"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatTimeVN } from "@/lib/date";

export default function ProjectorLiveBoardPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Manual Checkin Modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [manualNote, setManualNote] = useState("Học viên quên mang điện thoại");
  const [manualStatus, setManualStatus] = useState("ON_TIME");
  const [currentHost, setCurrentHost] = useState("buddy-training-hub.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHost(window.location.host);
    }
  }, []);

  // Fetch live board data
  const fetchLiveStatus = async () => {
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/live-status`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Không thể tải dữ liệu buổi học");
      } else {
        setData(json);
      }
    } catch (err) {
      setError("Mất kết nối với máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // Poll every 3 seconds for live updates
  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Toggle Check-in / Check-out gate
  const handleToggleGate = async (gate: "checkIn" | "checkOut", currentStatus: string) => {
    setActionLoading(true);
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/toggle-gate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gate,
          status: newStatus,
          actorName: "Giảng viên tại lớp",
        }),
      });
      if (res.ok) {
        await fetchLiveStatus();
      }
    } catch (err) {
      alert("Lỗi khi điều khiển cổng");
    } finally {
      setActionLoading(false);
    }
  };

  // Manual Attendance submit
  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      const res = await fetch(`/api/admin/attendance/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studentId: selectedStudentId,
          checkInStatus: manualStatus,
          note: manualNote,
          actorName: "Admin xác nhận có mặt tại lớp",
        }),
      });

      if (res.ok) {
        setShowManualModal(false);
        setSelectedStudentId("");
        await fetchLiveStatus();
      } else {
        const d = await res.json();
        alert(d.error || "Lỗi khi xác nhận điểm danh bổ sung");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-code">
        Đang kết nối màn hình chiếu Live Board...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="p-6 bg-rose-950 border border-rose-800 rounded-xl text-xs">
          Lỗi: {error}
        </div>
        <Link href="/admin" className="mt-4 inline-block text-xs uppercase text-slate-400 hover:text-white whitespace-nowrap">
          Quay lại Dashboard
        </Link>
      </div>
    );
  }

  const { session, stats, qrDataUrl, attendances, absentStudents, courseName, clientName } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Bar for Projector */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            {clientName} • {courseName}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
            BUỔI {session.sessionNumber}: {session.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gate Controls */}
          <button
            onClick={() => handleToggleGate("checkIn", session.checkInStatus)}
            disabled={actionLoading}
            className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border whitespace-nowrap transition-colors ${
              session.checkInStatus === "OPEN"
                ? "bg-rose-900/80 text-rose-200 border-rose-700 hover:bg-rose-800"
                : "bg-emerald-700 text-white border-emerald-600 hover:bg-emerald-600"
            }`}
          >
            {session.checkInStatus === "OPEN" ? "ĐÓNG CỔNG CHECK-IN" : "MỞ CỔNG CHECK-IN"}
          </button>

          <button
            onClick={() => handleToggleGate("checkOut", session.checkOutStatus)}
            disabled={actionLoading}
            className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border whitespace-nowrap transition-colors ${
              session.checkOutStatus === "OPEN"
                ? "bg-rose-900/80 text-rose-200 border-rose-700 hover:bg-rose-800"
                : "bg-amber-700 text-white border-amber-600 hover:bg-amber-600"
            }`}
          >
            {session.checkOutStatus === "OPEN" ? "ĐÓNG CỔNG CHECK-OUT" : "MỞ CỔNG CHECK-OUT"}
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            ĐIỂM DANH BỔ SUNG
          </button>

          <Link
            href="/admin"
            className="text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            THOÁT LIVE
          </Link>
        </div>
      </header>

      {/* Main Projector Two-Column View */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-stretch">
        {/* Left Column: Giant QR Code (7 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-between shadow-2xl text-center">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {session.checkOutStatus === "OPEN" ? "QUÉT QR ĐỂ CHECK-OUT CUỐI GIỜ" : "QUÉT QR ĐỂ ĐIỂM DANH ĐẦU GIỜ"}
            </span>
            <h2 className="text-lg font-bold text-white mt-2">
              DÙNG CAMERA ĐIỆN THOẠI ĐỂ QUÉT
            </h2>
          </div>

          {/* Giant QR Image */}
          <div className="my-6 p-4 bg-white rounded-2xl shadow-2xl border-4 border-slate-700">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Điểm Danh"
                className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto"
              />
            )}
          </div>

          {/* Fallback Instructions */}
          <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400">Không quét được camera? Truy cập trình duyệt:</div>
            <div className="font-code font-bold text-emerald-400 text-sm">
              {session.checkOutStatus === "OPEN" ? `${currentHost}/checkout` : `${currentHost}/checkin`}
            </div>
            <div className="text-slate-400 pt-1">
              Mã buổi học nhập tay: <span className="font-code font-bold text-white text-sm bg-slate-800 px-2 py-0.5 rounded">{session.sessionCode}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Counter & Attendee Stream (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Sĩ số Counter Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  SĨ SỐ HIỆN TẠI (REALTIME)
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold font-code text-emerald-400 tracking-tight">
                    {stats.checkedInCount} / {stats.totalStudents}
                  </span>
                  <span className="text-xl font-bold font-code text-slate-400">
                    ({stats.attendanceRate}%)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  CHECK-OUT HOÀN THÀNH
                </span>
                <div className="mt-1 text-2xl font-bold font-code text-amber-400">
                  {stats.checkedOutCount} / {stats.totalStudents}
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3.5 mt-4 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.attendanceRate}%` }}
              />
            </div>
          </div>

          {/* Realtime Attendee Feed */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  DANH SÁCH HỌC VIÊN CÓ MẶT (TỰ ĐỘNG CẬP NHẬT)
                </h3>
              </div>
              <span className="text-xs font-code text-slate-400">
                Đã check-in: {stats.checkedInCount}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-2">
              {attendances.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-code">
                  [ ĐANG CHỜ HỌC VIÊN ĐẦU TIÊN QUÉT MÃ... ]
                </div>
              ) : (
                attendances.map((att: any) => (
                  <div
                    key={att.id}
                    className="flex justify-between items-center bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {att.student.fullName}
                        </span>
                        <span className="text-[10px] font-bold font-code bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {att.student.studentCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {att.student.title} • {att.student.department}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border font-code ${
                          att.checkInStatus === "ON_TIME"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                            : "bg-amber-950 text-amber-300 border-amber-700"
                        }`}
                      >
                        {att.checkInStatus === "ON_TIME" ? "ĐÚNG GIỜ" : "ĐI TRỄ"} • {formatTimeVN(att.checkInAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Manual Checkin Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                XÁC NHẬN CÓ MẶT / ĐIỂM DANH BỔ SUNG
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  CHỌN HỌC VIÊN CÓ MẶT TẠI LỚP (CHƯA QUÉT QR)
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-3 rounded-lg"
                >
                  <option value="">-- Chọn bác sĩ / cán bộ quản lý --</option>
                  {absentStudents.map((st: any) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.studentCode}) - {st.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  TRẠNG THÁI GHI NHẬN
                </label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-3 rounded-lg"
                >
                  <option value="ON_TIME">Đúng giờ</option>
                  <option value="LATE">Đi trễ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  LÝ DO XÁC NHẬN BỔ SUNG (BẮT BUỘC LƯU AUDIT LOG)
                </label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  required
                  placeholder="VD: Học viên quên điện thoại, camera hỏng, mạng yếu..."
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-3 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  XÁC NHẬN ĐIỂM DANH BỔ SUNG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="flex justify-between items-center border-t border-slate-800 pt-4 text-xs text-slate-500">
        <div>
          Hội trường: {session.location || "Hội trường Hoa Sen, BV Phương Đông"} • Giảng viên: {session.trainerName || "Buddy"}
        </div>
        <div className="font-code text-slate-400">
          BUDDY LIVE PROJECTOR ENGINE v1.0
        </div>
      </footer>
    </div>
  );
}
