import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Download,
  Plus,
  ChevronDown,
  ArrowUpDown,
  FileText,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import AddStudentModal from "../components/AddStudentModal";
import { useDispatch, useSelector } from "react-redux";
import { getStudents } from "../../../redux/student/studentSlice";
import { avatarColors, colors } from "../../../common/utils/colors";

const STUDENTS = [
  {
    id: 1,
    name: "Aryan Kapoor",
    email: "aryan.k@school.in",
    initials: "AK",
    color: "bg-rose-500",
    roll: "1042",
    cls: "X-A",
    gender: "Male",
    attendance: 94,
    grade: "A+",
    gradeColor: "bg-emerald-50 text-emerald-600",
    fee: "Paid",
    feeColor: "bg-emerald-50 text-emerald-600",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 2,
    name: "Sneha Mehta",
    email: "sneha.m@school.in",
    initials: "SM",
    color: "bg-emerald-500",
    roll: "0987",
    cls: "IX-B",
    gender: "Female",
    attendance: 88,
    grade: "B+",
    gradeColor: "bg-blue-50 text-blue-600",
    fee: "Paid",
    feeColor: "bg-emerald-50 text-emerald-600",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 3,
    name: "Rohan Nair",
    email: "rohan.n@school.in",
    initials: "RN",
    color: "bg-blue-500",
    roll: "1158",
    cls: "XI-C",
    gender: "Male",
    attendance: 76,
    grade: "C",
    gradeColor: "bg-amber-50 text-amber-600",
    fee: "Pending",
    feeColor: "bg-amber-50 text-amber-600",
    status: "Warning",
    statusColor: "bg-amber-50 text-amber-600",
  },
  {
    id: 4,
    name: "Pooja Joshi",
    email: "pooja.j@school.in",
    initials: "PJ",
    color: "bg-orange-500",
    roll: "0834",
    cls: "VIII-A",
    gender: "Female",
    attendance: 97,
    grade: "A+",
    gradeColor: "bg-emerald-50 text-emerald-600",
    fee: "Paid",
    feeColor: "bg-emerald-50 text-emerald-600",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 5,
    name: "Karan Singh",
    email: "karan.s@school.in",
    initials: "KS",
    color: "bg-lime-500",
    roll: "1267",
    cls: "XII-A",
    gender: "Male",
    attendance: 64,
    grade: "D",
    gradeColor: "bg-rose-50 text-rose-600",
    fee: "Overdue",
    feeColor: "bg-rose-50 text-rose-600",
    status: "At Risk",
    statusColor: "bg-rose-50 text-rose-600",
  },
  {
    id: 6,
    name: "Divya Rao",
    email: "divya.r@school.in",
    initials: "DR",
    color: "bg-violet-500",
    roll: "0712",
    cls: "X-B",
    gender: "Female",
    attendance: 91,
    grade: "A",
    gradeColor: "bg-emerald-50 text-emerald-600",
    fee: "Paid",
    feeColor: "bg-emerald-50 text-emerald-600",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-600",
  },
];

const CLASS_TABS = [
  "All Classes",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
  "Class XII",
];
const PAGE_SIZE = 20;

function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <div className="flex items-center gap-3.5 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-[12.5px] text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function AttendanceBar({ value }) {
  const color =
    value >= 90
      ? "bg-emerald-500"
      : value >= 80
        ? "bg-amber-500"
        : "bg-rose-500";
  return (
    <div className="flex items-center gap-2 w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[12.5px] font-semibold text-slate-600 w-8 shrink-0">
        {value}%
      </span>
    </div>
  );
}

export default function StudentAdmissionPage() {
  const dispatch = useDispatch();

  const { students, loading, error } = useSelector((state) => state.students);
  console.log(students);
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState("All Classes");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    dispatch(getStudents());
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (!students) return [];

    if (activeTab === "All Classes") return students;

    const cls = activeTab.replace("Class ", "");

    return students.filter(
      (student) =>
        student.student_class === cls ||
        student.class === cls ||
        student.studentClass === cls,
    );
  }, [students, activeTab]);

  if (loading) {
    return <h3>Loading...</h3>;
  }

  if (error) {
    return <h3>{error}</h3>;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleAll = (e) =>
    setSelected(e.target.checked ? pageRows.map((s) => s.id) : []);
  const toggleOne = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const getAvatarColor = (value) => {
    let hash = 0;

    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-[13.5px] text-slate-400 mt-1">
            Manage all enrolled students, track performance and attendance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[13.5px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[13.5px] font-semibold hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-sm"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-500"
          value="1,284"
          label="Total enrolled"
        />
        <StatCard
          icon={UserCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          value="1,179"
          label="Present today"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          value="48"
          label="At risk"
        />
        <StatCard
          icon={UserX}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          value="57"
          label="Absent today"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white rounded-2xl border border-slate-100 px-4 py-3 mb-6 shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CLASS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-slate-150 bg-slate-200 mx-1" />
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
          All Status <ChevronDown size={14} />
        </button>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
          All Grades <ChevronDown size={14} />
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[12.5px] text-slate-400">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
            <button className="p-2 bg-indigo-50 text-indigo-600">
              <List size={15} />
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-50">
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-bold text-slate-800">
            Student directory
          </h2>
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
            <FileText size={14} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 text-[11.5px] uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-indigo-600"
                    onChange={toggleAll}
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((s) => selected.includes(s.id))
                    }
                  />
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Student <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    phone <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Roll No <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Class <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">Gender</th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Attendance <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Grade <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">Fee Status</th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Status <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold text-right pr-5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => {
                const initials = `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`;
                const avatarColor = getAvatarColor(
                  `${s.id}-${s.first_name}-${s.last_name}`,
                );
                return (
                  <tr
                    key={s.id}
                    className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-indigo-600"
                        checked={selected.includes(s.id)}
                        onChange={() => toggleOne(s.id)}
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* <div
                        className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-[12px] font-bold shrink-0 ${randomColor}`}
                      >
                        {s.photo_url ? (
                          <img
                            src={s.photo_url}
                            alt={`${s.first_name} ${s.last_name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.innerHTML = `
              ${(s.first_name?.[0] || "").toUpperCase()}${(s.last_name?.[0] || "").toUpperCase()}
            `;
                            }}
                          />
                        ) : (
                          <>
                            {(s.first_name?.[0] || "").toUpperCase()}
                            {(s.last_name?.[0] || "").toUpperCase()}
                          </>
                        )}
                      </div> */}
                        <div
                          className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-[12px] font-bold shrink-0 ${avatarColor}`}
                        >
                          {s.photo_url ? (
                            <img
                              src={s.photo_url}
                              alt={s.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials.toUpperCase()
                          )}
                        </div>

                        <div>
                          <p className="text-[13.5px] font-semibold text-slate-800">
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-[12px] text-slate-400">
                            {s.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">{s.mobile_no}</td>
                    <td className="px-3 py-3.5 text-[13.5px] text-slate-600">
                      {s.roll}
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge className="bg-slate-100 text-slate-600">
                        {s.cls}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 text-[13.5px] text-slate-600">
                      {s.gender}
                    </td>
                    <td className="px-3 py-3.5">
                      <AttendanceBar value={s.attendance} />
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge className={s.gradeColor}>{s.grade}</Badge>
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge className={s.feeColor}>{s.fee}</Badge>
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge className={s.statusColor}>{s.status}</Badge>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-10 text-center text-[13.5px] text-slate-400"
                  >
                    No students found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-[12.5px] text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
                  n === page
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <AddStudentModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}
