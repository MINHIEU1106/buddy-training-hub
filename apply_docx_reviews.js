const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const reviews = [
  {
    groupIndex: 0,
    groupName: "Nhóm 1: Khối Khám bệnh & Cận lâm sàng (15 người)",
    score: 85,
    comment: `Điểm đánh giá: 85 / 100
Ưu điểm nổi bật:
- Tuyên bố mục tiêu (Bước 1): Tốt, bám sát thực tế luồng đón tiếp ngoại trú và cận lâm sàng: "Rút ngắn thời gian chờ khám và trả kết quả xét nghiệm/CĐHA, tối ưu luồng đón tiếp ngoại trú".
- Phân công trách nhiệm (5W1H): Phân công người phụ trách (WHO) và mốc thời gian (WHEN) chi tiết, rõ ràng giữa Trưởng khoa Khám bệnh, Phó khoa phụ trách vận hành và các phòng ban phối hợp.

Cần chỉnh sửa:
- Bước 2 (Mục tiêu SMART): Chỉ số KR1 (Hài lòng: 84% → 98%) chưa phân rã mốc kiểm tra theo Quý. Thời hạn KR2 (30/09/2027) chưa đồng bộ mốc năm.
  + Sửa lại: Phân rã mốc Quý cho KR1 (Q1: 88% → Q2: 91% → Q3: 95% → Q4: 98%). KR2 (Chờ khám): Q1: 40' → Q2: 35' → Q3: 32' → Q4: ≤ 30'.
- Bước 3-6 (5W1H): Cột HOW (Cách làm) ở cả 2 công việc đang bị nhầm lẫn giữa Nguồn lực/Công cụ (phần mềm đặt lịch, bố trí 2 điều dưỡng, màn hình thông báo) với Chuỗi các bước thực hiện.
  + Sửa lại: Viết lại cột HOW thành chuỗi quy trình hành động (VD: Truyền thông App → Hướng dẫn đặt hẹn → Phân luồng ưu tiên tại sảnh).`,
  },
  {
    groupIndex: 1,
    groupName: "Nhóm 2: Khối Cấp cứu - Ngoại - Phẫu thuật (8 người)",
    score: 90,
    comment: `Điểm đánh giá: 90 / 100
Ưu điểm nổi bật:
- Tuyên bố mục tiêu (Bước 1): Rất sắc bén, thể hiện rõ tính chất đặc thù khẩn cấp và an toàn người bệnh: "Tối ưu hóa thời gian tiếp nhận cấp cứu, chuyển mổ khẩn và đảm bảo an toàn người bệnh tuyệt đối".
- Key Results (Bước 2): Chọn chỉ số KR2 "Thời gian chuyển mổ khẩn từ khi có chỉ định đến khi vào phòng mổ ≤ 10 phút" có hàm lượng chuyên môn cao, mang lại giá trị thực tế lớn cho bệnh viện.
- 5W1H (Bước 3-6): Đã xây dựng được bảng kiểm bàn giao, quy trình báo động 24/7 và sự phối hợp chặt chẽ giữa Cấp cứu - Ngoại - Phẫu thuật - Gây mê hồi sức.

Cần chỉnh sửa:
- Bước 2 (Mục tiêu SMART): Chưa bổ sung mốc chia Quý cho các chỉ số Key Results.
  + Sửa lại: Bổ sung mốc Quý: KR1 (Cấp cứu): Q1: 92% → Q2: 94% → Q3: 96% → Q4: 98%. KR2 (Chuyển mổ): Q1: 18' → Q2: 15' → Q3: 12' → Q4: ≤ 10'.`,
  },
  {
    groupIndex: 2,
    groupName: "Nhóm 3: Khối Nội - Nhi - Sản & CSSK (7 người)",
    score: 75,
    comment: `Điểm đánh giá: 75 / 100
Ưu điểm nổi bật:
- Tuyên bố mục tiêu (Bước 1): Thể hiện đúng định hướng chăm sóc người bệnh nội trú: "Nâng cao chất lượng điều trị nội trú, tư vấn chu đáo và chăm sóc chuyên sâu".
- Sáng kiến giải pháp (5W1H): Ý tưởng phát hành "Sổ tay hướng dẫn người bệnh nội trú" và dán "Mã QR tra cứu hồ sơ điều trị" ở Công việc 1 rất thiết thực, giúp tăng minh bạch thông tin.

Cần chỉnh sửa:
- Bước 2 (Lỗi đặt mục tiêu): Đặt mục tiêu KR1 Hài lòng 92% là sai lệch, thấp hơn mức sàn 98% Bệnh viện giao. Chỉ số KR2 lại lấy "thời gian chờ khám 30 phút" của khối Ngoại trú là không đúng khối Nội trú.
  + Sửa lại: Điều chỉnh KR1 đạt 98% (Q1: 88% → Q2: 91% → Q3: 95% → Q4: 98%). Thay KR2 thành: "100% người bệnh nội trú được tư vấn phác đồ và hướng dẫn dùng thuốc đầy đủ".
- Bước 3-6 (Thiếu công việc): Nhóm mới chỉ thực hiện 1 công việc. Đề bài yêu cầu tối thiểu 2 công việc.
  + Bổ sung Công việc 2 VD: "Cải tiến quy trình chăm sóc toàn diện và đi buồng phối hợp Bác sĩ - Điều dưỡng hàng ngày" (Chủ trì: Trưởng khoa Nội/Nhi/Sản).`,
  },
  {
    groupIndex: 3,
    groupName: "Nhóm 4: Khối Điều dưỡng, KSNK & Chất lượng (4 người)",
    score: 70,
    comment: `Điểm đánh giá: 70 / 100
Cần chỉnh sửa:
- Bước 1 (Mục tiêu): Tuyên bố mục tiêu của nhóm mới chỉ ghi con số đầu ra chung chung, chưa đưa được định hướng giải pháp cốt lõi về Giao tiếp AIDET & Kiểm soát nhiễm khuẩn. Nhóm điền hạn hoàn thành là tháng 12 năm 2026, trong khi toàn bộ chương trình và các nhóm khác lập kế hoạch cho năm 2027.
  + Sửa lại: "Nâng cao chất lượng chăm sóc nội trú toàn diện, đóng góp trực tiếp vào mục tiêu Tỷ lệ hài lòng người bệnh của Bệnh viện đạt 98%".
    • Chuẩn hóa Giao tiếp: Tuân thủ 100% văn hóa giao tiếp AIDET và thái độ phục vụ người bệnh.
    • Kiểm soát Nhiễm khuẩn: Đảm bảo ≥ 98% quy trình KSNK buồng bệnh và vệ sinh tay.
    • Tối ưu Vận hành: Rút ngắn thời gian thanh toán và hoàn tất thủ tục ra viện ≤ 30 phút.

- Bước 2 (Chỉ số đo lường): Chưa thể hiện được chỉ số đo lường việc Tuân thủ mô hình giao tiếp AIDET và Tỷ lệ tuân thủ KSNK buồng bệnh của lực lượng điều dưỡng/nhân viên y tế. Chỉ để 1 mốc hoàn thành cuối năm 2026.
  + Sửa lại: Phân rã mốc Quý năm 2027:
    • Chỉ tiêu 1: Tỷ lệ nhân viên y tế tuân thủ mô hình giao tiếp AIDET tại các khoa nội trú: Hiện tại: 80%; Mục tiêu: 100% (Phân rã: Q1: 96%; Q2: 97%; Q3: 97.5%; Q4: 98%).
    • Chỉ tiêu 2: Tỷ lệ tuân thủ quy trình KSNK buồng bệnh và vệ sinh tay: Hiện tại: 85%; Mục tiêu: 98% (Phân rã: Q1: 90%; Q2: 93%; Q3: 95%; Q4: 98%).
    • Chỉ tiêu 3: Thời gian trung bình hoàn tất thủ tục và thanh toán ra viện nội trú: Hiện tại: 45'; Mục tiêu: ≤ 30' (Phân rã: Q1: 40'; Q2: 35'; Q3: 32'; Q4: ≤ 30').

- Bước 3-6 (Lỗi nhầm chỉ số):
  + Chỉ tiêu 1: Thông báo kế hoạch ra viện của người bệnh: Mục tiêu đo lường ghi nhầm "Tỷ lệ bệnh nhân đặt hẹn trước đạt ≥ 40%" của khối Ngoại trú.
  + Chỉ tiêu 2: Nội dung "Tái cấu trúc luồng Cận lâm sàng" là của Nhóm 1. Khối Điều dưỡng/QLCL không trực tiếp quản lý luồng này.
  + Sửa lại:
    • Công việc 1: Tập huấn và Giám sát Văn hóa Giao tiếp AIDET (Chủ trì: Trưởng phòng Điều dưỡng. Phối hợp: Trưởng khoa Lâm sàng & Phòng QLCL). Mốc: 10/01/2027 – 31/03/2027. Đạt 100% NVYT tuân thủ.
    • Công việc 2: Tối ưu Quy trình Lập kế hoạch Ra viện trước 24h (Chủ trì: Phòng QLCL & Phòng Điều dưỡng. Phối hợp: Bác sĩ điều trị & TCKT). Mốc: 01/02/2027 – 30/04/2027. 100% người bệnh được thông báo trước 24h, thanh toán ≤ 30 phút.
    • Công việc 3: Giám sát Chuẩn hóa Quy trình KSNK Buồng bệnh & Vệ sinh tay (Chủ trì: Trưởng khoa KSNK. Phối hợp: Phòng Điều dưỡng). Mốc: 01/01/2027 – 31/12/2027. Đạt ≥ 98% tuân thủ.`,
  },
  {
    groupIndex: 4,
    groupName: "Nhóm 5: Khối CSKH, Viện phí & Dịch vụ (13 người)",
    score: 0,
    comment: `Trạng thái: Nhóm chưa nộp bài thực hành trên hệ thống (KHÔNG NỘP BÀI).
Nhắc nhở từ Giảng viên:
Nhóm cần khẩn trương truy cập cổng bài tập thực hành Buổi 1, hoàn thiện và nộp bản kế hoạch phân rã mục tiêu 5W1H (Bước 1, Bước 2, Bước 3-6) để Giảng viên đánh giá và mở khóa đầy đủ dữ liệu cho bài tập Buổi 2.`,
  },
  {
    groupIndex: 5,
    groupName: "Nhóm 6: Khối Hạ tầng Kỹ thuật, CNTT & Truyền thông (13 người)",
    score: 70,
    comment: `Điểm đánh giá: 70 / 100
Ưu điểm nổi bật:
- Bao phủ hành trình (5W1H): Xây dựng đủ 4 công việc bao phủ toàn bộ hành trình trải nghiệm của người bệnh (Trước khám → Đặt lịch → Tại viện → Sau khám ra về).
- Phối hợp liên phòng ban: Thể hiện sự kết nối tốt giữa CNTT, Marketing, Truyền thông, Cung ứng và TCKT.

Cần chỉnh sửa:
- Bước 1: Cần phân rã mục tiêu của tập đoàn xuống đơn vị, không viết nguyên mục tiêu đơn vị.
  + Hướng điều chỉnh: Bổ sung định hướng chức năng: "Đảm bảo hạ tầng Kỹ thuật, CNTT thông suốt và truyền thông hiệu quả, góp phần nâng tỷ lệ hài lòng người bệnh đạt từ 98% trở lên".
- Bước 2: Chỉ tiêu ghi "92 98%" không rõ ràng định dạng. Thiếu chỉ số kỹ thuật hạ tầng.
  + Sửa lại: Ghi rõ chỉ tiêu đạt 98% (Q1: 89% → Q2: 92% → Q3: 95% → Q4: 98%). Bổ sung chỉ tiêu hạ tầng: "Tỷ lệ thời gian hệ thống CNTT/HIS hoạt động liên tục (Uptime) đạt 99.9%".
- Bước 3-6: Chỉ tiêu 3 và 4 chưa có chỉ số mục tiêu/đo lường cụ thể.
  + Bổ sung chỉ số: Chỉ tiêu 3 (Tiếp đón): 100% khách hàng được hướng dẫn trong 3 phút. Chỉ tiêu 4 (Sau khám): 100% bệnh nhân được gọi điện khảo sát hài lòng trong 24h.`,
  },
  {
    groupIndex: 6,
    groupName: "Nhóm 7: Viện dưỡng lão ASAHI (7 người)",
    score: 95,
    comment: `Điểm đánh giá: 95 / 100 điểm (Xếp loại: Xuất sắc - Bài làm tốt nhất lớp)
Ưu điểm nổi bật:
- Tuyên bố mục tiêu (Bước 1): Xuất sắc, truyền cảm hứng: "Nâng tầm trải nghiệm chăm sóc người cao tuổi: Chuẩn hóa quy trình phục vụ tại Viện dưỡng lão, cá nhân hóa lộ trình chăm sóc sức khỏe - tinh thần nhằm đóng góp trực tiếp vào mục tiêu tỷ lệ cư dân và khách hàng hài lòng 98%".
- Key Results (Bước 2): Thiết lập bộ KPI tuyệt vời, cân bằng giữa chăm sóc y tế (Thời gian đáp ứng ≤ 5 phút) và đời sống tinh thần (80% cư dân tham gia CLB/sự kiện).
- 5W1H (Bước 3-6): Cột HOW phân tích sâu chuyên môn vận hành dưỡng lão (phân ca trực chéo, tổ chức Workshop "Tâm Sắc", tham quan Hoàng Thành). Đây là bài làm mẫu cho toàn lớp.

Cần chỉnh sửa:
- Bước 2 (Chỉnh nhẹ chỉ số): Chỉ tiêu 1 đang để 95% (nên điều chỉnh lên 98% cho đồng bộ toàn hệ thống). Bổ sung mốc chia Quý cho cả năm 2027 thay vì chỉ ghi mốc 31/03/2027.
  + Sửa lại: Chỉ tiêu 1 (Hài lòng): 85% → 98% (Q1: 90%; Q2: 93%; Q3: 96%; Q4: 98%). KR2 (Thời gian phản hồi): ≤ 5 phút (Giữ nguyên). KR3 (Hoạt động tinh thần): 80% → 95% (Giữ nguyên).
- Bước 3-6: Chỉ tiêu 1: Xuất sắc; Chỉ tiêu 2: Sáng tạo.`,
  },
  {
    groupIndex: 7,
    groupName: "Nhóm 8: Khối Công ty & Dự án (13 người)",
    score: 65,
    comment: `Điểm đánh giá: 65 / 100
Ưu điểm nổi bật:
- Tuyên bố mục tiêu (Bước 1): Đã nỗ lực chuyển hóa nhiệm vụ hậu phương (Nhân sự, Dự án, Tài chính) thành giá trị phục vụ người bệnh: "Đảm bảo nguồn nhân lực đáp ứng yêu cầu về số lượng, năng lực chuyên môn, kỹ năng giao tiếp... đóng góp vào mục tiêu hài lòng 98%".
- Ý tưởng KR: Đưa được chỉ số đào tạo hội nhập 100% nhân sự mới trước khi tiếp xúc người bệnh.

Cần chỉnh sửa:
- Bước 2 (Bỏ trống chỉ số):
  + Chỉ tiêu 1: Tỷ lệ vị trí nhân sự trọng yếu phục vụ người bệnh theo bố trí nhân sự định biên đã duyệt (Hiện tại: 70 | Mục tiêu 2027: 80% | Thời hạn: Bỏ trống).
  + Chỉ tiêu 3: Tỷ lệ vi phạm quy tắc ứng xử được xác minh và xử lý theo quy trình đúng thời hạn (Hiện tại: 90 | Mục tiêu 2027: 100% | Thời hạn: Bỏ trống).
  + Chỉ tiêu 4: Đảm bảo chi trả chế độ chính sách đúng và đủ (Hiện tại: 100 | Mục tiêu 2027: 100% | Thời hạn: Bỏ trống).
  + Chỉ tiêu 5: Tỷ lệ các khiếu nại của CBNV được giải quyết trong vòng 1 tuần (Bỏ trống toàn bộ các ô).
  + Sửa lại: Điền đầy đủ các chỉ số: Chỉ tiêu 1 (Định biên): 70% → 90%; Chỉ tiêu 2 (Đào tạo hội nhập): 95% → 100%; Chỉ tiêu 3 (Xử lý khiếu nại CBNV): 80% → 100% đúng hạn trong 48h.
- Bước 3-6: Khả năng nhập lỗi.
  + Sửa lại theo chỉ tiêu đã đưa ở bước 1:
    • Chỉ tiêu 1: "Tuyển dụng bổ sung đủ 100% định biên nhân sự tuyến đầu tiếp xúc người bệnh" (P. HCNS chủ trì). Phân rã định biên theo Quý (Q1, Q2, Q3, Q4).
    • Chỉ tiêu 2: "100% nhân viên mới trong 2 tuần đầu nhận việc được đào tạo hội nhập, tỷ lệ đầu ra sau đào tạo đạt 100%".
    • Chỉ tiêu 3: Tương tự.`,
  },
];

async function main() {
  console.log("Applying detailed reviews from docx to GoalCascadePlan...");

  for (const item of reviews) {
    const existing = await prisma.goalCascadePlan.findUnique({
      where: { groupIndex: item.groupIndex },
    });

    if (existing) {
      await prisma.goalCascadePlan.update({
        where: { groupIndex: item.groupIndex },
        data: {
          comment: item.comment,
          score: item.score,
        },
      });
      console.log(`Updated group ${item.groupIndex + 1}: ${item.groupName} (Score: ${item.score})`);
    } else {
      console.log(`Skipped group ${item.groupIndex + 1}: ${item.groupName} (Chưa nộp bài)`);
    }
  }

  console.log("All 8 groups successfully updated with feedback!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
