"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

  const avgScore = plans.length ? (plans.reduce((s, p) => s + p.score, 0) / plans.length).toFixed(1) : "0";

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
              Buổi 2 - Đào tạo Quản lý
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Điều Phối Live: Công Cụ Phân Rã Mục Tiêu 5W1H (Goal Cascade)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ thực hành trực tiếp của 6 nhóm khoa/phòng, mở khóa từng bước và phát kịch bản mô phỏng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/goal-cascade"
            target="_blank"
            className="text-xs font-bold bg-white text-[#00685E] border border-[#00685E] px-3.5 py-2 rounded hover:bg-teal-50 transition"
          >
            Mở Workspace Học Viên ↗
          </Link>
          <button
            onClick={() => setScenarioBroadcasted(!scenarioBroadcasted)}
            className={`text-xs font-bold px-4 py-2 rounded transition shadow font-mono ${
              scenarioBroadcasted
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-amber-400 text-slate-950 hover:bg-amber-300"
            }`}
          >
            {scenarioBroadcasted ? "✓ Đã Phát Kịch Bản Quý 2" : "⚡ Phát Kịch Bản Mô Phỏng Quý 2"}
          </button>
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
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm chất lượng TB</div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{avgScore} / 100</div>
            <div className="text-[11px] text-slate-500">Trên các nhóm đã nộp</div>
          </div>
        </div>

        {/* Projection Mode */}
        <div className="bg-gradient-to-r from-teal-900 to-[#00685E] text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
              Chế độ Hội trường
            </span>
            <h3 className="text-xs font-bold mt-1.5">Chiếu Cây Phân Rã & So Sánh 6 Nhóm</h3>
          </div>
          <Link
            href="/portal/goal-cascade"
            target="_blank"
            className="text-xs font-bold bg-white text-slate-950 px-3 py-1.5 rounded text-center hover:bg-slate-100 transition mt-2 font-mono"
          >
            Mở Chế Độ Toàn Màn Hình
          </Link>
        </div>
      </div>

      {/* Bảng Tổng Hợp Mục Tiêu Phân Rã Toàn Viện (Cấp 2 - Khoa/Phòng) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#00685E] text-white font-bold px-2 py-0.5 rounded font-mono">
                BẢNG TỔNG HỢP TOÀN VIỆN
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                Mục Tiêu Phân Rã Về 6 Khối / Khoa Phòng (Đóng góp vào mục tiêu BV ≥ 90%)
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
                <th className="p-3 min-w-[260px]">Chỉ số Kết quả & Mức cần đạt (Bước 2)</th>
                <th className="p-3 w-40">Người đại diện</th>
                <th className="p-3 w-28 text-center">Chất lượng</th>
                <th className="p-3 w-24 text-center">Trạng thái</th>
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
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            p.score >= 90
                              ? "bg-emerald-100 text-emerald-800"
                              : p.score >= 80
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {p.score}đ
                        </span>
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
            Danh sách 6 Nhóm Khoa/Phòng Thực hành
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
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          p.score >= 90
                            ? "bg-emerald-100 text-emerald-800"
                            : p.score >= 80
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {p.score}đ
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        Chưa nộp
                      </span>
                    )}
                  </div>

                  {p && (
                    <>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Người nộp: <strong className="text-slate-800">{p.submittedByName}</strong> ·{" "}
                        {new Date(p.submittedAt).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                        {p.comment ? " · Đã nhận xét" : ""}
                      </div>
                      {/* Tiêu chí đạt / chưa đạt */}
                      <div className="flex items-center gap-1 mt-2.5">
                        {p.data.checks.map((c, i) => (
                          <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${c.passed ? "bg-[#00685E]" : "bg-slate-200"}`}
                            title={`${c.label}: ${c.passed ? "Đạt" : "Chưa đạt"}`}
                          />
                        ))}
                      </div>
                    </>
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
            <h3 className="text-base font-bold text-slate-900 mt-1">{GOAL_CASCADE_GROUPS[selectedGroup]}</h3>
            {active && (
              <p className="text-xs text-slate-500">
                Người nộp: {active.submittedByName} ({active.submittedByCode}) · Điểm: {active.score}/100
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bước 2 – Kết quả:</span>
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
                    Bước 3–6 – Công việc 5W1H ({active.data.plan.step3_6_works.length} việc):
                  </span>
                  <ul className="list-disc pl-4 text-slate-700 space-y-0.5">
                    {active.data.plan.step3_6_works.map((w, i) => (
                      <li key={i}>
                        {w.what} — <strong>{w.who || "chưa có Who"}</strong> ({w.whenStart} → {w.whenEnd})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                    Xử lý Kịch bản Mô phỏng Quý 2:
                  </span>
                  <p className="text-rose-900"><strong>Nguyên nhân:</strong> {active.data.plan.simulationQ2.rootCause || "(trống)"}</p>
                  <p className="text-rose-900 mt-1"><strong>Điều chỉnh:</strong> {active.data.plan.simulationQ2.correctiveActions || "(trống)"}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Kiểm tra tự động:</span>
                  {active.data.checks.map((c, i) => (
                    <div key={i} className={c.passed ? "text-emerald-700" : "text-rose-700"}>
                      {c.passed ? "✓" : "✗"} {c.label}
                    </div>
                  ))}
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
                  className="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-[#00685E]"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={handleSaveComment}
                    disabled={savingComment}
                    className="bg-[#00685E] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-60"
                  >
                    {savingComment ? "Đang lưu..." : "Lưu Nhận Xét & Gửi Cho Nhóm"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
