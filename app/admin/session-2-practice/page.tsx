"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { formatTimeVN, formatDateVN } from "@/lib/date";

interface StudentPracticeItem {
  id: string;
  studentCode: string;
  fullName: string;
  title: string;
  department: string;
  groupNumber: number | null;
  groupName: string;
  submission: {
    id: string;
    version: number;
    status: string;
    submittedAt: string;
    type: string;
    data: any;
    reviews: any[];
    latestReview: {
      id: string;
      grade: string;
      publicComment: string | null;
      internalNote: string | null;
      reviewedAt: string;
      reviewerName: string;
    } | null;
  } | null;
}

export default function AdminSession2PracticePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<StudentPracticeItem[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [stats, setStats] = useState<any>({
    totalStudents: 80,
    submittedCount: 0,
    reviewedCount: 0,
    passCount: 0,
    excellentCount: 0,
    needsFixCount: 0,
  });
  const [assignment, setAssignment] = useState<any>(null);

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Filter & Search
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUBMITTED" | "NOT_SUBMITTED" | "REVIEWED" | "NOT_REVIEWED">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Review Form State
  const [grade, setGrade] = useState<string>("DAT");
  const [publicComment, setPublicComment] = useState<string>("");
  const [internalNote, setInternalNote] = useState<string>("");
  const [savingReview, setSavingReview] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // QR Modal State
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [baseOrigin, setBaseOrigin] = useState<string>("https://buddytrain.netlify.app");

  // Quick feedback templates
  const quickTemplates = [
    "Bài làm rất tốt, áp dụng chuẩn xác 4 RÕ khi giao việc và xử lý chậm tiến độ theo đúng thực tế.",
    "Phương án khắc phục khả thi, đã xác định đúng nguyên nhân và cam kết mốc kiểm tra lại cụ thể.",
    "Cần lưu ý bổ sung thời hạn hoàn thành cụ thể cho từng người trong danh sách việc cần làm ngay.",
    "Xuất sắc! Kịch bản đối thoại 4 bước điềm đạm, tập trung vào sự việc, không quy chụp con người.",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseOrigin(window.location.origin);
    }
  }, []);

  const practiceUrl = `${baseOrigin}/portal/session-2-practice`;

  useEffect(() => {
    QRCode.toDataURL(practiceUrl, {
      width: 520,
      margin: 2,
      color: { dark: "#003D37", light: "#FFFFFF" },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [practiceUrl]);

  // Load data function
  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/session-2-practice");
      if (res.ok) {
        const d = await res.json();
        setStudents(d.students || []);
        setGroups(d.groups || []);
        setStats(d.stats || {});
        setAssignment(d.assignment || null);

        // Auto select first student if none selected
        if (!selectedStudentId && d.students?.length > 0) {
          const firstSub = d.students.find((s: StudentPracticeItem) => s.submission !== null);
          setSelectedStudentId(firstSub ? firstSub.id : d.students[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading session 2 practice data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and 15s auto-refresh
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Synchronize review form when selecting a student
  useEffect(() => {
    if (selectedStudent?.submission?.latestReview) {
      setGrade(selectedStudent.submission.latestReview.grade || "DAT");
      setPublicComment(selectedStudent.submission.latestReview.publicComment || "");
      setInternalNote(selectedStudent.submission.latestReview.internalNote || "");
    } else {
      setGrade("DAT");
      setPublicComment("");
      setInternalNote("");
    }
    setSaveSuccessMsg(null);
  }, [selectedStudentId, selectedStudent?.submission?.latestReview?.id]);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Group filter
      if (selectedGroupFilter !== "ALL" && s.groupNumber !== selectedGroupFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === "SUBMITTED" && !s.submission) return false;
      if (statusFilter === "NOT_SUBMITTED" && s.submission) return false;
      if (statusFilter === "REVIEWED" && !s.submission?.latestReview) return false;
      if (statusFilter === "NOT_REVIEWED" && (s.submission?.latestReview || !s.submission)) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchCode = s.studentCode.toLowerCase().includes(q);
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchDept = (s.department || "").toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchDept) return false;
      }
      return true;
    });
  }, [students, selectedGroupFilter, statusFilter, searchTerm]);

  // Submit Review handler
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent?.submission) return;

    setSavingReview(true);
    setSaveSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedStudent.submission.id,
          grade,
          publicComment,
          internalNote,
          status: "REVIEWED",
        }),
      });

      if (res.ok) {
        setSaveSuccessMsg("Đã lưu đánh giá & gửi kết quả về cổng học viên thành công!");
        await loadData();
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        alert("Lỗi khi lưu nhận xét");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSavingReview(false);
    }
  };

  const completionRate = stats.totalStudents > 0
    ? Math.round((stats.submittedCount / stats.totalStudents) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 bg-white p-5 rounded-xl shadow-sm border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#00685E] text-white font-bold px-2.5 py-0.5 rounded font-mono uppercase">
              Buổi 2 - Đào tạo Quản lý cấp trung
            </span>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono">
              Live Dashboard
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Điều Phối Live: Cập Nhật Kết Quả & Xử Lý Chậm Tiến Độ (3 Biểu Mẫu)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ nộp bài của học viên, chiếu QR thực hành hội trường, chấm điểm và gửi phản hồi theo thời gian thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 px-4 py-2 rounded shadow transition flex items-center gap-1.5 font-mono"
          >
            📱 HIỆN MÃ QR THỰC HÀNH BUỔI 2
          </button>

          <Link
            href="/portal/session-2-practice"
            target="_blank"
            className="text-xs font-bold bg-white text-[#00685E] border border-[#00685E] px-3.5 py-2 rounded hover:bg-teal-50 transition"
          >
            Mở Workspace Học Viên ↗
          </Link>

          <Link
            href="/admin/goal-cascade"
            className="text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded transition"
            title="Chuyển sang màn hình điều phối Buổi 1"
          >
            ← Thực Hành Buổi 1
          </Link>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tiến độ nộp bài
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#00685E] font-mono">
              {stats.submittedCount} / {stats.totalStudents}
            </span>
            <span className="text-xs font-bold text-slate-500">({completionRate}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#00685E] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tiến độ chấm bài
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600 font-mono">
              {stats.reviewedCount} / {stats.submittedCount}
            </span>
            <span className="text-xs font-bold text-slate-500">Đã nhận xét</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Còn {Math.max(0, stats.submittedCount - stats.reviewedCount)} bài đang chờ chấm
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Xếp loại bài làm
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
              ★ {stats.excellentCount} XS
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono">
              ✓ {stats.passCount} ĐẠT
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-mono">
              ! {stats.needsFixCount} SỬA
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">Tiêu chuẩn 4 RÕ & 3 câu hỏi</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-gradient-to-r from-teal-900 to-[#00685E] text-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
              Hội trường Live
            </span>
            <div className="text-xs font-bold mt-1">Tự làm mới mỗi 15 giây</div>
          </div>
          <button
            onClick={() => setShowQrModal(true)}
            className="mt-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded text-center transition font-mono"
          >
            📱 Chiếu QR Code
          </button>
        </div>
      </div>

      {/* Main Container: Split View (Grid 12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student List & Filter (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          {/* Search & Filters */}
          <div className="space-y-2 border-b border-slate-200 pb-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh Sách Học Viên ({filteredStudents.length} / {students.length})
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Tìm theo Họ tên, Mã HV (HV01..), Khoa phòng..."
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00685E]"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 bg-white"
              >
                <option value="ALL">Tất cả 8 Nhóm khoa/phòng</option>
                {groups.map((g, idx) => (
                  <option key={idx} value={idx + 1}>
                    Nhóm {idx + 1}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SUBMITTED">Đã nộp bài</option>
                <option value="NOT_SUBMITTED">Chưa nộp bài</option>
                <option value="REVIEWED">Đã chấm điểm</option>
                <option value="NOT_REVIEWED">Chưa chấm điểm</option>
              </select>
            </div>
          </div>

          {/* Students Scrollable List */}
          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">
                Không tìm thấy học viên phù hợp bộ lọc.
              </div>
            ) : (
              filteredStudents.map((st) => {
                const isSelected = selectedStudentId === st.id;
                const hasSub = !!st.submission;
                const review = st.submission?.latestReview;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between text-xs ${
                      isSelected
                        ? "bg-teal-50/80 border-[#00685E] shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{st.studentCode}</span>
                        <span className="font-semibold text-slate-900 truncate">{st.fullName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {st.groupName ? `Nhóm ${st.groupNumber}` : "Chưa nhóm"} • {st.department}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {hasSub ? (
                        <div className="space-y-0.5">
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">
                            ĐÃ NỘP (v{st.submission?.version})
                          </span>
                          <div>
                            {review ? (
                              <span
                                className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                  review.grade === "XUAT_SAC"
                                    ? "bg-amber-100 text-amber-900"
                                    : review.grade === "DAT"
                                    ? "bg-teal-100 text-teal-900"
                                    : "bg-rose-100 text-rose-900"
                                }`}
                              >
                                {review.grade === "XUAT_SAC"
                                  ? "XUẤT SẮC"
                                  : review.grade === "DAT"
                                  ? "ĐẠT"
                                  : "CẦN SỬA"}
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-mono">
                                CHƯA CHẤM
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 font-mono">
                          CHƯA NỘP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Submission Details & Grading Studio (Col 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          {!selectedStudent ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Vui lòng chọn một học viên từ danh sách bên trái để xem bài làm.
            </div>
          ) : (
            <>
              {/* Student Header */}
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {selectedStudent.studentCode}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedStudent.fullName}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedStudent.title} • {selectedStudent.department} ({selectedStudent.groupName})
                  </p>
                </div>

                <div className="text-right">
                  {selectedStudent.submission ? (
                    <div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                        ✓ ĐÃ NỘP BÀI (Phiên bản {selectedStudent.submission.version})
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Nộp lúc: {formatTimeVN(selectedStudent.submission.submittedAt)} {formatDateVN(selectedStudent.submission.submittedAt)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      CHƯA NỘP BÀI
                    </span>
                  )}
                </div>
              </div>

              {!selectedStudent.submission ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs space-y-2">
                  <div className="text-2xl">⏳</div>
                  <div className="font-semibold text-slate-700">Học viên này chưa nộp bài thực hành Buổi 2</div>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                    Học viên có thể đang điền biểu mẫu trực tiếp trên điện thoại tại cổng học viên. Màn hình này sẽ tự động cập nhật ngay khi học viên bấm nộp bài.
                  </p>
                </div>
              ) : (
                (() => {
                  const subData = selectedStudent.submission.data || {};
                  const sc = subData.scenario || {};
                  const part1 = subData.part1_updatedKpiPlan || {};
                  const kpiRows = part1.kpiRows || [];
                  const formA = subData.part3_formA_workOrder || {};
                  const formB = subData.part3_formB_commitments || [];
                  const formC = subData.part3_formC_delayHandling || {};
                  const staff = subData.part3_staffFeedback || {};

                  return (
                    <div className="space-y-4 text-xs">
                      {/* Tình huống tóm tắt */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 space-y-1">
                        <div className="flex justify-between font-bold text-[11px]">
                          <span className="uppercase text-amber-900">
                            🎯 Tình huống: {sc.title || sc.indicator || "Chỉ tiêu chậm tiến độ"}
                          </span>
                          <span className="font-mono text-rose-700">
                            Đạt {sc.actualQuantity}/{sc.targetQuantity} {sc.unit} (Thiếu {sc.missingQuantity})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {sc.context || "Tình huống giao việc và kiểm soát tiến độ tại khoa phòng."}
                        </p>
                      </div>

                      {/* Phần 1: Bảng cập nhật chỉ tiêu */}
                      {kpiRows.length > 0 && (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 uppercase">
                            Phần 1: Cập nhật Thực tế & Hoạt động điều chỉnh
                          </div>
                          <div className="divide-y divide-slate-200">
                            {kpiRows.map((kr: any, idx: number) => (
                              <div key={idx} className="p-2.5 text-[11px] space-y-1">
                                <div className="flex justify-between font-semibold text-slate-900">
                                  <span>#{idx + 1}. {kr.indicator}</span>
                                  <span className="font-mono text-teal-800">
                                    Mục tiêu: {kr.target} {kr.unit} → Thực tế: <strong>{kr.actual || "—"} {kr.unit}</strong> ({kr.diff || "—"})
                                  </span>
                                </div>
                                <div className="text-slate-600">
                                  <strong>Hoạt động điều chỉnh:</strong> {kr.activity || "—"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mẫu A: Phiếu giao việc 4 RÕ */}
                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                        <div className="font-bold text-[#00685E] uppercase text-[11px] flex justify-between">
                          <span>MẪU A: PHIẾU GIAO VIỆC 4 RÕ</span>
                          <span className="font-mono text-slate-500 font-normal">Hạn: {formA.deadline || "—"}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div><strong>Nhiệm vụ:</strong> <span className="text-slate-800">{formA.taskName || "—"}</span></div>
                          <div><strong>Người phụ trách (Who):</strong> <span className="text-slate-900 font-bold">{formA.assignee || "—"}</span></div>
                          <div className="sm:col-span-2"><strong>Kết quả bàn giao:</strong> <span className="text-slate-800">{formA.deliverables || "—"}</span></div>
                          <div className="sm:col-span-2"><strong>Tiêu chuẩn hoàn thành:</strong> <span className="text-slate-800">{formA.standards || "—"}</span></div>
                          <div><strong>Mốc kiểm tra:</strong> <span className="text-slate-800">{formA.checkpoints || "—"}</span></div>
                          <div><strong>Hỗ trợ / Khó khăn:</strong> <span className="text-slate-800">{formA.supportNeeds || "—"}</span></div>
                        </div>
                      </div>

                      {/* Mẫu B: Bảng cam kết tiến độ */}
                      <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="font-bold text-blue-700 uppercase text-[11px]">
                          MẪU B: BẢNG CAM KẾT TIẾN ĐỘ ({formB.length} dòng)
                        </div>
                        <div className="space-y-1.5">
                          {formB.map((r: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] space-y-0.5">
                              <div className="flex justify-between items-center font-semibold text-slate-900">
                                <span>#{idx + 1}. {r.task}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  r.status === "Đã chậm" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                                }`}>{r.status}</span>
                              </div>
                              <div className="text-slate-500 text-[10px]">
                                Phụ trách: <strong>{r.assignee}</strong> | Hạn: <strong className="font-mono">{r.deadline}</strong> | Mốc cập nhật: <strong>{r.updateCheckpoint || "—"}</strong>
                              </div>
                              <div className="text-slate-700">
                                <strong>Hành động tiếp theo:</strong> {r.nextAction || "—"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mẫu C: Phiếu xử lý chậm tiến độ */}
                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-rose-50/20 border-rose-200">
                        <div className="font-bold text-rose-800 uppercase text-[11px]">
                          MẪU C: PHIẾU XỬ LÝ CHẬM TIẾN ĐỘ (Sản phẩm chính)
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div><strong>Vấn đề cần xử lý:</strong> <span className="text-slate-800">{formC.issueDescription || "—"}</span></div>
                          <div><strong>Nguyên nhân & Vướng mắc:</strong> <span className="text-slate-800">{formC.rootCause || "—"}</span></div>

                          {/* Hành động ngay */}
                          <div className="pt-1">
                            <span className="font-bold text-slate-700 block mb-1">Hành động khắc phục ngay:</span>
                            <div className="space-y-1 pl-2 border-l-2 border-rose-300">
                              {(formC.immediateActions || []).map((act: any, idx: number) => (
                                <div key={idx} className="text-[11px] text-slate-800">
                                  • {act.action} — <strong>{act.who}</strong> (Hạn: <span className="font-mono">{act.deadline}</span>)
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2 rounded border border-slate-200">
                            <div><strong>Mốc kiểm tra lại (Bắt buộc):</strong> <span className="font-mono font-bold text-rose-700">{formC.recheckTime || "—"}</span></div>
                            <div><strong>Cam kết hoàn thành:</strong> <span className="text-slate-800">{formC.commitmentDeadline || "—"}</span></div>
                            <div className="sm:col-span-2"><strong>Phòng ngừa tái diễn:</strong> <span className="text-slate-800">{formC.preventiveMeasures || "—"}</span></div>
                          </div>

                          {/* Kịch bản 4 bước */}
                          {(staff.step1_stateFacts || staff.step2_clarifyCause || staff.step3_agreeAction || staff.step4_lockCommitment) && (
                            <div className="mt-2 p-2.5 bg-teal-50/50 rounded border border-teal-200 space-y-1 text-[11px]">
                              <span className="font-bold text-[#00685E] uppercase text-[10px] block">
                                Kịch bản trao đổi nhân viên (4 bước không quy chụp):
                              </span>
                              <div>1. Nêu thực tế: <span className="italic text-slate-700">{staff.step1_stateFacts || "—"}</span></div>
                              <div>2. Làm rõ nguyên nhân: <span className="italic text-slate-700">{staff.step2_clarifyCause || "—"}</span></div>
                              <div>3. Thống nhất hành động: <span className="italic text-slate-700">{staff.step3_agreeAction || "—"}</span></div>
                              <div>4. Chốt cam kết: <span className="italic text-slate-700">{staff.step4_lockCommitment || "—"}</span></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Instructor Checklist */}
                      <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#00685E]">
                          📋 Tiêu chí đánh giá tham khảo (Checklist Giảng viên):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-700">
                          <div>☑ <strong>Đúng vấn đề:</strong> Nêu rõ việc chậm và tác động định lượng</div>
                          <div>☑ <strong>4 RÕ đầy đủ:</strong> Đầu ra, người làm, thời hạn, tiêu chuẩn</div>
                          <div>☑ <strong>Hành động cụ thể:</strong> Việc rõ, 1 người chịu trách nhiệm, có hạn</div>
                          <div>☑ <strong>Kiểm soát thực chất:</strong> Có mốc kiểm tra lại và phòng ngừa</div>
                        </div>
                      </div>

                      {/* Grading Studio Form */}
                      <form onSubmit={handleSaveReview} className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Đánh giá & Nhận xét của Giảng viên Buddy:
                          </label>
                          {selectedStudent.submission.latestReview && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Đã chấm lúc: {formatTimeVN(selectedStudent.submission.latestReview.reviewedAt)}
                            </span>
                          )}
                        </div>

                        {/* Grade selection */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700">Xếp loại:</span>
                          {[
                            { value: "XUAT_SAC", label: "★ XUẤT SẮC", color: "bg-amber-100 text-amber-900 border-amber-300" },
                            { value: "DAT", label: "✓ ĐẠT", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
                            { value: "CAN_SUA", label: "! CẦN CHỈNH SỬA", color: "bg-rose-100 text-rose-900 border-rose-300" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setGrade(opt.value)}
                              className={`text-xs font-bold px-3 py-1.5 rounded border transition font-mono ${
                                grade === opt.value
                                  ? `${opt.color} ring-2 ring-[#00685E] shadow-sm`
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {/* Quick feedback templates */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 block">💡 Gợi ý nhận xét nhanh:</span>
                          <div className="flex flex-wrap gap-1">
                            {quickTemplates.map((tmpl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPublicComment(tmpl)}
                                className="text-[10px] bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded truncate max-w-xs transition"
                                title={tmpl}
                              >
                                {tmpl}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment textarea */}
                        <div>
                          <textarea
                            rows={3}
                            value={publicComment}
                            onChange={(e) => setPublicComment(e.target.value)}
                            placeholder="Nhập nhận xét cụ thể để học viên xem trên cổng cá nhân..."
                            className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-900 focus:ring-2 focus:ring-[#00685E] focus:outline-none"
                          />
                        </div>

                        {saveSuccessMsg && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-semibold">
                            ✓ {saveSuccessMsg}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={savingReview}
                            className="bg-[#00685E] hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded shadow transition disabled:opacity-50"
                          >
                            {savingReview ? "Đang lưu..." : "Lưu Đánh Giá & Gửi Học Viên"}
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                })()
              )}
            </>
          )}
        </div>
      </div>

      {/* QR Code Projector Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00685E] bg-teal-50 px-2.5 py-0.5 rounded font-mono">
                BUỔI 2 • MÃ QR BÀI TẬP THỰC HÀNH
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Quét mã để làm bài: Cập nhật kết quả & Xử lý chậm tiến độ
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Chiếu mã này lên máy chiếu hội trường để tất cả học viên quét vào làm bài 3 biểu mẫu
              </p>
            </div>

            {qrDataUrl && (
              <div className="flex justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={qrDataUrl}
                  alt="QR Code Thực hành Buổi 2"
                  className="w-72 h-72 object-contain"
                />
              </div>
            )}

            <div className="p-2.5 bg-slate-100 rounded text-xs font-mono text-slate-700 break-all select-all">
              {practiceUrl}
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(practiceUrl);
                  alert("Đã copy đường link bài tập vào bộ nhớ tạm");
                }}
                className="text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded transition"
              >
                📋 Sao chép Link
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs font-bold bg-[#00685E] text-white hover:bg-teal-800 px-5 py-2 rounded transition"
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
