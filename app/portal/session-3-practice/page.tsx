"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeVN, formatDateVN } from "@/lib/date";

interface KpiIndicatorRow {
  id: string;
  indicator: string;
  target: string;
  baseline: string;
  actual: string; // Thực tế mới cập nhật
  unit: string;
  diff: string;   // Chênh lệch tự tính
  activity: string; // Hoạt động điều chỉnh
  deadline: string;
}

interface WorkOrderForm {
  taskName: string;
  deliverables: string; // Kết quả cần bàn giao
  assignee: string; // Người chịu trách nhiệm chính
  deadline: string; // Thời hạn hoàn thành
  standards: string; // Tiêu chuẩn hoàn thành
  checkpoints: string; // Mốc cập nhật tiến độ (VD: Ngày 3, Ngày 7, Ngày 10)
  supportNeeds: string; // Khó khăn/phối hợp cần hỗ trợ
}

interface CommitmentRow {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
  status: "Đúng tiến độ" | "Có nguy cơ chậm" | "Đã chậm" | "Chờ phối hợp";
  risks: string; // Vướng mắc / rủi ro
  nextAction: string; // Hành động tiếp theo
  updateCheckpoint: string; // Mốc cập nhật
}

interface ActionStepRow {
  id: string;
  action: string;
  who: string;
  deadline: string;
}

interface DelayHandlingForm {
  issueDescription: string; // Vấn đề cần xử lý
  currentFacts: string; // Dữ kiện / thực tế hiện tại
  rootCause: string; // Nguyên nhân và vướng mắc
  immediateActions: ActionStepRow[]; // Danh sách hành động ngay (việc - người - hạn)
  leadResponsible: string; // Người chịu trách nhiệm
  commitmentDeadline: string; // Cam kết và thời hạn
  recheckTime: string; // Thời điểm kiểm tra lại (bắt buộc)
  preventiveMeasures: string; // Cách phòng ngừa tái diễn
}

interface StaffFeedbackForm {
  step1_stateFacts: string; // Nêu thực tế khách quan
  step2_clarifyCause: string; // Làm rõ nguyên nhân
  step3_agreeAction: string; // Thống nhất hành động
  step4_lockCommitment: string; // Chốt cam kết
}

