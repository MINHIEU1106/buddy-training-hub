"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatTimeVN } from "@/lib/date";

function CheckOutForm() {
  const searchParams = useSearchParams();
  const sessionCodeFromUrl = searchParams.get("session") || "";

  const [studentCode, setStudentCode] = useState("");
  const [sessionCode, setSessionCode] = useState(sessionCodeFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const savedCode = localStorage.getItem("buddy_student_code");
    if (savedCode && !studentCode) {
      setStudentCode(savedCode);
    }
  }, []);

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const SURVEY_URL = "https://forms.gle/1KBNat2mq5hLybGZ6";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (redirectCountdown !== null && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (redirectCountdown === 0) {
      window.location.href = SURVEY_URL;
    }
    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setError("Vui lòng nhập mã học viên");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: studentCode.trim().toUpperCase(),
          sessionCode: sessionCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đã xảy ra lỗi khi check-out");
      } else {
        setResult(data);
        localStorage.setItem("buddy_student_code", data.student.studentCode);
        // Tự động đếm ngược 4 giây chuyển sang Google Form khảo sát
        setRedirectCountdown(4);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md w-full mx-auto my-auto py-8">
      {!result ? (
        <div className="bg-slate-800/80 border border-slate-700 p-6 sm:p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-6">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-amber-950/80 text-amber-400 border border-amber-800 px-3 py-1 rounded-full mb-3 whitespace-nowrap">
              CỔNG CHECK-OUT & ĐÁNH GIÁ CUỐI GIỜ
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              CHECK-OUT BUỔI HỌC
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Xác nhận giờ ra & tự động mở Biểu mẫu khảo sát đánh giá Buổi 1
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs leading-relaxed">
              <div className="font-bold uppercase tracking-wider mb-1">THÔNG BÁO LỖI</div>
              {error}
            </div>
          )}

          <form onSubmit={handleCheckOut} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                MÃ HỌC VIÊN / SỐ THỨ TỰ (VD: HV01 HOẶC 01)
              </label>
              <input
                type="text"
                maxLength={10}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                placeholder="VD: HV01 hoặc 01"
                autoFocus
                className="w-full text-center font-code text-2xl font-bold tracking-widest bg-slate-900 border-2 border-slate-600 focus:border-amber-500 focus:outline-none text-white py-3.5 px-4 rounded-lg placeholder:text-slate-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                MÃ BUỔI HỌC (TÙY CHỌN NẾU NHẬP TAY)
              </label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Tự động nhận theo buổi đang mở (hoặc nhập VD: BVPD-B1)"
                className="w-full text-center font-code text-sm font-semibold bg-slate-900/60 border border-slate-700 text-slate-300 py-2.5 px-3 rounded-lg focus:border-amber-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-lg whitespace-nowrap transition-colors shadow-lg"
            >
              {loading ? "ĐANG XÁC NHẬN..." : "✓ CHECK-OUT & ĐIỀN KHẢO SÁT"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-slate-800 border-2 border-amber-500/80 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-5">
          <div className="text-center">
            <span className="inline-block text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-amber-400 text-slate-950 shadow-lg font-mono">
              ✓ CHECK-OUT THÀNH CÔNG!
            </span>
            <div className="text-xs text-amber-300 font-bold mt-2">
              {result.attendance.checkOutStatus === "COMPLETED" ? "Đã ghi nhận hoàn thành buổi học trọn vẹn" : "Đã ghi nhận check-out ra về"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              {result.student.fullName}
            </h2>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              {result.student.title || "Học viên"} • {result.student.department || "BV Phương Đông"}
            </p>
          </div>

          {/* Survey Google Form Box */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-2 border-amber-400 p-5 rounded-xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded uppercase font-mono">
                PHIẾU KHẢO SÁT BUỔI 1
              </span>
              {redirectCountdown !== null && (
                <span className="text-xs font-bold text-amber-300 animate-pulse">
                  Tự động mở sau {redirectCountdown}s...
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white">
              Đánh Giá Sau Buổi 1: Khóa Đào Tạo Nâng Cao Năng Lực Quản Lý
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ý kiến của bạn là cơ sở quan trọng để Ban tổ chức nâng cao chất lượng các buổi đào tạo tiếp theo.
            </p>

            <a
              href={SURVEY_URL}
              className="block w-full text-center bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-md transition font-mono"
            >
              📋 MỞ BIỂU MẪU KHẢO SÁT NGAY →
            </a>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">MÃ HỌC VIÊN:</span>
              <span className="text-emerald-400 font-code font-bold text-sm">{result.student.studentCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">BUỔI HỌC:</span>
              <span className="text-slate-200 font-bold">{result.session.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">GIỜ VÀO (CHECK-IN):</span>
              <span className="text-slate-200 font-code">
                {formatTimeVN(result.attendance.checkInAt)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">GIỜ RA (CHECK-OUT):</span>
              <span className="text-slate-200 font-code font-bold text-emerald-400">
                {formatTimeVN(result.attendance.checkOutAt)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-semibold uppercase">TỔNG THỜI GIAN THAM DỰ:</span>
              <span className="text-white font-code font-bold">
                {result.durationMins} phút (~{(result.durationMins / 60).toFixed(1)} giờ)
              </span>
            </div>
          </div>

          {/* Homework Action Box */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-400/80 p-5 rounded-xl space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-500 text-white font-black px-2 py-0.5 rounded uppercase font-mono">
                BÀI TẬP VỀ NHÀ
              </span>
              <span className="text-xs font-bold text-blue-300">NHẮC NHỞ HOÀN THÀNH</span>
            </div>
            <h4 className="text-sm font-bold text-white">
              BTVN: Lập Kế Hoạch Công Việc Cá Nhân & 5W1H (2027)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có thể bắt đầu làm bài tập về nhà online ngay tại đây theo biểu mẫu 3 bước chuẩn chỉnh:
            </p>

            <Link
              href="/portal/homework-plan"
              className="block w-full text-center bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-md transition font-mono"
            >
              📝 LÀM BTVN LẬP KẾ HOẠCH CÁ NHÂN (ONLINE) →
            </Link>
          </div>

          <div>
            <Link
              href="/portal"
              className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg transition"
            >
              ← Về Trang Cá Nhân Học Viên
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CheckOutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold">
            BUDDY TRAINING HUB
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-200">
            BV ĐA KHOA PHƯƠNG ĐÔNG
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded whitespace-nowrap"
        >
          Trang chủ
        </Link>
      </header>

      <Suspense fallback={<div className="text-center text-slate-400 p-8">Đang tải biểu mẫu check-out...</div>}>
        <CheckOutForm />
      </Suspense>

      <footer className="text-center text-[11px] text-slate-500 py-4">
        Hệ thống Điểm danh Buddy Training Hub
      </footer>
    </div>
  );
}
