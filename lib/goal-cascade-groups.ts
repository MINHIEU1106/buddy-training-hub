// Tên 8 nhóm dùng chung cho trang học viên và trang giảng viên (Tổng 80 học viên: Khối BV 60, ASAHI 7, Công ty 13)
export const GOAL_CASCADE_GROUPS = [
  "Nhóm 1: Khối Khám bệnh & Cận lâm sàng (15 người)",
  "Nhóm 2: Khối Cấp cứu - Ngoại - Phẫu thuật (8 người)",
  "Nhóm 3: Khối Nội - Nhi - Sản & CSSK (7 người)",
  "Nhóm 4: Khối Điều dưỡng, KSNK & Chất lượng (4 người)",
  "Nhóm 5: Khối CSKH, Viện phí & Dịch vụ (13 người)",
  "Nhóm 6: Khối Hạ tầng Kỹ thuật, CNTT & Truyền thông (13 người)",
  "Nhóm 7: Viện dưỡng lão ASAHI (7 người)",
  "Nhóm 8: Khối Công ty & Dự án (13 người)",
];

export const GROUP_STUDENT_CODES: Record<number, string[]> = {
  1: [
    "HV01", "HV02", "HV03", "HV04", "HV05",
    "HV18", "HV19", "HV20", "HV21", "HV22",
    "HV23", "HV24", "HV27", "HV75", "HV76",
  ], // 15 cán bộ
  2: [
    "HV06", "HV10", "HV11", "HV12", "HV13", "HV14", "HV15", "HV26",
  ], // 8 cán bộ (đã chuyển chị Bùi Mỹ Lương HV26 sang Nhóm 2)
  3: [
    "HV07", "HV08", "HV09", "HV16", "HV17", "HV29", "HV30",
  ], // 7 cán bộ
  4: [
    "HV25", "HV28", "HV77", "HV78",
  ], // 4 cán bộ (Điều dưỡng, KSNK & Phòng KHTH-QLCL)
  5: [
    "HV35", "HV36", "HV37", "HV38", "HV48", "HV49",
    "HV50", "HV51", "HV52", "HV53", "HV54", "HV55", "HV79",
  ], // 13 cán bộ (CSKH, Viện phí, Dịch vụ & Phát triển DVKH)
  6: [
    "HV31", "HV32", "HV33", "HV34", "HV39", "HV40",
    "HV41", "HV42", "HV43", "HV44", "HV45", "HV46", "HV47",
  ], // 13 cán bộ
  7: [
    "HV56", "HV57", "HV58", "HV59", "HV60", "HV61", "HV80",
  ], // 7 cán bộ ASAHI
  8: [
    "HV62", "HV63", "HV64", "HV65", "HV66", "HV67",
    "HV68", "HV69", "HV70", "HV71", "HV72", "HV73", "HV74",
  ], // 13 cán bộ Khối Công ty
};

export function getStudentGroupNumber(studentCode: string, dbGroupNumber?: number | null): number | null {
  if (dbGroupNumber && dbGroupNumber >= 1 && dbGroupNumber <= 8) {
    return dbGroupNumber;
  }
  for (const [groupNum, codes] of Object.entries(GROUP_STUDENT_CODES)) {
    if (codes.includes(studentCode)) {
      return Number(groupNum);
    }
  }
  return null;
}

export function getStudentGroupName(studentCode: string, dbGroupNumber?: number | null): string {
  const num = getStudentGroupNumber(studentCode, dbGroupNumber);
  if (!num) return "Chưa phân nhóm";
  return GOAL_CASCADE_GROUPS[num - 1] || `Nhóm ${num}`;
}