export default function Session3PracticePage() {
  const [studentCode, setStudentCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  // Review & Previous Plan State (Phần 1)
  const [previousPlan, setPreviousPlan] = useState<any>(null);
  const [instructorReview, setInstructorReview] = useState<any>(null);
  const [kpiRows, setKpiRows] = useState<KpiIndicatorRow[]>([]);
  const [planGoal, setPlanGoal] = useState<string>("");

  // Scenario State (Phần 2)
  const [scenario, setScenario] = useState<any>(null);

  // Form A State (Phần 3)
  const [formA, setFormA] = useState<WorkOrderForm>({
    taskName: "",
    deliverables: "",
    assignee: "",
    deadline: "",
    standards: "",
    checkpoints: "",
    supportNeeds: "",
  });

  // Form B State (Phần 3)
  const [formBRows, setFormBRows] = useState<CommitmentRow[]>([]);

  // Form C State (Phần 3)
  const [formC, setFormC] = useState<DelayHandlingForm>({
    issueDescription: "",
    currentFacts: "",
    rootCause: "",
    immediateActions: [
      { id: "act_1", action: "", who: "", deadline: "" }
    ],
    leadResponsible: "",
    commitmentDeadline: "",
    recheckTime: "",
    preventiveMeasures: "",
  });

  // 4-Step Staff Feedback Form (Tùy chọn)
  const [staffFeedback, setStaffFeedback] = useState<StaffFeedbackForm>({
    step1_stateFacts: "",
    step2_clarifyCause: "",
    step3_agreeAction: "",
    step4_lockCommitment: "",
  });

  // Submit & Autosave state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [autoSaveMsg, setAutoSaveMsg] = useState("Đã lưu nháp tự động");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // 1. Initial Load from LocalStorage / URL
  useEffect(() => {
    const urlCode = new URLSearchParams(window.location.search).get("code");
    const code = urlCode || localStorage.getItem("buddy_student_code") || "";
    if (code) {
      setStudentCode(code);
      fetchPracticeData(code);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPracticeData = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/session-3-practice?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tải dữ liệu bài tập");
        return;
      }

      setStudentInfo(data.student);
      const hw = data.homeworkPlan;
      setPreviousPlan(hw?.planData);
      setInstructorReview(hw?.review);

      // Thiết lập bảng theo dõi chỉ tiêu (Phần 1)
      if (hw?.planData) {
        setPlanGoal(hw.planData.step1_goal || "");
        const krs: KpiIndicatorRow[] = (hw.planData.step2_results || []).map((kr: any, idx: number) => {
          const targetNum = parseFloat(kr.target) || 0;
          const baselineNum = parseFloat(kr.baseline) || 0;
          // Thực tế ban đầu có thể lấy từ baseline hoặc 70% mục tiêu
          const actualVal = kr.baseline || "";
          return {
            id: kr.id || `kri_${idx}`,
            indicator: kr.indicator || `Chỉ tiêu ${idx + 1}`,
            target: kr.target || "",
            baseline: kr.baseline || "",
            actual: actualVal,
            unit: kr.unit || "%",
            diff: calculateDiff(kr.target, actualVal, kr.unit),
            activity: hw.planData.step3_6_works?.[idx]?.what || "Duy trì theo dõi và triển khai theo tiến độ",
            deadline: kr.deadline || "",
          };
        });
        setKpiRows(krs);
      }

      // Thiết lập tình huống (Phần 2)
      const sc = data.scenario;
      setScenario(sc);

      // Điền sẵn dữ liệu mặc định cho Mẫu A từ tình huống
      if (sc) {
        setFormA({
          taskName: sc.indicator || "Nhiệm vụ trọng tâm khoa phòng",
          deliverables: `Báo cáo kết quả hoàn thành đạt tối thiểu ${sc.targetQuantity} ${sc.unit}`,
          assignee: sc.assigneeName || data.student?.fullName || "",
          deadline: sc.deadline || "",
          standards: `Đạt 100% định mức ${sc.dailyQuota} ${sc.unit}/ngày, đảm bảo chất lượng và sự hài lòng của người bệnh`,
          checkpoints: `Cập nhật ngày 3, ngày 7 và nghiệm thu ngày 10 (${sc.deadline})`,
          supportNeeds: `Phối hợp số liệu cùng phòng ban liên quan, hỗ trợ thiết bị liên lạc`,
        });

        // Điền sẵn Mẫu B (Dòng đầu tiên từ tình huống)
        setFormBRows([
          {
            id: "row_1",
            task: sc.indicator || "Nhiệm vụ chính",
            assignee: sc.assigneeName || data.student?.fullName || "",
            deadline: sc.deadline || "",
            status: "Đã chậm",
            risks: `Mới đạt ${sc.actualQuantity}/${sc.targetQuantity} ${sc.unit} (thiếu ${sc.missingQuantity} ${sc.unit})`,
            nextAction: "Họp rà soát nguyên nhân, phân bổ tăng cường nhân sự hỗ trợ",
            updateCheckpoint: "Cuối ngày hôm nay lúc 17:00",
          },
          {
            id: "row_2",
            task: "Phối hợp hỗ trợ rà soát danh sách & tăng cường cuộc gọi/xử lý",
            assignee: "Nhân sự phối hợp tăng cường",
            deadline: sc.deadline || "",
            status: "Chờ phối hợp",
            risks: "Khối lượng tồn đọng cần giải phóng gấp",
            nextAction: "Bố trí 02 nhân sự hỗ trợ ca chiều",
            updateCheckpoint: "Trước 11:30 ngày mai",
          },
        ]);

        // Điền sẵn Mẫu C
        setFormC({
          issueDescription: `Tiến độ chỉ tiêu "${sc.indicator}" bị chậm so với cam kết (${sc.actualQuantity}/${sc.targetQuantity} ${sc.unit}, thiếu hụt ${sc.missingQuantity} ${sc.unit})`,
          currentFacts: `Đến hạn ${sc.deadline}, chỉ tiêu mới hoàn thành ${sc.actualQuantity}/${sc.targetQuantity} ${sc.unit} (đạt ${sc.completionRate}%), định mức bình quân thực tế thấp hơn yêu cầu (${sc.dailyQuota} ${sc.unit}/ngày).`,
          rootCause: "",
          immediateActions: [
            {
              id: "act_1",
              action: `Hoàn thành dứt điểm ${sc.missingQuantity} ${sc.unit} còn thiếu`,
              who: sc.assigneeName || "",
              deadline: sc.deadline || "",
            },
            {
              id: "act_2",
              action: "Hỗ trợ phân loại và giải quyết vướng mắc tiếp cận người bệnh",
              who: "Quản lý / Người phối hợp",
              deadline: sc.deadline || "",
            },
          ],
          leadResponsible: sc.assigneeName || "",
          commitmentDeadline: `Cam kết hoàn thành bù toàn bộ khối lượng thiếu trước ${sc.deadline}`,
          recheckTime: `${sc.deadline} 16:30`,
          preventiveMeasures: "Thiết lập mốc kiểm đếm tiến độ 2 ngày/lần thay vì đợi đến sát hạn deadline mới tổng kết.",
        });
      }

      // Nếu đã từng nộp bài Buổi 3, khôi phục lại dữ liệu bài nộp
      if (data.session3Submission?.data) {
        const subData = data.session3Submission.data;
        if (subData.part1_updatedKpiPlan?.kpiRows) setKpiRows(subData.part1_updatedKpiPlan.kpiRows);
        if (subData.part3_formA_workOrder) setFormA(subData.part3_formA_workOrder);
        if (subData.part3_formB_commitments) setFormBRows(subData.part3_formB_commitments);
        if (subData.part3_formC_delayHandling) setFormC(subData.part3_formC_delayHandling);
        if (subData.part3_staffFeedback) setStaffFeedback(subData.part3_staffFeedback);
      } else {
        // Phục hồi từ localStorage draft nếu có
        const draftKey = `session3_draft_${code}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.kpiRows) setKpiRows(parsed.kpiRows);
            if (parsed.formA) setFormA(parsed.formA);
            if (parsed.formBRows) setFormBRows(parsed.formBRows);
            if (parsed.formC) setFormC(parsed.formC);
            if (parsed.staffFeedback) setStaffFeedback(parsed.staffFeedback);
            setAutoSaveMsg("Đã khôi phục bản nháp đang điền");
          } catch (e) {}
        }
      }
    } catch (err) {
      setError("Mất kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // Tính chênh lệch tự động
  const calculateDiff = (targetStr: string, actualStr: string, unit: string) => {
    const target = parseFloat(targetStr.replace(/[^0-9.]/g, ""));
    const actual = parseFloat(actualStr.replace(/[^0-9.]/g, ""));
    if (isNaN(target) || isNaN(actual)) return "—";
    const diff = actual - target;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff} ${unit}`;
  };

  // Cập nhật giá trị ô thực tế trong Phần 1
  const handleActualChange = (idx: number, newVal: string) => {
    setKpiRows((prev) => {
      const updated = [...prev];
      updated[idx].actual = newVal;
      updated[idx].diff = calculateDiff(updated[idx].target, newVal, updated[idx].unit);
      return updated;
    });
  };

  // Cập nhật hoạt động điều chỉnh
  const handleActivityChange = (idx: number, newAct: string) => {
    setKpiRows((prev) => {
      const updated = [...prev];
      updated[idx].activity = newAct;
      return updated;
    });
  };

  // Thêm/Xóa dòng Mẫu B
  const handleAddFormBRow = () => {
    setFormBRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        task: "",
        assignee: "",
        deadline: "",
        status: "Đúng tiến độ",
        risks: "",
        nextAction: "",
        updateCheckpoint: "",
      },
    ]);
  };

  const handleRemoveFormBRow = (id: string) => {
    setFormBRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Thêm/Xóa hành động Mẫu C
  const handleAddActionStep = () => {
    setFormC((prev) => ({
      ...prev,
      immediateActions: [
        ...prev.immediateActions,
        { id: `act_${Date.now()}`, action: "", who: "", deadline: "" },
      ],
    }));
  };

  const handleRemoveActionStep = (id: string) => {
    setFormC((prev) => ({
      ...prev,
      immediateActions: prev.immediateActions.filter((a) => a.id !== id),
    }));
  };

  // Tự động lưu nháp vào LocalStorage sau 1 giây
  useEffect(() => {
    if (!studentCode) return;
    const timer = setTimeout(() => {
      const draft = { kpiRows, formA, formBRows, formC, staffFeedback };
      localStorage.setItem(`session3_draft_${studentCode}`, JSON.stringify(draft));
      setAutoSaveMsg("Đã lưu nháp tự động lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [kpiRows, formA, formBRows, formC, staffFeedback, studentCode]);

  // Kiểm tra tính hợp lệ trước khi nộp
  const validateForms = () => {
    const errs: { [key: string]: string } = {};

    // Mẫu A
    if (!formA.taskName.trim()) errs.formA_taskName = "Vui lòng nhập tên nhiệm vụ (Mẫu A)";
    if (!formA.deliverables.trim()) errs.formA_deliverables = "Vui lòng nhập kết quả cần bàn giao (Mẫu A)";
    if (!formA.assignee.trim()) errs.formA_assignee = "Vui lòng nhập người chịu trách nhiệm chính (Mẫu A)";
    if (!formA.deadline.trim()) errs.formA_deadline = "Vui lòng nhập thời hạn hoàn thành (Mẫu A)";

    // Mẫu B
    if (formBRows.length === 0) {
      errs.formB = "Vui lòng điền ít nhất 1 dòng cam kết tiến độ (Mẫu B)";
    } else {
      const emptyTask = formBRows.find((r) => !r.task.trim() || !r.assignee.trim());
      if (emptyTask) errs.formB = "Mỗi dòng trong Bảng cam kết cần có tên nhiệm vụ và người phụ trách";
    }

    // Mẫu C
    if (!formC.issueDescription.trim()) errs.formC_issue = "Vui lòng nêu vấn đề cần xử lý (Mẫu C)";
    if (!formC.rootCause.trim()) errs.formC_rootCause = "Vui lòng phân tích nguyên nhân & vướng mắc (Mẫu C)";
    if (!formC.recheckTime.trim()) errs.formC_recheck = "Vui lòng ấn định thời điểm kiểm tra lại (bắt buộc)";
    if (!formC.preventiveMeasures.trim()) errs.formC_preventive = "Vui lòng nhập giải pháp phòng ngừa tái diễn";

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Nộp bài
  const handleSubmit = async () => {
    if (!validateForms()) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc được đánh dấu đỏ trong 3 biểu mẫu.");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccessMsg(null);
    try {
      const payload = {
        studentCode,
        scenarioData: scenario,
        updatedKpiPlan: {
          step1_goal: planGoal,
          kpiRows,
        },
        workOrderForm: formA,
        commitmentRows: formBRows,
        delayHandlingForm: formC,
        staffFeedbackForm: staffFeedback,
      };

      const res = await fetch("/api/session-3-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Nộp bài thất bại");
      } else {
        setSubmitSuccessMsg(data.message || "Đã nộp bài tập Buổi 3 thành công!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      alert("Mất kết nối máy chủ khi nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center font-mono text-sm text-slate-600">
          ⏳ Đang kết nối bài tập thực hành...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Header */}
      <div className="bg-[#00685E] text-white border-b border-teal-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded transition border border-teal-600"
            >
              ← Về Cổng Học Viên
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded tracking-wide uppercase font-mono">
                  BUỔI 2 • THỰC HÀNH TẠI LỚP
                </span>
                <h1 className="text-sm sm:text-base font-bold tracking-tight">
                  Cập Nhật Kết Quả & Xử Lý Chậm Tiến Độ (3 Biểu Mẫu)
                </h1>
              </div>
              <p className="text-[11px] text-teal-100 mt-0.5">
                Học viên: <strong className="text-white font-bold">{studentInfo?.fullName || "—"}</strong> ({studentCode}) • {studentInfo?.department || "BV Phương Đông"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-teal-200 hidden md:inline">● {autoSaveMsg}</span>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 text-slate-950 font-black text-xs uppercase px-4 py-2 rounded shadow transition font-mono whitespace-nowrap"
            >
              {isSubmitting ? "Đang gửi..." : "✓ NỘP BÀI THỰC HÀNH"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Success Alert */}
        {submitSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 text-xs shadow-md space-y-1">
            <div className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-800">
              ✓ NỘP BÀI THÀNH CÔNG!
            </div>
            <p>{submitSuccessMsg}</p>
          </div>
        )}

        {/* Cảnh báo bảo mật thông tin bệnh nhân */}
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span>
            <strong>Lưu ý bảo mật y tế:</strong> Không ghi thông tin định danh trực tiếp của người bệnh (Họ tên thật, Số CCCD, Bệnh án chi tiết) vào các biểu mẫu làm bài.
          </span>
        </div>

        {/* =========================================================================
            PHẦN 1: CẬP NHẬT KẾT QUẢ SAU REVIEW
        ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00685E] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded font-mono">
                PHẦN 1
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-1">
                Cập Nhật Kết Quả Kế Hoạch Sau Khi Được Review (Buổi 1)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Trạng thái bài thực hành Buổi 1:{" "}
              <strong className={instructorReview ? "text-emerald-700" : "text-amber-600"}>
                {instructorReview ? "Đã có nhận xét của Giảng viên" : "Đang chờ nhận xét (cho phép cập nhật nháp)"}
              </strong>
            </span>
          </div>

          {/* Nhận xét của giảng viên (Chỉ đọc) */}
          <div className="p-4 rounded-lg bg-teal-50/60 border border-teal-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#00685E] uppercase tracking-wide">
                💬 Nhận xét từ Giảng viên Buddy cho Bài thực hành Buổi 1 {instructorReview?.groupName || studentInfo?.groupName ? `(${instructorReview?.groupName || studentInfo?.groupName})` : ""}:
              </span>
              {instructorReview && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  {instructorReview.grade === "XUAT_SAC" ? "XUẤT SẮC" : instructorReview.grade === "DAT" ? "ĐẠT" : "CẦN CHỈNH SỬA"}
                </span>
              )}
            </div>
            <p className="text-slate-800 italic bg-white p-2.5 rounded border border-teal-100 whitespace-pre-wrap">
              {instructorReview?.publicComment ||
                `Bài thực hành của ${studentInfo?.groupName || "nhóm bạn"} đang đợi Giảng viên gửi nhận xét từ màn hình điều phối. Bạn vẫn có thể đối chiếu mục tiêu và chủ động cập nhật mức thực tế tại buổi học hôm nay.`}
            </p>
          </div>

          {/* Bảng theo dõi chỉ tiêu cập nhật */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 uppercase">
                Bảng Theo Dõi Chỉ Tiêu (Cập nhật cột Thực tế & Hoạt động điều chỉnh):
              </label>
              <span className="text-[11px] text-slate-500">Chênh lệch tự động tính toán</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <th className="p-2.5 w-10 text-center">STT</th>
                    <th className="p-2.5 min-w-[200px]">Chỉ tiêu</th>
                    <th className="p-2.5 w-24 text-center">Mục tiêu</th>
                    <th className="p-2.5 w-28 text-center bg-teal-50 text-[#00685E]">
                      Thực tế mới (Gõ sửa) *
                    </th>
                    <th className="p-2.5 w-24 text-center">Chênh lệch</th>
                    <th className="p-2.5 min-w-[240px]">Hoạt động điều chỉnh theo nhận xét</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {kpiRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        Chưa có dữ liệu chỉ tiêu từ Kế hoạch thực hành Buổi 1 của nhóm.
                      </td>
                    </tr>
                  ) : (
                    kpiRows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{row.indicator}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                          {row.target} {row.unit}
                        </td>
                        <td className="p-2.5 text-center bg-teal-50/50">
                          <input
                            type="text"
                            value={row.actual}
                            onChange={(e) => handleActualChange(idx, e.target.value)}
                            placeholder="Nhập mức mới"
                            className="w-full text-center font-mono font-bold text-[#00685E] border border-teal-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#00685E] bg-white"
                          />
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-600">
                          {row.diff}
                        </td>
                        <td className="p-2.5">
                          <textarea
                            rows={1}
                            value={row.activity}
                            onChange={(e) => handleActivityChange(idx, e.target.value)}
                            placeholder="Giải pháp điều chỉnh tiếp theo..."
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#00685E]"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PHẦN 2: TÌNH HUỐNG CHẬM TIẾN ĐỘ (DỰNG TỪ MỤC TIÊU ĐÃ ĐẶT)
        ========================================================================= */}
        {scenario && (
          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded font-mono">
                PHẦN 2 • TÌNH HUỐNG CHẬM TIẾN ĐỘ
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-1">
                {scenario.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {scenario.isPersonalized
                  ? "🎯 Tình huống được hệ thống tự động cá nhân hóa từ chính mục tiêu trong Kế hoạch của bạn"
                  : "🏢 Tình huống mẫu chuẩn ngành Y tế (Phòng Chăm sóc khách hàng)"}
              </p>
            </div>

            {/* 5 Thẻ dữ kiện then chốt */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  1. Mục tiêu tổng
                </span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {scenario.targetQuantity} {scenario.unit}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  2. Định mức / Ngày
                </span>
                <span className="font-mono font-bold text-teal-700 text-sm">
                  {scenario.dailyQuota} {scenario.unit}/ngày
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">({scenario.workingDays} ngày)</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  3. Người phụ trách
                </span>
                <span className="font-bold text-slate-800 text-xs block truncate" title={scenario.assigneeName}>
                  {scenario.assigneeName}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  4. Hạn chót (Deadline)
                </span>
                <span className="font-mono font-bold text-amber-700 text-xs">
                  {scenario.deadline}
                </span>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase text-rose-800 block mb-1">
                  5. Thực tế tại hạn chót
                </span>
                <span className="font-mono font-black text-rose-700 text-sm">
                  {scenario.actualQuantity} / {scenario.targetQuantity}
                </span>
                <span className="text-[10px] text-rose-800 block mt-0.5 font-bold">
                  Thiếu {scenario.missingQuantity} ({scenario.completionRate}%)
                </span>
              </div>
            </div>

            {/* Bối cảnh & Câu hỏi gợi mở */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <p className="text-slate-800 leading-relaxed">
                <strong>Bối cảnh:</strong> {scenario.context}
              </p>
              <div className="p-2.5 bg-white rounded border border-rose-200 text-rose-900 font-semibold flex items-start gap-2">
                <span>❓</span>
                <span>{scenario.questionPrompt}</span>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            PHẦN 3: ĐIỀN 3 BIỂU MẪU XỬ LÝ (MẪU A -> MẪU B -> MẪU C)
        ========================================================================= */}
        <section className="space-y-6">
          <div className="bg-[#00685E] text-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded font-mono uppercase">
                PHẦN 3 • BỘ 3 CÔNG CỤ QUẢN LÝ
              </span>
              <h2 className="text-base font-bold mt-1">
                Thực Hiện 3 Biểu Mẫu: Phiếu 4 Rõ → Cam Kết Tiến Độ → Phiếu Xử Lý Chậm
              </h2>
            </div>
            <span className="text-xs text-teal-100">Dữ liệu tự động điền sẵn từ tình huống</span>
          </div>

          {/* -------------------------------------------------------------
              MẪU A: PHIẾU GIAO VIỆC 4 RÕ
          ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#00685E] uppercase font-mono">
                  MẪU A (Đặt ở thời điểm GIAO việc ban đầu - Hoàn thiện lại cho chuẩn 4 RÕ)
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Phiếu Giao Việc 4 Rõ
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Rõ việc • Rõ người • Rõ hạn • Rõ chuẩn</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  1. Tên nhiệm vụ <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formA.taskName}
                  onChange={(e) => setFormA({ ...formA, taskName: e.target.value })}
                  placeholder="Điền tên nhiệm vụ..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                />
                {validationErrors.formA_taskName && (
                  <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formA_taskName}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  2. Người chịu trách nhiệm chính (Duy nhất 1 người) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formA.assignee}
                  onChange={(e) => setFormA({ ...formA, assignee: e.target.value })}
                  placeholder="Họ tên người phụ trách..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E] font-bold text-[#00685E]"
                />
                {validationErrors.formA_assignee && (
                  <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formA_assignee}</span>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  3. Kết quả cần bàn giao (Đầu ra cụ thể) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formA.deliverables}
                  onChange={(e) => setFormA({ ...formA, deliverables: e.target.value })}
                  placeholder="Mô tả cụ thể sản phẩm bàn giao..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                />
                {validationErrors.formA_deliverables && (
                  <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formA_deliverables}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  4. Thời hạn hoàn thành <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formA.deadline}
                  onChange={(e) => setFormA({ ...formA, deadline: e.target.value })}
                  placeholder="Hạn chót ngày dd/mm/yyyy"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E] font-mono"
                />
                {validationErrors.formA_deadline && (
                  <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formA_deadline}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  5. Các mốc cập nhật tiến độ (Checkpoints)
                </label>
                <input
                  type="text"
                  value={formA.checkpoints}
                  onChange={(e) => setFormA({ ...formA, checkpoints: e.target.value })}
                  placeholder="VD: Ngày 3, Ngày 7, và Ngày 10 nghiệm thu"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  6. Tiêu chuẩn hoàn thành (Chất lượng, định mức, số liệu)
                </label>
                <textarea
                  rows={2}
                  value={formA.standards}
                  onChange={(e) => setFormA({ ...formA, standards: e.target.value })}
                  placeholder="Tiêu chuẩn cần đạt..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  7. Khó khăn / Phối hợp cần hỗ trợ từ cấp trên và liên khoa phòng
                </label>
                <textarea
                  rows={2}
                  value={formA.supportNeeds}
                  onChange={(e) => setFormA({ ...formA, supportNeeds: e.target.value })}
                  placeholder="Nguồn lực hỗ trợ..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              MẪU B: BẢNG CAM KẾT TIẾN ĐỘ
          ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#00685E] uppercase font-mono">
                  MẪU B (Theo dõi nhiều việc, thêm/xóa dòng được - Mobile card view)
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Bảng Cam Kết Tiến Độ
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddFormBRow}
                className="bg-teal-50 hover:bg-teal-100 text-[#00685E] border border-teal-300 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 self-start sm:self-auto"
              >
                + Thêm dòng nhiệm vụ
              </button>
            </div>

            {validationErrors.formB && (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-semibold">
                {validationErrors.formB}
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5 min-w-[180px]">Nhiệm vụ</th>
                    <th className="p-2.5 w-32">Người phụ trách</th>
                    <th className="p-2.5 w-24 text-center">Hạn</th>
                    <th className="p-2.5 w-36 text-center">Tình trạng</th>
                    <th className="p-2.5 min-w-[160px]">Vướng mắc / Rủi ro</th>
                    <th className="p-2.5 min-w-[180px]">Hành động tiếp theo</th>
                    <th className="p-2.5 w-28 text-center">Mốc cập nhật</th>
                    <th className="p-2.5 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formBRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5">
                        <textarea
                          rows={2}
                          value={row.task}
                          onChange={(e) => {
                            const updated = [...formBRows];
                            updated[idx].task = e.target.value;
                            setFormBRows(updated);
                          }}
                          placeholder="Tên nhiệm vụ..."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={row.assignee}
                          onChange={(e) => {
                            const updated = [...formBRows];
                            updated[idx].assignee = e.target.value;
                            setFormBRows(updated);
                          }}
                          placeholder="Phụ trách..."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs font-semibold text-[#00685E]"
                        />
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        <input
                          type="text"
                          value={row.deadline}
                          onChange={(e) => {
                            const updated = [...formBRows];
                            updated[idx].deadline = e.target.value;
                            setFormBRows(updated);
                          }}
                          placeholder="Hạn"
                          className="w-full text-center border border-slate-300 rounded p-1.5 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <select
                          value={row.status}
                          onChange={(e: any) => {
                            const updated = [...formBRows];
                            updated[idx].status = e.target.value;
                            setFormBRows(updated);
                          }}
                          className={`w-full text-xs font-bold rounded p-1.5 border ${
                            row.status === "Đã chậm"
                              ? "bg-rose-50 text-rose-700 border-rose-300"
                              : row.status === "Có nguy cơ chậm"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : row.status === "Chờ phối hợp"
                              ? "bg-blue-50 text-blue-700 border-blue-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-300"
                          }`}
                        >
                          <option value="Đúng tiến độ">Đúng tiến độ</option>
                          <option value="Có nguy cơ chậm">Có nguy cơ chậm</option>
                          <option value="Đã chậm">Đã chậm</option>
                          <option value="Chờ phối hợp">Chờ phối hợp</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <textarea
                          rows={2}
                          value={row.risks}
                          onChange={(e) => {
                            const updated = [...formBRows];
                            updated[idx].risks = e.target.value;
                            setFormBRows(updated);
                          }}
                          placeholder="Vướng mắc nếu có..."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-rose-800"
                        />
                      </td>
                      <td className="p-2.5">
                        <textarea
                          rows={2}
                          value={row.nextAction}
                          onChange={(e) => {
                            const updated = [...formBRows];
                            updated[idx].nextAction = e.target.value;
                            setFormBRows(updated);
                          }}
                          placeholder="Hành động tiếp theo..."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="text"
                          value={row.updateCheckpoint}
                          onChange={(e) => {
                            const updated = [...formBRows];
                            updated[idx].updateCheckpoint = e.target.value;
                            setFormBRows(updated);
                          }}
                          placeholder="Mốc kiểm tra"
                          className="w-full text-center border border-slate-300 rounded p-1.5 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        {formBRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFormBRow(row.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {formBRows.map((row, idx) => (
                <div key={row.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      Nhiệm vụ #{idx + 1}
                    </span>
                    {formBRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFormBRow(row.id)}
                        className="text-rose-600 text-xs font-bold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-0.5">Tên nhiệm vụ:</label>
                    <input
                      type="text"
                      value={row.task}
                      onChange={(e) => {
                        const updated = [...formBRows];
                        updated[idx].task = e.target.value;
                        setFormBRows(updated);
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-600 block mb-0.5">Người phụ trách:</label>
                      <input
                        type="text"
                        value={row.assignee}
                        onChange={(e) => {
                          const updated = [...formBRows];
                          updated[idx].assignee = e.target.value;
                          setFormBRows(updated);
                        }}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white font-semibold text-[#00685E]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-0.5">Hạn:</label>
                      <input
                        type="text"
                        value={row.deadline}
                        onChange={(e) => {
                          const updated = [...formBRows];
                          updated[idx].deadline = e.target.value;
                          setFormBRows(updated);
                        }}
                        className="w-full border border-slate-300 rounded p-1.5 bg-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-0.5">Tình trạng:</label>
                    <select
                      value={row.status}
                      onChange={(e: any) => {
                        const updated = [...formBRows];
                        updated[idx].status = e.target.value;
                        setFormBRows(updated);
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                    >
                      <option value="Đúng tiến độ">Đúng tiến độ</option>
                      <option value="Có nguy cơ chậm">Có nguy cơ chậm</option>
                      <option value="Đã chậm">Đã chậm</option>
                      <option value="Chờ phối hợp">Chờ phối hợp</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-0.5">Hành động tiếp theo:</label>
                    <textarea
                      rows={2}
                      value={row.nextAction}
                      onChange={(e) => {
                        const updated = [...formBRows];
                        updated[idx].nextAction = e.target.value;
                        setFormBRows(updated);
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* -------------------------------------------------------------
              MẪU C: PHIẾU XỬ LÝ CHẬM TIẾN ĐỘ (SẢN PHẨM NỘP CHÍNH)
          ------------------------------------------------------------- */}
          <div className="bg-white border-2 border-teal-600 rounded-xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="border-b border-teal-200 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase font-mono bg-teal-100 px-2.5 py-0.5 rounded">
                  MẪU C (SẢN PHẨM NỘP CHÍNH CỦA TÌNH HUỐNG)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Phiếu Xử Lý Chậm Tiến Độ
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-mono">
                Bắt buộc điền đủ
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Vấn đề & Dữ kiện */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    1. Vấn đề cần xử lý <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formC.issueDescription}
                    onChange={(e) => setFormC({ ...formC, issueDescription: e.target.value })}
                    placeholder="Nêu rõ nội dung công việc bị chậm..."
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                  />
                  {validationErrors.formC_issue && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formC_issue}</span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    2. Dữ kiện / Thực tế hiện tại (Có thể chỉnh sửa số liệu)
                  </label>
                  <textarea
                    rows={2}
                    value={formC.currentFacts}
                    onChange={(e) => setFormC({ ...formC, currentFacts: e.target.value })}
                    placeholder="Số liệu thực tế..."
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                  />
                </div>
              </div>

              {/* Nguyên nhân */}
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  3. Nguyên nhân cốt lõi và vướng mắc thực tế <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formC.rootCause}
                  onChange={(e) => setFormC({ ...formC, rootCause: e.target.value })}
                  placeholder="Phân tích vì sao chậm: do quy trình, thiếu nhân sự, phối hợp chậm, hay dữ liệu đầu vào..."
                  className="w-full border border-slate-300 rounded p-2.5 focus:ring-1 focus:ring-[#00685E]"
                />
                {validationErrors.formC_rootCause && (
                  <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formC_rootCause}</span>
                )}
              </div>

              {/* Danh sách hành động ngay */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 uppercase">
                    4. Hành động cần thực hiện ngay (Việc - Người chịu trách nhiệm - Thời hạn):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddActionStep}
                    className="text-xs text-[#00685E] font-bold underline"
                  >
                    + Thêm hành động
                  </button>
                </div>

                <div className="space-y-2">
                  {formC.immediateActions.map((act, i) => (
                    <div key={act.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2 rounded border border-slate-200">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          value={act.action}
                          onChange={(e) => {
                            const updated = [...formC.immediateActions];
                            updated[i].action = e.target.value;
                            setFormC({ ...formC, immediateActions: updated });
                          }}
                          placeholder={`Hành động #${i + 1}...`}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={act.who}
                          onChange={(e) => {
                            const updated = [...formC.immediateActions];
                            updated[i].who = e.target.value;
                            setFormC({ ...formC, immediateActions: updated });
                          }}
                          placeholder="Người làm..."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs font-semibold text-[#00685E]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={act.deadline}
                          onChange={(e) => {
                            const updated = [...formC.immediateActions];
                            updated[i].deadline = e.target.value;
                            setFormC({ ...formC, immediateActions: updated });
                          }}
                          placeholder="Thời hạn"
                          className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center flex items-center justify-center">
                        {formC.immediateActions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveActionStep(act.id)}
                            className="text-rose-600 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cam kết & Kiểm tra lại */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    5. Cam kết và thời hạn hoàn thành bù
                  </label>
                  <textarea
                    rows={2}
                    value={formC.commitmentDeadline}
                    onChange={(e) => setFormC({ ...formC, commitmentDeadline: e.target.value })}
                    placeholder="Nội dung cam kết..."
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    6. Thời điểm kiểm tra lại (Check lại tiến độ) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formC.recheckTime}
                    onChange={(e) => setFormC({ ...formC, recheckTime: e.target.value })}
                    placeholder="VD: 16:30 Ngày 26/10/2027"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E] font-mono font-bold text-rose-700"
                  />
                  {validationErrors.formC_recheck && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formC_recheck}</span>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Bắt buộc có mốc giờ/ngày cụ thể để kiểm tra lại cam kết khắc phục.
                  </span>
                </div>
              </div>

              {/* Cách phòng ngừa tái diễn */}
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  7. Cách phòng ngừa tái diễn <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formC.preventiveMeasures}
                  onChange={(e) => setFormC({ ...formC, preventiveMeasures: e.target.value })}
                  placeholder="Giải pháp dài hạn: chuẩn hóa quy trình, thiết lập cảnh báo sớm, phân bổ lại định mức..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#00685E]"
                />
                {validationErrors.formC_preventive && (
                  <span className="text-rose-600 text-[11px] mt-0.5 block">{validationErrors.formC_preventive}</span>
                )}
              </div>
            </div>

            {/* Ô TÙY CHỌN: CÁCH TRAO ĐỔI VỚI NHÂN VIÊN THEO 4 BƯỚC */}
            <div className="mt-4 pt-4 border-t border-slate-200 bg-teal-50/40 p-4 rounded-lg space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-[#00685E] text-white px-2 py-0.5 rounded font-mono">
                    KỸ NĂNG BỔ TRỢ (TÙY CHỌN)
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Kịch Bản Trao Đổi Với Nhân Viên Theo 4 Bước Phản Hồi Văn Minh
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  💡 Nhắc nhẹ: &quot;Trao đổi trên sự việc, không quy chụp con người&quot;.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bước 1 – Nêu thực tế (Khách quan, có số liệu):
                  </label>
                  <textarea
                    rows={2}
                    value={staffFeedback.step1_stateFacts}
                    onChange={(e) => setStaffFeedback({ ...staffFeedback, step1_stateFacts: e.target.value })}
                    placeholder="VD: Đến hạn chót hôm nay, anh thấy số liệu ghi nhận là 210/300 người bệnh..."
                    className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bước 2 – Làm rõ nguyên nhân (Lắng nghe hai chiều):
                  </label>
                  <textarea
                    rows={2}
                    value={staffFeedback.step2_clarifyCause}
                    onChange={(e) => setStaffFeedback({ ...staffFeedback, step2_clarifyCause: e.target.value })}
                    placeholder="VD: Em đang gặp khó khăn gì trong quá trình gọi điện? Có vướng mắc về dữ liệu không?..."
                    className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bước 3 – Thống nhất hành động (Giải pháp cụ thể):
                  </label>
                  <textarea
                    rows={2}
                    value={staffFeedback.step3_agreeAction}
                    onChange={(e) => setStaffFeedback({ ...staffFeedback, step3_agreeAction: e.target.value })}
                    placeholder="VD: Anh sẽ cử thêm 1 điều dưỡng hỗ trợ em ca chiều để xử lý 90 người bệnh còn lại..."
                    className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bước 4 – Chốt cam kết & Mốc kiểm tra lại:
                  </label>
                  <textarea
                    rows={2}
                    value={staffFeedback.step4_lockCommitment}
                    onChange={(e) => setStaffFeedback({ ...staffFeedback, step4_lockCommitment: e.target.value })}
                    placeholder="VD: Vậy thống nhất 16:30 chiều mai hai anh em mình đối chiếu lại số liệu nhé..."
                    className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nút nộp bài cuối trang */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3 shadow-sm">
          <p className="text-xs text-slate-600 max-w-xl mx-auto">
            Sau khi hoàn thành 3 biểu mẫu và kiểm tra kỹ số liệu, bạn hãy bấm nút <strong>&quot;Nộp bài thực hành&quot;</strong> bên dưới. Bài nộp sẽ được lưu thành phiên bản mới nhất trên hệ thống để Giảng viên đánh giá.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 text-slate-950 font-black text-sm uppercase px-8 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 font-mono"
          >
            {isSubmitting ? "Đang gửi dữ liệu lên máy chủ..." : "✓ NỘP BÀI THỰC HÀNH BUỔI 2 (3 BIỂU MẪU) →"}
          </button>
        </div>
      </div>
    </div>
  );
}
