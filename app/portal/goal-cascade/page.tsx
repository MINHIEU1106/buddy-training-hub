"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GOAL_CASCADE_GROUPS } from "@/lib/goal-cascade-groups";

interface WorkItem {
  id: string;
  what: string;
  why: string;
  who: string;
  coOwners: string;
  how: string;
  whenStart: string;
  whenEnd: string;
  where: string;
  metric: string;
}

interface KeyResult {
  id: string;
  indicator: string;
  unit: string;
  baseline: string;
  target: string;
  deadline: string;
}

interface GoalPlan {
  department: string;
  managerName: string;
  studentCode: string;
  level: string; // KHOA_PHONG, BO_PHAN, CA_NHAN
  step1_goal: string;
  step2_results: KeyResult[];
  step3_6_works: WorkItem[];
  step7_monitoring: {
    indicator: string;
    frequency: string;
    source: string;
    reviewer: string;
    greenThreshold: string;
    yellowThreshold: string;
    redThreshold: string;
    deviationAction: string;
  };
  simulationQ2: {
    actualScore: string;
    status: "RED" | "YELLOW" | "GREEN";
    rootCause: string;
    correctiveActions: string;
  };
}

const SAMPLE_DEPARTMENTS = [
  {
    name: GOAL_CASCADE_GROUPS[0],
    goal: "Rút ngắn thời gian chờ khám và trả kết quả xét nghiệm/CĐHA, tối ưu luồng đón tiếp ngoại trú",
    target: "Thời gian chờ khám ≤ 30 phút, trả kết quả CLS ≤ 45 phút, hài lòng ≥ 92%",
    baseline: "Thời gian chờ khám 45 phút, CLS 60 phút, hài lòng 84%",
    defaultWorks: [
      {
        id: "w1",
        what: "Triển khai hệ thống đặt lịch hẹn khám trước theo khung giờ (App/Web)",
        why: "Giảm dồn ứ bệnh nhân vào khung giờ cao điểm sáng 08:00 - 09:30",
        who: "Trưởng khoa Khám bệnh",
        coOwners: "Phòng CNTT, Phòng CSKH, Khoa Xét nghiệm",
        how: "Phần mềm đặt lịch tự động, bố trí 2 điều dưỡng điều phối luồng",
        whenStart: "2027-01-01",
        whenEnd: "2027-04-30",
        where: "Khu vực tiếp đón & sảnh khám ngoại trú Tầng 1",
        metric: "Tỷ lệ bệnh nhân đặt hẹn trước đạt ≥ 40%",
      },
      {
        id: "w2",
        what: "Tái cấu trúc luồng di chuyển cận lâm sàng (Xét nghiệm - Siêu âm - X-quang)",
        why: "Rút ngắn quãng đường và thời gian chờ lấy kết quả",
        who: "Phó Trưởng khoa Khám bệnh phụ trách Vận hành",
        coOwners: "Khoa Xét nghiệm, Khoa CĐHA",
        how: "Cài đặt màn hình thông báo thứ tự tự động, trả kết quả online vào hồ sơ",
        whenStart: "2027-02-15",
        whenEnd: "2027-06-30",
        where: "Tầng 2 khu Cận lâm sàng",
        metric: "Thời gian trả kết quả cận lâm sàng ≤ 45 phút",
      },
    ],
  },
  {
    name: GOAL_CASCADE_GROUPS[1],
    goal: "Tối ưu hóa thời gian tiếp nhận cấp cứu, chuyển mổ khẩn và đảm bảo an toàn người bệnh tuyệt đối",
    target: "Thời gian tiếp nhận đến chẩn đoán cấp cứu ≤ 15 phút, tỷ lệ an toàn phẫu thuật 100%",
    baseline: "Thời gian xử lý trung bình 25 phút",
    defaultWorks: [
      {
        id: "w1",
        what: "Áp dụng hệ thống phân loại bệnh nhân cấp cứu tự động theo chuẩn 5 mức (Triage)",
        why: "Ưu tiên chính xác ca nặng, giảm tử vong và tăng an toàn người bệnh",
        who: "Trưởng khoa Cấp cứu",
        coOwners: "Khoa ICU, Khoa Ngoại, Phòng CNTT",
        how: "Phần mềm Triage trên Tablet, vòng đeo tay màu cảnh báo",
        whenStart: "2027-02-01",
        whenEnd: "2027-05-31",
        where: "Khu vực Cấp cứu",
        metric: "100% ca nguy kịch (Cấp 1-2) được can thiệp dưới 3 phút",
      },
    ],
  },
  {
    name: GOAL_CASCADE_GROUPS[2],
    goal: "Nâng cao chất lượng điều trị nội trú, tư vấn chu đáo và chăm sóc chuyên sâu mẹ & bé",
    target: "Tỷ lệ người bệnh nội trú hài lòng ≥ 95%, 0 khiếu nại về tư vấn chuyên môn",
    baseline: "Hài lòng 87%, còn phản ánh thiếu thông tin hướng dẫn dùng thuốc",
    defaultWorks: [
      {
        id: "w1",
        what: "Chuẩn hóa tài liệu và quy trình tư vấn phác đồ điều trị khi nhập viện và ra viện",
        why: "Giúp người bệnh và gia đình hiểu rõ lộ trình điều trị, tăng tuân thủ y lệnh",
        who: "Trưởng khoa Sản Phụ",
        coOwners: "Khoa Nhi, Khoa Nội",
        how: "Sổ tay hướng dẫn người bệnh nội trú, mã QR tra cứu hồ sơ điều trị",
        whenStart: "2027-01-15",
        whenEnd: "2027-04-15",
        where: "Các khoa Nội trú",
        metric: "100% người bệnh ký xác nhận được tư vấn đầy đủ",
      },
    ],
  },
  {
    name: GOAL_CASCADE_GROUPS[3],
    goal: "Chuẩn hóa văn hóa giao tiếp AIDET, thái độ phục vụ và kiểm soát nhiễm khuẩn buồng bệnh",
    target: "100% điều dưỡng tuân thủ tiêu chuẩn giao tiếp AIDET, hài lòng điều dưỡng ≥ 95%",
    baseline: "Hài lòng 86%, còn 5 phản ánh thái độ/tháng",
    defaultWorks: [
      {
        id: "w1",
        what: "Tập huấn và giám sát thực hiện mô hình giao tiếp AIDET tại toàn bộ các khoa",
        why: "Xóa bỏ rào cản giao tiếp, giúp người bệnh và người nhà an tâm điều trị",
        who: "Trưởng phòng Điều dưỡng",
        coOwners: "Điều dưỡng trưởng các khoa, Khoa KSNK",
        how: "Khóa đào tạo thực hành 4 buổi, kiểm tra đóng vai tình huống định kỳ",
        whenStart: "2027-01-10",
        whenEnd: "2027-03-31",
        where: "Hội trường Hoa Sen & các khoa nội trú",
        metric: "Tỷ lệ đạt chuẩn kiểm tra đột xuất ≥ 90%",
      },
    ],
  },
  {
    name: GOAL_CASCADE_GROUPS[4],
    goal: "Nâng cấp dịch vụ đón tiếp 5 sao, tinh gọn thủ tục BHYT và giải quyết triệt để 100% khiếu nại trong 24h",
    target: "Tỷ lệ tiếp đón hài lòng 98%, giải quyết khiếu nại trong 24h đạt 100%",
    baseline: "Hài lòng 89%, xử lý khiếu nại mất 48h-72h",
    defaultWorks: [
      {
        id: "w1",
        what: "Xây dựng quy trình phản ứng nhanh giải quyết thắc mắc viện phí & thủ tục tại chỗ",
        why: "Ngăn ngừa leo thang bức xúc, xử lý ngay tại điểm chạm tiếp đón",
        who: "Trưởng phòng Chăm sóc Khách hàng",
        coOwners: "Phòng Tài chính Kế toán, Bác sĩ trực lãnh đạo",
        how: "Hotline 24/7, sổ tay hướng dẫn xử lý 20 tình huống nhạy cảm",
        whenStart: "2027-01-01",
        whenEnd: "2027-02-28",
        where: "Sảnh đón tiếp Tầng 1 và Hotline",
        metric: "100% phản ánh được tiếp nhận và xử lý bước 1 dưới 15 phút",
      },
    ],
  },
  {
    name: GOAL_CASCADE_GROUPS[5],
    goal: "Giám sát thời gian thực các chỉ số chất lượng toàn viện, tối ưu vận hành chuỗi dịch vụ ASAHI & Công ty",
    target: "0 sự cố y khoa nghiêm trọng, 100% khuyến nghị cải tiến được triển khai",
    baseline: "Giám sát thủ công cuối tháng, phát hiện chậm",
    defaultWorks: [
      {
        id: "w1",
        what: "Thiết lập Dashboard theo dõi chỉ số chất lượng & cảnh báo sớm toàn viện",
        why: "Chuyển từ báo cáo bị động sang cảnh báo và hành động sớm",
        who: "Trưởng phòng Quản lý Chất lượng",
        coOwners: "Phòng KHTH, Đại diện ASAHI, Ban Giám đốc Công ty",
        how: "Hệ thống BI kết nối dữ liệu HIS, phân quyền xem theo khoa phòng",
        whenStart: "2027-01-15",
        whenEnd: "2027-06-30",
        where: "Toàn viện & Khối Công ty",
        metric: "Cập nhật dữ liệu hàng ngày trước 08:00 sáng",
      },
    ],
  },
];

