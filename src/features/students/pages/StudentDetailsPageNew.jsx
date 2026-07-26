/**
 * StudentDetailsPage.jsx  — tabbed student profile
 *
 * Tab registry (TABS array):
 *   profile    → StudentProfileTab    (personal / guardian / address / docs)
 *   attendance → StudentAttendanceTab (history + summary)
 *   fees       → ComingSoon
 *   results    → ComingSoon
 *   More tabs  → add one entry to TABS + one JSX case
 *
 * Route:  /students/:id
 */
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Download, Pencil, X, Loader2,
  User, CalendarCheck2, CreditCard, BookOpen,
} from "lucide-react";
import * as XLSX from "xlsx";

import { getStudentById } from "../../../redux/student/studentSlice";
import StudentProfileTab from "../components/StudentProfileTab.jsx";
import StudentAttendanceTab from "../components/StudentAttendanceTab.jsx";
import "../styles/StudentDetailsPage-new.css";

const BASE_URL = "http://localhost:5000";

/* ═══════════════════ TAB REGISTRY ════════════════════════
   Add a future tab: { id, label, icon, future: true }
   Activate it: flip future to false + add JSX case below
══════════════════════════════════════════════════════════ */
const TABS = [
  { id: "profile", label: "Profile", icon: User, future: false },
  { id: "attendance", label: "Attendance", icon: CalendarCheck2, future: false },
  { id: "fees", label: "Fees", icon: CreditCard, future: true },
  { id: "results", label: "Results", icon: BookOpen, future: true },
];

