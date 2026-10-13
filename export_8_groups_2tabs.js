const { PrismaClient } = require("@prisma/client");
const ExcelJS = require("exceljs");
const path = require("path");

const prisma = new PrismaClient();

// CẤU HÌNH 8 NHÓM CHUẨN THEO YÊU CẦU (80 HỌC VIÊN):
// Khối Bệnh viện (60 người) chia thành 6 nhóm chuyên môn
// Viện dưỡng lão ASAHI (7 người) giữ nguyên nhóm riêng
// Khối Công ty (13 người) giữ nguyên nhóm riêng
const GROUPS_8_CONFIG = [
  {
    groupIndex: 1,
    formalName: "Khối Khám bệnh & Cận lâm sàng",
    funName: "🚀 BIỆT ĐỘI THẦN TỐC (Khám bệnh & Cận lâm sàng)",
    slogan: "Khám chuẩn - Trả nhanh - Không chờ đợi",
    targetHospital: "Giảm thời gian chờ khám từ 45p xuống 30p, trả kết quả CLS trong 45p, hài lòng >= 92%",
    description: "Khoa Khám bệnh, Khám sức khỏe toàn diện, Xét nghiệm, CĐHA, Nội soi, Dược, Cơ xương khớp, Mắt, TMH",
    codeList: [
      "HV01", "HV02", "HV03", "HV04", "HV05",
      "HV18", "HV19", "HV20", "HV21", "HV22",
      "HV23", "HV24", "HV27", "HV75", "HV76"
    ], // 15 cán bộ
  },
  {
    groupIndex: 2,
    formalName: "Khối Cấp cứu - Ngoại - Phẫu thuật can thiệp",
    funName: "⚡ BIỆT ĐỘI PHẢN ỨNG NHANH (Cấp cứu & Phẫu thuật)",
    slogan: "Cứu người như cứu hỏa - An toàn tuyệt đối",
    targetHospital: "Tiếp nhận cấp cứu nguy kịch <= 3 phút, an toàn phẫu thuật 100%, chuyển mổ khẩn kịp thời",
    description: "Khoa Cấp cứu, ICU, Khoa Ngoại, Phẫu thuật tạo hình, Gây mê hồi sức, Ngân hàng mô, Tế bào gốc, Ung bướu",
    codeList: [
      "HV06", "HV10", "HV11", "HV12", "HV13", "HV14", "HV15"
    ], // 7 cán bộ
  },
  {
    groupIndex: 3,
    formalName: "Khối Nội - Nhi - Sản & Chăm sóc toàn diện",
    funName: "🌸 GIA ĐÌNH YÊU THƯƠNG (Nội - Nhi - Sản)",
    slogan: "Tận tâm từng khoảnh khắc - Trọn vẹn niềm tin",
    targetHospital: "Nâng cao chất lượng điều trị nội trú, tư vấn chu đáo phác đồ, hài lòng nội trú >= 95%",
    description: "Khoa Nội, Khoa Nhi, Khoa Phụ sản, Y học cổ truyền, VLTL-PHCN, Hiếm muộn & Nam học, CSSK toàn diện CNC",
    codeList: [
      "HV07", "HV08", "HV09", "HV16", "HV17", "HV29", "HV30"
    ], // 7 cán bộ
  },
  {
    groupIndex: 4,
    formalName: "Khối Điều dưỡng, Kiểm soát nhiễm khuẩn & Chất lượng",
    funName: "🛡️ TẤM LÁ CHẮN CHUẨN SAO (Điều dưỡng, KSNK & QLCL)",
    slogan: "Giao tiếp AIDET - An toàn chuẩn sao",
    targetHospital: "100% điều dưỡng tuân thủ giao tiếp AIDET, kiểm soát nhiễm khuẩn & quản lý chất lượng 0 lỗi",
    description: "Lãnh đạo Phòng Điều dưỡng toàn viện, Khoa Kiểm soát nhiễm khuẩn, Phòng Nghiệp vụ KCB & BHYT, Phòng KHTH - QLCL",
    codeList: [
      "HV25", "HV26", "HV28", "HV77", "HV78"
    ], // 5 cán bộ
  },
  {
    groupIndex: 5,
    formalName: "Khối Chăm sóc Khách hàng, Viện phí & Dịch vụ",
    funName: "🌟 NỤ CƯỜI PHƯƠNG ĐÔNG (CSKH, Viện phí & Dịch vụ)",
    slogan: "Chạm là hài lòng - Đón tiếp tận tâm",
    targetHospital: "Trải nghiệm đón tiếp 5 sao, giải quyết 100% khiếu nại trong 24h, thủ tục viện phí nhanh gọn",
    description: "Phòng CSKH, Phát triển DVKH, Quản lý dịch vụ, Quầy BHYT, Kế toán viện phí, Bếp & Nhà hàng Sen, Quan hệ đối tác",
    codeList: [
      "HV35", "HV36", "HV37", "HV38", "HV48", "HV49", "HV50", "HV51", "HV52", "HV53", "HV54", "HV55", "HV79"
    ], // 13 cán bộ
  },
  {
    groupIndex: 6,
    formalName: "Khối Hạ tầng Kỹ thuật, CNTT & Truyền thông",
    funName: "💡 ĐẦU NÃO CÔNG NGHỆ (CNTT, Kỹ thuật & Marketing)",
    slogan: "Hạ tầng vững vàng - Truyền thông bứt phá",
    targetHospital: "Đảm bảo Uptime hệ thống HIS/LIS 99.9%, trang thiết bị sẵn sàng 100%, lan tỏa thương hiệu bệnh viện",
    description: "Tổ chức nhân sự viện, Hành chính HCQT, CNTT, Phần mềm số, Thiết bị, Cung ứng, Marketing, Media, Kinh doanh",
    codeList: [
      "HV31", "HV32", "HV33", "HV34", "HV39", "HV40", "HV41", "HV42", "HV43", "HV44", "HV45", "HV46", "HV47"
    ], // 13 cán bộ (Khối Bệnh viện tổng 15+7+7+5+13+13 = 60 người)
  },
  {
    groupIndex: 7,
    formalName: "Viện dưỡng lão ASAHI (Khối riêng 7 người)",
    funName: "🎋 TỔ ẤM AN VUI (Viện Dưỡng Lão ASAHI)",
    slogan: "Phụng dưỡng từ tâm - Trọn đời an lạc",
    targetHospital: "Nâng cao chất lượng chăm sóc dài hạn, tối ưu hóa quy trình tiếp đón và quản trị chi phí ASAHI",
    description: "Dịch vụ khách hàng, Hành chính quản trị, Kế hoạch vận hành, Tài chính kế toán, Cung ứng Viện dưỡng lão ASAHI",
    codeList: [
      "HV56", "HV57", "HV58", "HV59", "HV60", "HV61", "HV80"
    ], // 7 cán bộ ASAHI
  },
  {
    groupIndex: 8,
    formalName: "Khối Công ty & Dự án (Khối riêng 13 người)",
    funName: "👑 CHIẾN HẠM ĐIỀU HÀNH (Khối Công Ty & Dự Án)",
    slogan: "Quản trị tinh gọn - Vững bước tiên phong",
    targetHospital: "Điều hành tối ưu dòng tiền, pháp lý minh bạch, quản lý chặt tiến độ dự án đầu tư và thiết kế công trình",
    description: "Ban Trợ lý - Thư ký, Giám sát ANNB, Pháp chế, HCNS Công ty, TCKT Công ty, Thiết kế, BQL Tòa nhà, Đầu tư DA1",
    codeList: [
      "HV62", "HV63", "HV64", "HV65", "HV66", "HV67", "HV68", "HV69", "HV70", "HV71", "HV72", "HV73", "HV74"
    ], // 13 cán bộ Công ty
  },
];

