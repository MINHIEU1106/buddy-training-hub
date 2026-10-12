"use client";

import { useState, useMemo } from "react";
import { formatTimeVN, formatDateVN, formatDateTimeVN } from "@/lib/date";

interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  department: string | null;
  title: string | null;
  managementLevel: string | null;
}

interface Session {
  id: string;
  sessionNumber: number;
  title: string;
  sessionCode: string;
}

interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  checkInAt: string | null;
  checkInStatus: string | null;
  checkOutAt: string | null;
  checkOutStatus: string | null;
}

interface Review {
  id: string;
  grade: string | null;
  publicComment: string | null;
  internalNote: string | null;
  reviewedAt: string;
}

interface Submission {
  id: string;
  studentId: string;
  assignmentId: string;
  version: number;
  type: string;
  contentUrl: string | null;
  filePath: string | null;
  fileName: string | null;
  note: string | null;
  submittedAt: string;
  isLate: boolean;
  status: string;
  reviews: Review[];
}

interface Assignment {
  id: string;
  sessionId: string;
  title: string;
  type: string;
  allowedFormat: string;
  session: {
    sessionNumber: number;
  };
  submissions: Submission[];
}

interface ReportsClientProps {
  students: Student[];
  sessions: Session[];
  attendances: Attendance[];
  assignments: Assignment[];
  courseName: string;
}