/* ── helpers ── */
const BASE = "http://localhost:5000";
function getFileUrl(v) { return typeof v === "string" ? v : v?.url || v?.path || null; }
function resolveUrl(v) {
  const r = getFileUrl(v); if (!r) return null;
  if (/^https?:\/\//i.test(r) || r.startsWith("data:")) return r;
  return `${BASE}${r.startsWith("/") ? "" : "/"}${r}`;
}
function toCamel(s) { return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }
function findDoc(obj, key) {
  if (!obj || !key) return null;
  const ck = toCamel(key);
  return [obj[key], obj[ck], obj.documents?.[key], obj.documents?.[ck], obj.files?.[key], obj.files?.[ck]]
    .find((v) => v !== undefined && v !== null && v !== "") ?? null;
}
function guessExt(url, mime) {
  const m = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  if (mime && m[mime]) return m[mime];
  const u = (url.split("?")[0].split(".").pop() || "").toLowerCase();
  return (u && u.length <= 5 && /^[a-z0-9]+$/.test(u)) ? u : "file";
}
function formatDate(v) {
  if (!v) return ""; const d = new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function computeAge(dob) {
  if (!dob) return null; const b = new Date(dob); if (isNaN(b)) return null;
  const now = new Date(); let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() - b.getMonth() < 0 || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a >= 0 ? a : null;
}
function fieldDisplay(v, type) {
  if (v === undefined || v === null || v === "") return null;
  return type === "date" ? formatDate(v) : String(v);
}

const PERSONAL_FIELDS = [
  ["First Name", "first_name"], ["Middle Name", "middle_name"], ["Last Name", "last_name"],
  ["Email", "email"], ["Mobile Number", "mobile_no"], ["Date of Birth", "date_of_birth", "date"],
  ["Gender", "gender"], ["Blood Group", "blood_group"], ["Aadhaar Number", "aadhaar_no"],
  ["Religion", "religion"], ["Nationality", "nationality"], ["Mother Tongue", "mother_tongue"],
];
const GUARDIAN_FIELDS = [
  ["Father's Name", "father_name"], ["Mother's Name", "mother_name"],
  ["Father's Occupation", "father_occupation"], ["Mother's Occupation", "mother_occupation"],
  ["Parent Mobile", "parent_mobile"], ["Alternate Mobile", "alternate_mobile"],
  ["Parent Email", "parent_email"], ["Emergency Contact", "emergency_contact"],
  ["Emergency Relationship", "emergency_relationship"],
];
const PERMANENT_ADDRESS = [
  ["Area", "permanent_area"], ["City", "permanent_city"],
  ["District", "permanent_district"], ["State", "permanent_state"],
  ["Postal Code", "permanent_postal_code"], ["Full Address", "permanent_address"],
];
const CURRENT_ADDRESS = [
  ["Area", "current_area"], ["City", "current_city"],
  ["District", "current_district"], ["State", "current_state"],
  ["Postal Code", "current_postal_code"], ["Full Address", "current_address"],
];
const DOC_FIELDS = [
  ["Photo", "photo_url", "photo"], ["Signature", "signature_url", "signature"],
  ["Birth Certificate", "birth_certificate_url", "birth_certificate"],
  ["Transfer Certificate", "transfer_certificate_url", "transfer_certificate"],
  ["Aadhaar Front", "aadhaar_front_url", "aadhaar_front"],
  ["Aadhaar Back", "aadhaar_back_url", "aadhaar_back"],
  ["Previous Marksheet", "previous_marksheets_url", "previous_marksheets"],
];

/* ── Coming soon placeholder ── */
function ComingSoonTab({ tab }) {
  const Icon = tab.icon;
  return (
    <div className="sd-coming-soon flex flex-col items-center justify-center gap-4 py-20 text-center rounded-2xl">
      <div className="sd-coming-icon-bg w-16 h-16 rounded-2xl flex items-center justify-center">
        <Icon size={28} />
      </div>
      <div>
        <p className="sd-coming-soon-title text-[16px] font-bold mb-1">{tab.label} — Coming Soon</p>
        <p style={{ color: "var(--text-muted)" }} className="text-[13px]">This section is planned for a future release.</p>
      </div>
      <span className="sd-tab-badge-soon">Planned</span>
    </div>
  );
}

/* ════ MAIN PAGE ══════════════════════════════════════════ */
export default function StudentDetailsPageNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [notImage, setNotImage] = useState({});
  const [downloading, setDownloading] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

  /* ── Fetch ── */
  const loadStudent = () => {
    setFetching(true); setFetchError(null);
    dispatch(getStudentById(id)).unwrap()
      .then((p) => setStudent(p?.student ?? p?.data ?? p ?? null))
      .catch((e) => { setFetchError(e?.message ?? String(e)); setStudent(null); })
      .finally(() => setFetching(false));
  };
  useEffect(() => { loadStudent(); }, [dispatch, id]);

  const age = useMemo(() => computeAge(student?.date_of_birth), [student]);
  const photoUrl = useMemo(() => resolveUrl(findDoc(student, "photo_url") || findDoc(student, "photo")), [student]);
  const sigUrl = useMemo(() => resolveUrl(findDoc(student, "signature_url") || findDoc(student, "signature")), [student]);
  const initials = `${student?.first_name?.[0] ?? ""}${student?.last_name?.[0] ?? ""}`.toUpperCase();
  const fullName = `${student?.first_name ?? ""}_${student?.last_name ?? ""}`.trim();

  const markNotImage = (k) => setNotImage((p) => ({ ...p, [k]: true }));
  const openLightbox = (url, label, key) => {
    if (!url) return;
    if (key && notImage[key]) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    setLightbox({ src: url, label });
  };
  const downloadFile = async (url, key, baseName) => {
    if (!url) return;
    setDownloading((p) => ({ ...p, [key]: true }));
    try {
      const r = await fetch(url); if (!r.ok) throw new Error(`${r.status}`);
      const blob = await r.blob();
      const fn = `${baseName}.${guessExt(url, blob.type)}`.replace(/\s+/g, "_");
      const bu = window.URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: bu, download: fn });
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(bu);
    } catch { window.open(url, "_blank", "noopener,noreferrer"); }
    finally { setDownloading((p) => ({ ...p, [key]: false })); }
  };

  /* ── Excel export ── */
  const handleExportExcel = () => {
    if (!student) return;
    const rows = [["Field", "Value"]];
    const sec = (title, fields) => {
      rows.push([title, ""]); fields.forEach(([l, k, t]) => rows.push([l, fieldDisplay(student[k], t) || ""])); rows.push(["", ""]);
    };
    sec("Personal Details", PERSONAL_FIELDS);
    if (age !== null) rows.push(["Age", `${age} years`]);
    sec("Guardian Details", GUARDIAN_FIELDS);
    sec("Permanent Address", PERMANENT_ADDRESS);
    if (student.current_address_same_as_permanent) { rows.push(["Current Address", "Same as permanent"]); rows.push(["", ""]); }
    else sec("Current Address", CURRENT_ADDRESS);
    const ws = XLSX.utils.aoa_to_sheet(rows); ws["!cols"] = [{ wch: 26 }, { wch: 42 }];
    const docRows = [["Document", "URL"]];
    DOC_FIELDS.forEach(([l, k, ak]) => {
      docRows.push([l, resolveUrl(findDoc(student, k) || (ak ? findDoc(student, ak) : null)) || "Not uploaded"]);
    });
    const wsDocs = XLSX.utils.aoa_to_sheet(docRows); wsDocs["!cols"] = [{ wch: 22 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profile");
    XLSX.utils.book_append_sheet(wb, wsDocs, "Documents");
    XLSX.writeFile(wb, `${fullName}_${student.id}.xlsx`.replace(/\s+/g, "_"));
  };

  if (fetching && !student) {
    return <div className="sd-page min-h-screen p-6"><p className="sd-loading text-[14px] py-12 text-center">Loading student details…</p></div>;
  }
  if (!student) {
    return (
      <div className="sd-page min-h-screen p-6">
        <button onClick={() => navigate(-1)} className="sd-back-btn inline-flex items-center gap-1.5 text-[13.5px] font-semibold mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center py-16">
          <h2 className="sd-notfound-title text-lg font-bold mb-2">Student not found</h2>
          <p className="sd-notfound text-[13.5px]">{fetchError || "This student may not exist."}</p>
          <button onClick={loadStudent} className="sd-btn-outline inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg text-[13px] font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-page min-h-screen p-5 sm:p-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="sd-back-btn inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to Students
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleExportExcel} className="sd-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => navigate(`/students?edit=${student.id}`)}
            className="sd-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
            <Pencil size={15} /> Edit Student
          </button>
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="sd-hero-card rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div onClick={() => photoUrl && openLightbox(photoUrl, "Student Photo")}
          className={`sd-avatar-ring w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${photoUrl ? "sd-avatar-clickable" : ""}`}>
          {photoUrl
            ? <img src={photoUrl} alt="Student" className="w-full h-full object-cover" />
            : <span className="sd-avatar-fallback w-full h-full flex items-center justify-center text-2xl font-bold">{initials || "—"}</span>}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="sd-hero-name text-2xl font-bold">
            {student.first_name} {student.middle_name ? `${student.middle_name} ` : ""}{student.last_name}
          </h1>
          <p className="sd-hero-email text-[13.5px] mt-0.5">{student.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            {[student.gender, student.blood_group, student.mobile_no, student.student_class && `Class ${student.student_class}`]
              .filter(Boolean).map((v, i) => (
                <span key={i} className="sd-chip px-3 py-1 rounded-full text-[12px] font-semibold capitalize">{v}</span>
              ))}
            {age !== null && <span className="sd-chip px-3 py-1 rounded-full text-[12px] font-semibold">{age} yrs</span>}
          </div>
        </div>
        {/* Signature */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <span className="sd-field-label text-[11px] uppercase tracking-wide">Signature</span>
          {sigUrl ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => openLightbox(sigUrl, "Signature")}
                className="sd-sig-thumb rounded-lg px-3 py-2 h-14 flex items-center justify-center cursor-zoom-in">
                <img src={sigUrl} alt="Signature" className="max-h-9 max-w-[130px] object-contain" />
              </button>
              <button onClick={() => downloadFile(sigUrl, "signature", `${fullName}_signature`)}
                className="sd-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center">
                {downloading.signature ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              </button>
            </div>
          ) : <span className="sd-field-value-empty text-[12.5px]">Not uploaded</span>}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="sd-tab-bar rounded-2xl px-2 mb-5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`sd-tab inline-flex items-center gap-2 px-4 py-4 text-[13.5px] transition-all ${isActive ? "sd-tab-active" : ""}`}>
                <Icon size={15} />
                {tab.label}
                {tab.future && <span className="sd-tab-badge-soon">Soon</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.18 }}>

          {activeTab === "profile" && (
            <StudentProfileTab
              student={student} age={age} fullName={fullName}
              notImage={notImage} downloading={downloading}
              onMarkNotImage={markNotImage} onLightbox={openLightbox} onDownload={downloadFile}
            />
          )}

          {activeTab === "attendance" && (
            <StudentAttendanceTab studentId={id} />
          )}

          {/* Future tabs */}
          {TABS.filter((t) => t.future).map((t) =>
            activeTab === t.id ? <ComingSoonTab key={t.id} tab={t} /> : null,
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="sd-lightbox-overlay fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <div className="sd-lightbox-frame rounded-2xl p-4 max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="sd-lightbox-label text-[14px] font-semibold">{lightbox.label}</span>
              <button onClick={() => setLightbox(null)} className="sd-lightbox-close w-8 h-8 rounded-full flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center">
              <img src={lightbox.src} alt={lightbox.label} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}