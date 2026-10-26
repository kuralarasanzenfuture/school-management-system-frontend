import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Bus,
  Home,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  History,
  ArrowRight,
  Sparkles,
  Layers,
  Loader2,
  Tag,
  AlertCircle,
} from "lucide-react";
import { getFullImageUrl } from "../../../config/env.js";
import {
  fetchStudentSectionAllocationHistory,
  clearAllocationHistory,
} from "../../../redux/studentSectionAllocation/studentSectionAllocationSlice.js";

const STATUS_BADGES = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  inactive: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  completed: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  transferred: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  cancelled: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const ALLOCATION_STATUS_THEMES = {
  active: {
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
    card: "border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10",
    title: "Current Active Section",
  },
  transferred: {
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500",
    card: "border-purple-200/70 dark:border-purple-800/70 bg-purple-50/20 dark:bg-purple-950/10",
    title: "Transferred Out",
  },
  completed: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
    card: "border-blue-200/70 dark:border-blue-800/70 bg-blue-50/20 dark:bg-blue-950/10",
    title: "Term / Year Completed",
  },
  cancelled: {
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    card: "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850",
    title: "Allocation Cancelled",
  },
};

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return String(val);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdmissionStudentDetailModal({
  isOpen,
  onClose,
  admission,
  student,
}) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'history'

  const {
    history = [],
    historyLoading = false,
    historyError = null,
  } = useSelector((state) => state.studentSectionAllocations || {});

  // Fetch Section Allocation History whenever modal opens with valid admission
  useEffect(() => {
    if (isOpen && admission) {
      const admissionId = admission.id || admission.admission_id;
      const studentId = admission.student_id;
      dispatch(
        fetchStudentSectionAllocationHistory({
          admission_id: admissionId,
          student_id: studentId,
        }),
      );
    } else {
      dispatch(clearAllocationHistory());
      setActiveTab("overview");
    }
  }, [dispatch, isOpen, admission]);

  if (!isOpen || !admission) return null;

  const rawPhoto = admission.photo_url || student?.photo_url || student?.avatar || student?.image;
  const photoUrl = getFullImageUrl(rawPhoto);
  const studentName =
    admission.student_name ||
    (student
      ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
      : `Student #${admission.student_id}`);
  const initials =
    `${(admission.first_name || student?.first_name || studentName)?.[0] || ""}${(admission.last_name || student?.last_name)?.[0] || ""}`.toUpperCase() || "S";

  const statusKey = String(admission.status || "active").toLowerCase();

  // Mobile numbers resolution (checking mobile_no, parent_mobile, phone, etc.)
  const studentMobile =
    student?.mobile_no ||
    student?.mobile ||
    student?.phone ||
    student?.studentMobile ||
    admission?.mobile_no ||
    admission?.mobile ||
    admission?.phone ||
    null;

  const parentMobile =
    student?.parent_mobile ||
    student?.parentMobile ||
    student?.guardian_phone ||
    admission?.parent_mobile ||
    null;

  const alternateMobile =
    student?.alternate_mobile ||
    student?.alternateMobile ||
    student?.emergency_contact ||
    null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Student Admission & Section Dossier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admission No: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{admission.admission_number || "—"}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <User size={14} />
            <span>Profile & Admission</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "history"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <History size={14} />
            <span>Class Section History</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "history"
                  ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {history.length > 0 ? history.length : "1"}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Profile & Admission Overview */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Student Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-lg flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {studentName}
                    </h4>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                        STATUS_BADGES[statusKey] || STATUS_BADGES.inactive
                      }`}
                    >
                      {admission.status || "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {student?.student_code && (
                      <span>
                        Code: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{student.student_code}</span>
                      </span>
                    )}
                    {(studentMobile || parentMobile) && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Phone size={11} className="text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{studentMobile || parentMobile}</span>
                      </span>
                    )}
                    {student?.gender && (
                      <span>
                        Gender: <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{student.gender}</span>
                      </span>
                    )}
                    {student?.dob && (
                      <span>
                        DOB: <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(student.dob)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admission & Academic Allocation Details */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-indigo-500" />
                  Current Academic Allocation
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">Class</span>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white mt-0.5">
                      {admission.class_name || "—"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">Section</span>
                    <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {admission.section || "Unallocated"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">Academic Year</span>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white mt-0.5">
                      {admission.academic_year_name || admission.academic_year || "—"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">Joining Date</span>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatDate(admission.joining_date)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">Admission Type</span>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                      {admission.admission_type || "New"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">Roll Number</span>
                    <p className="text-[13px] font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {admission.roll_no || student?.roll_no || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Facility Status */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Bus size={14} className="text-cyan-500" />
                  Facilities Opted
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        admission.transport_required
                          ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Bus size={18} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                        School Transport
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {admission.transport_required ? "Opted In (Bus Service)" : "Not Required"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        admission.hostel_required
                          ? "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Home size={18} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                        Hostel Accommodation
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {admission.hostel_required ? "Opted In (Boarding)" : "Not Required"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Parent Details */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-500" />
                  Contact & Guardian Information
                </h5>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                  {(student?.father_name || admission?.father_name) && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Father / Guardian:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {student?.father_name || admission?.father_name}
                      </span>
                    </div>
                  )}
                  {(student?.mother_name || admission?.mother_name) && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mother:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {student?.mother_name || admission?.mother_name}
                      </span>
                    </div>
                  )}
                  {studentMobile && parentMobile && studentMobile !== parentMobile ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Student Mobile:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {studentMobile}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Parent Mobile:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {parentMobile}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Mobile Number:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {studentMobile || parentMobile || "—"}
                      </span>
                    </div>
                  )}
                  {alternateMobile && alternateMobile !== studentMobile && alternateMobile !== parentMobile && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Alternate / Emergency:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {alternateMobile}
                      </span>
                    </div>
                  )}
                  {(student?.email || admission?.email) && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {student?.email || admission?.email}
                      </span>
                    </div>
                  )}
                  {(student?.permanent_city || admission?.permanent_city || student?.current_city || admission?.current_city) && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">City / State:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {student?.permanent_city || admission?.permanent_city || student?.current_city || admission?.current_city}
                        {(student?.permanent_state || admission?.permanent_state || student?.current_state || admission?.current_state)
                          ? `, ${student?.permanent_state || admission?.permanent_state || student?.current_state || admission?.current_state}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Class Section Allocation History */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h5 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                    Section Allocation Timeline
                  </h5>
                </div>
                <span className="text-xs text-slate-500">
                  {historyLoading ? "Checking history..." : `${history.length || 1} Record(s)`}
                </span>
              </div>

              {historyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                  <span>Loading class section allocation history...</span>
                </div>
              ) : history.length === 0 ? (
                /* Fallback when no multiple allocations exist yet — display current admission allocation */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                    <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Initial Section Allocation</div>
                      <div className="text-[11.5px] mt-0.5 text-blue-700 dark:text-blue-300">
                        This student is currently assigned to their initial classroom section. When transferred or promoted to another section, the full chronological transition history will appear here.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {admission.class_name || "Assigned Class"}
                          {admission.section ? ` — Section ${admission.section}` : " (Unallocated)"}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Current Active Section
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400">Academic Year:</span>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">
                          {admission.academic_year_name || admission.academic_year || "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Roll Number:</span>
                        <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {admission.roll_no || student?.roll_no || "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Allocation Date:</span>
                        <div className="font-medium text-slate-700 dark:text-slate-200">
                          {formatDate(admission.joining_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* History Timeline List */
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {history.map((item, idx) => {
                    const status = String(item.status || "active").toLowerCase();
                    const theme = ALLOCATION_STATUS_THEMES[status] || ALLOCATION_STATUS_THEMES.active;
                    const isLatest = idx === 0;

                    return (
                      <div key={item.id || idx} className="relative">
                        {/* Timeline Node Icon */}
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs ${
                            theme.dot
                          }`}
                        />

                        {/* History Card */}
                        <div
                          className={`p-4 rounded-2xl border transition-all ${
                            theme.card
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[14px] text-slate-900 dark:text-white">
                                {item.class_name || "Class"} — Section {item.section_name || item.section || "—"}
                              </span>
                              {item.academic_year_name && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {item.academic_year_name}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {isLatest && status === "active" && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                                  Latest
                                </span>
                              )}
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                                  theme.badge
                                }`}
                              >
                                {item.status || "Active"}
                              </span>
                            </div>
                          </div>

                          {/* Allocation Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-3">
                            <div>
                              <span className="text-slate-500 text-[11px]">Roll No</span>
                              <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                {item.roll_no || "—"}
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-500 text-[11px]">Allocated On</span>
                              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                {formatDate(item.allocation_date)}
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-500 text-[11px]">Effective Until</span>
                              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                {item.effective_to ? (
                                  formatDate(item.effective_to)
                                ) : status === "active" ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Present / Current</span>
                                ) : (
                                  "—"
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-500 text-[11px]">School</span>
                              <div className="font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
                                {item.school_name || "—"}
                              </div>
                            </div>
                          </div>

                          {/* Remarks / Transfer reason */}
                          {item.remarks && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[11.5px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                              <Tag size={12} className="shrink-0 mt-0.5 text-indigo-500" />
                              <span className="italic">Remarks: {item.remarks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {activeTab === "history" ? (
              <span>Reviewing section transfers and historical allocations</span>
            ) : (
              <span>Student Academic Dossier</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
