import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code-generator";

export const dynamic = "force-dynamic";

// GET /api/session-3-practice?code=HV01
// Trả về dữ liệu:
// 1. Học viên & BTVN cá nhân Buổi 1 (kèm review của giảng viên)
// 2. Tình huống chậm tiến độ (cá nhân hóa hoặc tình huống mẫu của admin)
// 3. Bài nộp Buổi 3 đã có (nếu đã từng nộp)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code");
    if (!rawCode) {
      return NextResponse.json({ error: "Thiếu mã học viên" }, { status: 400 });
    }

    const cleanCode = normalizeCode(rawCode);
    const student = await prisma.student.findFirst({
      where: { studentCode: cleanCode, status: "ACTIVE" },
      include: {
        course: {
          include: {
            sessions: {
              include: {
                assignments: {
                  include: {
                    submissions: {
                      where: { student: { studentCode: cleanCode } },
                      orderBy: { version: "desc" },
                      include: {
                        reviews: {
                          include: {
                            reviewer: { select: { fullName: true, role: true } },
                          },
                          orderBy: { reviewedAt: "desc" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Học viên không tồn tại" }, { status: 404 });
    }

    // 1. Tìm bài BTVN cá nhân Buổi 1 (POST_SESSION)
    let homeworkSub: any = null;
    let homeworkReview: any = null;
    let homeworkPlanData: any = null;

    if (student.course?.sessions) {
      for (const sess of student.course.sessions) {
        for (const assign of sess.assignments) {
          if (assign.type === "POST_SESSION" || assign.title.includes("kế hoạch cá nhân")) {
            const latestSub = assign.submissions?.[0];
            if (latestSub) {
              homeworkSub = latestSub;
              if (latestSub.reviews?.length > 0) {
                homeworkReview = latestSub.reviews[0];
              }
              if (latestSub.note) {
                try {
                  homeworkPlanData = JSON.parse(latestSub.note);
                } catch (e) {}
              }
              break;
            }
          }
        }
        if (homeworkSub) break;
      }
    }

    // 2. Tìm bài nộp Buổi 3 của học viên (nếu đã nộp)
    let session3Assignment: any = null;
    let session3Sub: any = null;

    if (student.course?.sessions) {
      const s3 = student.course.sessions.find((s) => s.sessionNumber === 3);
      if (s3) {
        session3Assignment = s3.assignments.find(
          (a) => a.title.includes("Cập nhật kết quả") || a.title.includes("chậm tiến độ")
        );
        if (session3Assignment?.submissions?.length > 0) {
          session3Sub = session3Assignment.submissions[0];
        }
      }
    }

    // 3. Tình huống chậm tiến độ: Tìm tình huống mẫu của Admin
    const defaultCase = await prisma.session3DelayCase.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // 4. Cá nhân hóa tình huống từ chỉ tiêu có số trong Kế hoạch cá nhân Buổi 1
    let personalizedCase = null;
    if (homeworkPlanData?.step2_results && Array.isArray(homeworkPlanData.step2_results)) {
      // Tìm chỉ số có mục tiêu dạng số
      const quantitativeKr = homeworkPlanData.step2_results.find((kr: any) => {
        if (!kr.target) return false;
        const num = parseFloat(kr.target.replace(/[^0-9.]/g, ""));
        return !isNaN(num) && num > 0;
      });

      if (quantitativeKr) {
        const targetNum = parseFloat(quantitativeKr.target.replace(/[^0-9.]/g, ""));
        const workingDays = 10;
        const dailyQuota = Math.round((targetNum / workingDays) * 10) / 10;
        const actualNum = Math.round(targetNum * 0.7 * 10) / 10;
        const missingNum = Math.round((targetNum - actualNum) * 10) / 10;
        const completionRate = 70;

        // Tìm người phụ trách từ bảng 5W1H nếu có
        const matchedWork = homeworkPlanData.step3_6_works?.find(
          (w: any) => w.taskName?.includes(quantitativeKr.indicator) || w.what?.includes(quantitativeKr.indicator)
        );
        const assignee = matchedWork?.who || student.fullName || "Nhân sự phụ trách";
        const deadline = quantitativeKr.deadline || matchedWork?.whenEnd || "2027-04-15";

        personalizedCase = {
          isPersonalized: true,
          title: `Chỉ tiêu khoa/phòng: ${quantitativeKr.indicator}`,
          department: homeworkPlanData.department || student.department || "Khoa/Phòng chuyên môn",
          indicator: quantitativeKr.indicator,
          targetQuantity: targetNum,
          unit: quantitativeKr.unit || "chỉ tiêu",
          workingDays,
          dailyQuota,
          assigneeName: assignee,
          deadline,
          actualQuantity: actualNum,
          missingQuantity: missingNum,
          completionRate,
          context: `Đơn vị ${homeworkPlanData.department || student.department} đặt mục tiêu hoàn thành ${targetNum} ${quantitativeKr.unit || "chỉ tiêu"} cho nhiệm vụ "${quantitativeKr.indicator}". Theo kế hoạch phân bổ trong ${workingDays} ngày làm việc (định mức ${dailyQuota} ${quantitativeKr.unit || "chỉ tiêu"}/ngày) do ${assignee} phụ trách. Đến hạn chót (${deadline}), đơn vị mới ghi nhận đạt ${actualNum}/${targetNum} (${completionRate}%), còn thiếu hụt ${missingNum} ${quantitativeKr.unit || "chỉ tiêu"}.`,
          questionPrompt: `Với vai trò là Quản lý trực tiếp, bạn sẽ xử lý tình huống chậm tiến độ này như thế nào theo đúng nguyên tắc 4 RÕ và kiểm soát tiến độ?`,
        };
      }
    }

    return NextResponse.json({
      student: {
        id: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        title: student.title,
        department: student.department,
        groupNumber: student.groupNumber,
      },
      homeworkPlan: {
        hasSubmission: !!homeworkSub,
        submittedAt: homeworkSub?.submittedAt,
        status: homeworkSub?.status,
        planData: homeworkPlanData,
        review: homeworkReview
          ? {
              grade: homeworkReview.grade,
              publicComment: homeworkReview.publicComment,
              reviewedAt: homeworkReview.reviewedAt,
              reviewerName: homeworkReview.reviewer?.fullName,
            }
          : null,
      },
      session3Assignment: session3Assignment
        ? {
            id: session3Assignment.id,
            title: session3Assignment.title,
            deadline: session3Assignment.deadline,
          }
        : null,
      session3Submission: session3Sub
        ? {
            id: session3Sub.id,
            version: session3Sub.version,
            status: session3Sub.status,
            submittedAt: session3Sub.submittedAt,
            data: session3Sub.note ? JSON.parse(session3Sub.note) : null,
            reviews: session3Sub.reviews,
          }
        : null,
      scenario: personalizedCase || defaultCase,
      defaultTemplateCase: defaultCase,
    });
  } catch (error: any) {
    console.error("Session 3 practice fetch error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu bài tập Buổi 3" }, { status: 500 });
  }
}

// POST /api/session-3-practice
// Học viên nộp bài thực hành Buổi 3:
// payload: { studentCode, assignmentId, updatedKpiPlan, workOrderForm, commitmentRows, delayHandlingForm, staffFeedbackForm, scenarioData }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentCode,
      assignmentId,
      updatedKpiPlan,
      workOrderForm,
      commitmentRows,
      delayHandlingForm,
      staffFeedbackForm,
      scenarioData,
    } = body;

    const cleanCode = normalizeCode(studentCode || "");
    if (!cleanCode) {
      return NextResponse.json({ error: "Thiếu mã học viên" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { studentCode: cleanCode, status: "ACTIVE" },
    });
    if (!student) {
      return NextResponse.json({ error: "Học viên không tồn tại" }, { status: 404 });
    }

    // Tìm Assignment Buổi 3
    let targetAssignmentId = assignmentId;
    if (!targetAssignmentId) {
      const a3 = await prisma.assignment.findFirst({
        where: {
          session: { sessionNumber: 3 },
          title: { contains: "chậm tiến độ" },
        },
      });
      if (a3) targetAssignmentId = a3.id;
    }

    if (!targetAssignmentId) {
      return NextResponse.json({ error: "Không tìm thấy bài tập Buổi 3 trong hệ thống" }, { status: 404 });
    }

    // Đếm phiên bản hiện tại
    const currentSubs = await prisma.submission.findMany({
      where: { assignmentId: targetAssignmentId, studentId: student.id },
      orderBy: { version: "desc" },
    });
    const nextVersion = currentSubs.length > 0 ? currentSubs[0].version + 1 : 1;

    // Toàn bộ dữ liệu 4 phần được đóng gói chặt chẽ trong JSON
    const structuredSubmission = {
      type: "SESSION3_DELAY_WORKORDER",
      submittedAt: new Date().toISOString(),
      studentCode: student.studentCode,
      studentName: student.fullName,
      scenario: scenarioData,
      part1_updatedKpiPlan: updatedKpiPlan,
      part3_formA_workOrder: workOrderForm,
      part3_formB_commitments: commitmentRows,
      part3_formC_delayHandling: delayHandlingForm,
      part3_staffFeedback: staffFeedbackForm,
    };

    const newSub = await prisma.submission.create({
      data: {
        assignmentId: targetAssignmentId,
        studentId: student.id,
        version: nextVersion,
        type: "ONLINE_FORM",
        note: JSON.stringify(structuredSubmission),
        status: "SUBMITTED",
        contentUrl: `/portal/session-3-practice?code=${student.studentCode}`,
      },
    });

    // Ghi AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          actorName: `Học viên ${student.fullName} (${student.studentCode})`,
          action: "SUBMIT_SESSION3_PRACTICE",
          entityType: "Submission",
          entityId: newSub.id,
          details: `Học viên nộp bài tập Buổi 3 (phiên bản ${nextVersion})`,
        },
      });
    } catch (auditErr) {}

    return NextResponse.json({
      success: true,
      submission: newSub,
      message: `Đã nộp bài tập Buổi 3 thành công (Phiên bản ${nextVersion})!`,
    });
  } catch (error: any) {
    console.error("Session 3 submit error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi nộp bài tập Buổi 3" }, { status: 500 });
  }
}