export default function GoalCascadeWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"wizard" | "matrix" | "tree" | "simulation" | "rubric">("wizard");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDeptIndex, setSelectedDeptIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState<string>("Đã tự động lưu nháp");
  const [activeTimer, setActiveTimer] = useState<number>(1500); // 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [teacherComment, setTeacherComment] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [submittedScore, setSubmittedScore] = useState<number>(0);
  const [allGroupPlans, setAllGroupPlans] = useState<any[]>([]);
  const isTimeOver = activeTimer <= 0;

  // Form State
  const [plan, setPlan] = useState<GoalPlan>({
    department: SAMPLE_DEPARTMENTS[0].name,
    managerName: "BS. CKII Nguyễn Văn An",
    studentCode: "HV01",
    level: "KHOA_PHONG",
    step1_goal: SAMPLE_DEPARTMENTS[0].goal,
    step2_results: [
      {
        id: "kr1",
        indicator: "Tỷ lệ người bệnh hài lòng chung tại khoa/phòng",
        unit: "%",
        baseline: "84",
        target: "92",
        deadline: "2027-12-31",
      },
      {
        id: "kr2",
        indicator: "Thời gian chờ khám trung bình",
        unit: "Phút",
        baseline: "45",
        target: "30",
        deadline: "2027-09-30",
      },
    ],
    step3_6_works: SAMPLE_DEPARTMENTS[0].defaultWorks,
    step7_monitoring: {
      indicator: "Điểm hài lòng người bệnh & thời gian chờ khám",
      frequency: "Hàng tuần (Đo lường) / Hàng tháng (Review Ban Giám đốc)",
      source: "Hệ thống khảo sát Tablet tại sảnh & Báo cáo thời gian thực HIS",
      reviewer: "Trưởng khoa & Phòng Quản lý Chất lượng",
      greenThreshold: "Hài lòng ≥ 90% hoặc thời gian chờ ≤ 30 phút",
      yellowThreshold: "Hài lòng 85% - 89% hoặc thời gian chờ 31 - 38 phút",
      redThreshold: "Hài lòng < 85% hoặc thời gian chờ > 38 phút",
      deviationAction: "Kích hoạt họp khẩn trong 24h, bổ sung 01 bác sĩ khám tăng cường và rà soát lại luồng phát số tự động.",
    },
    simulationQ2: {
      actualScore: "82% (Thời gian chờ 41 phút)",
      status: "RED",
      rootCause: "Số lượng bệnh nhân tăng đột biến 35% vào mùa dịch sốt xuất huyết, trong khi 02 nhân sự tiếp đón nghỉ thai sản chưa kịp bổ sung.",
      correctiveActions: "1. Điều động 02 điều dưỡng tăng cường từ khoa Phục hồi chức năng sang phân luồng; 2. Mở thêm 02 bàn khám buổi sáng (07:30 - 10:30); 3. Kích hoạt thông báo hẹn giờ tự động qua Zalo ZNS để giãn cách người bệnh.",
    },
  });

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeTimer > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Switch template
  const handleSelectDepartment = (index: number) => {
    setSelectedDeptIndex(index);
    const dept = SAMPLE_DEPARTMENTS[index];
    setPlan((prev) => ({
      ...prev,
      department: dept.name,
      step1_goal: dept.goal,
      step3_6_works: dept.defaultWorks,
    }));
    setAutoSaveMsg("Đã áp dụng mẫu " + dept.name);
  };

  // Clear to blank form for students to type from scratch
  const handleClearToBlank = () => {
    if (confirm("Bạn có chắc chắn muốn xóa dữ liệu mẫu để bắt đầu điền bài làm mới từ đầu?")) {
      setPlan((prev) => ({
        ...prev,
        step1_goal: "",
        step2_results: [
          {
            id: "kr_blank_1",
            indicator: "",
            unit: "",
            baseline: "",
            target: "",
            deadline: "",
          },
        ],
        step3_6_works: [
          {
            id: "w_blank_1",
            what: "",
            why: "",
            who: "",
            coOwners: "",
            how: "",
            whenStart: "",
            whenEnd: "",
            where: "",
            metric: "",
          },
        ],
        step7_monitoring: {
          indicator: "",
          frequency: "",
          source: "",
          reviewer: "",
          greenThreshold: "",
          yellowThreshold: "",
          redThreshold: "",
          deviationAction: "",
        },
        simulationQ2: {
          actualScore: "82% (Thời gian chờ 41 phút)",
          status: "RED",
          rootCause: "",
          correctiveActions: "",
        },
      }));
      setAutoSaveMsg("Đã chuyển sang biểu mẫu trống");
    }
  };

  // Reload reference sample
  const handleReloadSample = () => {
    handleSelectDepartment(selectedDeptIndex);
  };

  // Add new Key Result
  const handleAddKeyResult = () => {
    const newKR: KeyResult = {
      id: "kr_" + Date.now(),
      indicator: "",
      unit: "",
      baseline: "",
      target: "",
      deadline: "",
    };
    setPlan((prev) => ({
      ...prev,
      step2_results: [...prev.step2_results, newKR],
    }));
  };

  const handleRemoveKeyResult = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      step2_results: prev.step2_results.filter((k) => k.id !== id),
    }));
  };

  // Add new Work Item (5W1H)
  const handleAddWorkItem = () => {
    const newWork: WorkItem = {
      id: "w_" + Date.now(),
      what: "",
      why: "",
      who: "",
      coOwners: "",
      how: "",
      whenStart: "",
      whenEnd: "",
      where: "",
      metric: "",
    };
    setPlan((prev) => ({
      ...prev,
      step3_6_works: [...prev.step3_6_works, newWork],
    }));
  };

  const handleRemoveWorkItem = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      step3_6_works: prev.step3_6_works.filter((w) => w.id !== id),
    }));
  };

  // SMART Validation & Quality Score (0 - 100)
  const calculateQualityScore = () => {
    let score = 0;
    const checks: { label: string; passed: boolean; desc: string }[] = [];

    // Step 1: Goal stated (20đ)
    const s1Passed = plan.step1_goal.trim().length >= 15;
    score += s1Passed ? 20 : 0;
    checks.push({
      label: "Bước 1: Tuyên bố Mục tiêu rõ ràng (20đ)",
      passed: s1Passed,
      desc: s1Passed ? "Mục tiêu định hướng cụ thể, đóng góp vào mục tiêu viện" : "Mục tiêu quá ngắn hoặc chưa rõ định hướng",
    });

    // Step 2: Key results quantified (25đ)
    const s2Passed =
      plan.step2_results.length > 0 &&
      plan.step2_results.every((kr) => kr.target && kr.deadline && kr.unit);
    score += s2Passed ? 25 : 0;
    checks.push({
      label: "Bước 2: Kết quả then chốt đạt chuẩn SMART (25đ)",
      passed: s2Passed,
      desc: s2Passed ? "Đầy đủ chỉ số, đơn vị, mốc hiện tại, mức cần đạt và hạn chót" : "Thiếu chỉ số hoặc hạn chót định lượng",
    });

    // Step 3-6: 5W1H complete, strictly 1 Who per task (35đ)
    const s3Passed =
      plan.step3_6_works.length > 0 &&
      plan.step3_6_works.every(
        (w) =>
          w.what.trim().length > 5 &&
          w.why.trim().length > 5 &&
          w.who.trim().length > 3 &&
          w.how.trim().length > 5
      );
    score += s3Passed ? 35 : 0;
    checks.push({
      label: "Bước 3–6: Đầy đủ 5W1H & Đúng 1 người chịu trách nhiệm chính (35đ)",
      passed: s3Passed,
      desc: s3Passed ? "Mỗi đầu việc có đủ What, Why, How, When, Where và rõ 1 Who" : "Cần hoàn thiện đủ các cột trong bảng 5W1H",
    });

    // Step 7: Monitoring plan with green/yellow/red (20đ)
    const s7Passed =
      plan.step7_monitoring.frequency.length > 3 &&
      plan.step7_monitoring.redThreshold.length > 3 &&
      plan.step7_monitoring.deviationAction.length > 10;
    score += s7Passed ? 20 : 0;
    checks.push({
      label: "Bước 7: Kế hoạch theo dõi & Hành động ứng phó khi lệch (20đ)",
      passed: s7Passed,
      desc: s7Passed ? "Có tần suất đo, phân tầng cảnh báo Xanh/Vàng/Đỏ và phương án dự phòng" : "Chưa có hành động cụ thể khi chỉ số rơi vào ngưỡng Đỏ",
    });

    return { score, checks };
  };

  const { score, checks } = calculateQualityScore();

  // Mã học viên đăng nhập ở Cổng học viên
  useEffect(() => {
    const saved = localStorage.getItem("buddy_student_code") || "";
    setPlan((prev) => ({ ...prev, studentCode: saved }));
  }, []);

  // Tải thông tin bài nộp, bản nháp đã lưu & nhận xét của giảng viên cho nhóm đang chọn
  useEffect(() => {
    setTeacherComment("");
    // 1. Phục hồi bản nháp cục bộ (nếu có)
    try {
      const savedDraft = localStorage.getItem(`goal_cascade_draft_group_${selectedDeptIndex}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setPlan((prev) => ({
          ...prev,
          ...parsed,
          department: GOAL_CASCADE_GROUPS[selectedDeptIndex],
        }));
        setAutoSaveMsg("Đã khôi phục bản nháp đang gõ");
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Tải bài nộp chính thức của nhóm này từ máy chủ
    fetch(`/api/goal-cascade?groupIndex=${selectedDeptIndex}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) {
          setHasSubmitted(true);
          setSubmittedScore(d.plan.score || 0);
          setTeacherComment(d.plan.comment || "");
          // Nếu đã nộp và không có nháp dở thì nạp dữ liệu đã nộp
          if (!localStorage.getItem(`goal_cascade_draft_group_${selectedDeptIndex}`) && d.plan.data?.plan) {
            setPlan((prev) => ({
              ...prev,
              ...d.plan.data.plan,
              department: GOAL_CASCADE_GROUPS[selectedDeptIndex],
            }));
          }
        } else {
          setHasSubmitted(false);
          setSubmittedScore(0);
        }
      })
      .catch(() => {});

    // 3. Tải danh sách bài nộp của cả 6 nhóm để hiện thị bức tranh toàn viện ở Tab Cây phân rã
    fetch("/api/goal-cascade")
      .then((r) => r.json())
      .then((d) => {
        if (d.plans) setAllGroupPlans(d.plans);
      })
      .catch(() => {});
  }, [selectedDeptIndex]);

  // Tự động lưu nháp mỗi khi học viên thay đổi nội dung (Autosave sau 1 giây)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`goal_cascade_draft_group_${selectedDeptIndex}`, JSON.stringify(plan));
        setAutoSaveMsg("Đã tự động lưu nháp");
      } catch (e) {
        console.error(e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [plan, selectedDeptIndex]);

  // Submit plan to API (trưởng nhóm nộp 1 bản cho cả nhóm, có thể nộp đè khi còn giờ)
  const handleSubmitPlan = async () => {
    if (isTimeOver) {
      alert("Đã hết thời gian thực hành (25 phút). Hệ thống đã đóng cổng nộp bài.");
      return;
    }
    if (!plan.studentCode) {
      alert("Bạn chưa đăng nhập mã học viên. Vui lòng vào Cổng học viên để đăng nhập trước khi nộp.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goal-cascade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: plan.studentCode,
          groupIndex: selectedDeptIndex,
          plan,
          checks,
          score,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Nộp bài thất bại");
        return;
      }
      setHasSubmitted(true);
      setSubmittedScore(score);
      setSubmitSuccess(true);
      setAutoSaveMsg("Đã nộp bài thực hành thành công!");
    } catch (e) {
      console.error(e);
      alert("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Top Banner */}
      <div className="bg-[#00685E] text-white border-b border-teal-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded transition border border-teal-600"
            >
              ← Về Cổng Học Viên
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                  Thực hành Buổi 2
                </span>
                <h1 className="text-lg font-bold tracking-tight">
                  Công Cụ Phân Rã Mục Tiêu & Lập Kế Hoạch 5W1H (Goal Cascade)
                </h1>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Mục tiêu Bệnh viện Phương Đông 2027:{" "}
                <strong className="text-white underline decoration-amber-400 font-bold">
                  Tỷ lệ người bệnh hài lòng ≥ 90% (Hiện trạng 84%)
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Countdown Timer */}
            <div className="bg-teal-900/80 border border-teal-700 px-3 py-1.5 rounded text-center">
              <div className="text-[10px] text-teal-200 uppercase font-mono tracking-wider">Thời gian thực hành</div>
              <div className="text-base font-mono font-bold text-amber-300">{formatTimer(activeTimer)}</div>
            </div>

            {/* Quality Score Badge */}
            <div className="bg-white text-slate-900 px-3 py-1.5 rounded border border-teal-700 text-center shadow-sm">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Điểm chất lượng</div>
              <div
                className={`text-base font-black ${
                  score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-600" : "text-rose-600"
                }`}
              >
                {score}/100
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSubmitPlan}
              disabled={isSubmitting || isTimeOver}
              className={`font-bold px-4 py-2 rounded text-sm transition shadow font-mono flex items-center gap-1.5 ${
                isTimeOver
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600"
                  : hasSubmitted
                  ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950 border border-emerald-300"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950"
              }`}
              title={
                isTimeOver
                  ? "Đã hết thời gian làm bài (25 phút), không thể chỉnh sửa nộp lại"
                  : hasSubmitted
                  ? "Nhóm đã nộp bài. Bấm để nộp đè bản cập nhật mới nhất trước khi hết giờ"
                  : "Nộp bài thực hành của nhóm"
              }
            >
              {isSubmitting
                ? "Đang gửi..."
                : isTimeOver
                ? "Đã khóa (Hết giờ)"
                : hasSubmitted
                ? "✓ Cập nhật bài nộp"
                : "Nộp bài thực hành"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Department / Group Selector Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn Khoa/Phòng phân vai:</span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_DEPARTMENTS.map((dept, idx) => (
                <button
                  key={dept.name}
                  onClick={() => handleSelectDepartment(idx)}
                  className={`text-xs font-medium px-3 py-1.5 rounded border transition ${
                    selectedDeptIndex === idx
                      ? "bg-[#00685E] text-white border-[#00685E] font-bold shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearToBlank}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded transition"
              title="Xóa trắng để tự nhập bài làm của nhóm từ đầu"
            >
              🧹 Biểu mẫu trống
            </button>
            <button
              onClick={handleReloadSample}
              className="text-xs font-bold text-[#00685E] hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 px-3 py-1.5 rounded transition"
              title="Nạp lại gợi ý mẫu tham khảo ngành y tế"
            >
              💡 Gợi ý mẫu
            </button>
            <div className="text-emerald-700 font-medium text-xs ml-2">● {autoSaveMsg}</div>
          </div>
        </div>

        {teacherComment && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 text-xs">
            <div className="font-bold text-amber-900 uppercase mb-1">Nhận xét của Giảng viên cho nhóm</div>
            <p className="text-amber-950 whitespace-pre-line">{teacherComment}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-2 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("wizard")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 ${
              activeTab === "wizard"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Biểu Mẫu 7 Bước (Wizard)
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 ${
              activeTab === "matrix"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            2. Ma Trận 5W1H Tổng Hợp
          </button>
          <button
            onClick={() => setActiveTab("tree")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 ${
              activeTab === "tree"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            3. Cây Phân Rã 4 Cấp (Cascade Tree)
          </button>
          <button
            onClick={() => setActiveTab("rubric")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 ${
              activeTab === "rubric"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            4. Tiêu Chuẩn SMART & Bảng Điểm
          </button>
        </div>

        {/* Tab 1: 7-Step Wizard */}
        {activeTab === "wizard" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm">
            {/* Step navigation indicator */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-8 border-b pb-4">
              {[
                { num: 1, name: "Mục tiêu", desc: "Phải đạt gì?" },
                { num: 2, name: "Kết quả", desc: "Bao nhiêu? Khi nào?" },
                { num: 3, name: "Công việc", desc: "What & Why" },
                { num: 4, name: "Phụ trách", desc: "Who (1 người)" },
                { num: 5, name: "Nguồn lực", desc: "How" },
                { num: 6, name: "Tiến độ", desc: "When & Where" },
                { num: 7, name: "Theo dõi", desc: "Review & Ứng phó" },
              ].map((s) => (
                <button
                  key={s.num}
                  onClick={() => setCurrentStep(s.num)}
                  className={`p-2.5 text-left rounded border transition ${
                    currentStep === s.num
                      ? "border-[#00685E] bg-teal-50/60 ring-2 ring-[#00685E]/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                        currentStep === s.num ? "bg-[#00685E] text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      B{s.num}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{s.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Step 1: Goal */}
            {currentStep === 1 && (
              <div className="space-y-4 max-w-4xl">
                <div className="bg-teal-50 border-l-4 border-[#00685E] p-3 text-xs text-teal-900">
                  <strong>Nguyên tắc Bước 1:</strong> Phát biểu một câu tuyên bố mục tiêu rõ ràng, định hướng trực tiếp
                  đóng góp vào mục tiêu chung &quot;Tỷ lệ người bệnh hài lòng ≥ 90%&quot; của Bệnh viện Phương Đông.
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tuyên bố Mục tiêu của Đơn vị ({plan.department})
                  </label>
                  <textarea
                    rows={3}
                    value={plan.step1_goal}
                    onChange={(e) => setPlan({ ...plan, step1_goal: e.target.value })}
                    className="w-full border border-slate-300 rounded p-3 text-sm focus:ring-2 focus:ring-[#00685E] focus:outline-none"
                    placeholder="Nhập tuyên bố mục tiêu của khoa/phòng..."
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#00685E] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    Tiếp tục sang Bước 2 (Kết quả) →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Key Results */}
            {currentStep === 2 && (
              <div className="space-y-4 max-w-4xl">
                <div className="bg-teal-50 border-l-4 border-[#00685E] p-3 text-xs text-teal-900">
                  <strong>Nguyên tắc Bước 2 (SMART):</strong> Xác định rõ các chỉ số đo lường định lượng: Đạt bao nhiêu?
                  Mức hiện tại? Mức cần đạt? Thời hạn hoàn thành?
                </div>

                <div className="space-y-3">
                  {plan.step2_results.map((kr, idx) => (
                    <div key={kr.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#00685E] uppercase">Chỉ số Kết quả #{idx + 1}</span>
                        {plan.step2_results.length > 1 && (
                          <button
                            onClick={() => handleRemoveKeyResult(kr.id)}
                            className="text-xs text-rose-600 hover:underline font-medium"
                          >
                            Xóa chỉ số
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên chỉ số đo lường</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Tỷ lệ hài lòng người bệnh / Thời gian chờ"
                            value={kr.indicator}
                            onChange={(e) => {
                              const updated = [...plan.step2_results];
                              updated[idx].indicator = e.target.value;
                              setPlan({ ...plan, step2_results: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-2 text-xs bg-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Đơn vị tính</label>
                          <input
                            type="text"
                            placeholder="%, Phút..."
                            value={kr.unit}
                            onChange={(e) => {
                              const updated = [...plan.step2_results];
                              updated[idx].unit = e.target.value;
                              setPlan({ ...plan, step2_results: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-2 text-xs bg-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mức hiện tại</label>
                          <input
                            type="text"
                            placeholder="Hiện tại"
                            value={kr.baseline}
                            onChange={(e) => {
                              const updated = [...plan.step2_results];
                              updated[idx].baseline = e.target.value;
                              setPlan({ ...plan, step2_results: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-2 text-xs bg-white"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mức cần đạt</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Mức cần đạt"
                              value={kr.target}
                              onChange={(e) => {
                                const updated = [...plan.step2_results];
                                updated[idx].target = e.target.value;
                                setPlan({ ...plan, step2_results: updated });
                              }}
                              className="w-1/2 border border-slate-300 rounded p-2 text-xs bg-white font-bold text-[#00685E]"
                            />
                            <input
                              type="date"
                              value={kr.deadline}
                              onChange={(e) => {
                                const updated = [...plan.step2_results];
                                updated[idx].deadline = e.target.value;
                                setPlan({ ...plan, step2_results: updated });
                              }}
                              className="w-1/2 border border-slate-300 rounded p-2 text-xs bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddKeyResult}
                  className="text-xs font-bold text-[#00685E] border border-dashed border-[#00685E] hover:bg-teal-50 px-3 py-2 rounded w-full transition"
                >
                  + Thêm Chỉ số Kết quả then chốt
                </button>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="border border-slate-300 px-4 py-2 rounded text-xs font-bold text-slate-700"
                  >
                    ← Quay lại Bước 1
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-[#00685E] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    Tiếp tục sang Bước 3–6 (5W1H) →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3-6: 5W1H Breakdown */}
            {currentStep >= 3 && currentStep <= 6 && (
              <div className="space-y-4 max-w-5xl">
                <div className="bg-teal-50 border-l-4 border-[#00685E] p-3 text-xs text-teal-900">
                  <strong>Nguyên tắc Bước 3–6 (Khung 5W1H):</strong> Mỗi công việc phải giải quyết câu hỏi <em>Làm gì (What)</em>, <em>Vì sao (Why)</em>, <em>Cách làm & Nguồn lực (How)</em>, <em>Thời gian & Địa điểm (When & Where)</em> và <strong>đặc biệt đúng 01 người chịu trách nhiệm chính (Who)</strong>.
                </div>

                <div className="space-y-4">
                  {plan.step3_6_works.map((work, idx) => (
                    <div key={work.id} className="p-4 border border-slate-300 rounded-lg bg-white shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                          Công việc #{idx + 1}
                        </span>
                        {plan.step3_6_works.length > 1 && (
                          <button
                            onClick={() => handleRemoveWorkItem(work.id)}
                            className="text-xs text-rose-600 hover:underline"
                          >
                            Xóa công việc
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* What */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            1. WHAT - Cần làm những gì?
                          </label>
                          <textarea
                            rows={2}
                            value={work.what}
                            onChange={(e) => {
                              const updated = [...plan.step3_6_works];
                              updated[idx].what = e.target.value;
                              setPlan({ ...plan, step3_6_works: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#00685E]"
                            placeholder="Mô tả công việc cần làm..."
                          />
                        </div>

                        {/* Why */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            2. WHY - Vì sao làm? (Gắn với kết quả nào)
                          </label>
                          <textarea
                            rows={2}
                            value={work.why}
                            onChange={(e) => {
                              const updated = [...plan.step3_6_works];
                              updated[idx].why = e.target.value;
                              setPlan({ ...plan, step3_6_works: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#00685E]"
                            placeholder="Lý do và tác động tới sự hài lòng của người bệnh..."
                          />
                        </div>

                        {/* Who */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            3. WHO - Người chịu trách nhiệm chính (Duy nhất 1 người)
                          </label>
                          <input
                            type="text"
                            value={work.who}
                            onChange={(e) => {
                              const updated = [...plan.step3_6_works];
                              updated[idx].who = e.target.value;
                              setPlan({ ...plan, step3_6_works: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-2 text-xs font-bold text-[#00685E]"
                            placeholder="Ví dụ: Trưởng khoa Khám bệnh / Điều dưỡng trưởng"
                          />
                          <div className="mt-1.5">
                            <label className="block text-[10px] text-slate-500">Đơn vị / Nhân sự phối hợp (Tùy chọn)</label>
                            <input
                              type="text"
                              value={work.coOwners}
                              onChange={(e) => {
                                const updated = [...plan.step3_6_works];
                                updated[idx].coOwners = e.target.value;
                                setPlan({ ...plan, step3_6_works: updated });
                              }}
                              className="w-full border border-slate-200 rounded p-1.5 text-xs text-slate-600"
                              placeholder="Ví dụ: Phòng CNTT, Phòng CSKH"
                            />
                          </div>
                        </div>

                        {/* How */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            4. HOW - Cách làm & Nguồn lực (Nhân lực, Thiết bị, Chi phí)
                          </label>
                          <textarea
                            rows={3}
                            value={work.how}
                            onChange={(e) => {
                              const updated = [...plan.step3_6_works];
                              updated[idx].how = e.target.value;
                              setPlan({ ...plan, step3_6_works: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#00685E]"
                            placeholder="Công cụ, giải pháp, phần mềm, ngân sách ước tính..."
                          />
                        </div>

                        {/* When */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            5. WHEN - Thời gian bắt đầu & Hoàn thành
                          </label>
                          <div className="flex gap-2">
                            <div className="w-1/2">
                              <span className="text-[10px] text-slate-500 block">Từ ngày</span>
                              <input
                                type="date"
                                value={work.whenStart}
                                onChange={(e) => {
                                  const updated = [...plan.step3_6_works];
                                  updated[idx].whenStart = e.target.value;
                                  setPlan({ ...plan, step3_6_works: updated });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5 text-xs"
                              />
                            </div>
                            <div className="w-1/2">
                              <span className="text-[10px] text-slate-500 block">Đến ngày</span>
                              <input
                                type="date"
                                value={work.whenEnd}
                                onChange={(e) => {
                                  const updated = [...plan.step3_6_works];
                                  updated[idx].whenEnd = e.target.value;
                                  setPlan({ ...plan, step3_6_works: updated });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Where & Metric */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            6. WHERE & TIÊU CHÍ NGHIỆM THU
                          </label>
                          <input
                            type="text"
                            placeholder="Địa điểm / Khu vực triển khai (Where)"
                            value={work.where}
                            onChange={(e) => {
                              const updated = [...plan.step3_6_works];
                              updated[idx].where = e.target.value;
                              setPlan({ ...plan, step3_6_works: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs mb-1.5"
                          />
                          <input
                            type="text"
                            placeholder="Chỉ số nghiệm thu hoàn thành công việc"
                            value={work.metric}
                            onChange={(e) => {
                              const updated = [...plan.step3_6_works];
                              updated[idx].metric = e.target.value;
                              setPlan({ ...plan, step3_6_works: updated });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddWorkItem}
                  className="text-xs font-bold text-[#00685E] border border-dashed border-[#00685E] hover:bg-teal-50 px-3 py-2 rounded w-full transition"
                >
                  + Thêm Công việc mới theo 5W1H
                </button>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="border border-slate-300 px-4 py-2 rounded text-xs font-bold text-slate-700"
                  >
                    ← Quay lại Bước 2
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="bg-[#00685E] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    Tiếp tục sang Bước 7 (Theo dõi & Review) →
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Monitoring & Deviation Response */}
            {currentStep === 7 && (
              <div className="space-y-4 max-w-4xl">
                <div className="bg-teal-50 border-l-4 border-[#00685E] p-3 text-xs text-teal-900">
                  <strong>Nguyên tắc Bước 7 (Theo dõi & Đánh giá):</strong> Đo lường định kỳ với ngưỡng cảnh báo
                  giao thông (Xanh / Vàng / Đỏ) và chuẩn bị sẵn phương án ứng phó khẩn cấp khi chỉ số bị tụt dốc.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chỉ số theo dõi</label>
                    <input
                      type="text"
                      value={plan.step7_monitoring.indicator}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          step7_monitoring: { ...plan.step7_monitoring, indicator: e.target.value },
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tần suất đo & Review</label>
                    <input
                      type="text"
                      value={plan.step7_monitoring.frequency}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          step7_monitoring: { ...plan.step7_monitoring, frequency: e.target.value },
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nguồn dữ liệu đối soát</label>
                    <input
                      type="text"
                      value={plan.step7_monitoring.source}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          step7_monitoring: { ...plan.step7_monitoring, source: e.target.value },
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Người chủ trì Review</label>
                    <input
                      type="text"
                      value={plan.step7_monitoring.reviewer}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          step7_monitoring: { ...plan.step7_monitoring, reviewer: e.target.value },
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                </div>

                {/* Thresholds */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Phân tầng ngưỡng cảnh báo (Traffic Lights)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded">
                      <span className="text-[11px] font-bold text-emerald-800 block mb-1">● Ngưỡng XANH (Đạt mục tiêu)</span>
                      <input
                        type="text"
                        value={plan.step7_monitoring.greenThreshold}
                        onChange={(e) =>
                          setPlan({
                            ...plan,
                            step7_monitoring: { ...plan.step7_monitoring, greenThreshold: e.target.value },
                          })
                        }
                        className="w-full border border-emerald-200 rounded p-1.5 text-xs bg-white"
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-300 p-2.5 rounded">
                      <span className="text-[11px] font-bold text-amber-800 block mb-1">● Ngưỡng VÀNG (Cần lưu ý)</span>
                      <input
                        type="text"
                        value={plan.step7_monitoring.yellowThreshold}
                        onChange={(e) =>
                          setPlan({
                            ...plan,
                            step7_monitoring: { ...plan.step7_monitoring, yellowThreshold: e.target.value },
                          })
                        }
                        className="w-full border border-amber-200 rounded p-1.5 text-xs bg-white"
                      />
                    </div>

                    <div className="bg-rose-50 border border-rose-300 p-2.5 rounded">
                      <span className="text-[11px] font-bold text-rose-800 block mb-1">● Ngưỡng ĐỎ (Báo động)</span>
                      <input
                        type="text"
                        value={plan.step7_monitoring.redThreshold}
                        onChange={(e) =>
                          setPlan({
                            ...plan,
                            step7_monitoring: { ...plan.step7_monitoring, redThreshold: e.target.value },
                          })
                        }
                        className="w-full border border-rose-200 rounded p-1.5 text-xs bg-white font-bold text-rose-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Hành động khắc phục bắt buộc khi rơi vào Ngưỡng Đỏ:
                    </label>
                    <textarea
                      rows={3}
                      value={plan.step7_monitoring.deviationAction}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          step7_monitoring: { ...plan.step7_monitoring, deviationAction: e.target.value },
                        })
                      }
                      className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#00685E]"
                      placeholder="Quy trình kích hoạt họp khẩn, bổ sung nhân lực, điều chỉnh giải pháp..."
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="border border-slate-300 px-4 py-2 rounded text-xs font-bold text-slate-700"
                  >
                    ← Quay lại Bước 3–6
                  </button>
                  <button
                    onClick={() => setActiveTab("simulation")}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider shadow"
                  >
                    Thực hành Xử lý Kịch bản Quý 2 →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 5W1H Matrix Grid */}
        {activeTab === "matrix" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  Bảng Ma Trận 5W1H Tổng Hợp: {plan.department}
                </h2>
                <p className="text-xs text-slate-500">
                  Mục tiêu đơn vị: <strong>{plan.step1_goal}</strong>
                </p>
              </div>
              <button
                onClick={handleAddWorkItem}
                className="bg-[#00685E] text-white px-3 py-1.5 rounded text-xs font-bold tracking-wide"
              >
                + Thêm dòng công việc
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                    <th className="p-3 w-10 text-center">STT</th>
                    <th className="p-3 w-64">What (Làm gì)</th>
                    <th className="p-3 w-56">Why (Vì sao)</th>
                    <th className="p-3 w-44">Who (Phụ trách chính)</th>
                    <th className="p-3 w-60">How (Cách làm & Nguồn lực)</th>
                    <th className="p-3 w-40">When (Thời gian)</th>
                    <th className="p-3 w-44">Where (Địa điểm)</th>
                    <th className="p-3 w-16 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal">
                  {plan.step3_6_works.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <textarea
                          rows={2}
                          value={item.what}
                          onChange={(e) => {
                            const updated = [...plan.step3_6_works];
                            updated[idx].what = e.target.value;
                            setPlan({ ...plan, step3_6_works: updated });
                          }}
                          className="w-full border border-slate-200 rounded p-1.5 text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={2}
                          value={item.why}
                          onChange={(e) => {
                            const updated = [...plan.step3_6_works];
                            updated[idx].why = e.target.value;
                            setPlan({ ...plan, step3_6_works: updated });
                          }}
                          className="w-full border border-slate-200 rounded p-1.5 text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.who}
                          onChange={(e) => {
                            const updated = [...plan.step3_6_works];
                            updated[idx].who = e.target.value;
                            setPlan({ ...plan, step3_6_works: updated });
                          }}
                          className="w-full border border-slate-200 rounded p-1.5 text-xs font-bold text-[#00685E]"
                        />
                        <span className="text-[10px] text-slate-400 block mt-1">Phối hợp: {item.coOwners || "Không"}</span>
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={2}
                          value={item.how}
                          onChange={(e) => {
                            const updated = [...plan.step3_6_works];
                            updated[idx].how = e.target.value;
                            setPlan({ ...plan, step3_6_works: updated });
                          }}
                          className="w-full border border-slate-200 rounded p-1.5 text-xs"
                        />
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        <div>Từ: {item.whenStart}</div>
                        <div>Đến: {item.whenEnd}</div>
                      </td>
                      <td className="p-3 text-slate-700">{item.where}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRemoveWorkItem(item.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                          title="Xóa"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Goal Cascade Tree View */}
        {activeTab === "tree" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm space-y-6">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  Cây Phân Rã Mục Tiêu 4 Cấp (Goal Cascade Tree)
                </h2>
                <p className="text-xs text-slate-500">
                  Từ Mục tiêu Bệnh viện $\rightarrow$ Khoa/Phòng $\rightarrow$ Bộ phận $\rightarrow$ Cá nhân
                </p>
              </div>
            </div>

            {/* Level 1: Root Node (Hospital Level) */}
            <div className="p-4 bg-gradient-to-r from-teal-900 to-[#00685E] text-white rounded-lg shadow border border-teal-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
                  CẤP 1: BỆNH VIỆN ĐA KHOA PHƯƠNG ĐÔNG (ROOT)
                </span>
                <span className="text-xs font-mono font-bold text-teal-200">Trọng số: 100%</span>
              </div>
              <h3 className="text-base font-bold mt-2">Mục tiêu 2027: Tỷ lệ người bệnh hài lòng chung đạt ≥ 90%</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs text-teal-100 border-t border-teal-700/60 pt-2">
                <div>Mức hiện tại: <strong>84%</strong></div>
                <div>Hạn chót: <strong>31/12/2027</strong></div>
                <div>Chủ trì: <strong>Ban Giám đốc BV</strong></div>
                <div>Độ phủ mục tiêu: <strong className="text-amber-300">6 Khối / Khoa phòng</strong></div>
              </div>
            </div>

            {/* Connector Line */}
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-slate-300"></div>
            </div>

            {/* Level 2: Department Level (All 6 Groups with live data if available) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GOAL_CASCADE_GROUPS.map((grpName, idx) => {
                const sample = SAMPLE_DEPARTMENTS[idx] || SAMPLE_DEPARTMENTS[0];
                const submittedPlan = allGroupPlans.find(
                  (p: any) => p.groupIndex === idx || p.department === grpName
                );
                const isCurrentGroup = grpName === plan.department;
                const displayGoal = isCurrentGroup
                  ? plan.step1_goal || sample.goal
                  : (submittedPlan?.data?.plan?.step1_goal || sample.goal);
                const displayTarget = isCurrentGroup
                  ? (plan.step2_results?.[0]?.target ? `${plan.step2_results[0].target} ${plan.step2_results[0].unit}` : sample.target)
                  : (submittedPlan?.data?.plan?.step2_results?.[0]?.target
                      ? `${submittedPlan.data.plan.step2_results[0].target} ${submittedPlan.data.plan.step2_results[0].unit}`
                      : sample.target);

                return (
                  <div
                    key={grpName}
                    className={`p-4 rounded-lg border transition ${
                      isCurrentGroup
                        ? "border-2 border-[#00685E] bg-teal-50/50 shadow-sm ring-1 ring-teal-200"
                        : submittedPlan
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                        CẤP 2: {grpName.split(":")[0]}
                      </span>
                      {isCurrentGroup ? (
                        <span className="text-[10px] font-bold text-[#00685E] bg-teal-100 px-1.5 py-0.5 rounded">
                          ● Nhóm của bạn
                        </span>
                      ) : submittedPlan ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          ✓ Đã nộp bài
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Đang làm bài...
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{grpName}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{displayGoal}</p>
                    <div className="mt-3 pt-2 border-t text-[10px] text-slate-500 font-mono flex items-center justify-between">
                      <span>Chỉ tiêu: <strong className="text-slate-800">{displayTarget}</strong></span>
                      {submittedPlan?.score !== undefined && (
                        <span className="font-bold text-emerald-700">{submittedPlan.score}/100đ</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connector Line */}
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-slate-300"></div>
            </div>

            {/* Level 3 & 4: Work Items / Individuals */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                CẤP 3 & 4: CÔNG VIỆC BỘ PHẬN & CÁ NHÂN PHỤ TRÁCH ({plan.department})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.step3_6_works.map((w, idx) => (
                  <div key={w.id} className="p-3 bg-white border border-slate-200 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                        Việc #{idx + 1} (5W1H)
                      </span>
                      <span className="text-[11px] font-bold text-[#00685E]">{w.who}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5">{w.what}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Lý do (Why): {w.why}</div>
                    <div className="text-[10px] text-slate-600 mt-1 font-mono">
                      Thời hạn: {w.whenStart} → {w.whenEnd} | Nơi: {w.where}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Mid-Year Simulation (Q2 Scenario) */}
        {activeTab === "simulation" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm space-y-6">
            <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded font-mono uppercase">
                  Kịch bản Mô phỏng Thực hành Quý 2
                </span>
                <span className="text-xs font-bold text-rose-800 animate-pulse">● CẢNH BÁO LỆCH CHỈ SỐ</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">
                Kết quả đo lường Quý 2: Điểm hài lòng tại {plan.department} chỉ đạt{" "}
                <span className="text-rose-700 underline font-black">82%</span> (Mục tiêu ≥ 90%), Thời gian chờ trung
                bình tăng lên <span className="text-rose-700 underline font-black">41 phút</span>.
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Yêu cầu: Học viên phân tích nguyên nhân gốc rễ và lập ngay kế hoạch điều chỉnh khẩn cấp 5W1H để cứu vãn
                chỉ tiêu cuối năm.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Root Cause Analysis */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase">
                  1. Phân tích Nguyên nhân Gốc rễ (Root Cause Analysis)
                </label>
                <textarea
                  rows={4}
                  value={plan.simulationQ2.rootCause}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      simulationQ2: { ...plan.simulationQ2, rootCause: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded p-3 text-xs focus:ring-1 focus:ring-rose-500"
                  placeholder="Chỉ ra các nguyên nhân khách quan và chủ quan dẫn tới chỉ số rơi vào ngưỡng đỏ..."
                />
              </div>

              {/* Corrective Action 5W1H */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase">
                  2. Kế hoạch Hành động Điều chỉnh Khẩn cấp (Corrective 5W1H)
                </label>
                <textarea
                  rows={4}
                  value={plan.simulationQ2.correctiveActions}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      simulationQ2: { ...plan.simulationQ2, correctiveActions: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded p-3 text-xs focus:ring-1 focus:ring-rose-500"
                  placeholder="Nêu các giải pháp hành động cụ thể, người chịu trách nhiệm và mốc thời gian hoàn thành..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitPlan}
                disabled={isSubmitting}
                className="bg-[#00685E] hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded text-xs uppercase tracking-wider shadow"
              >
                {isSubmitting ? "Đang lưu..." : "Xác nhận & Nộp Kế hoạch Điều Chỉnh"}
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Rubric & Auto Quality Score */}
        {activeTab === "rubric" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm space-y-6">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  Bảng Đánh Giá Chất Lượng Kế Hoạch 5W1H (Tự động & Rubric)
                </h2>
                <p className="text-xs text-slate-500">
                  Hệ thống kiểm tra tự động theo các tiêu chuẩn quản trị y tế chuyên nghiệp
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Tổng điểm:</span>
                <span
                  className={`text-2xl font-black font-mono ${
                    score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-600" : "text-rose-600"
                  }`}
                >
                  {score}/100
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {checks.map((c, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                    c.passed ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                          c.passed ? "bg-emerald-700 text-white" : "bg-rose-700 text-white"
                        }`}
                      >
                        {c.passed ? "ĐẠT" : "CHƯA ĐẠT"}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{c.label}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Central Success Modal */}
        {submitSuccess && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-200 text-center space-y-5 relative">
              {/* Close icon */}
              <button
                onClick={() => setSubmitSuccess(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-full hover:bg-slate-100 transition"
                title="Đóng popup"
              >
                ✕
              </button>

              {/* Success Badge */}
              <div className="w-16 h-16 bg-emerald-100 text-[#00685E] rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner font-bold">
                ✓
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full font-mono border border-teal-200">
                  Ghi Nhận Thành Công
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  ĐÃ NỘP BÀI THỰC HÀNH BUỔI 2
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Kế hoạch phân rã 5W1H của <strong className="text-slate-900">{plan.department}</strong> đã được đồng bộ lên Bảng tổng hợp của Giảng viên.
                </p>
              </div>

              {/* Score Highlight Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-700">Điểm chất lượng đạt chuẩn:</div>
                  <div className="text-[11px] text-slate-500">Đánh giá theo 4 tiêu chí SMART & 5W1H</div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-2xl font-black font-mono ${
                      submittedScore >= 80 ? "text-emerald-700" : submittedScore >= 60 ? "text-amber-600" : "text-rose-600"
                    }`}
                  >
                    {submittedScore}/100
                  </span>
                </div>
              </div>

              {/* Notice about edit permissions */}
              <div className="text-[11px] text-slate-500 bg-teal-50/50 p-3 rounded-lg border border-teal-100 text-left">
                💡 <strong>Lưu ý:</strong> Nhóm vẫn có thể chỉnh sửa và bấm <strong>&quot;✓ Cập nhật bài nộp&quot;</strong> để nộp đè bản mới nhất khi thời gian 25 phút trên lớp vẫn còn.
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-300"
                >
                  ← Xem lại bài làm
                </button>
                <Link
                  href="/portal"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#00685E] hover:bg-teal-700 text-white text-xs font-bold transition shadow text-center flex items-center justify-center"
                >
                  Về Cổng học viên →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
