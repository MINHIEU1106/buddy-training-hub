"use client";

import { useState, useEffect } from "react";
import { GOAL_CASCADE_GROUPS, getStudentGroupNumber, getStudentGroupName } from "@/lib/goal-cascade-groups";

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [filterGroup, setFilterGroup] = useState<number | "ALL">("ALL");

  // Import Excel Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  // Reissue code Modal state
  const [showReissueModal, setShowReissueModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [reissueReason, setReissueReason] = useState("Học viên làm mất/quên mã");

  // Edit / Create Student Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    studentCode: "",
    fullName: "",
    title: "",
    department: "",
    managementLevel: "Khối Bệnh viện",
    email: "",
    phone: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const studentRes = await fetch("/api/admin/students/list");
      if (studentRes.ok) {
        const json = await studentRes.json();
        setStudents(json.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenEdit = (st?: any) => {
    setEditMessage(null);
    if (st) {
      setEditingStudent(st);
      setEditForm({
        id: st.id,
        studentCode: st.studentCode || "",
        fullName: st.fullName || "",
        title: st.title || "",
        department: st.department || "",
        managementLevel: st.managementLevel || "Khối Bệnh viện",
        email: st.email || "",
        phone: st.phone || "",
      });
    } else {
      setEditingStudent(null);
      const nextCode = `HV${String(students.length + 1).padStart(2, "0")}`;
      setEditForm({
        id: "",
        studentCode: nextCode,
        fullName: "",
        title: "",
        department: "",
        managementLevel: "Khối Bệnh viện",
        email: "",
        phone: "",
      });
    }
    setShowEditModal(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditMessage(null);
    try {
      const res = await fetch("/api/admin/students/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchStudents();
        setShowEditModal(false);
      } else {
        setEditMessage(data.error || "Lỗi khi lưu thông tin học viên");
      }
    } catch (err) {
      setEditMessage("Lỗi kết nối máy chủ");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setImportResult(data);
      if (res.ok) {
        await fetchStudents();
      }
    } catch (err) {
      setImportResult({ error: "Lỗi kết nối khi tải file" });
    } finally {
      setImporting(false);
    }
  };

  const handleReissueCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await fetch("/api/admin/students/reissue-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          reason: reissueReason,
          actorName: "Admin Buddy",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Đã cấp mã mới thành công: ${data.newCode}`);
        setShowReissueModal(false);
        await fetchStudents();
      } else {
        alert(data.error || "Lỗi cấp lại mã");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  // Counts
  const countBV = students.filter((s) => s.managementLevel === "Khối Bệnh viện").length;
  const countAsahi = students.filter((s) => s.managementLevel === "Viện dưỡng lão ASAHI").length;
  const countCongTy = students.filter((s) => s.managementLevel === "Khối Công ty").length;
  const countMissingEmail = students.filter((s) => !s.email || !s.email.trim()).length;

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchLevel =
      filterLevel === "ALL" ||
      (filterLevel === "MISSING_EMAIL" ? !s.email || !s.email.trim() : s.managementLevel === filterLevel);

    const grpNum = getStudentGroupNumber(s.studentCode);
    const matchGroup = filterGroup === "ALL" || grpNum === filterGroup;

    return matchSearch && matchLevel && matchGroup;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            QUẢN TRỊ DANH SÁCH & PHÂN CHIA 8 NHÓM
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            DANH SÁCH HỌC VIÊN & MÃ ĐỊNH DANH
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổng cộng: <span className="text-white font-bold font-code">{students.length}</span> học viên chia thành <span className="text-emerald-400 font-bold">8 nhóm thực hành</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenEdit()}
            className="text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors shadow"
          >
            + THÊM HỌC VIÊN
          </button>
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportResult(null);
            }}
            className="text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors shadow"
          >
            IMPORT TỪ EXCEL
          </button>
          <a
            href="/api/admin/reports/export-excel"
            className="text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors"
          >
            XUẤT DANH SÁCH MÃ
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="w-full lg:w-80">
            <input
              type="text"
              placeholder="Tìm theo tên, mã HV, khoa phòng, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap">KHỐI ĐƠN VỊ:</span>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterLevel("ALL")}
                className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterLevel === "ALL" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                TẤT CẢ ({students.length})
              </button>
              <button
                onClick={() => setFilterLevel("Khối Bệnh viện")}
                className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterLevel === "Khối Bệnh viện" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                KHỐI BỆNH VIỆN ({countBV})
              </button>
              <button
                onClick={() => setFilterLevel("Viện dưỡng lão ASAHI")}
                className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterLevel === "Viện dưỡng lão ASAHI" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                ASAHI ({countAsahi})
              </button>
              <button
                onClick={() => setFilterLevel("Khối Công ty")}
                className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterLevel === "Khối Công ty" ? "bg-emerald-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                KHỐI CÔNG TY ({countCongTy})
              </button>
              {countMissingEmail > 0 && (
                <button
                  onClick={() => setFilterLevel("MISSING_EMAIL")}
                  className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors border ${
                    filterLevel === "MISSING_EMAIL"
                      ? "bg-amber-600 text-white border-amber-400"
                      : "bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60"
                  }`}
                >
                  ⚠ CHƯA CÓ EMAIL ({countMissingEmail})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 8 Groups Filter Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase text-slate-400 whitespace-nowrap">LỌC THEO 8 NHÓM:</span>
          <button
            onClick={() => setFilterGroup("ALL")}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
              filterGroup === "ALL" ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            Tất cả 8 nhóm
          </button>
          {GOAL_CASCADE_GROUPS.map((grpLabel, idx) => {
            const gNum = idx + 1;
            return (
              <button
                key={gNum}
                onClick={() => setFilterGroup(gNum)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  filterGroup === gNum
                    ? "bg-blue-600 text-white"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {grpLabel.split(":")[0]} ({grpLabel.match(/\((\d+) người\)/)?.[1] || ""})
              </button>
            );
          })}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-code">MÃ HV</th>
                <th className="py-3.5 px-4">HỌ VÀ TÊN</th>
                <th className="py-3.5 px-4">CHỨC DANH / KHOA PHÒNG</th>
                <th className="py-3.5 px-4">NHÓM THỰC HÀNH & KHỐI</th>
                <th className="py-3.5 px-4">LIÊN HỆ (EMAIL/SĐT)</th>
                <th className="py-3.5 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-code">
                    [ ĐANG TẢI DANH SÁCH HỌC VIÊN... ]
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Không tìm thấy học viên phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const grpNum = getStudentGroupNumber(st.studentCode);
                  const grpName = getStudentGroupName(st.studentCode);
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-code font-bold text-emerald-400 text-sm whitespace-nowrap">
                        {st.studentCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {st.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{st.title || "--"}</div>
                        <div className="text-slate-400 text-[11px]">{st.department || "--"}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div>
                          {grpNum ? (
                            <span className="inline-block bg-blue-950/80 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded font-bold text-[10px]">
                              {grpName.replace(/\s*\(\d+ người\)/, "")}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Chưa phân nhóm</span>
                          )}
                        </div>
                        <div>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold text-[10px]">
                            {st.managementLevel || "Quản lý"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-code text-[11px] text-slate-400">
                        <div>
                          {st.email ? (
                            <span className="text-slate-300">{st.email}</span>
                          ) : (
                            <span className="text-amber-400 bg-amber-950/60 border border-amber-800/70 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold">
                              ⚠ Chưa có email
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5">{st.phone || "--"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="text-[11px] font-bold uppercase text-emerald-300 hover:text-white border border-emerald-800 bg-emerald-950/50 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ✏️ SỬA THÔNG TIN
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(st);
                            setShowReissueModal(true);
                          }}
                          className="text-[11px] font-bold uppercase text-amber-400 hover:text-amber-300 border border-amber-900 bg-amber-950/40 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          CẤP LẠI MÃ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  {editingStudent ? "CẬP NHẬT HỒ SƠ HỌC VIÊN" : "THÊM HỌC VIÊN MỚI"}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {editingStudent
                    ? `${editingStudent.fullName} (${editingStudent.studentCode})`
                    : "Nhập thông tin học viên bổ sung"}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Đóng
              </button>
            </div>

            {editMessage && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
                {editMessage}
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">
                    MÃ HỌC VIÊN *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.studentCode}
                    onChange={(e) => setEditForm({ ...editForm, studentCode: e.target.value.toUpperCase() })}
                    placeholder="VD: HV74"
                    className="w-full font-code font-bold bg-slate-950 border border-slate-700 text-emerald-400 p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold uppercase text-slate-300 mb-1">
                    HỌ VÀ TÊN HỌC VIÊN *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Nhập đầy đủ họ và tên..."
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">
                    CHỨC DANH
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="VD: Trưởng phòng, Tổ trưởng QLCL..."
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">
                    KHỐI ĐƠN VỊ
                  </label>
                  <select
                    value={editForm.managementLevel}
                    onChange={(e) => setEditForm({ ...editForm, managementLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Khối Bệnh viện">Khối Bệnh viện</option>
                    <option value="Viện dưỡng lão ASAHI">Viện dưỡng lão ASAHI</option>
                    <option value="Khối Công ty">Khối Công ty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">
                  KHOA / PHÒNG / BỘ PHẬN
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="VD: Khoa Xét nghiệm, Phòng KHTH - QLCL..."
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-emerald-400 mb-1">
                    ĐỊA CHỈ EMAIL (ĐỂ NHẬN THÔNG BÁO ĐIỂM)
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="example@phuongdonghospital.vn"
                    className="w-full font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">
                    SỐ ĐIỆN THOẠI
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="VD: 0912345678"
                    className="w-full font-code bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold uppercase py-2.5 rounded-lg shadow-lg"
                >
                  {savingEdit ? "ĐANG LƯU..." : "LƯU THÔNG TIN HỌC VIÊN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                NHẬP DANH SÁCH HỌC VIÊN TỪ EXCEL
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
              >
                Đóng
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">File Excel mẫu:</span>
              <a
                href="/templates/danh_sach_mau_50_hoc_vien_BVPD.xlsx"
                download
                className="font-code font-bold text-emerald-400 hover:underline whitespace-nowrap"
              >
                Tải file mẫu .xlsx
              </a>
            </div>

            <p className="text-xs text-slate-400">
              Hệ thống chấp nhận file .xlsx hoặc .csv với các cột: <br />
              <span className="font-code text-slate-300">Họ tên, Chức danh, Khoa/phòng, Cấp quản lý, Email, Số điện thoại</span>
            </p>

            {importResult && (
              <div className={`p-4 rounded-lg text-xs ${
                importResult.success
                  ? "bg-emerald-950/80 border border-emerald-800 text-emerald-200"
                  : "bg-rose-950/80 border border-rose-800 text-rose-200"
              }`}>
                {importResult.message || importResult.error}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-blue-600 file:text-white bg-slate-950 p-3 rounded-lg border border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="w-2/3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  {importing ? "ĐANG XỬ LÝ..." : "TIẾN HÀNH IMPORT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reissue Code Modal */}
      {showReissueModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                CẤP LẠI MÃ HỌC VIÊN
              </h3>
              <button
                onClick={() => setShowReissueModal(false)}
                className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
              >
                Đóng
              </button>
            </div>

            <div className="text-xs space-y-2 bg-slate-950 p-3 rounded border border-slate-800">
              <div>Học viên: <span className="font-bold text-white">{selectedStudent.fullName}</span></div>
              <div>Mã hiện tại: <span className="font-code font-bold text-rose-400">{selectedStudent.studentCode}</span> (Sẽ bị vô hiệu hóa)</div>
            </div>

            <form onSubmit={handleReissueCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  LÝ DO CẤP LẠI MÃ (AUDIT LOG)
                </label>
                <input
                  type="text"
                  value={reissueReason}
                  onChange={(e) => setReissueReason(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReissueModal(false)}
                  className="w-1/3 bg-slate-800 text-slate-300 text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase py-2.5 rounded-lg whitespace-nowrap"
                >
                  TẠO MÃ MỚI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
