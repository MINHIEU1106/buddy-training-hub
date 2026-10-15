import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code-generator";
import { getStudentGroupNumber, getStudentGroupName, GOAL_CASCADE_GROUPS } from "@/lib/goal-cascade-groups";

export const dynamic = "force-dynamic";

// GET /api/session-3-practice?code=HV01
// Trả về dữ liệu:
// 1. Học viên & Bài thực hành Buổi 1 của chính nhóm học viên (kèm review của giảng viên)
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

    // 0. Xác định nhóm của học viên trong Buổi 1 (Goal Cascade)
    const studentGroupNum = getStudentGroupNumber(student.studentCode, student.groupNumber);
    const studentGroupName = getStudentGroupName(student.studentCode, student.groupNumber);
    let groupPlan: any = null;

    if (studentGroupNum && studentGroupNum >= 1 && studentGroupNum <= GOAL_CASCADE_GROUPS.length) {
      const groupIndex = studentGroupNum - 1;
      groupPlan = await prisma.goalCascadePlan.findUnique({
        where: { groupIndex },
      });
    }

    // 1. Tìm bài và nhận xét Buổi 1 của học viên:
    // Ưu tiên 1: Bài BTVN Lập kế hoạch cá nhân của chính học viên (nếu đã nộp có dữ liệu)
    let homeworkSub: any = null;
    let homeworkReview: any = null;
    let homeworkPlanData: any = null;
    let planSource: "GROUP_PRACTICE" | "INDIVIDUAL_HOMEWORK" = "GROUP_PRACTICE";

    if (student.course?.sessions) {
      for (const sess of student.course.sessions) {
        for (const assign of sess.assignments) {
          const assignTitle = assign.title.toLowerCase();
          if (assign.type === "POST_SESSION" || assignTitle.includes("kế hoạch cá nhân") || assignTitle.includes("btvn") || assignTitle.includes("buổi 1")) {
            const latestSub = assign.submissions?.[0];
            if (latestSub) {
              homeworkSub = latestSub;
              if (latestSub.reviews?.length > 0) {
                homeworkReview = latestSub.reviews[0];
              }
              if (latestSub.note) {
                try {
                  const parsed = JSON.parse(latestSub.note);
                  if (parsed && (parsed.step1_goal || (parsed.step2_results && parsed.step2_results.length > 0))) {
                    homeworkPlanData = parsed;
                    planSource = "INDIVIDUAL_HOMEWORK";
                  }
                } catch (e) {}
              }
              break;
            }
          }
        }
        if (homeworkPlanData) break;
      }
    }

    // Ưu tiên 2: Nếu chưa có bài cá nhân, lấy từ bài thực hành Buổi 1 trên lớp của nhóm (GoalCascadePlan)
    if (!homeworkPlanData && groupPlan) {
      if (groupPlan.data && typeof groupPlan.data === "object" && (groupPlan.data as any).plan) {
        homeworkPlanData = (groupPlan.data as any).plan;
        planSource = "GROUP_PRACTICE";
      }
    }

    // Luôn ưu tiên hiển thị nhận xét của giảng viên (nếu bài cá nhân chưa có review thì lấy nhận xét của nhóm)
    if (!homeworkReview && groupPlan?.comment) {
      homeworkReview = {
        grade: (groupPlan.score >= 90) ? "XUAT_SAC" : (groupPlan.score >= 80 ? "DAT" : "CAN_CHINH_SUA"),
        publicComment: groupPlan.comment,
        reviewedAt: groupPlan.updatedAt,
        reviewerName: "Giảng viên Buddy (Hội trường)",
        source: "GROUP_PRACTICE",
        groupName: groupPlan.groupName,
        score: groupPlan.score,
      };
    }

    // 2. Tìm bài nộp Xử lý chậm tiến độ của học viên (nếu đã nộp)
    let session3Assignment: any = null;
    let session3Sub: any = null;

    if (student.course?.sessions) {
      for (const sess of student.course.sessions) {
        const found = sess.assignments.find(
          (a) => a.title.includes("Cập nhật kết quả") || a.title.includes("chậm tiến độ")
        );
        if (found) {
          session3Assignment = found;
          if (found.submissions?.length > 0) {
            session3Sub = found.submissions[0];
          }
          break;
        }
      }
    }

    // 3. Tình huống chậm tiến độ: Tìm tình huống mẫu của Admin
    const defaultCase = await prisma.session3DelayCase.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // 4. Cá nhân hóa tình huống từ chỉ tiêu trong Kế hoạch Buổi 1
    let personalizedCase = null;
    if (homeworkPlanData?.step2_results && Array.isArray(homeworkPlanData.step2_results)) {
      // Tìm chỉ số có mục tiêu dạng số
      const quantitativeKr = homeworkPlanData.step2_results.find((kr: any) => {
        if (!kr.target) return false;
        const num = parseFloat(kr.target.replace(/[^0-9.]/g, ""));
        return !isNaN(num) && num > 0;
      }) || homeworkPlanData.step2_results[0];

      if (quantitativeKr) {
        const targetNum = parseFloat(String(quantitativeKr.target).replace(/[^0-9.]/g, "")) || 100;
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
          title: `Chỉ tiêu: ${quantitativeKr.indicator}`,
          department: homeworkPlanData.department || student.department || studentGroupName,
          indicator: quantitativeKr.indicator,
          targetQuantity: targetNum,
          unit: quantitativeKr.unit || "chỉ tiêu",
          assigneeName: assignee,
          deadline,
          actualQuantity: actualNum,
          missingQuantity: missingNum,
          completionRate,
          context: `Đơn vị ${homeworkPlanData.department || student.department || studentGroupName} đặt mục tiêu hoàn thành ${targetNum} ${quantitativeKr.unit || "chỉ tiêu"} cho nhiệm vụ "${quantitativeKr.indicator}" do ${assignee} phụ trách. Đến hạn (${deadline}), thực tế đạt được ${actualNum}/${targetNum} (${completionRate}%), còn thiếu hụt ${missingNum} ${quantitativeKr.unit || "chỉ tiêu"}.`,
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
        groupNumber: studentGroupNum || student.groupNumber,
        groupName: studentGroupName,
      },
      homeworkPlan: {
        hasSubmission: !!groupPlan || !!homeworkSub,
        submittedAt: groupPlan?.submittedAt || homeworkSub?.submittedAt,
        status: groupPlan?.comment ? "ĐÃ NHẬN XÉT" : (groupPlan ? "ĐÃ NỘP" : homeworkSub?.status),
        planData: homeworkPlanData,
        groupName: studentGroupName,
        source: planSource,
        review: homeworkReview
          ? {
              grade: homeworkReview.grade,
              publicComment: homeworkReview.publicComment,
              reviewedAt: homeworkReview.reviewedAt,
              reviewerName: homeworkReview.reviewerName || homeworkReview.reviewer?.fullName || "Giảng viên Buddy",
              groupName: homeworkReview.groupName || studentGroupName,
              score: homeworkReview.score,
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

    // Tìm Assignment Xử lý chậm tiến độ
    let targetAssignmentId = assignmentId;
    if (!targetAssignmentId) {
      const a = await prisma.assignment.findFirst({
        where: {
          title: { contains: "chậm tiến độ" },
        },
      });
      if (a) targetAssignmentId = a.id;
    }

    if (!targetAssignmentId) {
      return NextResponse.json({ error: "Không tìm thấy bài tập Xử lý chậm tiến độ trong hệ thống" }, { status: 404 });
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
