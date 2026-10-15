"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GOAL_CASCADE_GROUPS, getStudentGroupNumber } from "@/lib/goal-cascade-groups";

interface WorkItem {
  id: string;
  taskName: string; // Tên công việc (Bắt buộc)
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
        taskName: "Đặt lịch khám tự động qua App/Web",
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
        taskName: "Tái cấu trúc luồng di chuyển Cận lâm sàng",
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
        taskName: "Hệ thống phân loại cấp cứu Triage 5 mức",
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
        taskName: "Tư vấn phác đồ và hướng dẫn dùng thuốc nội trú",
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
        taskName: "Tập huấn và kiểm tra mô hình giao tiếp AIDET",
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
        taskName: "Quy trình phản ứng nhanh xử lý khiếu nại viện phí",
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
    goal: "Đảm bảo Uptime hệ thống HIS/LIS 99.9%, trang thiết bị sẵn sàng 100%, lan tỏa thương hiệu bệnh viện",
    target: "Uptime hệ thống CNTT 99.9%, độ sẵn sàng thiết bị y tế 100%, hài lòng truyền thông số ≥ 90%",
    baseline: "Uptime 98.5%, còn tình trạng chờ xử lý sự cố mạng giờ cao điểm",
    defaultWorks: [
      {
        id: "w1",
        taskName: "Nâng cấp hạ tầng mạng dự phòng & Bảo trì thiết bị y tế",
        what: "Triển khai đường truyền dự phòng cáp quang và quy trình kiểm tra thiết bị đầu giờ",
        why: "Đảm bảo thông suốt việc khám chữa bệnh và bảo mật dữ liệu y tế",
        who: "Trưởng phòng CNTT",
        coOwners: "Phòng Quản trị Thiết bị, Phòng Marketing",
        how: "Hạ tầng mạng kép Failover, phần mềm bảo trì thiết bị y tế định kỳ",
        whenStart: "2027-01-01",
        whenEnd: "2027-05-31",
        where: "Toàn viện",
        metric: "100% sự cố mạng được cô lập và phục hồi dưới 5 phút",
      },
    ],
  },
  {
    name: GOAL_CASCADE_GROUPS[6],
    goal: "Nâng cao chất lượng chăm sóc dài hạn, tối ưu hóa quy trình tiếp đón và quản trị chi phí Viện dưỡng lão ASAHI",
    target: "Tỷ lệ gia đình người cao tuổi hài lòng ≥ 96%, tỷ lệ lấp đầy giường đạt 85%",
    baseline: "Hài lòng 88%, tỷ lệ lấp đầy giường 70%",
    defaultWorks: [
      {
        id: "w1",
        taskName: "Gói dịch vụ chăm sóc dưỡng lão chuẩn Nhật Bản & Tiếp đón thân thiện",
        what: "Chuẩn hóa quy trình chăm sóc cá thể hóa theo tiêu chuẩn Kaigo Nhật Bản cho người cao tuổi",
        why: "Tạo sự an tâm tuyệt đối cho gia đình, nâng cao thể chất và tinh thần người cao tuổi",
        who: "Giám đốc Vận hành Viện Dưỡng Lão ASAHI",
        coOwners: "Phòng Kế hoạch Vận hành, Phòng TCKT ASAHI, Đội ngũ Điều dưỡng",
        how: "Quy trình chăm sóc 24/7, hoạt động thể chất và dinh dưỡng cá nhân hóa",
        whenStart: "2027-01-15",
        whenEnd: "2027-06-30",
        where: "Khuôn viên Viện dưỡng lão ASAHI",
        metric: "100% người cao tuổi có hồ sơ theo dõi sức khỏe và dinh dưỡng hàng ngày",
      },
    ],
  },
  {
    name: GOAL_CASCADE_GROUPS[7],
    goal: "Điều hành tối ưu dòng tiền, pháp lý minh bạch, quản lý chặt tiến độ dự án đầu tư và thiết kế công trình",
    target: "100% dự án đúng tiến độ và ngân sách, tối ưu 10% chi phí vận hành, 0 rủi ro pháp lý",
    baseline: "Tiến độ một số hạng mục chậm 15 ngày, giải ngân thủ công",
    defaultWorks: [
      {
        id: "w1",
        taskName: "Hệ thống quản lý tiến độ dự án đầu tư & Kiểm soát dòng tiền tinh gọn",
        what: "Số hóa quy trình phê duyệt ngân sách và giám sát mốc tiến độ thi công dự án",
        why: "Đảm bảo hiệu quả sử dụng vốn đầu tư, tránh đội vốn và chậm bàn giao công trình",
        who: "Trưởng ban Quản lý Dự án Đầu tư",
        coOwners: "Phòng TCKT Công ty, Ban Pháp chế, Ban Trợ lý - Thư ký",
        how: "Phần mềm quản lý dự án trực quan, báo cáo dòng tiền tự động hàng tuần",
        whenStart: "2027-01-01",
        whenEnd: "2027-12-31",
        where: "Khối Văn phòng Công ty & Ban QLDA",
        metric: "100% mốc nghiệm thu công trình đạt chuẩn kỹ thuật đúng hạn",
      },
    ],
  },
];

