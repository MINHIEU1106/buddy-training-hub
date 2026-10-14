const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function init() {
  console.log('--- 1. Kiểm tra / Khởi tạo Session 3 Assignment ---');
  const session3 = await prisma.session.findFirst({
    where: { sessionNumber: 3 },
    include: { assignments: true },
  });

  if (!session3) {
    console.error('Không tìm thấy Buổi 3 trong database!');
    return;
  }

  console.log(`Tìm thấy Buổi 3: "${session3.title}" (ID: ${session3.id})`);
  let assign3 = session3.assignments.find(a => a.title.includes('Cập nhật kết quả') || a.title.includes('chậm tiến độ'));
  if (!assign3) {
    assign3 = await prisma.assignment.create({
      data: {
        sessionId: session3.id,
        title: 'Buổi 3: Cập nhật kết quả và xử lý chậm tiến độ',
        description: 'Cập nhật kết quả kế hoạch cá nhân sau review và giải quyết tình huống chậm tiến độ bằng 3 biểu mẫu: Phiếu giao việc 4 rõ (Mẫu A), Bảng cam kết tiến độ (Mẫu B), Phiếu xử lý chậm tiến độ (Mẫu C).',
        type: 'IN_SESSION',
        allowedFormat: 'BOTH',
        isRequired: true,
        status: 'ACTIVE',
      },
    });
    console.log(`✓ Đã tạo Assignment Buổi 3: "${assign3.title}" (ID: ${assign3.id})`);
  } else {
    console.log(`Assignment Buổi 3 đã tồn tại: "${assign3.title}" (ID: ${assign3.id})`);
  }

  console.log('--- 2. Khởi tạo Tình huống chậm tiến độ mẫu ---');
  let defaultCase = await prisma.session3DelayCase.findFirst({
    where: { isActive: true },
  });

  if (!defaultCase) {
    defaultCase = await prisma.session3DelayCase.create({
      data: {
        title: 'Phòng CSKH: Khảo sát mức độ hài lòng của người bệnh',
        department: 'Phòng Chăm sóc khách hàng',
        indicator: 'Khảo sát mức độ hài lòng của người bệnh nội trú và ngoại trú',
        targetQuantity: 300,
        unit: 'người bệnh',
        workingDays: 10,
        dailyQuota: 30,
        assigneeName: 'Điều dưỡng A (Tổ trưởng Khảo sát CSKH)',
        deadline: '2027-04-15',
        actualQuantity: 210,
        missingQuantity: 90,
        completionRate: 70,
        context: 'Phòng CSKH được giao chỉ tiêu gọi điện khảo sát mức độ hài lòng của 300 người bệnh sau khi xuất viện/khám xong. Kế hoạch đề ra trong 10 ngày làm việc (định mức 30 cuộc gọi/ngày) do Điều dưỡng A phụ trách chính. Tuy nhiên, đến ngày deadline, tổng kết chỉ mới hoàn thành 210/300 người bệnh (đạt 70%), còn thiếu 90 người bệnh.',
        questionPrompt: 'Là người Quản lý phụ trách, bạn sẽ xử lý tình huống chậm tiến độ này như thế nào để vừa đảm bảo đạt mục tiêu chung của Bệnh viện, vừa hỗ trợ nhân sự vượt qua vướng mắc thực tế?',
        instructorNote: 'Tiêu chí đánh giá của Giảng viên: 1. Xác định đúng nguyên nhân thực tế (vướng mắc về dữ liệu SĐT hay quá tải công việc); 2. Phản hồi 4 bước văn minh, không quy chụp; 3. Có phương án phân công bổ sung người hỗ trợ rõ ràng; 4. Có mốc chốt kiểm tra lại cụ thể.',
        isActive: true,
      },
    });
    console.log(`✓ Đã tạo tình huống mẫu: "${defaultCase.title}" (ID: ${defaultCase.id})`);
  } else {
    console.log(`Tình huống mẫu đã tồn tại: "${defaultCase.title}" (ID: ${defaultCase.id})`);
  }
}

init()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
