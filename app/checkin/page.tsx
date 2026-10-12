"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatTimeVN } from "@/lib/date";

function CheckInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionCodeFromUrl = searchParams.get("session") || "";

  const [studentCode, setStudentCode] = useState("");
  const [sessionCode, setSessionCode] = useState(sessionCodeFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Prefill student code if saved previously
  useEffect(() => {
    const savedCode = localStorage.getItem("buddy_student_code");
    if (savedCode && !studentCode) {
      setStudentCode(savedCode);
    }
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setError("Vui lòng nhập mã học viên 6 ký tự");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: studentCode.trim().toUpperCase(),
          sessionCode: sessionCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đã xảy ra lỗi khi điểm danh");
      } else {
        setResult(data);
        localStorage.setItem("buddy_student_code", data.student.studentCode);
      }
    } catch (err: any) {
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md w-full mx-auto my-auto py-8">
      {!result ? (
        <div className="bg-slate-800/80 border border-slate-700 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur">
          <div className="text-center mb-6">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full mb-3">
              CỔNG ĐIỂM DANH ĐẦU GIỜ
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              ĐIỂM DANH BUỔI HỌC
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Nhập số thứ tự hoặc mã định danh (VD: 01, HV01...) để xác nhận có mặt
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs leading-relaxed">
              <div className="font-bold uppercase tracking-wider mb-1">THÔNG BÁO LỖI</div>
              {error}
            </div>
          )}

          <form onSubmit={handleCheckIn} className="space-y-5">
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
                className="w-full text-center font-code text-2xl font-bold tracking-widest bg-slate-900 border-2 border-slate-600 focus:border-emerald-500 focus:outline-none text-white py-3.5 px-4 rounded-lg placeholder:text-slate-600 uppercase"
              />
            </div>

            {sessionCode && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  MÃ BUỔI HỌC
                </label>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="w-full text-center font-code text-sm font-semibold bg-slate-900/60 border border-slate-700 text-slate-300 py-2 px-3 rounded"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-lg whitespace-nowrap transition-colors shadow-lg"
            >
              {loading ? "ĐANG XÁC NHẬN..." : "XÁC NHẬN ĐIỂM DANH"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400">
              Chưa biết mã của mình? Liên hệ Giảng viên / Admin tại bàn đón tiếp.
            </p>
          </div>
        </div>
      ) : (
        /* Welcome and Identity Confirmation Screen */
        <div className="bg-slate-800 border border-slate-700 p-6 sm:p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-6">
            <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-lg border whitespace-nowrap ${
              result.attendance.checkInStatus === "ON_TIME"
                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                : "bg-amber-950 text-amber-300 border-amber-700"
            }`}>
              {result.isDuplicate ? "BẠN ĐÃ ĐIỂM DANH TRƯỚC ĐÓ" : result.attendance.checkInStatus === "ON_TIME" ? "CHECK-IN ĐÚNG GIỜ" : "CHECK-IN ĐI TRỄ"}
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-4">
              {result.student.fullName}
            </h2>
            <p className="text-sm font-semibold text-emerald-400 mt-1">
              {result.student.title || "Học viên"}
            </p>
          </div>

          {/* Student Info Card */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-4 space-y-2 text-xs mb-6">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">ĐƠN VỊ / KHOA PHÒNG:</span>
              <span className="text-slate-200 font-bold">{result.student.department || "BV Phương Đông"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">CẤP QUẢN LÝ:</span>
              <span className="text-slate-200 font-bold">{result.student.managementLevel || "Quản lý"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">MÃ HỌC VIÊN:</span>
              <span className="text-emerald-400 font-code font-bold">{result.student.studentCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">BUỔI HỌC:</span>
              <span className="text-slate-200 font-bold">{result.session.title}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-semibold uppercase">GIỜ GHI NHẬN:</span>
              <span className="text-slate-200 font-code font-bold">
                {formatTimeVN(result.attendance.checkInAt)} (Asia/Ho_Chi_Minh)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div>
            <Link
              href="/portal"
              className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider py-3.5 px-4 rounded-lg whitespace-nowrap transition-colors shadow-lg"
            >
              VÀO TRANG CÁ NHÂN & NỘP BÀI
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
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

      <Suspense fallback={<div className="text-center font-code text-xs text-slate-400 py-12">Đang tải cổng điểm danh...</div>}>
        <CheckInForm />
      </Suspense>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-4">
        Hệ thống Điểm danh Buddy Training Hub • Múi giờ Asia/Ho_Chi_Minh
      </footer>
    </div>
  );
}
