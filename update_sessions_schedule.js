const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("--- Bắt đầu cập nhật thông tin 4 buổi học theo lịch đào tạo mới ---");

  const sessions = await prisma.session.findMany({
    orderBy: { sessionNumber: "asc" },
  });

  if (sessions.length < 4) {
    console.error("Không đủ 4 buổi học trong database!");
    return;
  }

  const updates = [
    {
      sessionNumber: 1,
      title: "1.1 Vai trò Quản lý cấp trung | 1.2 Lập kế hoạch công việc và theo dõi đánh giá hoàn thành chỉ tiêu năm",
      date: "2026-10-13",
      startTime: "13:30",
      endTime: "17:00",
      trainerName: "Chuyên gia Minh Phùng & CEO Quỳnh Nguyễn",
    },
    {
      sessionNumber: 2,
      title: "2.1 Giao việc và kiểm soát tiến độ | 2.2 Quản lý nhân sự và tạo động lực",
      date: "2026-10-15",
      startTime: "13:30",
      endTime: "17:00",
      trainerName: "CEO Quỳnh Nguyễn & Chuyên gia Sen Nga",
    },
    {
      sessionNumber: 3,
      title: "KPI và Đánh giá hiệu suất",
      date: "2026-10-20",
      startTime: "13:30",
      endTime: "17:00",
      trainerName: "Chuyên gia Thuỳ Vũ",
    },
    {
      sessionNumber: 4,
      title: "4.1 Quản trị thay đổi trong doanh nghiệp | 4.2 Giải quyết vấn đề và phối hợp liên phòng ban",
      date: "2026-10-22",
      startTime: "13:30",
      endTime: "17:00",
      trainerName: "Chuyên gia Minh Phùng & Chuyên gia Sen Nga",
    },
  ];

  for (const item of updates) {
    const existing = sessions.find((s) => s.sessionNumber === item.sessionNumber);
    if (existing) {
      const updated = await prisma.session.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          trainerName: item.trainerName,
        },
      });
      console.log(`✓ Đã cập nhật Buổi ${updated.sessionNumber}:`);
      console.log(`  - Tiêu đề: ${updated.title}`);
      console.log(`  - Ngày: ${updated.date} (${updated.startTime} - ${updated.endTime})`);
      console.log(`  - Giảng viên: ${updated.trainerName}`);
    }
  }

  console.log("\n--- Hoàn tất cập nhật 4 buổi học thành công! ---");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
