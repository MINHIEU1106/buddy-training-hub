"use client";

import { useState, useEffect } from "react";
import { formatDateVN, formatTimeVN } from "@/lib/date";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  // Review form state
  const [grade, setGrade] = useState("DAT");
  const [publicComment, setPublicComment] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick feedback templates for fast grading
  const feedbackTemplates = [
    "Bài làm phân tích đúng trọng tâm, đề xuất giải pháp khả thi và bám sát thực tế khoa phòng.",
    "Ý tưởng tốt, cần bổ sung thêm số liệu định lượng về thời gian chờ của bệnh nhân.",
    "Cần tối ưu hóa lại sơ đồ quy trình để phân định rõ trách nhiệm của từng vị trí điều dưỡng và bác sĩ.",
    "Xuất sắc! Mô hình áp dụng rất sáng tạo và có thể nhân rộng sang các khoa khác.",
  ];

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assignments/list");
      if (res.ok) {
        const json = await res.json();
        setAssignments(json.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenReview = (sub: any) => {
    setSelectedSubmission(sub);
    const existingReview = sub.reviews?.[sub.reviews.length - 1];
    if (existingReview) {
      setGrade(existingReview.grade || "DAT");
      setPublicComment(existingReview.publicComment || "");
      setInternalNote(existingReview.internalNote || "");
    } else {
      setGrade("DAT");
      setPublicComment("");
      setInternalNote("");
    }
    setSaveSuccess(false);
  };

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSavingReview(true);
    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          grade,
          publicComment,
          internalNote,
          status: "REVIEWED",
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        const gradeText = grade === "XUAT_SAC" ? "XUẤT SẮC" : grade === "DAT" ? "ĐẠT" : "CẦN SỬA";
        const studentEmail = selectedSubmission.student.email || "Chưa có email";
        setNotificationMsg(
          `Đã ghi nhận kết quả và gửi thông báo điểm: Học viên ${selectedSubmission.student.fullName} (${selectedSubmission.student.studentCode}) - Email: ${studentEmail} | Điểm/Xếp loại: [${gradeText}]`
        );
        await fetchAssignments();
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        alert("Lỗi khi lưu nhận xét");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            STUDIO CHẤM BÀI & ĐÁNH GIÁ
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            BÀI TẬP & NHẬN XÉT CỦA GIẢNG VIÊN
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Xem bài nộp trực tiếp của học viên, đánh giá xếp loại và phản hồi công khai
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Assignments & Submissions List (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {loading ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl font-code text-xs text-slate-500">
              [ ĐANG TẢI DANH SÁCH BÀI TẬP... ]
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500">
              Chưa có bài tập nào.
            </div>
          ) : (
            assignments.map((assign) => (
              <div
                key={assign.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4"
              >
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-code">
                      BUỔI {assign.session.sessionNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border whitespace-nowrap ${
                      assign.type === "IN_SESSION"
                        ? "bg-teal-950 text-teal-300 border-teal-700"
                        : "bg-blue-950 text-blue-300 border-blue-800"
                    }`}>
                      {assign.type === "IN_SESSION" ? "THỰC HÀNH TRÊN LỚP" : "BÀI TẬP VỀ NHÀ"}
                    </span>
                    {assign.deadline && (
                      <span className="text-[10px] font-code text-amber-400">
                        Hạn: {formatDateVN(assign.deadline)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {assign.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Tổng số bài nộp: <span className="font-bold text-emerald-400 font-code">{assign.submissions.length}</span>
                  </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {assign.submissions.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3 text-center">
                      Chưa có học viên nào nộp bài tập này.
                    </div>
                  ) : (
                    assign.submissions.map((sub: any) => {
                      const isSelected = selectedSubmission?.id === sub.id;
                      const hasReview = sub.reviews?.length > 0;
                      const latestReview = sub.reviews?.[sub.reviews.length - 1];

                      return (
                        <div
                          key={sub.id}
                          onClick={() => handleOpenReview(sub)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors flex justify-between items-center ${
                            isSelected
                              ? "bg-slate-800 border-blue-500 shadow-md"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {sub.student.fullName}
                              </span>
                              <span className="text-[10px] font-code text-slate-400">
                                ({sub.student.studentCode})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {sub.student.department} • Phiên bản {sub.version} • {sub.type === "ONLINE_FORM" ? "Biểu mẫu 3 bước" : sub.type === "LINK" ? "Link online" : "File upload"}
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                hasReview
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                  : "bg-amber-950 text-amber-300 border-amber-700"
                              }`}
                            >
                              {hasReview
                                ? latestReview.grade === "XUAT_SAC"
                                  ? "XUẤT SẮC"
                                  : latestReview.grade === "DAT"
                                  ? "ĐẠT"
                                  : "CẦN SỬA"
                                : "CHƯA CHẤM"}
                            </span>
                            <div className="text-[10px] font-code text-slate-500 mt-1 whitespace-nowrap">
                              {formatTimeVN(sub.submittedAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Split View Review Panel (6 cols) */}
        <div className="lg:col-span-6">
          {!selectedSubmission ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <span className="font-code font-bold uppercase text-slate-400 mb-2">
                CHỌN MỘT BÀI NỘP ĐỂ BẮT ĐẦU CHẤM
              </span>
              Nhấp vào bài nộp của bất kỳ học viên nào ở danh sách bên trái để xem nội dung và gửi nhận xét.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6 sticky top-24">
              {/* Submission Header */}
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded whitespace-nowrap">
                  CHI TIẾT BÀI NỘP
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  {selectedSubmission.student.fullName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedSubmission.student.title} • {selectedSubmission.student.department} (Mã: {selectedSubmission.student.studentCode})
                </p>
              </div>

              {/* View Submission Content Box */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300 uppercase">HÌNH THỨC NỘP:</span>
                  <span className="font-code font-bold text-emerald-400 whitespace-nowrap">
                    {selectedSubmission.type === "ONLINE_FORM"
                      ? "BIỂU MẪU 3 BƯỚC TRỰC TUYẾN"
                      : selectedSubmission.type === "LINK"
                      ? "ĐƯỜNG LINK ONLINE"
                      : "TẬP TIN UPLOAD"}
                  </span>
                </div>

                {selectedSubmission.type === "ONLINE_FORM" ? (
                  <div className="space-y-3">
                    <div className="text-slate-300 font-bold flex items-center justify-between">
                      <span>BẢNG KẾ HOẠCH CÁ NHÂN (QUY TRÌNH 3 BƯỚC):</span>
                      {selectedSubmission.contentUrl && (
                        <a
                          href={selectedSubmission.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-0.5 rounded uppercase"
                        >
                          Mở giao diện cá nhân →
                        </a>
                      )}
                    </div>
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedSubmission.note || "{}");
                        return (
                          <div className="space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px]">
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
                          <div className="p-3 bg-slate-900 rounded text-slate-400 font-mono text-[11px] whitespace-pre-wrap">
                            {selectedSubmission.note}
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : selectedSubmission.type === "LINK" ? (
                  <div className="space-y-2">
                    <div className="text-slate-400">Đường link bài làm:</div>
                    <a
                      href={selectedSubmission.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded bg-slate-900 border border-slate-700 text-blue-400 hover:text-blue-300 font-code break-all underline text-xs"
                    >
                      {selectedSubmission.contentUrl}
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-slate-400">Tệp tài liệu:</div>
                    <a
                      href={selectedSubmission.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded bg-slate-900 border border-slate-700 text-emerald-400 hover:text-emerald-300 font-code font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      TẢI VỀ / XEM FILE: {selectedSubmission.fileName || "Tệp đính kèm"}
                    </a>
                  </div>
                )}

                {selectedSubmission.type !== "ONLINE_FORM" && selectedSubmission.note && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1">Ghi chú từ học viên:</span>
                    <span className="text-slate-200 italic">"{selectedSubmission.note}"</span>
                  </div>
                )}
              </div>

              {/* Review Grading Form */}
              <form onSubmit={handleSaveReview} className="space-y-4">
                {saveSuccess && (
                  <div className="p-3.5 rounded-lg bg-emerald-950/90 border border-emerald-500 text-emerald-100 text-xs space-y-1 shadow-md">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                      ✓ ĐÃ LƯU ĐÁNH GIÁ & GỬI THÔNG BÁO ĐIỂM THÀNH CÔNG!
                    </div>
                    <p className="text-[11px] text-emerald-200">
                      {notificationMsg}
                    </p>
                  </div>
                )}

                {/* Grade Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    XẾP LOẠI BÀI TẬP
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setGrade("XUAT_SAC")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border whitespace-nowrap transition-colors ${
                        grade === "XUAT_SAC"
                          ? "bg-emerald-600 text-white border-emerald-400 shadow"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      XUẤT SẮC
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrade("DAT")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border whitespace-nowrap transition-colors ${
                        grade === "DAT"
                          ? "bg-blue-600 text-white border-blue-400 shadow"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      ĐẠT
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrade("CAN_CAI_THIEN")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border whitespace-nowrap transition-colors ${
                        grade === "CAN_CAI_THIEN"
                          ? "bg-amber-600 text-white border-amber-400 shadow"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      CẦN SỬA
                    </button>
                  </div>
                </div>

                {/* Quick feedback templates */}
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    CHÈN NHẬN XÉT MẪU NHANH:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {feedbackTemplates.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPublicComment((prev) => (prev ? prev + " " + tpl : tpl))}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 text-left"
                      >
                        + Mẫu {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Public Comment */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    NHẬN XÉT CỦA GIẢNG VIÊN (HỌC VIÊN SẼ THẤY NỘI DUNG NÀY)
                  </label>
                  <textarea
                    rows={4}
                    value={publicComment}
                    onChange={(e) => setPublicComment(e.target.value)}
                    placeholder="Nhập nhận xét chi tiết, khen ngợi hoặc hướng dẫn cải tiến..."
                    className="w-full text-xs bg-slate-950 border border-slate-700 focus:border-blue-500 text-white p-3 rounded-lg"
                  />
                </div>

                {/* Internal Note */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    GHI CHÚ NỘI BỘ (CHỈ DÀNH CHO BUDDY / BAN TỔ CHỨC)
                  </label>
                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="VD: Cần lưu ý bác sĩ này để mời tham gia ban cố vấn..."
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-lg"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={savingReview}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg whitespace-nowrap transition-colors shadow-lg"
                >
                  {savingReview ? "ĐANG LƯU NHẬN XÉT..." : "LƯU VÀ GỬI NHẬN XÉT"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
