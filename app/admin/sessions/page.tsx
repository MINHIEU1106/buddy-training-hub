"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { formatDateVN } from "@/lib/date";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // QR Popup state for Assignments
  const [qrPopup, setQrPopup] = useState<{
    title: string;
    type: string;
    url: string;
    dataUrl: string;
  } | null>(null);

  const openAssignmentQr = async (assign: any) => {
    const isInSession = assign.type === "IN_SESSION";
    const targetUrl = isInSession
      ? "https://buddytrain.netlify.app/portal/goal-cascade"
      : "https://buddytrain.netlify.app/portal/homework-plan";
    try {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        width: 520,
        margin: 2,
        color: { dark: "#003D37", light: "#FFFFFF" },
      });
      setQrPopup({
        title: assign.title,
        type: assign.type,
        url: targetUrl,
        dataUrl,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Edit Session Modal state
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [sessionFormData, setSessionFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    trainerName: "",
    lateThresholdMins: 15,
    earlyLeaveThresholdMins: 30,
  });
  const [savingSession, setSavingSession] = useState(false);

  // Assignment Modal state (Create & Edit)
  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    sessionNumber: number;
    assignmentId?: string;
  } | null>(null);

  const [assignFormData, setAssignFormData] = useState({
    title: "",
    description: "",
    type: "IN_SESSION", // IN_SESSION (Thực hành trên lớp) or POST_SESSION (Bài tập về nhà)
    allowedFormat: "BOTH", // BOTH, LINK, FILE
    deadline: "",
    isRequired: true,
  });
  const [savingAssign, setSavingAssign] = useState(false);

  // Alert message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/sessions/list");
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
        setCourse(data.course);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // --- Session Modal Handlers ---
  const openEditSessionModal = (sess: any) => {
    setEditingSession(sess);
    const dateStr = sess.date ? sess.date : "";
    setSessionFormData({
      title: sess.title || "",
      date: dateStr,
      startTime: sess.startTime || "08:30",
      endTime: sess.endTime || "11:30",
      location: sess.location || "Hội trường Hoa Sen, BV Phương Đông",
      trainerName: sess.trainerName || "Buddy Trainer",
      lateThresholdMins: sess.lateThresholdMins || 15,
      earlyLeaveThresholdMins: sess.earlyLeaveThresholdMins || 30,
    });
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setSavingSession(true);

    try {
      const res = await fetch("/api/admin/sessions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSession.id,
          ...sessionFormData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Cập nhật thông tin buổi học thành công!");
        setEditingSession(null);
        await fetchSessions();
      } else {
        alert(data.error || "Lỗi khi cập nhật");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSavingSession(false);
    }
  };

  // --- Assignment Modal Handlers ---
  const openCreateAssignmentModal = (sess: any) => {
    const defaultDeadline = sess.date ? `${sess.date}T23:59` : "";
    setAssignFormData({
      title: "",
      description: "",
      type: "IN_SESSION",
      allowedFormat: "BOTH",
      deadline: defaultDeadline,
      isRequired: true,
    });
    setAssignmentModal({
      isOpen: true,
      sessionId: sess.id,
      sessionNumber: sess.sessionNumber,
    });
  };

  const openEditAssignmentModal = (sess: any, assign: any) => {
    let deadlineStr = "";
    if (assign.deadline) {
      const d = new Date(assign.deadline);
      const iso = d.toISOString();
      deadlineStr = iso.slice(0, 16);
    }
    setAssignFormData({
      title: assign.title || "",
      description: assign.description || "",
      type: assign.type || "IN_SESSION",
      allowedFormat: assign.allowedFormat || "BOTH",
      deadline: deadlineStr,
      isRequired: assign.isRequired !== undefined ? assign.isRequired : true,
    });
    setAssignmentModal({
      isOpen: true,
      sessionId: sess.id,
      sessionNumber: sess.sessionNumber,
      assignmentId: assign.id,
    });
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentModal) return;
    setSavingAssign(true);

    try {
      const isEditing = Boolean(assignmentModal.assignmentId);
      const endpoint = isEditing ? "/api/admin/assignments/update" : "/api/admin/assignments/create";

      const payload = isEditing
        ? { id: assignmentModal.assignmentId, ...assignFormData }
        : { sessionId: assignmentModal.sessionId, ...assignFormData };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(isEditing ? "Đã cập nhật bài tập thành công!" : "Đã thêm bài tập mới vào buổi học!");
        setAssignmentModal(null);
        await fetchSessions();
      } else {
        alert(data.error || "Lỗi lưu bài tập");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSavingAssign(false);
    }
  };

  const handleDeleteAssignment = async (assignId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài tập: "${title}"?\n(Tất cả bài nộp liên quan cũng sẽ bị xóa)`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/assignments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assignId }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Đã xóa bài tập thành công!");
        await fetchSessions();
      } else {
        alert(data.error || "Lỗi khi xóa bài tập");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs uppercase px-4 py-3 rounded-lg shadow-2xl animate-fade-in border border-emerald-400 whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            CHƯƠNG TRÌNH ĐÀO TẠO • BV PHƯƠNG ĐÔNG
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            CẤU HÌNH 4 BUỔI HỌC & BÀI TẬP THỰC HÀNH
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý thông tin buổi học, thiết lập bài tập thực hành trên lớp và bài tập về nhà cho 80 học viên
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/assignments"
            className="text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
          >
            STUDIO CHẤM BÀI TẬP
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 font-code text-slate-400 text-xs">
          Đang tải dữ liệu 4 buổi học và bài tập...
        </div>
      ) : (
        /* Sessions List */
        <div className="grid grid-cols-1 gap-6">
          {sessions.map((sess) => {
            const checkInCount = sess.attendances
              ? sess.attendances.filter((a: any) => a.checkInAt !== null).length
              : 0;
            const checkOutCount = sess.attendances
              ? sess.attendances.filter((a: any) => a.checkOutAt !== null).length
              : 0;
            const assignments = sess.assignments || [];

            return (
              <div
                key={sess.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
              >
                {/* Session Title Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-code font-bold text-sm bg-slate-800 text-slate-200 px-3 py-1 rounded border border-slate-700 whitespace-nowrap">
                      BUỔI {sess.sessionNumber}
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      {sess.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded border whitespace-nowrap ${
                        sess.checkInStatus === "OPEN"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      CHECK-IN: {sess.checkInStatus === "OPEN" ? "ĐANG MỞ" : "ĐÓNG"}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded border whitespace-nowrap ${
                        sess.checkOutStatus === "OPEN"
                          ? "bg-amber-950 text-amber-300 border-amber-700"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      CHECK-OUT: {sess.checkOutStatus === "OPEN" ? "ĐANG MỞ" : "ĐÓNG"}
                    </span>
                  </div>
                </div>

                {/* Details Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold uppercase block mb-1">MÃ BUỔI NHẬP TAY</span>
                    <span className="font-code font-bold text-emerald-400 text-sm">{sess.sessionCode}</span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold uppercase block mb-1">THỜI GIAN & NGÀY</span>
                    <span className="text-slate-200 font-code font-semibold">
                      {formatDateVN(sess.date)} ({sess.startTime} - {sess.endTime})
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold uppercase block mb-1">NGƯỠNG ĐI TRỄ / VỀ SỚM</span>
                    <span className="text-slate-200 font-code">
                      Trễ: {sess.lateThresholdMins}p | Sớm: {sess.earlyLeaveThresholdMins}p
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold uppercase block mb-1">ĐÃ CHECK-IN / CHECK-OUT</span>
                    <span className="text-emerald-400 font-code font-bold">
                      {checkInCount}/80 in • {checkOutCount} out
                    </span>
                  </div>
                </div>

                {/* ASSIGNMENTS SECTION */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        BÀI TẬP THỰC HÀNH & NỘP BÀI CỦA BUỔI {sess.sessionNumber} ({assignments.length})
                      </span>
                    </div>

                    <button
                      onClick={() => openCreateAssignmentModal(sess)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors shadow"
                    >
                      + THÊM BÀI TẬP VÀO BUỔI NÀY
                    </button>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">
                      Chưa có bài tập nào cho buổi này. Bấm nút "+ Thêm bài tập" để tạo bài thực hành trên lớp hoặc bài tập về nhà.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {assignments.map((assign: any) => {
                        const subCount = assign.submissions ? assign.submissions.length : 0;
                        const isInSession = assign.type === "IN_SESSION";

                        return (
                          <div
                            key={assign.id}
                            className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border whitespace-nowrap ${
                                    isInSession
                                      ? "bg-teal-950 text-teal-300 border-teal-700"
                                      : "bg-blue-950 text-blue-300 border-blue-700"
                                  }`}
                                >
                                  {isInSession ? "THỰC HÀNH TRÊN LỚP" : "BÀI TẬP VỀ NHÀ"}
                                </span>
                                <h4 className="text-xs font-bold text-white">
                                  {assign.title}
                                </h4>
                              </div>

                              {assign.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                  {assign.description}
                                </p>
                              )}

                              <div className="text-[10px] text-slate-500 flex gap-3 flex-wrap pt-0.5">
                                <span>
                                  Định dạng: <strong className="text-slate-400">{assign.allowedFormat === "BOTH" ? "Link & File" : assign.allowedFormat === "LINK" ? "Chỉ Link" : "Chỉ File"}</strong>
                                </span>
                                {assign.deadline && (
                                  <span>
                                    Hạn nộp: <strong className="text-slate-400">{formatDateVN(assign.deadline)}</strong>
                                  </span>
                                )}
                                <span>
                                  Đã nộp: <strong className="text-emerald-400">{subCount}/80 bài</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                              <button
                                onClick={() => openAssignmentQr(assign)}
                                className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 px-3 py-1.5 rounded whitespace-nowrap transition-colors shadow"
                              >
                                📱 HIỆN MÃ QR
                              </button>
                              {isInSession && (
                                <Link
                                  href="/admin/goal-cascade"
                                  className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-teal-950 hover:bg-teal-900 border border-teal-600 px-3 py-1.5 rounded whitespace-nowrap transition-colors"
                                >
                                  ĐIỀU PHỐI THỰC HÀNH LIVE ↗
                                </Link>
                              )}
                              <button
                                onClick={() => openEditAssignmentModal(sess, assign)}
                                className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 whitespace-nowrap transition-colors"
                              >
                                SỬA
                              </button>
                              <button
                                onClick={() => handleDeleteAssignment(assign.id, assign.title)}
                                className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 px-3 py-1.5 rounded border border-rose-800 whitespace-nowrap transition-colors"
                              >
                                XÓA
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Session Bottom Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Địa điểm: <span className="text-slate-200">{sess.location || "Hội trường Hoa Sen"}</span> • Giảng viên: <span className="text-slate-200">{sess.trainerName || "Buddy"}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditSessionModal(sess)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
                    >
                      CHỈNH SỬA BUỔI HỌC
                    </button>
                    <Link
                      href={`/admin/sessions/${sess.id}/live`}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors shadow"
                    >
                      MỞ MÀN HÌNH LIVE QR
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL QR CODE BÀI TẬP THỰC HÀNH / BTVN */}
      {qrPopup && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#00685E] p-6 sm:p-8 rounded-2xl max-w-lg w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setQrPopup(null)}
              className="absolute top-4 right-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg"
            >
              ✕ Đóng
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00685E] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                {qrPopup.type === "IN_SESSION" ? "MÃ QR THỰC HÀNH TRÊN LỚP (8 NHÓM)" : "MÃ QR BÀI TẬP VỀ NHÀ"}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
                {qrPopup.title}
              </h3>
            </div>

            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl border-4 border-[#00685E] shadow-xl inline-block">
                <img
                  src={qrPopup.dataUrl}
                  alt="QR Code Bài Tập"
                  className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <div className="text-[11px] uppercase font-bold text-slate-400">Đường dẫn truy cập trực tiếp:</div>
              <div className="font-code font-bold text-sm text-[#00685E] select-all">
                {qrPopup.url}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-1">
              <a
                href={qrPopup.dataUrl}
                download={qrPopup.type === "IN_SESSION" ? "QR_Thuc_Hanh_Tren_Lop.png" : "QR_BTVN_Ke_Hoach_Ca_Nhan.png"}
                className="text-xs font-bold uppercase bg-[#00685E] hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg shadow transition"
              >
                ⬇ Tải ảnh QR (.PNG)
              </a>
              <button
                onClick={() => setQrPopup(null)}
                className="text-xs font-bold uppercase bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2.5 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT ASSIGNMENT */}
      {assignmentModal && assignmentModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {assignmentModal.assignmentId ? "CHỈNH SỬA BÀI TẬP" : `THÊM BÀI TẬP VÀO BUỔI ${assignmentModal.sessionNumber}`}
              </h3>
              <button
                onClick={() => setAssignmentModal(null)}
                className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  TIÊU ĐỀ BÀI TẬP
                </label>
                <input
                  type="text"
                  value={assignFormData.title}
                  onChange={(e) => setAssignFormData({ ...assignFormData, title: e.target.value })}
                  placeholder="VD: Bài thực hành 1: Tối ưu quy trình bàn giao ca trực..."
                  required
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  PHÂN LOẠI BÀI TẬP
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignFormData({ ...assignFormData, type: "IN_SESSION" })}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase border whitespace-nowrap transition-all ${
                      assignFormData.type === "IN_SESSION"
                        ? "bg-teal-700 text-white border-teal-500 shadow"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    1. Thực hành trên lớp
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignFormData({ ...assignFormData, type: "POST_SESSION" })}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase border whitespace-nowrap transition-all ${
                      assignFormData.type === "POST_SESSION"
                        ? "bg-blue-600 text-white border-blue-400 shadow"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    2. Bài tập về nhà
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  YÊU CẦU & HƯỚNG DẪN LÀM BÀI (ĐỀ BÀI)
                </label>
                <textarea
                  rows={3}
                  value={assignFormData.description}
                  onChange={(e) => setAssignFormData({ ...assignFormData, description: e.target.value })}
                  placeholder="Mô tả các bước thực hiện, tiêu chí đánh giá, lưu ý bảo mật dữ liệu theo Nghị định 13/2023/NĐ-CP..."
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    ĐỊNH DẠNG CHO PHÉP
                  </label>
                  <select
                    value={assignFormData.allowedFormat}
                    onChange={(e) => setAssignFormData({ ...assignFormData, allowedFormat: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg font-code"
                  >
                    <option value="BOTH">Link, File & Form Online (Mặc định)</option>
                    <option value="ONLINE">Biểu mẫu 3 bước trực tuyến</option>
                    <option value="LINK">Chỉ nộp Link (Docs/Drive/Canva)</option>
                    <option value="FILE">Chỉ nộp File (PDF/DOCX/Ảnh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    HẠN CHÓT NỘP (DEADLINE)
                  </label>
                  <input
                    type="datetime-local"
                    value={assignFormData.deadline}
                    onChange={(e) => setAssignFormData({ ...assignFormData, deadline: e.target.value })}
                    className="w-full text-xs font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignmentModal(null)}
                  className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={savingAssign}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap transition-colors shadow"
                >
                  {savingAssign ? "ĐANG LƯU..." : assignmentModal.assignmentId ? "LƯU THAY ĐỔI" : "TẠO BÀI TẬP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SESSION INFO */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                CHỈNH SỬA BUỔI {editingSession.sessionNumber}
              </h3>
              <button
                onClick={() => setEditingSession(null)}
                className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  TIÊU ĐỀ / CHỦ ĐỀ BUỔI HỌC
                </label>
                <input
                  type="text"
                  value={sessionFormData.title}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                  required
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    NGÀY HỌC
                  </label>
                  <input
                    type="date"
                    value={sessionFormData.date}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, date: e.target.value })}
                    required
                    className="w-full text-xs font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    GIỜ BẮT ĐẦU
                  </label>
                  <input
                    type="text"
                    value={sessionFormData.startTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, startTime: e.target.value })}
                    placeholder="08:30"
                    className="w-full text-xs font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    GIỜ KẾT THÚC
                  </label>
                  <input
                    type="text"
                    value={sessionFormData.endTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, endTime: e.target.value })}
                    placeholder="11:30"
                    className="w-full text-xs font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    ĐỊA ĐIỂM (HỘI TRƯỜNG)
                  </label>
                  <input
                    type="text"
                    value={sessionFormData.location}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, location: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    GIẢNG VIÊN PHỤ TRÁCH
                  </label>
                  <input
                    type="text"
                    value={sessionFormData.trainerName}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, trainerName: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    NGƯỠNG ĐI TRỄ (PHÚT)
                  </label>
                  <input
                    type="number"
                    value={sessionFormData.lateThresholdMins}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, lateThresholdMins: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    NGƯỠNG VỀ SỚM (PHÚT)
                  </label>
                  <input
                    type="number"
                    value={sessionFormData.earlyLeaveThresholdMins}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, earlyLeaveThresholdMins: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={savingSession}
                  className="w-2/3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  {savingSession ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
