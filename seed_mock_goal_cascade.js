const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    take: 6,
    orderBy: { id: "asc" },
  });

  console.log(`Tìm thấy ${students.length} học viên làm đại diện`);

  const mockData = [
    {
      groupIndex: 0,
      groupName: "Nhóm 1: Khám bệnh & Cận lâm sàng",
      score: 95,
      goal: "Rút ngắn thời gian chờ khám và trả kết quả xét nghiệm/CĐHA, tối ưu luồng đón tiếp ngoại trú",
      krs: [
        { indicator: "Tỷ lệ người bệnh hài lòng chung tại khoa", baseline: "84%", target: "≥ 92%", unit: "", deadline: "31/12/2027" },
        { indicator: "Thời gian chờ khám trung bình", baseline: "45 phút", target: "≤ 30 phút", unit: "", deadline: "30/09/2027" },
      ],
      comment: "Kế hoạch rất sát với thực tế luồng khám ngoại trú Phương Đông. Cần lưu ý bổ sung bàn khám dự phòng."
    },
    {
      groupIndex: 1,
      groupName: "Nhóm 2: Cấp cứu - Ngoại - ICU",
      score: 92,
      goal: "Tối ưu hóa thời gian tiếp nhận cấp cứu, chuyển mổ khẩn và đảm bảo an toàn người bệnh tuyệt đối",
      krs: [
        { indicator: "Thời gian tiếp nhận đến chẩn đoán cấp cứu", baseline: "25 phút", target: "≤ 15 phút", unit: "", deadline: "30/06/2027" },
        { indicator: "Tỷ lệ an toàn phẫu thuật ngoại khoa", baseline: "98%", target: "100%", unit: "", deadline: "31/12/2027" },
      ],
      comment: "Chỉ tiêu thời gian cấp cứu rất thách thức nhưng khả thi. Cần gắn chặt với khối Xét nghiệm."
    },
    {
      groupIndex: 2,
      groupName: "Nhóm 3: Khối Nội - Nhi - Sản",
      score: 88,
      goal: "Nâng cao chất lượng điều trị nội trú, tư vấn chu đáo và chăm sóc chuyên sâu mẹ & bé",
      krs: [
        { indicator: "Tỷ lệ người bệnh nội trú hài lòng", baseline: "87%", target: "≥ 95%", unit: "", deadline: "31/12/2027" },
        { indicator: "Số vụ khiếu nại về tư vấn dùng thuốc", baseline: "4 vụ/quý", target: "0 vụ", unit: "", deadline: "30/09/2027" },
      ],
      comment: "Đã làm rõ được khâu tư vấn xuất viện và dùng thuốc của bác sĩ điều trị."
    },
    {
      groupIndex: 3,
      groupName: "Nhóm 4: Điều dưỡng & KSNK",
      score: 94,
      goal: "Chuẩn hóa văn hóa giao tiếp AIDET, thái độ phục vụ và kiểm soát nhiễm khuẩn buồng bệnh",
      krs: [
        { indicator: "Tỷ lệ điều dưỡng đạt chuẩn giao tiếp AIDET", baseline: "70%", target: "100%", unit: "", deadline: "30/06/2027" },
        { indicator: "Tỷ lệ hài lòng về thái độ chăm sóc điều dưỡng", baseline: "86%", target: "≥ 95%", unit: "", deadline: "31/12/2027" },
      ],
      comment: "Chuẩn giao tiếp AIDET là đòn bẩy lớn nhất để nâng điểm hài lòng toàn viện."
    },
    {
      groupIndex: 4,
      groupName: "Nhóm 5: CSKH - Tiếp đón & Viện phí",
      score: 90,
      goal: "Nâng cấp dịch vụ đón tiếp 5 sao, tinh gọn thủ tục BHYT và giải quyết triệt để 100% khiếu nại trong 24h",
      krs: [
        { indicator: "Tỷ lệ hài lòng khâu tiếp đón & hướng dẫn", baseline: "89%", target: "≥ 98%", unit: "", deadline: "31/12/2027" },
        { indicator: "Tỷ lệ xử lý dứt điểm khiếu nại trong 24h", baseline: "65%", target: "100%", unit: "", deadline: "30/06/2027" },
      ],
      comment: "Cần phối hợp liên phòng ban để rút ngắn quy trình phê duyệt viện phí BHYT."
    },
    {
      groupIndex: 5,
      groupName: "Nhóm 6: QLCL & ASAHI / Khối Công ty",
      score: 86,
      goal: "Giám sát thời gian thực các chỉ số chất lượng toàn viện, tối ưu vận hành chuỗi dịch vụ ASAHI & Công ty",
      krs: [
        { indicator: "Số sự cố y khoa nghiêm trọng", baseline: "1 vụ/năm", target: "0 vụ", unit: "", deadline: "31/12/2027" },
        { indicator: "Tỷ lệ khuyến nghị cải tiến được ban hành", baseline: "75%", target: "100%", unit: "", deadline: "30/09/2027" },
      ],
      comment: "Cần bổ sung dashboard cảnh báo chỉ số chất lượng y tế sớm theo tuần."
    },
  ];

  for (let i = 0; i < mockData.length; i++) {
    const item = mockData[i];
    const student = students[i] || { studentCode: `HV000${i+1}`, fullName: `Trưởng nhóm ${i+1}` };

    const planData = {
      plan: {
        step1_goal: item.goal,
        step2_results: item.krs,
        step3_6_works: [
          {
            what: "Triển khai tái cấu trúc luồng tiếp nhận và đào tạo nội bộ",
            who: student.fullName,
            whenStart: "2027-01-01",
            whenEnd: "2027-06-30",
          },
          {
            what: "Đánh giá thử nghiệm và chuẩn hóa quy trình cải tiến",
            who: student.fullName,
            whenStart: "2027-07-01",
            whenEnd: "2027-10-31",
          }
        ],
        simulationQ2: {
          rootCause: "Bệnh nhân tăng đột biến 35% trong mùa cao điểm, thiếu 02 nhân sự tiếp đón",
          correctiveActions: "Điều động nhân sự hỗ trợ luân phiên và mở thêm bàn khám giờ cao điểm"
        }
      },
      checks: [
        { label: "Bước 1: Mục tiêu rõ ràng", passed: true },
        { label: "Bước 2: Kết quả SMART định lượng", passed: true },
        { label: "Bước 3-6: 5W1H đủ 1 Who phụ trách chính", passed: true },
        { label: "Bước 7: Kế hoạch đo lường & ngưỡng Đỏ", passed: true }
      ]
    };

    await prisma.goalCascadePlan.upsert({
      where: { groupIndex: item.groupIndex },
      create: {
        groupIndex: item.groupIndex,
        groupName: item.groupName,
        score: item.score,
        data: planData,
        submittedByCode: student.studentCode,
        submittedByName: student.fullName,
        comment: item.comment,
      },
      update: {
        groupName: item.groupName,
        score: item.score,
        data: planData,
        submittedByCode: student.studentCode,
        submittedByName: student.fullName,
        comment: item.comment,
      }
    });

    console.log(`✓ Đã nạp dữ liệu: ${item.groupName} - Đại diện: ${student.fullName}`);
  }

  console.log("Hoàn tất nạp dữ liệu kiểm thử cho 6 nhóm!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
