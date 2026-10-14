import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/session-3-case - Lấy danh sách tình huống
export async function GET() {
  try {
    const cases = await prisma.session3DelayCase.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ cases });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải danh sách tình huống" }, { status: 500 });
  }
}

// POST /api/admin/session-3-case - Tạo mới hoặc cập nhật tình huống
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      department,
      indicator,
      targetQuantity,
      unit,
      workingDays,
      dailyQuota,
      assigneeName,
      deadline,
      actualQuantity,
      missingQuantity,
      completionRate,
      context,
      questionPrompt,
      instructorNote,
      isActive,
      actorName,
    } = body;

    if (!title || !department || !indicator) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ Tiêu đề, Khoa phòng và Chỉ tiêu" }, { status: 400 });
    }

    const payload = {
      title,
      department,
      indicator,
      targetQuantity: Number(targetQuantity) || 0,
      unit: unit || "người bệnh",
      workingDays: Number(workingDays) || 10,
      dailyQuota: Number(dailyQuota) || 0,
      assigneeName: assigneeName || "Nhân viên phụ trách",
      deadline: deadline || "2027-04-15",
      actualQuantity: Number(actualQuantity) || 0,
      missingQuantity: Number(missingQuantity) || 0,
      completionRate: Number(completionRate) || 0,
      context: context || "",
      questionPrompt: questionPrompt || "Là quản lý, bạn xử lý thế nào?",
      instructorNote: instructorNote || "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    let resultCase;
    if (id) {
      resultCase = await prisma.session3DelayCase.update({
        where: { id },
        data: payload,
      });
    } else {
      resultCase = await prisma.session3DelayCase.create({
        data: payload,
      });
    }

    // Ghi AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          actorName: actorName || "Admin Giảng viên",
          action: id ? "UPDATE_SESSION3_CASE" : "CREATE_SESSION3_CASE",
          entityType: "Session3DelayCase",
          entityId: resultCase.id,
          details: `Admin cập nhật tình huống Buổi 3: "${resultCase.title}"`,
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true, case: resultCase });
  } catch (error: any) {
    console.error("Admin session 3 case save error:", error);
    return NextResponse.json({ error: "Lỗi lưu tình huống" }, { status: 500 });
  }
}
