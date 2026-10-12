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
              CỔNG CHECK-OUT CUỐI GIỜ
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              CHECK-OUT KẾT THÚC BUỔI
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Xác nhận giờ ra để ghi nhận tổng thời gian tham gia khóa học
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
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-lg whitespace-nowrap transition-colors shadow-lg"
            >
              {loading ? "ĐANG XÁC NHẬN..." : "XÁC NHẬN CHECK-OUT"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 p-6 sm:p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-6">
            <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md border whitespace-nowrap ${
              result.attendance.checkOutStatus === "COMPLETED"
                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                : "bg-amber-950 text-amber-300 border-amber-700"
            }`}>
              {result.attendance.checkOutStatus === "COMPLETED" ? "HOÀN THÀNH BUỔI HỌC" : "CHECK-OUT VỀ SỚM"}
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-4">
              {result.student.fullName}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {result.student.title || "Học viên"}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-4 space-y-2 text-xs mb-6">
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
              <span className="text-slate-400 font-semibold uppercase">TỔNG THỜI GIAN:</span>
              <span className="text-white font-code font-bold">
                {result.durationMins} phút (~{(result.durationMins / 60).toFixed(1)} giờ)
              </span>
            </div>
          </div>

          <Link
            href="/portal"
            className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider py-3.5 px-4 rounded-lg whitespace-nowrap transition-colors"
          >
            VÀO TRANG CÁ NHÂN & BÀI TẬP
          </Link>
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
