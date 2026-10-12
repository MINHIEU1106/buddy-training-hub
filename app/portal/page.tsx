"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeVN, formatDateVN } from "@/lib/date";

export default function StudentPortalPage() {
  const [studentCode, setStudentCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);

  useEffect(() => {
    const savedCode = localStorage.getItem("buddy_student_code");
    if (savedCode) {
      setStudentCode(savedCode);
      fetchStudent(savedCode);
    }
  }, []);

  const fetchStudent = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/me?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không tìm thấy học viên");
        setStudentData(null);
      } else {
        setStudentData(data.student);
        localStorage.setItem("buddy_student_code", data.student.studentCode);
      }
    } catch (err) {
      setError("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setStudentCode(inputCode.trim().toUpperCase());
    fetchStudent(inputCode.trim().toUpperCase());
  };

  const handleLogout = () => {
    localStorage.removeItem("buddy_student_code");
    setStudentData(null);
    setStudentCode("");
    setInputCode("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navigation */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            BUDDY TRAINING HUB • BỆNH VIỆN PHƯƠNG ĐÔNG
          </span>
          <h1 className="text-base font-bold text-white">
            TRANG CÁ NHÂN & THEO DÕI HỌC TẬP
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {studentData && (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold uppercase text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
            >
              ĐỔI MÃ HỌC VIÊN
            </button>
          )}
          <Link
            href="/"
            className="text-xs font-semibold uppercase text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
          >
            TRANG CHỦ
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto my-6 flex-1">
        {!studentData ? (
          /* Login with Code Form */
          <div className="max-w-md mx-auto my-12 bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-2xl">
            <div className="text-center mb-6">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-blue-950 text-blue-400 border border-blue-800 px-3 py-1 rounded-full mb-3">
                CỔNG HỌC VIÊN
              </span>
              <h2 className="text-2xl font-bold text-white">TRUY CẬP TRANG CÁ NHÂN</h2>
              <p className="text-xs text-slate-400 mt-2">
                Nhập số thứ tự hoặc mã định danh (VD: 01, HV01...)
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded bg-rose-950/70 border border-rose-800 text-rose-200 text-xs">
                <div className="font-bold uppercase tracking-wider mb-1">LỖI</div>
                {error}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                  MÃ HỌC VIÊN / SỐ THỨ TỰ (VD: HV01 HOẶC 01)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="VD: HV01 hoặc 01"
                  className="w-full text-center font-code text-2xl font-bold tracking-widest bg-slate-900 border-2 border-slate-600 focus:border-blue-500 focus:outline-none text-white py-3 px-4 rounded-lg uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold text-sm uppercase py-3.5 px-4 rounded-lg whitespace-nowrap transition-colors"
              >
                {loading ? "ĐANG TẢI..." : "TRUY CẬP HỌC TẬP"}
              </button>
            </form>
          </div>
        ) : (
          /* Student Portal Dashboard */
          <div className="space-y-8">
            {/* Student Header Card */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded">
                    {studentData.managementLevel || "Cán bộ Quản lý"}
                  </span>
                  <span className="text-[11px] font-bold font-code bg-emerald-950 border border-emerald-800 text-emerald-400 px-2.5 py-0.5 rounded">
                    MÃ: {studentData.studentCode}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  {studentData.fullName}
                </h2>
                <p className="text-sm text-slate-300 mt-0.5">
                  {studentData.title} • {studentData.department}
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Link
                  href={`/checkin?session=BVPD-B1`}
                  className="flex-1 md:flex-none text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
                >
                  ĐIỂM DANH CHECK-IN
                </Link>
                <Link
                  href={`/checkout`}
                  className="flex-1 md:flex-none text-center bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
                >
                  CHECK-OUT
                </Link>
              </div>
            </div>

            {/* Session 2 In-Class Practice Spotlight: Goal Cascade Workspace */}
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 border-2 border-teal-500/80 p-5 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    THỰC HÀNH TRÊN LỚP • BUỔI 2
                  </span>
                  <span className="text-xs font-bold text-teal-300">GOAL CASCADE WORKSPACE</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Công Cụ Phân Rã Mục Tiêu BV & Lập Kế Hoạch 5W1H (Quy Trình 7 Bước)
                </h3>
                <p className="text-xs text-teal-100 max-w-2xl">
                  Mục tiêu gốc: <strong>&quot;Tỷ lệ người bệnh hài lòng ≥ 90% (Baseline 84%)&quot;</strong>. Phân rã theo nhóm Khoa/Phòng, kiểm tra SMART tự động và xử lý kịch bản mô phỏng Quý 2.
                </p>
              </div>

              <Link
                href="/portal/goal-cascade"
                className="w-full md:w-auto text-center bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-lg shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap font-mono"
              >
                VÀO LÀM BÀI THỰC HÀNH →
              </Link>
            </div>

            {/* Attendance 4-Session Timeline Grid */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    TIẾN ĐỘ CHUYÊN CẦN (4 BUỔI ĐÀO TẠO)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ghi nhận giờ vào và giờ ra chính xác theo máy chủ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {studentData.course.sessions.map((sess: any) => {
                  const att = studentData.attendances.find((a: any) => a.sessionId === sess.id);
                  const isCheckedIn = att && att.checkInAt;
                  const isCheckedOut = att && att.checkOutAt;

                  return (
                    <div
                      key={sess.id}
                      className={`p-4 rounded-lg border ${
                        isCheckedIn
                          ? "bg-slate-900/90 border-emerald-800/80"
                          : sess.checkInStatus === "OPEN"
                          ? "bg-slate-900/90 border-blue-700 animate-pulse"
                          : "bg-slate-900/40 border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-300 font-code">
                          BUỔI {sess.sessionNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isCheckedIn
                              ? att.checkInStatus === "ON_TIME"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                : "bg-amber-950 text-amber-300 border-amber-700"
                              : sess.checkInStatus === "OPEN"
                              ? "bg-blue-950 text-blue-300 border-blue-700"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {isCheckedIn
                            ? att.checkInStatus === "ON_TIME"
                              ? "[ ĐÚNG GIỜ ]"
                              : "[ ĐI TRỄ ]"
                            : sess.checkInStatus === "OPEN"
                            ? "[ ĐANG MỞ ]"
                            : "[ CHƯA DIỄN RA ]"}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-200 line-clamp-2 min-h-[32px]">
                        {sess.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 font-code">
                        Ngày: {formatDateVN(sess.date)} ({sess.startTime} - {sess.endTime})
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Check-in:</span>
                          <span className="text-slate-200 font-code font-semibold">
                            {isCheckedIn ? formatTimeVN(att.checkInAt) : "--:--"}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Check-out:</span>
                          <span className="text-slate-200 font-code font-semibold">
                            {isCheckedOut ? formatTimeVN(att.checkOutAt) : "--:--"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignments List */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  DANH SÁCH BÀI TẬP & NHẬN XÉT CỦA GIẢNG VIÊN
                </h3>
                <p className="text-xs text-slate-400">
                  Nộp bài bằng đường link (Google Docs/Canva) hoặc tải file tài liệu
                </p>
              </div>

              {studentData.course.sessions.map((sess: any) => {
                if (!sess.assignments || sess.assignments.length === 0) return null;

                return (
                  <div key={sess.id} className="space-y-4">
                    <div className="border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        BUỔI {sess.sessionNumber}: {sess.title}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {sess.assignments.map((assign: any) => {
                        const subs = assign.submissions || [];
                        const latestSub = subs[0];
                        const reviews = latestSub?.reviews || [];
                        const latestReview = reviews[reviews.length - 1];

                        return (
                          <div
                            key={assign.id}
                            className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border whitespace-nowrap ${
                                    assign.type === "IN_SESSION"
                                      ? "bg-teal-950 text-teal-300 border-teal-700"
                                      : "bg-blue-950 text-blue-300 border-blue-700"
                                  }`}>
                                    {assign.type === "IN_SESSION" ? "THỰC HÀNH TRÊN LỚP" : "BÀI TẬP VỀ NHÀ"}
                                  </span>
                                  {assign.deadline && (
                                    <span className="text-[11px] text-amber-400 font-code">
                                      Hạn: {formatDateVN(assign.deadline)}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-base font-bold text-white mt-1">
                                  {assign.title}
                                </h4>
                              </div>

                                <div>
                                  <span
                                    className={`text-xs font-bold uppercase px-3 py-1 rounded border whitespace-nowrap ${
                                      latestSub
                                        ? latestReview
                                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                          : "bg-blue-950 text-blue-300 border-blue-700"
                                        : "bg-slate-800 text-slate-400 border-slate-700"
                                    }`}
                                  >
                                    {latestSub
                                      ? latestReview
                                        ? `ĐÃ NHẬN XÉT: ${latestReview.grade === "XUAT_SAC" ? "XUẤT SẮC" : latestReview.grade === "DAT" ? "ĐẠT" : "CẦN CẢI THIỆN"}`
                                        : `ĐÃ NỘP - V${latestSub.version}`
                                      : "CHƯA NỘP"}
                                  </span>
                                </div>
                            </div>

                            {assign.description && (
                              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded border border-slate-800/80 leading-relaxed">
                                {assign.description}
                              </p>
                            )}

                            {/* Submission History / Details */}
                            {latestSub && (
                              <div className="bg-slate-800/70 border border-slate-700 rounded-md p-4 text-xs space-y-2">
                                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                  <span className="font-bold text-slate-300">
                                    BÀI NỘP HIỆN HÀNH (PHIÊN BẢN {latestSub.version})
                                  </span>
                                  <span className="font-code text-slate-400">
                                    Nộp lúc {formatTimeVN(latestSub.submittedAt)} - {formatDateVN(latestSub.submittedAt)}
                                  </span>
                                </div>

                                {latestSub.type === "LINK" ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Đường link nộp:</span>
                                    <a
                                      href={latestSub.contentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:underline font-code truncate max-w-xs"
                                    >
                                      {latestSub.contentUrl}
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400">File đã tải:</span>
                                    <a
                                      href={latestSub.filePath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:underline font-code truncate max-w-xs"
                                    >
                                      {latestSub.fileName || "Tệp đính kèm"}
                                    </a>
                                  </div>
                                )}

                                {latestSub.note && (
                                  <div className="text-slate-400">
                                    <span>Ghi chú của bạn: </span>
                                    <span className="text-slate-200">{latestSub.note}</span>
                                  </div>
                                )}

                                {/* Review Feedback Box */}
                                {latestReview && (
                                  <div className="mt-3 pt-3 border-t border-slate-700 bg-slate-900/80 p-3 rounded border border-emerald-800/60">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-emerald-400 uppercase tracking-wider">
                                        NHẬN XÉT TỪ GIẢNG VIÊN
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {formatDateVN(latestReview.reviewedAt)}
                                      </span>
                                    </div>
                                    <p className="text-slate-200 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                                      {latestReview.publicComment || "Không có nhận xét văn bản."}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Submit / Resubmit */}
                            <div className="pt-2 flex justify-end">
                              <Link
                                href={`/portal/submit/${assign.id}`}
                                className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-lg whitespace-nowrap transition-colors shadow"
                              >
                                {latestSub ? "NỘP LẠI BẢN MỚI (UPDATE)" : "TIẾN HÀNH NỘP BÀI"}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
        Bảo mật theo Nghị định 13/2023/NĐ-CP • Buddy Training Hub
      </footer>
    </div>
  );
}
