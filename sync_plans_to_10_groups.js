const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GOAL_CASCADE_GROUPS = [
  "Nhóm 1: Khối Khám bệnh & Cận lâm sàng - Bàn 1 (7 người)",
  "Nhóm 2: Khối Khám bệnh & Cận lâm sàng - Bàn 2 (8 người)",
  "Nhóm 3: Khối Cấp cứu & Phẫu thuật (8 người)",
  "Nhóm 4: Khối Nội - Nhi - Sản (7 người)",
  "Nhóm 5: Khối Điều dưỡng & KSNK (5 người)",
  "Nhóm 6: Khối CSKH, Viện phí & Dịch vụ (17 người)",
  "Nhóm 7: Khối CNTT, Kỹ thuật & Marketing (10 người)",
  "Nhóm 8: Viện dưỡng lão ASAHI (10 người)",
  "Nhóm 9: Khối Công ty & Dự án - Ban Trợ lý & Thư ký (10 người)",
  "Nhóm 10: Khối Công ty & Dự án - Vận hành & Đầu tư (9 người)",
];

async function main() {
  console.log("=== BẮT ĐẦU ĐỒNG BỘ 10 NHÓM CHO GOAL CASCADE PLANS VÀ SUBMISSIONS ===");

  // 1. Lấy tất cả các plan hiện tại
  const existingPlans = await prisma.goalCascadePlan.findMany({
    orderBy: { groupIndex: "asc" }
  });
  console.log(`Tìm thấy ${existingPlans.length} bản ghi GoalCascadePlan cũ.`);

  // Lưu tạm vào map theo groupIndex cũ
  const planMap = {};
  existingPlans.forEach(p => {
    planMap[p.groupIndex] = p;
  });

  // Ánh xạ groupIndex cũ -> groupIndex mới (0-indexed):
  // Old 0 (Khám bệnh) -> New 0 (Nhóm 1) & New 1 (Nhóm 2)
  // Old 1 (Cấp cứu)   -> New 2 (Nhóm 3)
  // Old 2 (Nội - Nhi) -> New 3 (Nhóm 4)
  // Old 3 (Điều dưỡng) -> New 4 (Nhóm 5)
  // Old 4 (CSKH)      -> New 5 (Nhóm 6)
  // Old 5 (CNTT)      -> New 6 (Nhóm 7)
  // Old 6 (ASAHI)     -> New 7 (Nhóm 8)
  // Old 7 (Công ty)   -> New 8 (Nhóm 9) & New 9 (Nhóm 10)

  // Để tránh lỗi unique trên groupIndex, ta tạm gán groupIndex âm
  for (const p of existingPlans) {
    await prisma.goalCascadePlan.update({
      where: { id: p.id },
      data: { groupIndex: -100 - p.groupIndex }
    });
  }

  // Bây giờ tạo/cập nhật 10 nhóm mới (index 0 đến 9)
  const newAssignments = [
    { newIdx: 0, fromOldIdx: 0, groupName: GOAL_CASCADE_GROUPS[0], submitterCode: "HV01", submitterName: "Trần Thị Linh" },
    {
      newIdx: 1,
      fromOldIdx: 0,
      groupName: GOAL_CASCADE_GROUPS[1],
      submitterCode: "HV75",
      submitterName: "Nguyễn Thị Thu Trang",
      customGoal: "Tối ưu hóa quy trình xét nghiệm, CĐHA và trả kết quả cận lâm sàng nhanh chóng, chính xác (≤ 45 phút)"
    },
    { newIdx: 2, fromOldIdx: 1, groupName: GOAL_CASCADE_GROUPS[2], submitterCode: "HV06", submitterName: "Ngô Thị Tuyết Mai" },
    { newIdx: 3, fromOldIdx: 2, groupName: GOAL_CASCADE_GROUPS[3], submitterCode: "HV09", submitterName: "Nguyễn Minh Thuỳ" },
    { newIdx: 4, fromOldIdx: 3, groupName: GOAL_CASCADE_GROUPS[4], submitterCode: "HV77", submitterName: "Nguyễn Thế Sơn" },
    { newIdx: 5, fromOldIdx: 4, groupName: GOAL_CASCADE_GROUPS[5], submitterCode: "HV50", submitterName: "Trương Văn Tâm" },
    { newIdx: 6, fromOldIdx: 5, groupName: GOAL_CASCADE_GROUPS[6], submitterCode: "HV41", submitterName: "Trần Đình Toàn" },
    { newIdx: 7, fromOldIdx: 6, groupName: GOAL_CASCADE_GROUPS[7], submitterCode: "HV61", submitterName: "Nguyễn Việt Cường" },
    { newIdx: 8, fromOldIdx: 7, groupName: GOAL_CASCADE_GROUPS[8], submitterCode: "HV64", submitterName: "Chử Thị Huế" },
    {
      newIdx: 9,
      fromOldIdx: 7,
      groupName: GOAL_CASCADE_GROUPS[9],
      submitterCode: "HV66",
      submitterName: "Hoàng Anh",
      customGoal: "Điều hành tối ưu dòng tiền, pháp lý minh bạch, quản lý chặt tiến độ dự án đầu tư và thiết kế công trình"
    },
  ];

  for (const item of newAssignments) {
    const basePlan = planMap[item.fromOldIdx];
    let planData = basePlan?.data ? JSON.parse(JSON.stringify(basePlan.data)) : { plan: {} };
    if (planData.plan) {
      planData.plan.department = item.groupName;
      if (item.customGoal) {
        planData.plan.step1_goal = item.customGoal;
      }
    }

    const payload = {
      groupIndex: item.newIdx,
      groupName: item.groupName,
      submittedByCode: item.submitterCode || basePlan?.submittedByCode || "HV01",
      submittedByName: item.submitterName || basePlan?.submittedByName || "Đại diện nhóm",
      submittedAt: basePlan?.submittedAt || new Date(),
      score: basePlan?.score || 85,
      comment: basePlan?.comment || `Bài làm hoàn thành tốt, đã rà soát mục tiêu nhóm ${item.newIdx + 1}.`,
      data: planData,
    };

    // Kiểm tra xem có bản ghi tạm nào dùng lại được không
    const tempPlan = await prisma.goalCascadePlan.findFirst({
      where: { groupIndex: -100 - item.fromOldIdx }
    });

    if (tempPlan && item.newIdx !== 1 && item.newIdx !== 9) {
      // Cập nhật bản ghi cũ sang vị trí mới
      await prisma.goalCascadePlan.update({
        where: { id: tempPlan.id },
        data: payload
      });
      console.log(`✓ Chuyển cũ [${item.fromOldIdx}] -> Mới [Nhóm ${item.newIdx + 1}]: ${item.groupName}`);
    } else {
      // Tạo mới cho nhóm tách (Nhóm 2 hoặc Nhóm 10)
      await prisma.goalCascadePlan.create({
        data: payload
      });
      console.log(`+ Tạo mới [Nhóm ${item.newIdx + 1}]: ${item.groupName}`);
    }
  }

  // Dọn dẹp bất kỳ bản ghi âm nào còn sót
  const leftovers = await prisma.goalCascadePlan.findMany({
    where: { groupIndex: { lt: 0 } }
  });
  if (leftovers.length > 0) {
    console.log(`Dọn dẹp ${leftovers.length} bản ghi tạm cũ...`);
    for (const l of leftovers) {
      await prisma.goalCascadePlan.delete({ where: { id: l.id } });
    }
  }

  // 2. CẬP NHẬT SUBMISSIONS CÁ NHÂN (NOTE JSON department -> Tên nhóm mới)
  console.log("\n2. Cập nhật tên nhóm trong Submissions cá nhân...");
  const subs = await prisma.submission.findMany({
    include: { student: true }
  });

  let subsUpdated = 0;
  for (const sub of subs) {
    if (!sub.note || !sub.student) continue;
    try {
      const noteObj = JSON.parse(sub.note);
      const studentGrpNum = sub.student.groupNumber || 1;
      const expectedGroupName = GOAL_CASCADE_GROUPS[studentGrpNum - 1];

      // Nếu department trong note đang lưu tên nhóm cũ khác expectedGroupName
      if (noteObj.department !== expectedGroupName) {
        noteObj.department = expectedGroupName;
        await prisma.submission.update({
          where: { id: sub.id },
          data: { note: JSON.stringify(noteObj) }
        });
        subsUpdated++;
        console.log(`  ~ Cập nhật BTVN của ${sub.student.studentCode} (${sub.student.fullName}) -> ${expectedGroupName}`);
      }
    } catch (e) {
      // Bỏ qua nếu note không phải JSON
    }
  }
  console.log(`✓ Đã cập nhật xong ${subsUpdated} bài nộp BTVN.`);

  console.log("\n=== HOÀN TẤT ĐỒNG BỘ 10 NHÓM ===");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
