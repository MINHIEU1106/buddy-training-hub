import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      orderBy: { studentCode: "asc" },
      include: {
        attendances: true,
      },
    });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi tải danh sách" }, { status: 500 });
  }
}