export default function ReportsClient({
  students,
  sessions,
  attendances,
  assignments,
  courseName,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "ATTENDANCE" | "ASSIGNMENTS" | "SUBMISSIONS_DETAIL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<{
    sub: Submission;
    st: Student;
    assign: Assignment;
    latestRev?: Review;
  } | null>(null);

  // Lọc học viên theo từ khóa tìm kiếm
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(term) ||
        s.studentCode.toLowerCase().includes(term) ||
        (s.department && s.department.toLowerCase().includes(term))
    );
  }, [students, searchTerm]);

  // Thống kê tổng hợp
  const stats = useMemo(() => {
    const totalStudents = students.length;
    let totalAttendedChecks = 0;
    const totalPossibleChecks = totalStudents * (sessions.length || 1);

    attendances.forEach((a) => {
      if (a.checkInAt) totalAttendedChecks++;
    });

    const attendanceRate = totalPossibleChecks > 0 ? Math.round((totalAttendedChecks / totalPossibleChecks) * 100) : 0;

    let totalSubmissions = 0;
    let totalGraded = 0;
    let totalXuatSac = 0;
    let totalDat = 0;
    let totalCanSua = 0;
    let totalChoCham = 0;

    assignments.forEach((assign) => {
      students.forEach((st) => {
        const userSubs = assign.submissions.filter((s) => s.studentId === st.id);
        if (userSubs.length > 0) {
          totalSubmissions++;
          const latest = userSubs.sort((a, b) => b.version - a.version)[0];
          const latestRev = latest.reviews?.[latest.reviews.length - 1];
          if (latestRev && latestRev.grade) {
            totalGraded++;
            if (latestRev.grade === "XUAT_SAC") totalXuatSac++;
            else if (latestRev.grade === "DAT") totalDat++;
            else if (latestRev.grade === "CAN_CAI_THIEN") totalCanSua++;
          } else {
            totalChoCham++;
          }
        }
      });
    });

    const totalPossibleSubs = totalStudents * (assignments.length || 1);
    const submissionRate = totalPossibleSubs > 0 ? Math.round((totalSubmissions / totalPossibleSubs) * 100) : 0;

    return {
      totalStudents,
      attendanceRate,
      totalSubmissions,
      submissionRate,
      totalGraded,
      totalXuatSac,
      totalDat,
      totalCanSua,
      totalChoCham,
    };
  }, [students, sessions, attendances, assignments]);

  // Danh sách phẳng tất cả các bài nộp cho tab "Chi tiết bài nộp & Nhận xét"
  const allSubmissionsList = useMemo(() => {
    const list: Array<{
      sub: Submission;
      st: Student;
      assign: Assignment;
      latestRev?: Review;
    }> = [];

    assignments.forEach((assign) => {
      assign.submissions.forEach((sub) => {
        const st = students.find((s) => s.id === sub.studentId);
        if (!st) return;

        // Chỉ lấy submission mới nhất của từng học viên cho mỗi bài tập
        const userSubs = assign.submissions.filter((s) => s.studentId === st.id);
        const latest = userSubs.sort((a, b) => b.version - a.version)[0];
        if (latest.id === sub.id) {
          const latestRev = sub.reviews?.[sub.reviews.length - 1];
          list.push({ sub, st, assign, latestRev });
        }
      });
    });

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.st.fullName.toLowerCase().includes(term) ||
        item.st.studentCode.toLowerCase().includes(term) ||
        item.assign.title.toLowerCase().includes(term) ||
        (item.st.department && item.st.department.toLowerCase().includes(term))
    );
  }, [assignments, students, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            TRUNG TÂM BÁO CÁO & XUẤT DỮ LIỆU
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            BÁO CÁO TỔNG KẾT KHÓA ĐÀO TẠO
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dữ liệu chuyên cần 4 buổi và kết quả nộp bài tập của Bệnh viện Phương Đông
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export-excel"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg whitespace-nowrap transition-all shadow-lg hover:shadow-emerald-900/30"
          >
            <span>📥</span>
            <span>Tải file báo cáo Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tổng học viên</div>
          <div className="text-2xl font-bold text-white mt-1 font-code">{stats.totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cán bộ quản lý BV Phương Đông</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Chuyên cần trung bình</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-code">{stats.attendanceRate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Qua {sessions.length} buổi đào tạo</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tỷ lệ nộp bài tập</div>
          <div className="text-2xl font-bold text-blue-400 mt-1 font-code">
            {stats.totalSubmissions} <span className="text-sm font-normal text-slate-400">lượt ({stats.submissionRate}%)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{assignments.length} bài tập được giao</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Kết quả chấm bài</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              ⭐ {stats.totalXuatSac} Xuất sắc
            </span>
            <span className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              ✓ {stats.totalDat} Đạt
            </span>
            {stats.totalCanSua > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                ⚠ {stats.totalCanSua} Cần sửa
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.totalChoCham > 0 ? `Còn ${stats.totalChoCham} bài chờ chấm` : "Tất cả bài nộp đã được chấm"}
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === "ALL"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            📋 Tất cả báo cáo
          </button>
          <button
            onClick={() => setActiveTab("ATTENDANCE")}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === "ATTENDANCE"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            🕒 Chuyên cần 4 buổi
          </button>
          <button
            onClick={() => setActiveTab("ASSIGNMENTS")}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === "ASSIGNMENTS"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            📝 Bảng điểm & Kết quả bài tập ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab("SUBMISSIONS_DETAIL")}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === "SUBMISSIONS_DETAIL"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            💬 Chi tiết bài nộp & Nhận xét ({allSubmissionsList.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, mã HV, khoa..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: BẢNG CHUYÊN CẦN 4 BUỔI */}
      {(activeTab === "ALL" || activeTab === "ATTENDANCE") && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>🕒</span> BẢNG THEO DÕI CHUYÊN CẦN 4 BUỔI
              </h2>
              <p className="text-xs text-slate-400">
                Tổng hợp giờ check-in và check-out chi tiết của từng học viên
              </p>
            </div>
            <span className="text-xs font-code text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
              {filteredStudents.length} học viên
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-code">MÃ</th>
                  <th className="py-3 px-3">HỌ VÀ TÊN</th>
                  <th className="py-3 px-3">KHOA PHÒNG</th>
                  {sessions.map((sess) => (
                    <th key={sess.id} className="py-3 px-3 text-center">
                      BUỔI {sess.sessionNumber}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right">TỶ LỆ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.map((st) => {
                  let attended = 0;
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-code font-bold text-emerald-400">
                        {st.studentCode}
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {st.fullName}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {st.department || "--"}
                      </td>

                      {sessions.map((sess) => {
                        const att = attendances.find(
                          (a) => a.sessionId === sess.id && a.studentId === st.id
                        );
                        const isPresent = att && att.checkInAt;
                        if (isPresent) attended++;

                        return (
                          <td key={sess.id} className="py-3 px-3 text-center">
                            {isPresent ? (
                              <span
                                className={`inline-block text-[10px] font-bold font-code px-2 py-0.5 rounded border ${
                                  att.checkInStatus === "ON_TIME"
                                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                    : "bg-amber-950 text-amber-300 border-amber-800"
                                }`}
                                title={`Check-in: ${formatTimeVN(att.checkInAt)}${
                                  att.checkOutAt ? ` | Check-out: ${formatTimeVN(att.checkOutAt)}` : ""
                                }`}
                              >
                                {formatTimeVN(att.checkInAt)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-code text-slate-600">
                                --
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-right font-code font-bold text-emerald-400">
                        {Math.round((attended / (sessions.length || 1)) * 100)}% ({attended}/{sessions.length})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: BẢNG TỔNG HỢP KẾT QUẢ & ĐIỂM BÀI TẬP (MA TRẬN HỌC VIÊN X BÀI TẬP) */}
      {(activeTab === "ALL" || activeTab === "ASSIGNMENTS") && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>📝</span> BẢNG TỔNG HỢP ĐIỂM & KẾT QUẢ BÀI TẬP
              </h2>
              <p className="text-xs text-slate-400">
                Theo dõi tình trạng nộp bài, xếp loại (Xuất sắc / Đạt / Cần sửa) và điểm đánh giá của từng học viên
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                ⭐ Xuất sắc
              </span>
              <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/80">
                ✓ Đạt
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                ⚠ Cần sửa
              </span>
              <span className="inline-flex items-center gap-1 text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/80">
                🕒 Chờ chấm
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-code">MÃ</th>
                  <th className="py-3 px-3">HỌ VÀ TÊN</th>
                  <th className="py-3 px-3">KHOA PHÒNG</th>
                  {assignments.map((assign) => (
                    <th key={assign.id} className="py-3 px-3 text-center min-w-[140px]">
                      <div className="text-[10px] text-emerald-400 font-mono">B{assign.session.sessionNumber}</div>
                      <div className="line-clamp-2 leading-tight" title={assign.title}>
                        {assign.title.replace(/^Buổi \d+: /, "")}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right">ĐÃ NỘP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.map((st) => {
                  let submittedCount = 0;

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-code font-bold text-emerald-400">
                        {st.studentCode}
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {st.fullName}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {st.department || "--"}
                      </td>

                      {assignments.map((assign) => {
                        const userSubs = assign.submissions.filter((s) => s.studentId === st.id);
                        const latestSub = userSubs.sort((a, b) => b.version - a.version)[0];
                        if (latestSub) submittedCount++;

                        const latestRev = latestSub?.reviews?.[latestSub.reviews.length - 1];

                        return (
                          <td key={assign.id} className="py-3 px-3 text-center">
                            {latestSub ? (
                              <button
                                onClick={() => setSelectedSubmission({ sub: latestSub, st, assign, latestRev })}
                                className="inline-flex flex-col items-center gap-0.5 group focus:outline-none"
                              >
                                {latestRev && latestRev.grade === "XUAT_SAC" ? (
                                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 hover:border-emerald-400 transition-colors">
                                    ⭐ Xuất sắc
                                  </span>
                                ) : latestRev && latestRev.grade === "DAT" ? (
                                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 hover:border-blue-400 transition-colors">
                                    ✓ Đạt
                                  </span>
                                ) : latestRev && latestRev.grade === "CAN_CAI_THIEN" ? (
                                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 hover:border-amber-400 transition-colors">
                                    ⚠ Cần sửa
                                  </span>
                                ) : (
                                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 hover:border-purple-400 transition-colors">
                                    🕒 Đã nộp (Chờ chấm)
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-500 font-code group-hover:text-slate-300">
                                  {formatDateVN(latestSub.submittedAt)}
                                </span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-code text-slate-600">
                                --
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-right font-code font-bold">
                        <span
                          className={
                            submittedCount === assignments.length
                              ? "text-emerald-400"
                              : submittedCount > 0
                              ? "text-blue-400"
                              : "text-slate-500"
                          }
                        >
                          {submittedCount}/{assignments.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: DANH SÁCH CHI TIẾT BÀI NỘP & NHẬN XÉT CỦA GIẢNG VIÊN */}
      {(activeTab === "ALL" || activeTab === "SUBMISSIONS_DETAIL") && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>💬</span> DANH SÁCH BÀI NỘP & NHẬN XÉT CHI TIẾT CỦA GIẢNG VIÊN
              </h2>
              <p className="text-xs text-slate-400">
                Chi tiết bài làm, tập tin/link nộp và lời nhận xét đánh giá từng bài của Giảng viên Buddy
              </p>
            </div>
            <span className="text-xs font-code text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
              {allSubmissionsList.length} bài nộp
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-code">MÃ HV</th>
                  <th className="py-3 px-3">HỌ VÀ TÊN</th>
                  <th className="py-3 px-3">BÀI TẬP</th>
                  <th className="py-3 px-3 text-center">THỜI GIAN NỘP</th>
                  <th className="py-3 px-3">BÀI LÀM / TẬP TIN</th>
                  <th className="py-3 px-3 text-center">XẾP LOẠI</th>
                  <th className="py-3 px-3 min-w-[280px]">LỜI NHẬN XÉT TỪ GIẢNG VIÊN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allSubmissionsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      Chưa có dữ liệu bài nộp nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  allSubmissionsList.map((item, idx) => {
                    const { sub, st, assign, latestRev } = item;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-code font-bold text-emerald-400 whitespace-nowrap">
                          {st.studentCode}
                        </td>
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          <div>{st.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{st.department || "--"}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded mr-1">
                            Buổi {assign.session.sessionNumber}
                          </span>
                          <span className="font-medium">{assign.title}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-code text-[11px] text-slate-400 whitespace-nowrap">
                          <div>{formatDateTimeVN(sub.submittedAt)}</div>
                          {sub.isLate && (
                            <span className="text-[9px] text-amber-400 bg-amber-950 px-1 rounded">
                              Nộp trễ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {sub.type === "ONLINE_FORM" ? (
                            <button
                              onClick={() => setSelectedSubmission(item)}
                              className="text-cyan-400 hover:text-cyan-300 font-bold underline text-[11px]"
                            >
                              📋 Biểu mẫu 3 bước trực tuyến
                            </button>
                          ) : sub.type === "LINK" ? (
                            <a
                              href={sub.contentUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-code underline break-all text-[11px] line-clamp-1"
                            >
                              🔗 {sub.contentUrl}
                            </a>
                          ) : (
                            <a
                              href={sub.filePath || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 font-code font-bold underline text-[11px] line-clamp-1"
                            >
                              📁 {sub.fileName || "Tập tin bài làm"}
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {latestRev && latestRev.grade === "XUAT_SAC" ? (
                            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                              ⭐ Xuất sắc
                            </span>
                          ) : latestRev && latestRev.grade === "DAT" ? (
                            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">
                              ✓ Đạt
                            </span>
                          ) : latestRev && latestRev.grade === "CAN_CAI_THIEN" ? (
                            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                              ⚠ Cần sửa
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              🕒 Chờ chấm
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-xs">
                          {latestRev?.publicComment ? (
                            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[11px] text-slate-200">
                              "{latestRev.publicComment}"
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Chưa có nhận xét</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT BÀI NỘP */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  CHI TIẾT BÀI LÀM & ĐÁNH GIÁ
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedSubmission.st.fullName} ({selectedSubmission.st.studentCode})
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSubmission.st.department} • {selectedSubmission.assign.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Chi tiết nội dung bài nộp */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase">HÌNH THỨC NỘP:</span>
                <span className="font-code font-bold text-emerald-400">
                  {selectedSubmission.sub.type === "ONLINE_FORM"
                    ? "BIỂU MẪU KẾ HOẠCH CÁ NHÂN (3 BƯỚC)"
                    : selectedSubmission.sub.type === "LINK"
                    ? "ĐƯỜNG LINK ONLINE"
                    : "TẬP TIN ĐÍNH KÈM"}
                </span>
              </div>

              {selectedSubmission.sub.type === "ONLINE_FORM" ? (
                <div>
                  {(() => {
                    try {
                      const parsed = JSON.parse(selectedSubmission.sub.note || "{}");
                      return (
                        <div className="space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] mt-2">
                          <div>
                            <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                              BƯỚC 1: TUYÊN BỐ MỤC TIÊU 2027
                            </div>
                            <p className="text-white font-medium mt-0.5 bg-slate-950 p-2 rounded border border-slate-800">
                              {parsed.step1_goal || "Chưa nhập"}
                            </p>
                          </div>

                          <div>
                            <div className="text-teal-400 font-bold uppercase tracking-wider text-[10px]">
                              BƯỚC 2: KẾT QUẢ MONG MUỐN (KEY RESULTS)
                            </div>
                            <div className="space-y-1 mt-0.5">
                              {parsed.step2_results?.map((kr: any, kIdx: number) => (
                                <div key={kIdx} className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
                                  <span>• {kr.indicator}</span>
                                  <strong className="text-slate-200 font-mono">
                                    {kr.baseline} → {kr.target} {kr.unit} ({kr.deadline})
                                  </strong>
                                </div>
                              )) || <span className="text-slate-500 italic">Chưa có chỉ số</span>}
                            </div>
                          </div>

                          <div>
                            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                              BƯỚC 3: KẾ HOẠCH HÀNH ĐỘNG (5W1H)
                            </div>
                            <div className="space-y-1.5 mt-0.5">
                              {parsed.step3_6_works?.map((w: any, wIdx: number) => (
                                <div key={wIdx} className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                                  <div className="font-bold text-white flex justify-between">
                                    <span>#{wIdx + 1}. {w.taskName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{w.whenStart} → {w.whenEnd}</span>
                                  </div>
                                  <div className="text-slate-300"><strong>What:</strong> {w.what}</div>
                                  <div className="text-slate-400 text-[10px]">
                                    <span>Who: {w.who}</span> | <span>Phối hợp: {w.coOwners}</span> | <span>Đo lường: {w.metric}</span>
                                  </div>
                                </div>
                              )) || <span className="text-slate-500 italic">Chưa có công việc</span>}
                            </div>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="p-3 bg-slate-900 rounded text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                          {selectedSubmission.sub.note}
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : selectedSubmission.sub.type === "LINK" ? (
                <div className="space-y-1">
                  <div className="text-slate-400">Đường dẫn bài nộp:</div>
                  <a
                    href={selectedSubmission.sub.contentUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2.5 rounded bg-slate-900 border border-slate-800 text-blue-400 hover:text-blue-300 font-code underline break-all"
                  >
                    {selectedSubmission.sub.contentUrl}
                  </a>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-slate-400">Tập tin đính kèm:</div>
                  <a
                    href={selectedSubmission.sub.filePath || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 font-code font-bold underline"
                  >
                    📁 {selectedSubmission.sub.fileName || "Tải tập tin về"}
                  </a>
                </div>
              )}

              {selectedSubmission.sub.note && selectedSubmission.sub.type !== "ONLINE_FORM" && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">Lời nhắn từ học viên:</span>
                  <p className="text-slate-200 italic">"{selectedSubmission.sub.note}"</p>
                </div>
              )}
            </div>

            {/* Đánh giá và nhận xét từ giảng viên */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase">KẾT QUẢ ĐÁNH GIÁ:</span>
                <div>
                  {selectedSubmission.latestRev?.grade === "XUAT_SAC" ? (
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      ⭐ XUẤT SẮC
                    </span>
                  ) : selectedSubmission.latestRev?.grade === "DAT" ? (
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-700">
                      ✓ ĐẠT YÊU CẦU
                    </span>
                  ) : selectedSubmission.latestRev?.grade === "CAN_CAI_THIEN" ? (
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700">
                      ⚠ CẦN SỬA ĐỔI / CẢI THIỆN
                    </span>
                  ) : (
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      🕒 ĐANG CHỜ GIẢNG VIÊN CHẤM
                    </span>
                  )}
                </div>
              </div>

              {selectedSubmission.latestRev?.publicComment && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold">LỜI NHẬN XÉT TỪ GIẢNG VIÊN:</div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-200 leading-relaxed">
                    "{selectedSubmission.latestRev.publicComment}"
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