export default function HomeworkPlanWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"wizard" | "matrix" | "tree" | "gantt" | "indicators">("wizard");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDeptIndex, setSelectedDeptIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState<string>("Đã tự động lưu nháp");
  const [activeTimer, setActiveTimer] = useState<number>(86400); // 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [teacherComment, setTeacherComment] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [submittedScore, setSubmittedScore] = useState<number>(0);
  const [allGroupPlans, setAllGroupPlans] = useState<any[]>([]);
  const isTimeOver = activeTimer <= 0;

  // Student Identity State
  const [currentStudent, setCurrentStudent] = useState<{
    studentCode: string;
    fullName: string;
    department?: string;
    title?: string;
  } | null>(null);
  const [quickInputCode, setQuickInputCode] = useState<string>("");
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [identityError, setIdentityError] = useState<string>("");

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
      greenThreshold: "Hài lòng ≥ 98% hoặc thời gian chờ ≤ 30 phút",
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
            taskName: "",
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
      taskName: "",
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

  // Validation kiểm tra tính hợp lệ của Kế hoạch (B1, B2, B3)
  const validatePlanBeforeSubmit = () => {
    if (!plan.step1_goal.trim()) {
      return "Vui lòng nhập Tuyên bố Mục tiêu ở Bước 1.";
    }
    if (plan.step2_results.length === 0 || !plan.step2_results.some((kr) => kr.indicator.trim() && kr.target.trim())) {
      return "Vui lòng nhập ít nhất 01 Kết quả mong muốn (kèm Mức mục tiêu) ở Bước 2.";
    }
    for (let i = 0; i < plan.step3_6_works.length; i++) {
      const w = plan.step3_6_works[i];
      if (!w.taskName.trim()) {
        return `Vui lòng nhập Tên công việc cho Công việc #${i + 1} ở Bước 3.`;
      }
      if (!w.what.trim()) {
        return `Vui lòng nhập hoạt động (What) cho Công việc #${i + 1}.`;
      }
    }
    return null;
  };

  // Hàm tra cứu và thiết lập danh tính học viên
  const applyStudentIdentity = async (rawCode: string) => {
    let cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) return;
    if (!cleanCode.startsWith("HV") && /^\d+$/.test(cleanCode)) {
      cleanCode = `HV${cleanCode.padStart(2, "0")}`;
    }

    setIsIdentifying(true);
    setIdentityError("");
    try {
      const res = await fetch(`/api/student/me?code=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (res.ok && data.student) {
        setCurrentStudent(data.student);
        localStorage.setItem("buddy_student_code", data.student.studentCode);

        // Tự động chuyển tab Khoa/Phòng theo nhóm của học viên
        const grp = getStudentGroupNumber(data.student.studentCode, data.student.groupNumber);
        if (grp && grp >= 1 && grp <= 8) {
          setSelectedDeptIndex(grp - 1);
        }

        // 1. Kiểm tra xem học viên đã có bài nộp BTVN trên hệ thống chưa
        let foundSubmittedPlan: any = null;
        let foundReview: any = null;
        if (data.student.course?.sessions) {
          for (const sess of data.student.course.sessions) {
            for (const assign of sess.assignments || []) {
              const isHomework = assign.type === "POST_SESSION" || assign.title?.includes("BTVN");
              if (isHomework && assign.submissions && assign.submissions.length > 0) {
                // Sắp xếp lấy bản nộp mới nhất theo version hoặc submittedAt
                const sortedSubs = [...assign.submissions].sort(
                  (a: any, b: any) =>
                    (b.version || 0) - (a.version || 0) ||
                    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                );
                const latestSub = sortedSubs[0];
                if (latestSub.reviews && latestSub.reviews.length > 0) {
                  foundReview = latestSub.reviews[latestSub.reviews.length - 1];
                }
                if (latestSub.note) {
                  try {
                    const parsed = JSON.parse(latestSub.note);
                    if (parsed && (parsed.step1_goal || parsed.step2_results || parsed.step3_6_works)) {
                      foundSubmittedPlan = parsed;
                      break;
                    }
                  } catch (e) {}
                }
              }
            }
            if (foundSubmittedPlan) break;
          }
        }

        if (foundSubmittedPlan) {
          setHasSubmitted(true);
          if (foundReview) {
            setTeacherComment(foundReview.publicComment || "");
          }
          setPlan((prev) => ({
            ...prev,
            ...foundSubmittedPlan,
            studentCode: data.student.studentCode,
            managerName: data.student.fullName || foundSubmittedPlan.managerName || prev.managerName,
            department: foundSubmittedPlan.department || data.student.department || prev.department,
          }));

          // Đồng bộ tab Khoa/Phòng theo nội dung bài đã nộp nếu có
          if (foundSubmittedPlan.department) {
            const matchedIdx = SAMPLE_DEPARTMENTS.findIndex(
              (d) => d.name === foundSubmittedPlan.department || foundSubmittedPlan.department.includes(d.name)
            );
            if (matchedIdx !== -1) {
              setSelectedDeptIndex(matchedIdx);
            }
          }

          try {
            localStorage.setItem(
              `homework_plan_draft_${data.student.studentCode}`,
              JSON.stringify(foundSubmittedPlan)
            );
          } catch (e) {}
          setAutoSaveMsg("Đã tải bài làm BTVN của học viên từ máy chủ");
        } else {
          // Chưa nộp bài trên máy chủ: Khôi phục bản nháp cục bộ nếu có
          const draftKey = `homework_plan_draft_${data.student.studentCode}`;
          let restoredDraft = false;
          try {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
              const parsed = JSON.parse(savedDraft);
              setPlan((prev) => ({
                ...prev,
                ...parsed,
                studentCode: data.student.studentCode,
                managerName: data.student.fullName || prev.managerName,
                department: data.student.department || prev.department,
              }));
              setAutoSaveMsg("Đã khôi phục bản nháp BTVN cá nhân");
              restoredDraft = true;
            }
          } catch (e) {}
          if (!restoredDraft) {
            setPlan((prev) => ({
              ...prev,
              studentCode: data.student.studentCode,
              managerName: data.student.fullName || prev.managerName,
              department: data.student.department || prev.department,
            }));
          }
        }

        setQuickInputCode("");
      } else {
        setIdentityError(data.error || "Không tìm thấy học viên với mã này.");
      }
    } catch (e) {
      setIdentityError("Không thể kết nối đến máy chủ.");
    } finally {
      setIsIdentifying(false);
    }
  };

  // Mã học viên và thông tin cá nhân đăng nhập ở Cổng học viên / Check-in
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchCode = params.get("code");
    const adminParam = params.get("admin") === "1";
    if (adminParam) {
      setIsAdminView(true);
    }
    const saved = searchCode || localStorage.getItem("buddy_student_code") || "";
    if (saved) {
      applyStudentIdentity(saved);
    } else {
      try {
        const savedDraft = localStorage.getItem("homework_plan_draft_personal");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setPlan((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    }
  }, []);

  // Tự động lưu nháp mỗi khi học viên thay đổi nội dung (Không tự lưu khi admin xem bài)
  useEffect(() => {
    if (isAdminView) return;
    const studentCode = plan.studentCode || localStorage.getItem("buddy_student_code") || "personal";
    const draftKey = `homework_plan_draft_${studentCode}`;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(plan));
        setAutoSaveMsg("Đã tự động lưu nháp");
      } catch (e) {
        console.error(e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [plan, isAdminView]);

  // Submit plan to API: Lưu vào bài nộp cá nhân của học viên
  const handleSubmitPlan = async () => {
    let finalCode = plan.studentCode;
    if (!finalCode) {
      const input = prompt("Nhập Mã học viên của bạn để ghi nhận BTVN (VD: HV01 - HV80):");
      if (!input || !input.trim()) {
        alert("Vui lòng nhập mã học viên để hệ thống ghi nhận người nộp bài.");
        return;
      }
      finalCode = input.trim().toUpperCase();
      if (!finalCode.startsWith("HV") && /^\d+$/.test(finalCode)) {
        finalCode = `HV${finalCode.padStart(2, "0")}`;
      }
      localStorage.setItem("buddy_student_code", finalCode);
      setPlan((prev) => ({ ...prev, studentCode: finalCode }));
    }
    const validationError = validatePlanBeforeSubmit();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      // Tìm bài tập BTVN Buổi 1 (hoặc buổi đầu tiên có bài tập POST_SESSION)
      const meRes = await fetch(`/api/student/me?code=${encodeURIComponent(plan.studentCode)}`);
      const meData = await meRes.json();
      let assignId = "";
      if (meData.student?.course?.sessions) {
        const s1 = meData.student.course.sessions.find((s: any) => s.sessionNumber === 1);
        const s1Post = s1?.assignments?.find((a: any) => a.type === "POST_SESSION");
        if (s1Post) {
          assignId = s1Post.id;
        } else {
          for (const sess of meData.student.course.sessions) {
            const postAssign = sess.assignments?.find((a: any) => a.type === "POST_SESSION");
            if (postAssign) {
              assignId = postAssign.id;
              break;
            }
          }
        }
      }

      if (!assignId) {
        alert("Không tìm thấy thông tin bài tập về nhà Buổi 1 trong hệ thống.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("studentCode", plan.studentCode.trim().toUpperCase());
      formData.append("assignmentId", assignId);
      formData.append("type", "ONLINE_FORM");
      formData.append("note", JSON.stringify(plan));

      const res = await fetch("/api/student/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Nộp bài thất bại");
        return;
      }
      setHasSubmitted(true);
      setSubmittedScore(100);
      setSubmitSuccess(true);
      setAutoSaveMsg("Đã nộp BTVN thành công!");
      alert("Chúc mừng bạn đã nộp BTVN Kế hoạch cá nhân 2027 thành công! Giảng viên sẽ xem và chấm điểm trên hệ thống.");
    } catch (e) {
      console.error(e);
      alert("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Admin Notice Banner */}
      {isAdminView && (
        <div className="bg-amber-400 text-slate-950 px-4 sm:px-6 py-2.5 text-xs font-bold flex items-center justify-between border-b border-amber-500 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-base">👁️</span>
            <span>
              CHẾ ĐỘ GIẢNG VIÊN XEM BÀI NỘP CỦA HỌC VIÊN: <strong className="underline">{currentStudent?.fullName || plan.managerName}</strong> ({currentStudent?.studentCode || plan.studentCode})
            </span>
          </div>
          <Link
            href="/admin/assignments"
            className="bg-slate-900 text-white px-3 py-1 rounded text-[11px] uppercase tracking-wider hover:bg-slate-800 font-bold transition shadow-sm whitespace-nowrap"
          >
            ← Về Studio Chấm Bài
          </Link>
        </div>
      )}

      {/* Top Banner */}
      <div className={`bg-[#00685E] text-white border-b border-teal-800 z-30 shadow-md ${isAdminView ? "" : "sticky top-0"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={isAdminView ? "/admin/assignments" : "/portal"}
              className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded transition border border-teal-600"
            >
              {isAdminView ? "← Về Trang Chấm Bài" : "← Về Cổng Học Viên"}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                  BÀI TẬP VỀ NHÀ • BUỔI 1
                </span>
                <h1 className="text-lg font-bold tracking-tight">
                  BTVN: LẬP KẾ HOẠCH CÔNG VIỆC CÁ NHÂN & 5W1H (2027)
                </h1>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Học viên: <strong className="text-white underline decoration-amber-400 font-bold">{plan.managerName}</strong> (Mã: {plan.studentCode || "—"}) • {plan.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Submit Action */}
            {isAdminView ? (
              <div className="bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded text-xs border border-emerald-300 flex items-center gap-1.5 shadow font-mono">
                <span>✓ Bài nộp của học viên (Chế độ xem)</span>
              </div>
            ) : (
              <button
                onClick={handleSubmitPlan}
                disabled={isSubmitting}
                className={`font-bold px-5 py-2.5 rounded text-sm transition shadow font-mono flex items-center gap-1.5 ${
                  hasSubmitted
                    ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950 border border-emerald-300"
                    : "bg-blue-500 hover:bg-blue-400 text-white"
                }`}
                title="Lưu và nộp BTVN lên hệ thống"
              >
                {isSubmitting
                  ? "Đang gửi..."
                  : hasSubmitted
                  ? "✓ Nộp lại bản cập nhật mới"
                  : "NỘP BÀI TẬP VỀ NHÀ →"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Smart Identity Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {currentStudent ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 font-semibold border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                👤 Người làm bài: <strong className="text-blue-950 font-bold">{currentStudent.fullName}</strong>
                <span className="text-blue-700">({currentStudent.studentCode})</span>
              </span>
              {currentStudent.department && (
                <span className="text-slate-600 font-medium hidden md:inline">• {currentStudent.department}</span>
              )}
              {currentStudent.title && (
                <span className="text-slate-500 hidden lg:inline">• {currentStudent.title}</span>
              )}
              <button
                type="button"
                onClick={() => {
                  setCurrentStudent(null);
                  localStorage.removeItem("buddy_student_code");
                  setPlan((prev) => ({ ...prev, studentCode: "", managerName: "" }));
                }}
                className="text-slate-400 hover:text-rose-600 underline text-[11px] ml-1"
                title="Đổi sang mã học viên khác"
              >
                (Đổi mã)
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>
                  <strong>Bạn đang vào thiết bị mới.</strong> Nhập Mã học viên (VD: <span className="font-mono font-bold text-amber-950">HV01</span> hoặc <span className="font-mono font-bold text-amber-950">01</span>) để lưu BTVN vào đúng hồ sơ của bạn:
                </span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (quickInputCode.trim()) applyStudentIdentity(quickInputCode);
                }}
                className="flex items-center gap-1.5 w-full sm:w-auto"
              >
                <input
                  type="text"
                  placeholder="Mã HV (VD: 01 hoặc HV01)"
                  value={quickInputCode}
                  onChange={(e) => setQuickInputCode(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-amber-300 rounded focus:ring-2 focus:ring-teal-500 bg-white font-mono uppercase text-slate-800 w-36"
                />
                <button
                  type="submit"
                  disabled={isIdentifying || !quickInputCode.trim()}
                  className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded text-xs transition disabled:opacity-50 whitespace-nowrap shadow-sm"
                >
                  {isIdentifying ? "Đang tìm..." : "Xác nhận"}
                </button>
              </form>
            </div>
          )}

          {identityError && (
            <div className="text-rose-600 font-medium text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {identityError}
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Department / Group Display Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Khoa/Phòng phân vai:
            </span>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00685E] text-white font-bold text-xs shadow-sm border border-teal-700">
              <span>🏛️</span>
              <span>{plan.department || GOAL_CASCADE_GROUPS[selectedDeptIndex]}</span>
              {currentStudent && (
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono uppercase ml-1">
                  Theo mã học viên
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isAdminView && (
              <>
                <button
                  onClick={handleClearToBlank}
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded transition"
                  title="Xóa trắng để tự nhập bài làm từ đầu"
                >
                  🧹 Biểu mẫu trống
                </button>
                <button
                  onClick={handleReloadSample}
                  className="text-xs font-bold text-[#00685E] hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 px-3 py-1.5 rounded transition"
                  title="Nạp lại gợi ý mẫu tham khảo"
                >
                  💡 Gợi ý mẫu
                </button>
              </>
            )}
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
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 whitespace-nowrap ${
              activeTab === "wizard"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Quy Trình 3 Bước (B1 - B2 - B3)
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 whitespace-nowrap ${
              activeTab === "matrix"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            2. Ma Trận 5W1H Tổng Hợp
          </button>
          <button
            onClick={() => setActiveTab("tree")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 whitespace-nowrap ${
              activeTab === "tree"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            3. Cây Phân Rã 4 Cấp (Cascade Tree)
          </button>
          <button
            onClick={() => setActiveTab("gantt")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 whitespace-nowrap ${
              activeTab === "gantt"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            4. Sơ Đồ Gantt
          </button>
          <button
            onClick={() => setActiveTab("indicators")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition border-b-2 whitespace-nowrap ${
              activeTab === "indicators"
                ? "border-[#00685E] text-[#00685E] bg-teal-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            5. Bảng Theo Dõi Chỉ Tiêu
          </button>
        </div>

        {/* Tab 1: 7-Step Wizard */}
        {activeTab === "wizard" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm">
            {/* Step navigation indicator - 3 Bước tinh gọn */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 border-b pb-4">
              {[
                { num: 1, name: "B1: Mục tiêu", desc: "Phải đạt gì? (Tuyên bố mục tiêu)" },
                { num: 2, name: "B2: Kết quả mong muốn", desc: "Mức mục tiêu & Deadline" },
                { num: 3, name: "B3: Kế hoạch hành động 5W1H", desc: "Tên việc, What, Who, How, When, Where" },
              ].map((s) => (
                <button
                  key={s.num}
                  onClick={() => setCurrentStep(s.num)}
                  className={`p-3 text-left rounded-lg border transition ${
                    currentStep === s.num
                      ? "border-[#00685E] bg-teal-50/60 ring-2 ring-[#00685E]/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        currentStep === s.num ? "bg-[#00685E] text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      BƯỚC {s.num}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1.5">{s.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Step 1: Goal */}
            {currentStep === 1 && (
              <div className="space-y-4 max-w-4xl">
                <div className="bg-teal-50 border-l-4 border-[#00685E] p-3 text-xs text-teal-900">
                  <strong>Nguyên tắc Bước 1:</strong> Phát biểu một câu tuyên bố mục tiêu rõ ràng, định hướng trực tiếp
                  đóng góp vào mục tiêu chung &quot;Tỷ lệ người bệnh hài lòng ≥ 98%&quot; của Bệnh viện Phương Đông.
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
                    Tiếp tục sang Bước 2 (Kết quả mong muốn) →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Key Results */}
            {currentStep === 2 && (
              <div className="space-y-4 max-w-4xl">
                <div className="bg-teal-50 border-l-4 border-[#00685E] p-3 text-xs text-teal-900">
                  <strong>Nguyên tắc Bước 2 (Kết quả mong muốn):</strong> Xác định rõ các chỉ số đo lường định lượng: Đạt bao nhiêu?
                  Mức hiện tại? Mức mục tiêu? và Deadline (Thời hạn hoàn thành theo định dạng ngày dd/mm/yyyy).
                </div>

                <div className="space-y-3">
                  {plan.step2_results.map((kr, idx) => (
                    <div key={kr.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#00685E] uppercase">Kết quả mong muốn #{idx + 1}</span>
                        {plan.step2_results.length > 1 && (
                          <button
                            onClick={() => handleRemoveKeyResult(kr.id)}
                            className="text-xs text-rose-600 hover:underline font-medium"
                          >
                            Xóa kết quả
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
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mức mục tiêu & Deadline</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Mức mục tiêu"
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
                              title="Deadline hoàn thành (dd/mm/yyyy)"
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
                  + Thêm Kết quả mong muốn
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
                    Tiếp tục sang Bước 3 (Kế hoạch hành động 5W1H) →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: 5W1H Action Plan */}
            {currentStep === 3 && (
              <div className="space-y-4 max-w-5xl">
                <div className="bg-teal-50 border-l-4 border-[#00685E] p-3 text-xs text-teal-900">
                  <strong>Nguyên tắc Bước 3 (Kế hoạch hành động 5W1H):</strong> Mỗi công việc phải có <strong>Tên công việc (Bắt buộc)</strong> và giải quyết câu hỏi <em>Làm gì (What)</em>, <em>Vì sao (Why)</em>, <em>Cách làm & Nguồn lực (How)</em>, <em>Thời gian & Địa điểm (When & Where)</em> và <strong>đặc biệt đúng 01 người chịu trách nhiệm chính (Who)</strong>.
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

                      {/* Tên công việc (Bắt buộc nhập, có validate) */}
                      <div className="bg-teal-50/40 p-3 rounded-md border border-teal-200">
                        <label className="block text-xs font-bold text-[#00685E] uppercase mb-1">
                          Tên công việc <span className="text-rose-600">*</span> (Bắt buộc nhập)
                        </label>
                        <input
                          type="text"
                          required
                          value={work.taskName || ""}
                          onChange={(e) => {
                            const updated = [...plan.step3_6_works];
                            updated[idx].taskName = e.target.value;
                            setPlan({ ...plan, step3_6_works: updated });
                          }}
                          placeholder="Ví dụ: Đặt lịch khám tự động qua App / Chuẩn hóa bảng phân loại Triage..."
                          className="w-full border border-teal-300 rounded p-2 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#00685E]"
                        />
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
                    className="border border-slate-300 px-4 py-2 rounded text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    ← Quay lại Bước 2
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("gantt")}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
                    >
                      Xem Sơ đồ Gantt →
                    </button>
                    <button
                      onClick={() => setActiveTab("indicators")}
                      className="bg-[#00685E] hover:bg-teal-900 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider shadow"
                    >
                      Bảng theo dõi chỉ tiêu →
                    </button>
                  </div>
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
              <h3 className="text-base font-bold mt-2">Mục tiêu 2027: Tỷ lệ người bệnh hài lòng chung đạt ≥ 98%</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-xs text-teal-100 border-t border-teal-700/60 pt-2">
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

        {/* Tab 4: Sơ Đồ Gantt (Tiến độ thực hiện) */}
        {activeTab === "gantt" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm space-y-6">
            <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#00685E] text-white font-bold px-2 py-0.5 rounded font-mono uppercase">
                    TIẾN ĐỘ THỰC HIỆN
                  </span>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Sơ Đồ Gantt Kế Hoạch Năm 2027: {plan.department}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Trực quan hóa thời gian triển khai 12 tháng (T1 - T12) của từng công việc theo kế hoạch 5W1H
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <span className="font-bold text-slate-600">Chú giải:</span>
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block"></span> Xong
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-sm bg-[#00685E] inline-block"></span> Đang làm
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block"></span> Chưa bắt đầu
                </span>
              </div>
            </div>

            {/* Gantt Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 uppercase font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-3 w-10 text-center border-r border-slate-200">STT</th>
                    <th className="p-3 w-64 border-r border-slate-200">Tên công việc</th>
                    <th className="p-3 w-36 border-r border-slate-200">Phụ trách</th>
                    <th className="p-3 w-28 text-center border-r border-slate-200">Trạng thái</th>
                    {/* Months 1-12 */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <th
                        key={m}
                        className="p-2 text-center w-12 font-mono font-bold border-r border-slate-200 bg-slate-200/70 text-slate-700 last:border-r-0"
                      >
                        T{m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {plan.step3_6_works.map((work, idx) => {
                    // Tính tháng bắt đầu và kết thúc
                    let startM = 1;
                    let endM = 12;
                    if (work.whenStart) {
                      const m = parseInt(work.whenStart.split("-")[1], 10);
                      if (!isNaN(m) && m >= 1 && m <= 12) startM = m;
                    }
                    if (work.whenEnd) {
                      const m = parseInt(work.whenEnd.split("-")[1], 10);
                      if (!isNaN(m) && m >= 1 && m <= 12) endM = m;
                    }
                    if (endM < startM) endM = startM;

                    // Xác định trạng thái tự động
                    const nowMonth = 4; // Mốc hiện tại
                    let statusLabel = "Đang làm";
                    let statusColor = "bg-teal-100 text-[#00685E] border-teal-300";
                    if (endM < nowMonth) {
                      statusLabel = "Xong";
                      statusColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
                    } else if (startM > nowMonth) {
                      statusLabel = "Chưa bắt đầu";
                      statusColor = "bg-slate-100 text-slate-600 border-slate-300";
                    }

                    return (
                      <tr key={work.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-center font-mono font-bold text-slate-500 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">
                          <div>{work.taskName || `Công việc #${idx + 1}`}</div>
                          <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{work.what}</div>
                        </td>
                        <td className="p-3 text-slate-700 font-medium border-r border-slate-200">
                          {work.who || "Chưa phân công"}
                        </td>
                        <td className="p-3 text-center border-r border-slate-200">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>

                        {/* Months cells */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                          const isActive = m >= startM && m <= endM;
                          return (
                            <td
                              key={m}
                              className={`p-1.5 border-r border-slate-200 text-center last:border-r-0 ${
                                isActive ? "bg-teal-50" : ""
                              }`}
                            >
                              {isActive ? (
                                <div
                                  className={`h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow-sm transition-all ${
                                    statusLabel === "Xong"
                                      ? "bg-emerald-600"
                                      : statusLabel === "Chưa bắt đầu"
                                      ? "bg-slate-400"
                                      : "bg-[#00685E]"
                                  }`}
                                  title={`${work.taskName || `Việc #${idx + 1}`}: Tháng ${startM} → Tháng ${endM}`}
                                >
                                  {m === startM ? `T${startM}` : m === endM ? `T${endM}` : "•"}
                                </div>
                              ) : (
                                <div className="h-5"></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Bảng Theo Dõi Chỉ Tiêu (KPIs & Progress Monitoring) */}
        {activeTab === "indicators" && (
          <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-6 shadow-sm space-y-6">
            <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#00685E] text-white font-bold px-2 py-0.5 rounded font-mono uppercase">
                    CHỈ TIÊU & TIẾN ĐỘ
                  </span>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Bảng Theo Dõi Chỉ Tiêu Đơn Vị: {plan.department}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dữ liệu tự động đồng bộ từ Bước 2 và Bước 3: Chỉ tiêu = Tên việc, Mục tiêu, Thực tế, Chênh lệch và Hành động
                </p>
              </div>

              {/* Status legend */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-500 text-[11px]">Trạng thái:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] border border-emerald-300">
                  ● Đạt
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[11px] border border-amber-300">
                  ● Có nguy cơ
                </span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[11px] border border-rose-300">
                  ● Chưa đạt
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 uppercase font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-3 w-10 text-center border-r border-slate-200">STT</th>
                    <th className="p-3 min-w-[200px] border-r border-slate-200">Chỉ tiêu (Tên công việc)</th>
                    <th className="p-3 w-28 text-center border-r border-slate-200">Mục tiêu</th>
                    <th className="p-3 w-28 text-center border-r border-slate-200">Thực tế</th>
                    <th className="p-3 w-28 text-center border-r border-slate-200">Chênh lệch</th>
                    <th className="p-3 w-32 text-center border-r border-slate-200">Trạng thái</th>
                    <th className="p-3 min-w-[260px]">Hành động (What)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {plan.step3_6_works.map((work, idx) => {
                    // Ghép tương ứng với chỉ số kết quả ở bước 2 nếu có
                    const kr = plan.step2_results[idx] || plan.step2_results[0] || {
                      target: "90",
                      baseline: "84",
                      unit: "%",
                    };

                    const targetNum = parseFloat(kr.target);
                    const baseNum = parseFloat(kr.baseline);
                    let diffText = "—";
                    let statusPill = (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[11px] border border-amber-300">
                        Có nguy cơ
                      </span>
                    );

                    if (!isNaN(targetNum) && !isNaN(baseNum)) {
                      const diff = baseNum - targetNum;
                      diffText = (diff > 0 ? `+${diff}` : `${diff}`) + (kr.unit ? ` ${kr.unit}` : "");
                      if (diff >= 0) {
                        statusPill = (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] border border-emerald-300">
                            Đạt
                          </span>
                        );
                      } else if (diff >= -5) {
                        statusPill = (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[11px] border border-amber-300">
                            Có nguy cơ
                          </span>
                        );
                      } else {
                        statusPill = (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[11px] border border-rose-300">
                            Chưa đạt
                          </span>
                        );
                      }
                    }

                    return (
                      <tr key={work.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-center font-mono font-bold text-slate-500 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                          <div>{work.taskName || `Công việc #${idx + 1}`}</div>
                          <div className="text-[10px] text-[#00685E] font-medium mt-0.5">Phụ trách: {work.who}</div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-[#00685E] border-r border-slate-200">
                          {kr.target ? `${kr.target} ${kr.unit}` : "—"}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-700 border-r border-slate-200">
                          {kr.baseline ? `${kr.baseline} ${kr.unit}` : "—"}
                        </td>
                        <td className="p-3 text-center font-mono font-bold border-r border-slate-200 text-slate-800">
                          {diffText}
                        </td>
                        <td className="p-3 text-center border-r border-slate-200">
                          {statusPill}
                        </td>
                        <td className="p-3 text-slate-800">
                          <p className="line-clamp-2">{work.what || "—"}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

              {/* Status Highlight Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-950">Trạng thái bài nộp:</div>
                  <div className="text-[11px] text-emerald-700">Đầy đủ 3 bước (Mục tiêu, Kết quả, 5W1H)</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-600 text-white rounded font-mono">
                    ĐÃ GHI NHẬN
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
