// Tên 10 nhóm dùng chung cho trang học viên và trang giảng viên (Phân nhóm theo bảng phân bàn mới nhất)
export const GOAL_CASCADE_GROUPS = [
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

export const GROUP_STUDENT_CODES: Record<number, string[]> = {
  1: ["HV01", "HV02", "HV03", "HV04", "HV05", "HV18", "HV19"],
  2: ["HV20", "HV21", "HV22", "HV23", "HV24", "HV27", "HV75", "HV76"],
  3: ["HV06", "HV10", "HV11", "HV12", "HV13", "HV14", "HV15", "HV81"],
  4: ["HV07", "HV08", "HV09", "HV16", "HV17", "HV29", "HV30"],
  5: ["HV25", "HV26", "HV28", "HV77", "HV78"],
  6: [
    "HV35", "HV36", "HV37", "HV38", "HV48", "HV49",
    "HV50", "HV51", "HV52", "HV53", "HV54", "HV55",
    "HV79", "HV82", "HV83", "HV84", "HV85",
  ],
  7: ["HV31", "HV32", "HV33", "HV34", "HV39", "HV40", "HV41", "HV42", "HV43", "HV44"],
  8: ["HV45", "HV46", "HV47", "HV56", "HV57", "HV58", "HV59", "HV60", "HV61", "HV80"],
  9: ["HV62", "HV63", "HV64", "HV65", "HV86", "HV87", "HV88", "HV89", "HV90", "HV91"],
  10: ["HV66", "HV67", "HV68", "HV69", "HV70", "HV71", "HV72", "HV73", "HV74"],
};

export function getStudentGroupNumber(studentCode: string, dbGroupNumber?: number | null): number | null {
  if (dbGroupNumber && dbGroupNumber >= 1 && dbGroupNumber <= 10) {
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
