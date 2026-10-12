// Character pool without ambiguous characters: 0/O, 1/I/L, 8/B
const SAFE_CHARS = "2345679ACDEFGHJKMNPQRSTUVWXYZ";

/**
 * Sinh mã học viên 6 ký tự ngẫu nhiên, không trùng lặp
 */
export function generateStudentCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * SAFE_CHARS.length);
    result += SAFE_CHARS[randomIndex];
  }
  return result;
}

/**
 * Chuẩn hóa mã khi người dùng nhập vào:
 * - Hỗ trợ nhập trực tiếp số thứ tự: 1 -> HV01, 73 -> HV73
 * - Hỗ trợ nhập H01 -> HV01
 * - Hỗ trợ nhập HV1 -> HV01
 * - Chuyển chữ hoa, xóa khoảng trắng
 */
export function normalizeCode(input: string): string {
  if (!input) return "";
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");

  // Trường hợp học viên chỉ gõ số thứ tự: VD: "1" -> "HV01", "73" -> "HV73"
  if (/^\d{1,3}$/.test(cleaned)) {
    const num = parseInt(cleaned, 10);
    return `HV${num.toString().padStart(2, "0")}`;
  }

  // Trường hợp gõ "H01" -> "HV01", "H73" -> "HV73"
  if (/^H\d{1,3}$/.test(cleaned)) {
    const num = parseInt(cleaned.slice(1), 10);
    return `HV${num.toString().padStart(2, "0")}`;
  }

  // Trường hợp gõ "HV1" -> "HV01"
  if (/^HV\d{1,3}$/.test(cleaned)) {
    const num = parseInt(cleaned.slice(2), 10);
    return `HV${num.toString().padStart(2, "0")}`;
  }

  return cleaned;
}
