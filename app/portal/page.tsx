"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeVN, formatDateVN } from "@/lib/date";
import { getStudentGroupName } from "@/lib/goal-cascade-groups";

export default function StudentPortalPage() {
  const [studentCode, setStudentCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);

  // Edit profile modal state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    title: "",
    department: "",
    email: "",
    phone: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

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

  const handleOpenEditProfile = () => {
    if (!studentData) return;
    setProfileForm({
      fullName: studentData.fullName || "",
      title: studentData.title || "",
      department: studentData.department || "",
      email: studentData.email || "",
      phone: studentData.phone || "",
    });
    setProfileMsg(null);
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/admin/students/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentData.id,
          ...profileForm,
          actorName: `Học viên ${studentData.studentCode}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchStudent(studentData.studentCode);
        setShowEditProfile(false);
      } else {
        setProfileMsg(data.error || "Lỗi cập nhật thông tin");
      }
    } catch (err) {
      setProfileMsg("Không thể kết nối máy chủ");
    } finally {
      setSavingProfile(false);
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
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded">
                    {studentData.managementLevel || "Cán bộ Quản lý"}
                  </span>
                  <span className="text-[11px] font-bold font-code bg-emerald-950 border border-emerald-800 text-emerald-400 px-2.5 py-0.5 rounded">
                    MÃ: {studentData.studentCode}
                  </span>
                  <span className="text-[11px] font-bold bg-blue-950 border border-blue-800 text-blue-300 px-2.5 py-0.5 rounded">
                    {getStudentGroupName(studentData.studentCode, studentData.groupNumber)}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  {studentData.fullName}
                </h2>
                <p className="text-sm text-slate-300">
                  {studentData.title} • {studentData.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <span className="font-code text-slate-400">
                    ✉️ Email: {studentData.email ? (
                      <strong className="text-slate-200">{studentData.email}</strong>
                    ) : (
                      <span className="text-amber-400 font-sans">Chưa cập nhật email</span>
                    )}
                  </span>
                  <button
                    onClick={handleOpenEditProfile}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    ✏️ Chỉnh sửa thông tin / Bổ sung Email
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Link
                  href="/checkin"
                  className="flex-1 md:flex-none text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
                >
                  ĐIỂM DANH CHECK-IN
                </Link>
                <Link
                  href="/checkout"
                  className="flex-1 md:flex-none text-center bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
                >
                  CHECK-OUT
                </Link>
              </div>
            </div>

            {/* Session 1 In-Class Practice Spotlight: Goal Cascade Workspace */}
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 border-2 border-teal-500/80 p-5 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    THỰC HÀNH TRÊN LỚP • BUỔI 1
                  </span>
                  <span className="text-xs font-bold text-teal-300">GOAL CASCADE WORKSPACE (NHÓM)</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Công Cụ Phân Rã Mục Tiêu BV & Lập Kế Hoạch 5W1H (Quy Trình 3 Bước - 8 Nhóm)
                </h3>
                <p className="text-xs text-teal-100 max-w-2xl">
                  Mục tiêu gốc: <strong>&quot;Tỷ lệ người bệnh hài lòng ≥ 98%&quot;</strong>. Phân rã mục tiêu theo 8 nhóm Khoa/Phòng/Đơn vị, lập kế hoạch hành động 5W1H, sơ đồ Gantt và bảng theo dõi chỉ tiêu.
                </p>
              </div>

              <Link
                href="/portal/goal-cascade"
                className="w-full md:w-auto text-center bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-lg shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap font-mono"
              >
                VÀO LÀM BÀI TRÊN LỚP →
              </Link>
            </div>

            {/* Session 1 Homework: Personal Goal Cascade Workspace */}
            <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-blue-500/80 p-5 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-500 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    BÀI TẬP VỀ NHÀ • BUỔI 1
                  </span>
                  <span className="text-xs font-bold text-blue-300">BTVN LẬP KẾ HOẠCH CÁ NHÂN 2027</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Biểu Mẫu Lập Kế Hoạch Cá Nhân / Khoa Phòng (Đầy Đủ 3 Bước Online)
                </h3>
                <p className="text-xs text-blue-100 max-w-2xl">
                  Nhân bản chuẩn format bài tập trên lớp: Xác định mục tiêu cá nhân 2027 $\rightarrow$ Chỉ số kết quả then chốt $\rightarrow$ Kế hoạch hành động 5W1H chi tiết của riêng bạn.
                </p>
              </div>

              <Link
                href="/portal/homework-plan"
                className="w-full md:w-auto text-center bg-blue-500 hover:bg-blue-400 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-lg shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap font-mono"
              >
                LÀM BTVN ONLINE (3 BƯỚC) →
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
                            <div className="pt-2 flex flex-wrap justify-end gap-2">
                              {assign.type === "IN_SESSION" && (
                                <Link
                                  href="/portal/goal-cascade"
                                  className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg whitespace-nowrap transition-colors shadow"
                                >
                                  VÀO LÀM BÀI TRÊN LỚP (8 NHÓM) →
                                </Link>
                              )}
                              {assign.type === "POST_SESSION" && (
                                <Link
                                  href="/portal/homework-plan"
                                  className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg whitespace-nowrap transition-colors shadow"
                                >
                                  LÀM BTVN ONLINE (3 BƯỚC) →
                                </Link>
                              )}
                              <Link
                                href={`/portal/submit/${assign.id}`}
                                className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg whitespace-nowrap transition-colors shadow"
                              >
                                {latestSub ? "NỘP LẠI FILE / LINK (UPDATE)" : "NỘP FILE / LINK"}
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

            {showEditProfile && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                        CẬP NHẬT THÔNG TIN CÁ NHÂN
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {studentData.fullName} ({studentData.studentCode})
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowEditProfile(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ✕ Đóng
                    </button>
                  </div>

                  {profileMsg && (
                    <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
                      {profileMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold uppercase text-slate-300 mb-1">
                        HỌ VÀ TÊN
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-emerald-400 mb-1">
                        EMAIL NHẬN THÔNG BÁO KẾT QUẢ & NHẬN XÉT
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="example@phuongdonghospital.vn"
                        className="w-full font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-slate-300 mb-1">
                        SỐ ĐIỆN THOẠI
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="0912..."
                        className="w-full font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-slate-300 mb-1">
                        CHỨC DANH
                      </label>
                      <input
                        type="text"
                        value={profileForm.title}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-slate-300 mb-1">
                        KHOA / PHÒNG / BỘ PHẬN
                      </label>
                      <input
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                      />
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowEditProfile(false)}
                        className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg"
                      >
                        HỦY
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase py-2.5 rounded-lg shadow-lg"
                      >
                        {savingProfile ? "ĐANG LƯU..." : "LƯU CẬP NHẬT"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
