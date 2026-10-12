import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const course = await prisma.course.findFirst({
    where: { status: "ACTIVE" },
    include: {
      sessions: { orderBy: { sessionNumber: "asc" } },
      students: {
        where: { status: "ACTIVE" },
        orderBy: { fullName: "asc" },
      },
    },
  });

  if (!course) {
    return <div className="p-8 text-white">Chưa có khóa học.</div>;
  }

  const students = course.students;
  const sessions = course.sessions;

  const attendances = await prisma.attendance.findMany({
    where: { sessionId: { in: sessions.map((s) => s.id) } },
  });

  const assignments = await prisma.assignment.findMany({
    where: { sessionId: { in: sessions.map((s) => s.id) } },
    include: {
      session: {
        select: {
          sessionNumber: true,
        },
      },
      submissions: {
        include: {
          reviews: {
            orderBy: { reviewedAt: "desc" },
          },
        },
      },
    },
    orderBy: [
      { session: { sessionNumber: "asc" } },
      { createdAt: "asc" },
    ],
  });

  // Serialize safe plain JSON for client component
  const serializedStudents = JSON.parse(JSON.stringify(students));
  const serializedSessions = JSON.parse(JSON.stringify(sessions));
  const serializedAttendances = JSON.parse(JSON.stringify(attendances));
  const serializedAssignments = JSON.parse(JSON.stringify(assignments));

  return (
    <ReportsClient
      courseName={course.name}
      students={serializedStudents}
      sessions={serializedSessions}
      attendances={serializedAttendances}
      assignments={serializedAssignments}
    />
  );
}