async function generateTwoTabExcel() {
  const allStudents = await prisma.student.findMany({
    orderBy: { studentCode: "asc" },
  });

  const studentMap = new Map();
  allStudents.forEach((st) => studentMap.set(st.studentCode, st));

  // Kiểm tra tổng số cán bộ
  let totalAllocated = 0;
  GROUPS_8_CONFIG.forEach((g) => (totalAllocated += g.codeList.length));
  console.log(`Kiểm tra khớp số lượng: ${totalAllocated}/80 học viên.`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Buddy Training Hub - BV Phương Đông";
  workbook.created = new Date();

  // ==========================================
  // TAB 1: CÁCH CHIA & BẢNG ĐIỀU PHỐI 8 NHÓM
  // ==========================================
  const ws1 = workbook.addWorksheet("1. CÁCH CHIA 8 NHÓM", {
    views: [{ showGridLines: true }],
  });

  // Banner Header
  ws1.mergeCells("A1:D1");
  const b1 = ws1.getCell("A1");
  b1.value = "BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG — KHÓA ĐÀO TẠO QUẢN LÝ CẤP TRUNG (80 HỌC VIÊN)";
  b1.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF00685E" } };
  b1.alignment = { horizontal: "center", vertical: "middle" };

  ws1.mergeCells("A2:D2");
  const b2 = ws1.getCell("A2");
  b2.value = "MA TRẬN PHÂN CHIA NHÓM THỰC HÀNH (8 NHÓM)";
  b2.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF103746" } };
  b2.alignment = { horizontal: "center", vertical: "middle" };

  ws1.mergeCells("A3:D3");
  const b3 = ws1.getCell("A3");
  b3.value = "Nguyên tắc: Khối Bệnh viện chia nhỏ theo chuyên môn (Nhóm 1-6) | ASAHI giữ riêng (Nhóm 7) | Khối Công ty giữ riêng (Nhóm 8)";
  b3.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF64748B" } };
  b3.alignment = { horizontal: "center", vertical: "middle" };

  ws1.addRow([]); // Blank row 4

  const tab1Headers = [
    "BÀN / NHÓM",
    "SĨ SỐ",
    "PHẠM VI KHOA / PHÒNG ĐẠI DIỆN",
    "MỤC TIÊU PHÂN RÃ TRỌNG TÂM (CASCADE GOAL)",
  ];

  const hRow1 = ws1.addRow(tab1Headers);
  hRow1.height = 30;
  hRow1.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00685E" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      left: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "medium", color: { argb: "FF004D40" } },
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  GROUPS_8_CONFIG.forEach((grp, idx) => {
    const r = ws1.addRow([
      `Nhóm ${grp.groupIndex}`,
      `${grp.codeList.length} người`,
      grp.description,
      grp.targetHospital,
    ]);
    r.height = 42;

    const isEven = idx % 2 === 1;
    const bg = isEven ? "FFF8FAFC" : "FFFFFFFF";

    r.eachCell((cell, colIdx) => {
      cell.font = { name: "Arial", size: 10, color: { argb: "FF1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "middle", wrapText: true };

      if (colIdx === 1 || colIdx === 2) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0F172A" } };
      }
    });
  });

  ws1.columns = [
    { width: 16 }, // BÀN / NHÓM
    { width: 16 }, // SĨ SỐ
    { width: 54 }, // PHẠM VI
    { width: 54 }, // MỤC TIÊU
  ];

  // ==========================================
  // TAB 2: DANH SÁCH THÔNG TIN HỌC VIÊN THEO NHÓM
  // ==========================================
  const ws2 = workbook.addWorksheet("2. DANH SÁCH CHI TIẾT THEO NHÓM", {
    views: [{ showGridLines: true }],
  });

  ws2.mergeCells("A1:H1");
  const h1 = ws2.getCell("A1");
  h1.value = "BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG — DANH SÁCH CHI TIẾT 80 CÁN BỘ THEO 8 NHÓM";
  h1.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF00685E" } };
  h1.alignment = { horizontal: "center", vertical: "middle" };

  ws2.mergeCells("A2:H2");
  const h2 = ws2.getCell("A2");
  h2.value = "DANH SÁCH HỌC VIÊN ĐÍNH KÈM MÃ HV (HV01 - HV80) & PHÂN BỔ BÀN THỰC HÀNH";
  h2.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF103746" } };
  h2.alignment = { horizontal: "center", vertical: "middle" };

  ws2.addRow([]); // Blank row 3

  const tab2Headers = [
    "STT NHÓM",
    "BÀN / NHÓM",
    "MÃ HV",
    "HỌ VÀ TÊN",
    "CHỨC DANH QUẢN LÝ",
    "KHOA / PHÒNG / BỘ PHẬN",
    "CẤP BẬC",
    "EMAIL NỘI BỘ",
  ];

  const hRow2 = ws2.addRow(tab2Headers);
  hRow2.height = 28;
  hRow2.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00685E" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      left: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "medium", color: { argb: "FF004D40" } },
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  const groupHeaderColors = [
    "FFE0F2FE", // Nhóm 1 - Light Sky
    "FFDCFCE7", // Nhóm 2 - Light Emerald
    "FFFEF9C3", // Nhóm 3 - Light Yellow
    "FFFFEDD5", // Nhóm 4 - Light Orange
    "FFFCE7F3", // Nhóm 5 - Light Pink
    "FFF3E8FF", // Nhóm 6 - Light Purple
    "FFE0E7FF", // Nhóm 7 (ASAHI) - Light Indigo
    "FFF1F5F9", // Nhóm 8 (Công ty) - Light Slate
  ];

  GROUPS_8_CONFIG.forEach((grp, gIdx) => {
    // Row phân cách nhóm (đã xóa tên nhóm theo yêu cầu)
    const sep = ws2.addRow([
      `NHÓM ${grp.groupIndex}`,
      `(${grp.codeList.length} Học viên)`,
      "", "", "", "", "", ""
    ]);
    sep.height = 26;
    ws2.mergeCells(`B${sep.number}:H${sep.number}`);

    sep.getCell(1).font = { name: "Arial", size: 10.5, bold: true, color: { argb: "FF1E293B" } };
    sep.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    sep.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: groupHeaderColors[gIdx] } };

    sep.getCell(2).font = { name: "Arial", size: 10.5, bold: true, color: { argb: "FF00685E" } };
    sep.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    sep.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: groupHeaderColors[gIdx] } };

    grp.codeList.forEach((code, mIdx) => {
      const st = studentMap.get(code);
      if (!st) return;

      const r = ws2.addRow([
        mIdx + 1,
        `Nhóm ${grp.groupIndex}`,
        st.studentCode,
        st.fullName,
        st.title || "--",
        st.department || "--",
        st.managementLevel || "Quản lý",
        st.email || "--",
      ]);
      r.height = 24;

      const isEven = mIdx % 2 === 1;
      const bg = isEven ? "FFF8FAFC" : "FFFFFFFF";

      r.eachCell((cell, colIdx) => {
        cell.font = { name: "Arial", size: 10, color: { argb: "FF1E293B" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        if (colIdx === 1 || colIdx === 2) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (colIdx === 3) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 10.5, bold: true, color: { argb: "FF00685E" } };
        } else if (colIdx === 4) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0F172A" } };
        } else if (colIdx === 7) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        }
      });
    });
  });

  ws2.columns = [
    { width: 12 }, // STT NHÓM
    { width: 14 }, // BÀN
    { width: 14 }, // MÃ HV
    { width: 26 }, // HỌ VÀ TÊN
    { width: 34 }, // CHỨC DANH
    { width: 44 }, // KHOA PHÒNG
    { width: 20 }, // CẤP BẬC
    { width: 32 }, // EMAIL
  ];

  const p1 = path.join(process.cwd(), "DANH_SACH_CHIA_8_NHOM_THEO_KHOA_PHONG_BVPD.xlsx");
  const p2 = path.join(process.cwd(), "public", "DANH_SACH_CHIA_8_NHOM_THEO_KHOA_PHONG_BVPD.xlsx");

  await workbook.xlsx.writeFile(p1);
  await workbook.xlsx.writeFile(p2);

  console.log("Xuất file Excel 2 tab thành công tại:");
  console.log("1. " + p1);
  console.log("2. " + p2);

  await prisma.$disconnect();
}

generateTwoTabExcel().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
