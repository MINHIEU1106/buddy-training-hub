"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    // If on login page, skip layout nav
    if (pathname === "/admin/login") return;

    const savedUser = localStorage.getItem("buddy_admin_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("buddy_admin_user");
    router.push("/admin/login");
  };

  const navItems = [
    { label: "TỔNG QUAN", href: "/admin" },
    { label: "THỰC HÀNH B1", href: "/admin/goal-cascade" },
    { label: "THỰC HÀNH B2", href: "/admin/session-2-practice" },
    { label: "HỌC VIÊN", href: "/admin/students" },
    { label: "BUỔI HỌC", href: "/admin/sessions" },
    { label: "CHẤM BÀI TẬP", href: "/admin/assignments" },
    { label: "BÁO CÁO & XUẤT EXCEL", href: "/admin/reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Title */}
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  BUDDY TRAINING HUB
                </span>
                <span className="text-xs font-bold text-white tracking-tight">
                  BV ĐA KHOA PHƯƠNG ĐÔNG
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right User & Actions */}
            <div className="flex items-center space-x-3">
              {currentUser && (
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-bold text-slate-200 whitespace-nowrap">
                    {currentUser.fullName}
                  </span>
                  <span className="block text-[10px] font-code uppercase text-emerald-400 whitespace-nowrap">
                    VAI TRÒ: {currentUser.role}
                  </span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 border border-rose-900/80 hover:border-rose-700 bg-rose-950/30 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors"
              >
                ĐĂNG XUẤT
              </button>
            </div>
          </div>

          {/* Mobile subnav */}
          <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800 space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] font-bold uppercase whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-slate-800 text-emerald-400 border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Buddy Training Hub Management Studio • Bảo mật chuẩn Nghị định 13/2023/NĐ-CP
      </footer>
    </div>
  );
}
