import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code-generator";
import { getVNMinutesOfDay, parseTimeToMinutes } from "@/lib/date";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentCode, sessionCode, sessionId } = body;

    const cleanCode = normalizeCode(studentCode);
    if (!cleanCode) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã học viên" },
        { status: 400 }
      );
    }

    // 1. Tìm học viên theo mã
    const student = await prisma.student.findFirst({
      where: {
        studentCode: cleanCode,
        status: "ACTIVE",
      },
      include: {
        course: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Mã học viên không hợp lệ hoặc đã bị vô hiệu hóa. Vui lòng liên hệ Admin/Giảng viên." },
        { status: 404 }
      );
    }

    // 2. Xác định Buổi học hiện tại
    let session = null;
    if (sessionId) {
      session = await prisma.session.findUnique({ where: { id: sessionId } });
    } else if (sessionCode) {
      session = await prisma.session.findFirst({
        where: { sessionCode: sessionCode.toUpperCase().trim(), courseId: student.courseId },
      });
    } else {
      // Tìm buổi học đang mở cổng check-in
      session = await prisma.session.findFirst({
        where: {
          courseId: student.courseId,
          checkInStatus: "OPEN",
        },
        orderBy: { sessionNumber: "asc" },
      });
    }

    if (!session) {
      return NextResponse.json(
        { error: "Hiện tại không có buổi học nào đang mở cổng điểm danh. Vui lòng đợi giảng viên mở cổng." },
        { status: 400 }
      );
    }

    if (session.checkInStatus !== "OPEN") {
      return NextResponse.json(
        { error: `Cổng điểm danh cho ${session.title} hiện đang đóng.` },
        { status: 400 }
      );
    }

    // 3. Kiểm tra xem học viên đã điểm danh buổi này chưa
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
    });

    const now = new Date();

    if (existingAttendance && existingAttendance.checkInAt) {
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        message: "Học viên đã điểm danh trước đó.",
        student: {
          id: student.id,
          fullName: student.fullName,
          title: student.title,
          department: student.department,
          managementLevel: student.managementLevel,
          studentCode: student.studentCode,
        },
        attendance: existingAttendance,
        session: {
          id: session.id,
          sessionNumber: session.sessionNumber,
          title: session.title,
          sessionCode: session.sessionCode,
        },
      });
    }

    // 4. Tính toán trạng thái: Đúng giờ hay Đi trễ
    // Giờ bắt đầu buổi học được cấu hình ví dụ "08:00" theo giờ Việt Nam
    let checkInStatus = "ON_TIME";
    if (session.startTime) {
      const currentMinutes = getVNMinutesOfDay(now);
      const startMinutes = parseTimeToMinutes(session.startTime);
      const lateThresholdMins = session.lateThresholdMins || 15;
      const lateDeadlineMinutes = startMinutes + lateThresholdMins;

      if (currentMinutes > lateDeadlineMinutes) {
        checkInStatus = "LATE";
      }
    }

    // 5. Ghi nhận điểm danh
    const attendance = await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
      update: {
        checkInAt: now,
        checkInStatus: checkInStatus,
        source: "QR_SCAN",
      },
      create: {
        sessionId: session.id,
        studentId: student.id,
        checkInAt: now,
        checkInStatus: checkInStatus,
        source: "QR_SCAN",
      },
    });

    return NextResponse.json({
      success: true,
      isDuplicate: false,
      message: checkInStatus === "ON_TIME" ? "Điểm danh đúng giờ thành công!" : "Điểm danh thành công (Ghi nhận đi trễ)",
      student: {
        id: student.id,
        fullName: student.fullName,
        title: student.title,
        department: student.department,
        managementLevel: student.managementLevel,
        studentCode: student.studentCode,
      },
      attendance,
      session: {
        id: session.id,
        sessionNumber: session.sessionNumber,
        title: session.title,
        sessionCode: session.sessionCode,
      },
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi xử lý điểm danh." },
      { status: 500 }
    );
  }
}
