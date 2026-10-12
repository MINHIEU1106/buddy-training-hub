"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function AssignmentSubmitPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.assignmentId as string;

  const [studentCode, setStudentCode] = useState("");
  const [submissionType, setSubmissionType] = useState<"LINK" | "FILE">("LINK");
  const [contentUrl, setContentUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedCode = localStorage.getItem("buddy_student_code");
    if (savedCode) {
      setStudentCode(savedCode);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setError("Vui lòng nhập mã học viên");
      return;
    }

    if (submissionType === "LINK" && !contentUrl.trim()) {
      setError("Vui lòng dán đường link bài tập");
      return;
    }

    if (submissionType === "FILE" && !file) {
      setError("Vui lòng chọn file tài liệu để tải lên");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("studentCode", studentCode.trim().toUpperCase());
      formData.append("assignmentId", assignmentId);
      formData.append("type", submissionType);
      formData.append("note", note);

      if (submissionType === "LINK") {
        formData.append("contentUrl", contentUrl.trim());
      } else if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/student/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lỗi khi nộp bài");
      } else {
        setSuccessMsg(data.message || "Nộp bài thành công!");
        setTimeout(() => {
          router.push("/portal");
        }, 1500);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold">
            BUDDY TRAINING HUB • BV PHƯƠNG ĐÔNG
          </span>
          <h1 className="text-sm sm:text-base font-bold text-white">
            NỘP BÀI TẬP ĐÀO TẠO
          </h1>
        </div>
        <Link
          href="/portal"
          className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded whitespace-nowrap"
        >
          Quay lại trang cá nhân
        </Link>
      </header>

      {/* Main Form */}
      <main className="max-w-2xl w-full mx-auto my-6">
        <div className="bg-slate-800 border border-slate-700 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
          <div className="border-b border-slate-700 pb-4">
            <span className="text-xs font-bold uppercase text-emerald-400">
              FORM THU NỘP BÀI TẬP
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Gửi bài làm và cập nhật phiên bản
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Hệ thống sẽ tự động gán bài nộp vào hồ sơ cá nhân theo mã học viên
            </p>
          </div>

          {/* Security Alert Box */}
          <div className="bg-amber-950/60 border border-amber-800 text-amber-200 p-4 rounded-lg text-xs leading-relaxed">
            <div className="font-bold uppercase tracking-wider mb-1 text-amber-300">
              LƯU Ý BẢO MẬT & RIÊNG TƯ DỮ LIỆU
            </div>
            Tuân thủ Nghị định 13/2023/NĐ-CP: Vui lòng không đưa bất kỳ thông tin định danh cá nhân của bệnh nhân (Họ tên, mã bệnh án, địa chỉ, số CCCD) vào bài tập nộp.
          </div>

          {error && (
            <div className="p-4 rounded bg-rose-950/70 border border-rose-800 text-rose-200 text-xs">
              <div className="font-bold uppercase mb-1">THÔNG BÁO LỖI</div>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs">
              <div className="font-bold uppercase mb-1">THÀNH CÔNG</div>
              {successMsg} — Đang chuyển hướng về trang cá nhân...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Code Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                MÃ HỌC VIÊN / SỐ THỨ TỰ CỦA BẠN (VD: HV01 HOẶC 01)
              </label>
              <input
                type="text"
                maxLength={10}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                placeholder="VD: HV01 hoặc 01"
                className="w-full font-code text-lg font-bold tracking-widest bg-slate-900 border border-slate-600 focus:border-blue-500 text-white py-2.5 px-4 rounded-lg uppercase"
                required
              />
            </div>

            {/* Submission Type Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                HÌNH THỨC NỘP BÀI
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSubmissionType("LINK")}
                  className={`py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${
                    submissionType === "LINK"
                      ? "bg-blue-600 text-white border-blue-400 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  1. Nộp bằng đường link
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType("FILE")}
                  className={`py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${
                    submissionType === "FILE"
                      ? "bg-blue-600 text-white border-blue-400 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  2. Tải file tài liệu
                </button>
              </div>
            </div>

            {/* Input based on selection */}
            {submissionType === "LINK" ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  ĐƯỜNG LINK BÀI TẬP (GOOGLE DRIVE, DOCS, SHEETS, CANVA, NOTION...)
                </label>
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://docs.google.com/presentation/d/..."
                  className="w-full font-code text-sm bg-slate-900 border border-slate-600 focus:border-blue-500 text-white py-3 px-4 rounded-lg"
                />
                <p className="text-[11px] text-slate-400">
                  Nhắc nhở: Hãy đảm bảo đường link đã được bật quyền "Bất kỳ ai có đường liên kết đều có thể xem".
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  CHỌN FILE ĐÍNH KÈM (PDF, DOCX, PPTX, XLSX, PNG, JPG - TỐI ĐA 25MB)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-slate-700 file:text-white hover:file:bg-slate-600 bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer"
                />
              </div>
            )}

            {/* Note Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                GHI CHÚ / LỜI NHẮN CHO GIẢNG VIÊN (TÙY CHỌN)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Bài làm của nhóm 2 - Khoa Cấp cứu..."
                className="w-full text-xs bg-slate-900 border border-slate-600 focus:border-blue-500 text-white p-3 rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Link
                href="/portal"
                className="w-1/3 text-center bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg whitespace-nowrap transition-colors"
              >
                HỦY
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider py-3.5 px-6 rounded-lg whitespace-nowrap transition-colors shadow-lg"
              >
                {loading ? "ĐANG TẢI LÊN..." : "XÁC NHẬN NỘP BÀI"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        Buddy Training Hub • Bệnh viện Phương Đông
      </footer>
    </div>
  );
}
