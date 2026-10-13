import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        session: true,
        submissions: {
          orderBy: { submittedAt: "desc" },
          include: {
            student: true,
            reviews: {
              orderBy: { reviewedAt: "desc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, assignments });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi tải danh sách bài tập" }, { status: 500 });
  }
}
