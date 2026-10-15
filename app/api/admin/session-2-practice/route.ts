import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentGroupNumber, getStudentGroupName, SESSION_2_GROUPS } from "@/lib/goal-cascade-groups";

export const dynamic = "force-dynamic";

// GET /api/admin/session-2-practice
// Trả về toàn bộ danh sách 80 học viên kèm trạng thái bài nộp Buổi 2
export async function GET(req: NextRequest) {
  try {
    // 1. Tìm Assignment Buổi 2 về Xử lý chậm tiến độ
    const assignment = await prisma.assignment.findFirst({
      where: {
        OR: [
          { title: { contains: "chậm tiến độ", mode: "insensitive" } },
          { title: { contains: "Cập nhật kết quả", mode: "insensitive" } },
        ],
      },
      include: {
        session: true,
        submissions: {
          orderBy: { version: "desc" },
          include: {
            student: true,
            reviews: {
              orderBy: { reviewedAt: "desc" },
              include: {
                reviewer: { select: { fullName: true, role: true } },
              },
            },
          },
        },
      },
    });

    // 2. Lấy toàn bộ học viên đang ACTIVE
    const students = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      orderBy: { studentCode: "asc" },
    });

    // 3. Map bài nộp mới nhất của từng học viên
    const submissionsByStudentId = new Map<string, any>();
    if (assignment?.submissions) {
      for (const sub of assignment.submissions) {
        if (!submissionsByStudentId.has(sub.studentId)) {
          submissionsByStudentId.set(sub.studentId, sub);
        }
      }
    }

    let submittedCount = 0;
    let reviewedCount = 0;
    let passCount = 0;
    let excellentCount = 0;
    let needsFixCount = 0;

    const mappedStudents = students.map((st) => {
      const groupNum = getStudentGroupNumber(st.studentCode, st.groupNumber);
      const groupName = getStudentGroupName(st.studentCode, st.groupNumber);
      const sub = submissionsByStudentId.get(st.id) || null;

      let subData: any = null;
      let latestReview: any = null;

      if (sub) {
        submittedCount++;
        if (sub.note) {
          try {
            subData = JSON.parse(sub.note);
          } catch (e) {}
        }
        if (sub.reviews && sub.reviews.length > 0) {
          reviewedCount++;
          latestReview = sub.reviews[0];
          if (latestReview.grade === "XUAT_SAC") excellentCount++;
          else if (latestReview.grade === "DAT") passCount++;
          else if (latestReview.grade === "CAN_SUA") needsFixCount++;
        }
      }

      return {
        id: st.id,
        studentCode: st.studentCode,
        fullName: st.fullName,
        title: st.title,
        department: st.department,
        groupNumber: groupNum,
        groupName: groupName,
        submission: sub
          ? {
              id: sub.id,
              version: sub.version,
              status: sub.status,
              submittedAt: sub.submittedAt,
              type: sub.type,
              data: subData,
              reviews: sub.reviews,
              latestReview: latestReview
                ? {
                    id: latestReview.id,
                    grade: latestReview.grade,
                    publicComment: latestReview.publicComment,
                    internalNote: latestReview.internalNote,
                    reviewedAt: latestReview.reviewedAt,
                    reviewerName: latestReview.reviewer?.fullName || "Giảng viên",
                  }
                : null,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      assignment: assignment
        ? {
            id: assignment.id,
            title: assignment.title,
            sessionNumber: assignment.session?.sessionNumber || 2,
            deadline: assignment.deadline,
          }
        : null,
      stats: {
        totalStudents: students.length,
        submittedCount,
        reviewedCount,
        passCount,
        excellentCount,
        needsFixCount,
      },
      groups: SESSION_2_GROUPS,
      students: mappedStudents,
    });
  } catch (error: any) {
    console.error("Admin session 2 practice fetch error:", error);
    return NextResponse.json(
      { error: "Lỗi tải dữ liệu theo dõi bài thực hành Buổi 2" },
      { status: 500 }
    );
  }
}
