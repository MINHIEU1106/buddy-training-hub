"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { GOAL_CASCADE_GROUPS } from "@/lib/goal-cascade-groups";

interface SubmittedPlan {
  groupIndex: number;
  groupName: string;
  score: number;
  submittedByCode: string;
  submittedByName: string;
  submittedAt: string;
  comment: string | null;
  data: {
    plan: {
      step1_goal: string;
      step2_results: { indicator: string; unit: string; baseline: string; target: string; deadline: string }[];
      step3_6_works: { what: string; who: string; whenStart: string; whenEnd: string }[];
      simulationQ2: { rootCause: string; correctiveActions: string };
    };
    checks: { label: string; passed: boolean }[];
  };
}

export default function AdminGoalCascadePage() {
  const [unlockedStep, setUnlockedStep] = useState<number>(7);
  const [scenarioBroadcasted, setScenarioBroadcasted] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [plans, setPlans] = useState<SubmittedPlan[]>([]);
  const [commentDraft, setCommentDraft] = useState<string>("");
  const [savingComment, setSavingComment] = useState<boolean>(false);

  // QR Modal state
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrMode, setQrMode] = useState<"IN_CLASS" | "HOMEWORK">("IN_CLASS");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [baseOrigin, setBaseOrigin] = useState("https://buddytrain.netlify.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseOrigin(window.location.origin);
    }
  }, []);

  const practiceUrl =
    qrMode === "IN_CLASS"
      ? `${baseOrigin}/portal/goal-cascade`
      : `${baseOrigin}/portal/homework-plan`;

  useEffect(() => {
    QRCode.toDataURL(practiceUrl, {
      width: 520,
      margin: 2,
      color: { dark: "#003D37", light: "#FFFFFF" },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [practiceUrl]);

  const loadPlans = () =>
    fetch("/api/goal-cascade")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []))
      .catch(() => {});

  // Tải bài nộp thật, tự làm mới mỗi 15 giây trong buổi học
  useEffect(() => {
    loadPlans();
    const t = setInterval(loadPlans, 15000);
    return () => clearInterval(t);
  }, []);

  const planOf = (idx: number) => plans.find((p) => p.groupIndex === idx);
  const active = planOf(selectedGroup);

  useEffect(() => {
    setCommentDraft(planOf(selectedGroup)?.comment || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, plans.length]);

  const handleSaveComment = async () => {
    setSavingComment(true);
    const res = await fetch("/api/goal-cascade", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupIndex: selectedGroup, comment: commentDraft }),
    });
    setSavingComment(false);
    if (!res.ok) {
      alert((await res.json()).error || "Lưu nhận xét thất bại");
      return;
    }
    await loadPlans();
    alert("Đã lưu nhận xét. Nhóm sẽ thấy khi mở lại Workspace.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#00685E] text-white font-bold px-2.5 py-0.5 rounded font-mono uppercase">
              Buổi 1 - Đào tạo Quản lý
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Điều Phối Live: Công Cụ Phân Rã Mục Tiêu 5W1H (Goal Cascade)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ thực hành trực tiếp của 8 nhóm khoa/phòng, mở khóa từng bước và phát kịch bản mô phỏng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setQrMode("IN_CLASS");
              setShowQrModal(true);
            }}
            className="text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 px-4 py-2 rounded shadow transition flex items-center gap-1.5 font-mono"
          >
            📱 HIỆN MÃ QR BÀI TẬP THỰC HÀNH
          </button>
          <Link
            href="/portal/goal-cascade?admin=1"
            target="_blank"
            className="text-xs font-bold bg-white text-[#00685E] border border-[#00685E] px-3.5 py-2 rounded hover:bg-teal-50 transition"
          >
            Mở Workspace Học Viên ↗
          </Link>
        </div>
      </div>

      {/* Live Instructor Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step Unlocker */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Điều khiển mở khóa bước thực hành
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "B1 - B2", value: 2 },
              { label: "B3 - B6 (5W1H)", value: 6 },
              { label: "B7 & Review", value: 7 },
            ].map((st) => (
              <button
                key={st.value}
                onClick={() => setUnlockedStep(st.value)}
                className={`py-2 text-xs font-bold rounded border text-center transition font-mono ${
                  unlockedStep >= st.value
                    ? "bg-[#00685E] text-white border-[#00685E]"
                    : "bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aggregate Stats (dữ liệu thật) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến độ nộp bài</div>
            <div className="text-2xl font-black text-[#00685E] font-mono mt-1">
              {plans.length} / {GOAL_CASCADE_GROUPS.length} Nhóm
            </div>
            <div className="text-[11px] text-slate-500">Tự làm mới mỗi 15 giây</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</div>
            <div className="text-sm font-bold text-emerald-700 mt-1">
              {plans.length === GOAL_CASCADE_GROUPS.length ? "✓ Đã đủ 100% nhóm" : `Còn ${GOAL_CASCADE_GROUPS.length - plans.length} nhóm chưa nộp`}
            </div>
            <div className="text-[11px] text-slate-500">Quy trình 3 bước</div>
          </div>
        </div>

        {/* Projection Mode */}
        <div className="bg-gradient-to-r from-teal-900 to-[#00685E] text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
              Chế độ Hội trường
            </span>
            <h3 className="text-xs font-bold mt-1.5">Chiếu QR Thực Hành & So Sánh 8 Nhóm</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => {
                setQrMode("IN_CLASS");
                setShowQrModal(true);
              }}
              className="text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded text-center transition font-mono"
            >
              📱 Chiếu QR Code
            </button>
            <Link
              href="/portal/goal-cascade?admin=1"
              target="_blank"
              className="text-xs font-bold bg-white text-slate-950 px-2.5 py-1.5 rounded text-center hover:bg-slate-100 transition font-mono"
            >
              Mở Toàn Màn Hình
            </Link>
          </div>
        </div>
      </div>

      {/* Fullscreen Projection QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#00685E] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-center space-y-5 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg"
            >
              ✕ Đóng
            </button>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setQrMode("IN_CLASS")}
                className={`text-xs font-bold uppercase px-3.5 py-1.5 rounded-lg border transition ${
                  qrMode === "IN_CLASS"
                    ? "bg-[#00685E] text-white border-[#00685E]"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                1. QR Thực hành tại lớp (8 Nhóm)
              </button>
              <button
                onClick={() => setQrMode("HOMEWORK")}
                className={`text-xs font-bold uppercase px-3.5 py-1.5 rounded-lg border transition ${
                  qrMode === "HOMEWORK"
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                2. QR Bài tập về nhà cá nhân
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00685E] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                {qrMode === "IN_CLASS" ? "BUỔI 1 • THỰC HÀNH TRÊN LỚP (8 NHÓM)" : "BUỔI 1 • BÀI TẬP VỀ NHÀ CÁ NHÂN"}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {qrMode === "IN_CLASS"
                  ? "QUÉT MÃ QR ĐỂ VÀO BÀN THỰC HÀNH NHÓM"
                  : "QUÉT MÃ QR ĐỂ LÀM BTVN LẬP KẾ HOẠCH CÁ NHÂN"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {qrMode === "IN_CLASS"
                  ? "Phân rã mục tiêu BV 'Người bệnh hài lòng ≥ 98%' & Lập kế hoạch hành động 5W1H"
                  : "Biểu mẫu lập kế hoạch công việc cá nhân / khoa phòng 3 bước online"}
              </p>
            </div>

            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl border-4 border-[#00685E] shadow-xl inline-block">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Bài Tập Thực Hành"
                    className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-72 h-72 flex items-center justify-center text-xs text-slate-400">
                    Đang tạo mã QR...
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <div className="text-[11px] uppercase font-bold text-slate-400">Hoặc truy cập trực tiếp bằng trình duyệt:</div>
              <div className="font-mono font-bold text-sm sm:text-base text-[#00685E] select-all">
                {practiceUrl}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-1">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={qrMode === "IN_CLASS" ? "QR_Thuc_Hanh_Buoi_1_Goal_Cascade.png" : "QR_BTVN_Buoi_1_Ke_Hoach_Ca_Nhan.png"}
                  className="text-xs font-bold uppercase bg-[#00685E] hover:bg-teal-800 text-white px-4 py-2.5 rounded-lg shadow transition"
                >
                  ⬇ Tải ảnh QR (.PNG) chèn Slide
                </a>
              )}
              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs font-bold uppercase bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2.5 rounded-lg transition"
              >
                Đóng màn hình QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng Tổng Hợp Mục Tiêu Phân Rã Toàn Viện (Cấp 2 - Khoa/Phòng) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#00685E] text-white font-bold px-2 py-0.5 rounded font-mono">
                BẢNG TỔNG HỢP MỤC TIÊU
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                Mục Tiêu Phân Rã Về 8 Khối / Khoa Phòng (Đóng góp vào mục tiêu BV ≥ 98%)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hiển thị tức thời mục tiêu đơn vị, chỉ số kết quả then chốt và người chịu trách nhiệm sau khi các nhóm nộp bài
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Đã nộp: <strong className="text-[#00685E] font-bold">{plans.length}</strong> / {GOAL_CASCADE_GROUPS.length} nhóm
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3 w-56">Khối / Khoa Phòng</th>
                <th className="p-3 min-w-[240px]">Mục tiêu phân rã của đơn vị (Bước 1)</th>
                <th className="p-3 min-w-[260px]">Chỉ số Kết quả mong muốn & Mức mục tiêu (Bước 2)</th>
                <th className="p-3 w-40">Người đại diện</th>
                <th className="p-3 w-28 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {GOAL_CASCADE_GROUPS.map((groupName, idx) => {
                const p = planOf(idx);
                return (
                  <tr
                    key={groupName}
                    onClick={() => setSelectedGroup(idx)}
                    className={`cursor-pointer transition ${
                      selectedGroup === idx ? "bg-teal-50/60 font-medium" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{groupName}</div>
                      {p && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          Nộp: {new Date(p.submittedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-800">
                      {p ? (
                        <p className="line-clamp-2">{p.data.plan.step1_goal || "—"}</p>
                      ) : (
                        <span className="text-slate-400 italic">Đang làm bài, chưa nộp...</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">
                      {p && p.data.plan.step2_results && p.data.plan.step2_results.length > 0 ? (
                        <div className="space-y-1">
                          {p.data.plan.step2_results.map((kr, kIdx) => (
                            <div key={kIdx} className="text-[11px] flex items-start gap-1">
                              <span className="text-teal-700 font-bold">•</span>
                              <span>
                                {kr.indicator}:{" "}
                                <strong className="text-slate-900 font-mono">
                                  {kr.baseline} → {kr.target} {kr.unit}
                                </strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-800">
                      {p ? (
                        <div>
                          <div className="font-semibold text-slate-900">{p.submittedByName}</div>
                          <span className="text-[10px] text-slate-500 font-mono">Mã: {p.submittedByCode}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {p ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                          ĐÃ NỘP
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                          CHƯA
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Teams Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Teams List (Col 5) */}
        <div className="md:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách 8 Nhóm Khoa/Phòng Thực hành
          </div>

          <div className="space-y-2">
            {GOAL_CASCADE_GROUPS.map((name, idx) => {
              const p = planOf(idx);
              return (
                <div
                  key={name}
                  onClick={() => setSelectedGroup(idx)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition ${
                    selectedGroup === idx
                      ? "border-2 border-[#00685E] bg-teal-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{name}</span>
                    {p ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                        ✓ Đã nộp
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                        Chưa nộp
                      </span>
                    )}
                  </div>

                  {p && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      Người nộp: <strong className="text-slate-800">{p.submittedByName}</strong> ·{" "}
                      {new Date(p.submittedAt).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                      {p.comment ? " · Đã nhận xét" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Detail & Grading Panel (Col 7) */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <div className="border-b pb-3">
            <span className="text-[10px] font-bold bg-[#00685E] text-white px-2 py-0.5 rounded font-mono uppercase">
              Chi tiết bài thực hành
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
              <h3 className="text-base font-bold text-slate-900">{GOAL_CASCADE_GROUPS[selectedGroup]}</h3>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/portal/goal-cascade?code=${active?.submittedByCode || ""}&admin=1`}
                  target="_blank"
                  className="text-[11px] font-bold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition inline-flex items-center gap-1"
                  title="Mở Sơ đồ Gantt tiến độ 12 tháng của nhóm này"
                >
                  📊 Sơ đồ Gantt ↗
                </Link>
                <Link
                  href={`/portal/goal-cascade?code=${active?.submittedByCode || ""}&admin=1`}
                  target="_blank"
                  className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition inline-flex items-center gap-1"
                  title="Mở Bảng theo dõi chỉ tiêu KPIs & Tiến độ"
                >
                  📈 Bảng chỉ tiêu ↗
                </Link>
              </div>
            </div>
            {active && (
              <p className="text-xs text-slate-500 mt-1">
                Người nộp: <strong>{active.submittedByName}</strong> ({active.submittedByCode}) · Trạng thái: <strong className="text-emerald-700">Đã nộp bài</strong>
              </p>
            )}
          </div>

          {!active ? (
            <p className="text-xs text-slate-500">Nhóm này chưa nộp bài.</p>
          ) : (
            <>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bước 1 – Mục tiêu:</span>
                  <p className="font-semibold text-slate-800">{active.data.plan.step1_goal || "(trống)"}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bước 2 – Kết quả mong muốn:</span>
                  <ul className="list-disc pl-4 text-slate-700 space-y-0.5">
                    {active.data.plan.step2_results.map((kr, i) => (
                      <li key={i}>
                        {kr.indicator}: {kr.baseline} → {kr.target} {kr.unit} (hạn {kr.deadline})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Bước 3 – Kế hoạch hành động 5W1H ({active.data.plan.step3_6_works.length} việc):
                  </span>
                  <ul className="list-disc pl-4 text-slate-700 space-y-0.5">
                    {active.data.plan.step3_6_works.map((w, i) => (
                      <li key={i}>
                        {w.what} — <strong>{w.who || "chưa có Who"}</strong> ({w.whenStart} → {w.whenEnd})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructor Feedback Input */}
              <div className="space-y-2 pt-2 border-t">
                <label className="block text-xs font-bold text-slate-800 uppercase">
                  Nhận xét & Đánh giá của Giảng viên Buddy:
                </label>
                <textarea
                  rows={3}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Nhập nhận xét cho nhóm..."
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded p-2.5 text-xs focus:ring-2 focus:ring-[#00685E] focus:outline-none placeholder:text-slate-400 font-medium"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-500">
                    💡 Sau khi lưu, học viên mở trang làm bài của nhóm sẽ thấy ngay thông báo nhận xét này.
                  </div>
                  <div className="flex items-center gap-2">
                    {active && (
                      <Link
                        href={`/portal/goal-cascade?code=${active.submittedByCode}&admin=1`}
                        target="_blank"
                        className="text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded transition inline-flex items-center gap-1"
                        title="Mở giao diện nhóm này dưới góc nhìn học viên để xem nhận xét"
                      >
                        👁 Xem trang học viên ↗
                      </Link>
                    )}
                    <button
                      onClick={handleSaveComment}
                      disabled={savingComment}
                      className="bg-[#00685E] hover:bg-teal-800 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-60 transition shadow"
                    >
                      {savingComment ? "Đang lưu..." : "Lưu Nhận Xét & Gửi Cho Nhóm"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
