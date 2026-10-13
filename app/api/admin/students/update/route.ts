import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      studentCode,
      fullName,
      title,
      department,
      managementLevel,
      email,
      phone,
      groupNumber,
      actorName,
    } = body;

    // Trường hợp cập nhật học viên đã tồn tại (hỗ trợ cả đổi nhóm nhanh chỉ cần id + groupNumber)
    if (id) {
      const existing = await prisma.student.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { error: "Không tìm thấy học viên cần chỉnh sửa" },
          { status: 404 }
        );
      }

      const parsedGroup =
        groupNumber !== undefined && groupNumber !== null && groupNumber !== ""
          ? Number(groupNumber)
          : existing.groupNumber;

      const updated = await prisma.student.update({
        where: { id },
        data: {
          studentCode: studentCode ? studentCode.trim().toUpperCase() : existing.studentCode,
          fullName: fullName ? fullName.trim() : existing.fullName,
          title: title !== undefined ? (title?.trim() || null) : existing.title,
          department: department !== undefined ? (department?.trim() || null) : existing.department,
          managementLevel:
            managementLevel !== undefined ? (managementLevel?.trim() || null) : existing.managementLevel,
          email: email !== undefined ? (email?.trim() || null) : existing.email,
          phone: phone !== undefined ? (phone?.trim() || null) : existing.phone,
          groupNumber: parsedGroup,
        },
      });

      await createAuditLog({
        actorName: actorName || "Admin Buddy",
        action: "UPDATE_STUDENT_INFO",
        entityType: "Student",
        entityId: updated.id,
        details: {
          studentCode: updated.studentCode,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          department: updated.department,
          groupNumber: updated.groupNumber,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã cập nhật học viên ${updated.fullName} (${updated.studentCode}) — Nhóm ${updated.groupNumber || "--"}`,
        student: updated,
      });
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: "Họ và tên học viên không được để trống" },
        { status: 400 }
      );
    }

    // Trường hợp thêm mới học viên trực tiếp
    const course = await prisma.course.findFirst({ where: { status: "ACTIVE" } });
    if (!course) {
      return NextResponse.json({ error: "Không tìm thấy khóa học đang hoạt động" }, { status: 404 });
    }

    let finalCode = studentCode ? studentCode.trim().toUpperCase() : "";
    if (!finalCode) {
      const count = await prisma.student.count({ where: { courseId: course.id } });
      finalCode = `HV${String(count + 1).padStart(2, "0")}`;
    }

    const created = await prisma.student.create({
      data: {
        courseId: course.id,
        studentCode: finalCode,
        fullName: fullName.trim(),
        title: title?.trim() || null,
        department: department?.trim() || null,
        managementLevel: managementLevel?.trim() || "Khối Bệnh viện",
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        groupNumber: groupNumber ? Number(groupNumber) : 1,
        status: "ACTIVE",
      },
    });

    await createAuditLog({
      actorName: actorName || "Admin Buddy",
      action: "CREATE_STUDENT",
      entityType: "Student",
      entityId: created.id,
      details: {
        studentCode: created.studentCode,
        fullName: created.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm mới học viên ${created.fullName} (${created.studentCode})`,
      student: created,
    });
  } catch (error: any) {
    console.error("Update student error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi máy chủ khi lưu thông tin học viên" },
      { status: 500 }
    );
  }
}
