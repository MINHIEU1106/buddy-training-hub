import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          include: {
            students: {
              where: { status: "ACTIVE" },
              orderBy: { fullName: "asc" },
            },
          },
        },
        attendances: {
          include: {
            student: true,
          },
          orderBy: { checkInAt: "desc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Không tìm thấy buổi học" },
        { status: 404 }
      );
    }

    const totalStudents = session.course.students.length;
    const checkedInCount = session.attendances.filter((a) => a.checkInAt !== null).length;
    const checkedOutCount = session.attendances.filter((a) => a.checkOutAt !== null).length;

    // Generate QR code link
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const origin = req.headers.get("origin") || (host ? `${proto}://${host}` : (req.nextUrl.origin || "https://buddy-training-hub.vercel.app"));
    const checkinUrl = `${origin}/checkin?session=${session.sessionCode}`;
    const checkoutUrl = `${origin}/checkout?session=${session.sessionCode}`;

    // Target URL based on active gate
    const targetUrl = session.checkOutStatus === "OPEN" ? checkoutUrl : checkinUrl;
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    // Map attended and unattended students
    const checkedInStudentIds = new Set(
      session.attendances.filter((a) => a.checkInAt).map((a) => a.studentId)
    );

    const absentStudents = session.course.students.filter(
      (s) => !checkedInStudentIds.has(s.id)
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        sessionNumber: session.sessionNumber,
        title: session.title,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        trainerName: session.trainerName,
        checkInStatus: session.checkInStatus,
        checkOutStatus: session.checkOutStatus,
        sessionCode: session.sessionCode,
      },
      courseName: session.course.name,
      clientName: session.course.clientName,
      stats: {
        totalStudents,
        checkedInCount,
        checkedOutCount,
        attendanceRate: totalStudents > 0 ? Math.round((checkedInCount / totalStudents) * 100) : 0,
      },
      qrDataUrl,
      targetUrl,
      attendances: session.attendances,
      absentStudents,
    });
  } catch (error: any) {
    console.error("Live status error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi lấy dữ liệu Live Board." },
      { status: 500 }
    );
  }
}
