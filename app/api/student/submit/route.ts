import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code-generator";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const studentCode = formData.get("studentCode") as string;
    const assignmentId = formData.get("assignmentId") as string;
    const type = formData.get("type") as string; // LINK or FILE
    const contentUrl = formData.get("contentUrl") as string;
    const note = formData.get("note") as string;
    const file = formData.get("file") as File | null;

    const cleanCode = normalizeCode(studentCode);
    if (!cleanCode) {
      return NextResponse.json({ error: "Thiếu mã học viên" }, { status: 400 });
    }

    if (!assignmentId) {
      return NextResponse.json({ error: "Thiếu thông tin bài tập" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { studentCode: cleanCode, status: "ACTIVE" },
    });

    if (!student) {
      return NextResponse.json({ error: "Học viên không tồn tại" }, { status: 404 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { session: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Bài tập không tồn tại" }, { status: 404 });
    }

    // Check IN_SESSION rule: must have checked in
    if (assignment.type === "IN_SESSION") {
      const attendance = await prisma.attendance.findFirst({
        where: { sessionId: assignment.sessionId, studentId: student.id },
      });
      if (!attendance || !attendance.checkInAt) {
        return NextResponse.json(
          { error: "Bài tập thực hành trên lớp chỉ dành cho học viên đã điểm danh có mặt tại buổi học này." },
          { status: 403 }
        );
      }
    }

    let filePath: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let finalUrl: string | null = null;

    if (type === "LINK") {
      if (!contentUrl || !contentUrl.trim()) {
        return NextResponse.json({ error: "Vui lòng nhập đường link bài tập" }, { status: 400 });
      }
      const trimmedUrl = contentUrl.trim();
      if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        return NextResponse.json({ error: "Đường link phải bắt đầu bằng http:// hoặc https://" }, { status: 400 });
      }
      finalUrl = trimmedUrl;
    } else if (type === "FILE") {
      if (!file || file.size === 0) {
        return NextResponse.json({ error: "Vui lòng chọn file bài tập để tải lên" }, { status: 400 });
      }

      // Max size: 25MB
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "Dung lượng file tối đa là 25MB" }, { status: 400 });
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads", "submissions");
      await fs.mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const savedFileName = `${student.studentCode}_${assignment.id.slice(0, 6)}_${timestamp}_${sanitizedOriginalName}`;
      const fullPath = path.join(uploadDir, savedFileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(fullPath, buffer);

      filePath = `/uploads/submissions/${savedFileName}`;
      fileName = file.name;
      fileSize = file.size;
    } else if (type === "ONLINE_FORM") {
      finalUrl = `/portal/homework-plan?code=${encodeURIComponent(student.studentCode)}`;
      fileName = "Bản kế hoạch 3 bước trực tuyến";
    } else {
      return NextResponse.json({ error: "Loại hình nộp bài không hợp lệ" }, { status: 400 });
    }

    // Check versioning
    const previousSubmissions = await prisma.submission.findMany({
      where: {
        assignmentId: assignment.id,
        studentId: student.id,
      },
      orderBy: { version: "desc" },
    });

    const nextVersion = previousSubmissions.length > 0 ? previousSubmissions[0].version + 1 : 1;

    // Check if late
    const now = new Date();
    const isLate = assignment.deadline ? now.getTime() > new Date(assignment.deadline).getTime() : false;

    const submission = await prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        studentId: student.id,
        version: nextVersion,
        type: type,
        contentUrl: finalUrl,
        filePath: filePath,
        fileName: fileName,
        fileSize: fileSize,
        note: note ? note.trim() : null,
        isLate: isLate,
        status: "SUBMITTED",
        submittedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: isLate ? "Nộp bài thành công (Ghi nhận nộp sau hạn)" : "Nộp bài thành công!",
      submission,
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi nộp bài tập." },
      { status: 500 }
    );
  }
}
