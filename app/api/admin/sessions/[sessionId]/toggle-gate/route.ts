import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await req.json();
    const { gate, status, actorName } = body; // gate: 'checkIn' | 'checkOut', status: 'OPEN' | 'CLOSED'

    if (!gate || !status) {
      return NextResponse.json({ error: "Thiếu tham số" }, { status: 400 });
    }

    const currentSession = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!currentSession) {
      return NextResponse.json({ error: "Không tìm thấy buổi học" }, { status: 404 });
    }

    const updateData: Record<string, string> = {};
    if (gate === "checkIn") {
      updateData.checkInStatus = status;
      if (status === "OPEN") {
        // Tự động đóng cổng check-in của các buổi khác để tránh nhầm lẫn buổi học
        await prisma.session.updateMany({
          where: { courseId: currentSession.courseId, id: { not: sessionId } },
          data: { checkInStatus: "CLOSED" },
        });
      }
    } else if (gate === "checkOut") {
      updateData.checkOutStatus = status;
      if (status === "OPEN") {
        // Tự động đóng cổng check-out của các buổi khác
        await prisma.session.updateMany({
          where: { courseId: currentSession.courseId, id: { not: sessionId } },
          data: { checkOutStatus: "CLOSED" },
        });
      }
    }

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    });

    await createAuditLog({
      actorName: actorName || "Giảng viên / Admin",
      action: status === "OPEN" ? `OPEN_${gate.toUpperCase()}_GATE` : `CLOSE_${gate.toUpperCase()}_GATE`,
      entityType: "Session",
      entityId: session.id,
      details: { gate, status, sessionTitle: session.title },
    });

    return NextResponse.json({
      success: true,
      message: `Đã ${status === "OPEN" ? "mở" : "đóng"} cổng ${gate === "checkIn" ? "Check-in" : "Check-out"}`,
      session,
    });
  } catch (error: any) {
    console.error("Toggle gate error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi thay đổi trạng thái cổng." },
      { status: 500 }
    );
  }
}
