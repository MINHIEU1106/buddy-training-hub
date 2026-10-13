"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại");
      } else {
        localStorage.setItem("buddy_admin_user", JSON.stringify(data.user));
        router.push("/admin");
      }
    } catch (err) {
      setError("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold">
            BUDDY TRAINING HUB
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-200">
            CỔNG QUẢN TRỊ & GIẢNG VIÊN
          </p>
        </div>
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white border border-slate-800 px-3 py-1.5 rounded whitespace-nowrap"
          >
            Về trang chủ
          </Link>
        </header>

        {/* Main Login Box */}
        <main className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl space-y-6">
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                HỆ THỐNG QUẢN LÝ ĐÀO TẠO
              </span>
              <h2 className="text-2xl font-bold text-white mt-3">ĐĂNG NHẬP ADMIN / TRAINER</h2>
              <p className="text-xs text-slate-400 mt-1">
                Đăng nhập để điều hành điểm danh, quản lý học viên và chấm bài
              </p>
            </div>

            {error && (
              <div className="p-4 rounded bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
                <div className="font-bold uppercase mb-1">LỖI ĐĂNG NHẬP</div>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  EMAIL ĐĂNG NHẬP
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email quản trị..."
                  required
                  className="w-full text-xs font-code bg-slate-950 border border-slate-700 focus:border-blue-500 text-white p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  MẬT KHẨU
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  required
                  className="w-full text-xs font-code bg-slate-950 border border-slate-700 focus:border-blue-500 text-white p-3 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg whitespace-nowrap transition-colors shadow-lg"
              >
                {loading ? "ĐANG XÁC THỰC..." : "ĐĂNG NHẬP VÀO HỆ THỐNG"}
              </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-4">
        Buddy Training Hub Security • 2026
      </footer>
    </div>
  );
}
