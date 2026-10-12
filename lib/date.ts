/**
 * Tiện ích xử lý thời gian theo múi giờ Asia/Ho_Chi_Minh (UTC+7)
 */

export function formatTimeVN(date: Date | string | null | undefined): string {
  if (!date) return "--:--";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatDateVN(date: Date | string | null | undefined): string {
  if (!date) return "--/--/----";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTimeVN(date: Date | string | null | undefined): string {
  if (!date) return "--";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  }).format(d);
}

export function getNowInVN(): Date {
  return new Date();
}

/**
 * Lấy phút trong ngày theo giờ Việt Nam (0 - 1439 phút)
 */
export function getVNMinutesOfDay(date: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

/**
 * Chuyển chuỗi "HH:mm" thành số phút trong ngày (0 - 1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
