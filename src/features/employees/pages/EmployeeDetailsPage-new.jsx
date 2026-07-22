/**
 * EmployeeDetailsPage.jsx  — tabbed employee profile
 *
 * Tabs:
 *  1. Profile    — personal / employment / address / bank / documents (existing)
 *  2. Salary     — full salary breakdown from /full-salary-by-employee/:id
 *  3. Attendance — (future)
 *  4. Leave      — (future)
 *
 * Adding a new tab = add one entry to TABS array + one case in <TabContent>.
 *
 * Route:  /employees/:id
 */
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Download, Pencil, X,
  FileText, FileImage, ExternalLink, Loader2,
  User, IndianRupee, CalendarClock, Umbrella,
  TrendingUp, TrendingDown, CalendarDays,
  CalendarCheck2, Percent, Minus,
} from "lucide-react";
import * as XLSX from "xlsx";

import { fetchEmployeeById } from "../../../redux/employee/employeeSlice";
import "../styles/EmployeeDetailsPage-new.css";

const BASE_URL = "http://localhost:5000";
const SALARY_API = `${BASE_URL}/api/employee-salary-structures-details/full-salary-by-employee`;

/* ══════════════════════════════════════════════════════
   TAB REGISTRY  — add future tabs here, nothing else changes
══════════════════════════════════════════════════════ */
const TABS = [
  { id: "profile", label: "Profile", icon: User, future: false },
  { id: "salary", label: "Salary", icon: IndianRupee, future: false },
  { id: "attendance", label: "Attendance", icon: CalendarClock, future: true },
  { id: "leave", label: "Leave", icon: Umbrella, future: true },
];

/* ═══════════════════ FIELD DEFINITIONS ═══════════════════ */
const PERSONAL_FIELDS = [
  ["First Name", "first_name"], ["Last Name", "last_name"],
  ["Email", "email"], ["Mobile Number", "mobile"],
  ["Date of Birth", "dob", "date"], ["Gender", "gender"],
  ["Blood Group", "blood_group"], ["Aadhaar Number", "aadhaar_no"],
];
const EMPLOYMENT_FIELDS = [
  ["Joining Date", "joining_date", "date"], ["Designation", "designation"],
  ["Department", "department"], ["Qualification", "qualification"],
  ["Experience (years)", "experience_years"], ["Salary", "salary"],
  ["Status", "status"],
];
const PERMANENT_ADDRESS_FIELDS = [
  ["Area", "permanent_area"], ["City", "permanent_city"],
  ["District", "permanent_district"], ["State", "permanent_state"],
  ["Postal Code", "permanent_postal_code"], ["Full Address", "permanent_address"],
];
const CURRENT_ADDRESS_FIELDS = [
  ["Area", "current_area"], ["City", "current_city"],
  ["District", "current_district"], ["State", "current_state"],
  ["Postal Code", "current_postal_code"], ["Full Address", "current_address"],
];
const EMERGENCY_FIELDS = [
  ["Emergency Contact", "emergency_contact"], ["Relationship", "emergency_relationship"],
];
const BANK_FIELDS = [
  ["Bank Name", "bank_name"], ["Branch Name", "branch_name"],
  ["Account Number", "account_number"], ["Account Type", "account_type"],
  ["IFSC Code", "ifsc_code"],
];
const DOC_FIELDS = [
  ["Photo", "photo_url", "photo"],
  ["Signature", "signature_url", "signature"],
  ["Passport Size Photo", "passport_size_photo_url", "passport_size_photo"],
  ["Aadhaar Card", "aadhaar_card_url", "aadhaar_card"],
  ["PAN Card", "pan_card_url", "pan_card"],
  ["Degree Certificate", "degree_certificate_url", "degree_certificate"],
  ["Experience Certificate", "experience_certificate_url", "experience_certificate"],
];

/* ═══════════════════ HELPERS ═══════════════════════════ */
function getFileUrl(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.url || v.path || null;
  return null;
}
function resolveUrl(v) {
  const raw = getFileUrl(v);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  return `${BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
}
function toCamel(s) { return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }
function findDoc(emp, key) {
  if (!emp || !key) return null;
  const ck = toCamel(key);
  const candidates = [emp[key], emp[ck], emp.documents?.[key], emp.documents?.[ck], emp.files?.[key], emp.files?.[ck]];
  return candidates.find((v) => v !== undefined && v !== null && v !== "") ?? null;
}
function guessExt(url, mime) {
  const map = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  if (mime && map[mime]) return map[mime];
  const u = (url.split("?")[0].split(".").pop() || "").toLowerCase();
  return (u && u.length <= 5 && /^[a-z0-9]+$/.test(u)) ? u : "file";
}
function fmtDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtMoney(n) { return Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }); }
function computeAge(dob) {
  if (!dob) return null;
  const b = new Date(dob); if (isNaN(b)) return null;
  const now = new Date(); let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() - b.getMonth() < 0 || (now.getMonth() - b.getMonth() === 0 && now.getDate() < b.getDate())) a--;
  return a >= 0 ? a : null;
}
function fieldDisplay(v, type) {
  if (v === undefined || v === null || v === "") return null;
  if (type === "date") return fmtDate(v);
  return String(v);
}

/* ═══════════════════ SMALL SHARED PIECES ══════════════ */
function FieldRow({ label, value, type }) {
  const display = fieldDisplay(value, type);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="ed-field-label text-[11.5px] uppercase tracking-wide">{label}</span>
      {display
        ? <span className="ed-field-value text-[14px] font-medium">{display}</span>
        : <span className="ed-field-value-empty text-[13.5px]">Not provided</span>}
    </div>
  );
}
function SectionCard({ title, children }) {
  return (
    <div className="ed-section-card rounded-2xl p-5">
      <h3 className="ed-section-title text-[14px] font-bold pb-2.5 mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">{children}</div>
    </div>
  );
}
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--divider)" }}>
      <span className="ed-info-row-label text-[13px]">{label}</span>
      <span className="ed-info-row-value text-[13px]">{value ?? "—"}</span>
    </div>
  );
}

/* ═══════════════════ SALARY SECTION ═══════════════════ */
function SalarySection({ title, tone, rows }) {
  const subtotal = rows.filter(r => r.calculation_type === "fixed").reduce((s, r) => s + Number(r.amount ?? r.value ?? 0), 0);
  const hdrClass = tone === "earning" ? "ed-salary-section-earning" : "ed-salary-section-deduction";
  return (
    <div className="ed-section-card rounded-2xl overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-3 ${hdrClass}`}>
        <div className="flex items-center gap-2">
          {tone === "earning" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          <span className="text-[13.5px] font-bold">{title}</span>
          <span className="text-[11.5px] opacity-70">({rows.length})</span>
        </div>
        <span className="text-[13px] font-bold">₹{fmtMoney(subtotal)}</span>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="ed-salary-thead text-[11px] uppercase tracking-wide">
            <th className="px-4 py-2 font-semibold">Component</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isPct = r.calculation_type === "percentage";
            const val = r.value != null ? r.value : r.amount;
            return (
              <tr key={r.id ?? i} className="ed-salary-row">
                <td className="px-4 py-3">
                  <p className="ed-salary-primary text-[13.5px] font-semibold">{r.name}</p>
                </td>
                <td className="px-3 py-3">
                  {isPct ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="ed-calc-chip ed-calc-percentage inline-flex items-center gap-1">
                        <Percent size={10} />{Number(r.percentage ?? 0).toFixed(2)}%
                      </span>
                      <span className="ed-based-on">of {r.based_on}</span>
                    </div>
                  ) : (
                    <span className="ed-calc-chip ed-calc-fixed inline-flex items-center gap-1">
                      <IndianRupee size={10} />Fixed
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={tone === "earning" ? "ed-salary-earning" : "ed-salary-deduction"}>
                    ₹{fmtMoney(val)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr style={{ borderTop: "2px solid var(--divider)", background: "var(--input-bg)" }}>
              <td colSpan={2} className="px-4 py-2.5 ed-salary-muted text-[12px] font-bold">Subtotal</td>
              <td className={`px-3 py-2.5 text-right text-[14px] font-bold ${tone === "earning" ? "ed-salary-earning" : "ed-salary-deduction"}`}>
                ₹{fmtMoney(subtotal)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/* ═══════════════════ TAB 1: PROFILE ═══════════════════ */
function ProfileTab({ employee, age, photoUrl, sigUrl, fullName, notImage, downloading, onMarkNotImage, onLightbox, onDownload }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <SectionCard title="Personal Details">
          {PERSONAL_FIELDS.map(([l, k, t]) => <FieldRow key={k} label={l} value={employee[k]} type={t} />)}
          {age !== null && <FieldRow label="Age" value={`${age} years`} />}
        </SectionCard>
        <SectionCard title="Employment Details">
          {EMPLOYMENT_FIELDS.map(([l, k, t]) => <FieldRow key={k} label={l} value={employee[k]} type={t} />)}
        </SectionCard>
        <SectionCard title="Permanent Address">
          {PERMANENT_ADDRESS_FIELDS.map(([l, k]) => <FieldRow key={k} label={l} value={employee[k]} />)}
        </SectionCard>
        <div className="ed-section-card rounded-2xl p-5">
          <h3 className="ed-section-title text-[14px] font-bold pb-2.5 mb-4">Current Address</h3>
          {employee.current_address_same_as_permanent ? (
            <p className="ed-note text-[13px] rounded-lg px-3 py-2.5">Same as permanent address.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              {CURRENT_ADDRESS_FIELDS.map(([l, k]) => <FieldRow key={k} label={l} value={employee[k]} />)}
            </div>
          )}
        </div>
        <SectionCard title="Emergency Contact">
          {EMERGENCY_FIELDS.map(([l, k]) => <FieldRow key={k} label={l} value={employee[k]} />)}
        </SectionCard>
        <SectionCard title="Bank Details">
          {BANK_FIELDS.map(([l, k]) => <FieldRow key={k} label={l} value={employee[k]} />)}
        </SectionCard>
      </div>

      {/* Documents */}
      <div className="ed-section-card rounded-2xl p-5">
        <h3 className="ed-section-title text-[14px] font-bold pb-2.5 mb-4">Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DOC_FIELDS.filter(([l]) => l !== "Photo" && l !== "Signature").map(([label, key, altKey]) => {
            const url = resolveUrl(findDoc(employee, key) || (altKey ? findDoc(employee, altKey) : null));
            const showImg = url && !notImage[key];
            const isDl = downloading[key];
            return (
              <div key={key} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${url ? "ed-doc-card-filled" : "ed-doc-card"}`}>
                <div className="ed-doc-thumb w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {showImg
                    ? <img src={url} alt={label} className="w-full h-full object-cover" onError={() => onMarkNotImage(key)} />
                    : url
                      ? <FileText size={18} className="ed-doc-icon-filled" />
                      : <FileImage size={18} className="ed-doc-icon-empty" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="ed-doc-name text-[13px] font-semibold truncate">{label}</p>
                  <p className={`text-[11px] truncate ${url ? "ed-doc-icon-filled" : "ed-doc-missing"}`}>
                    {url ? "Uploaded" : "Not uploaded"}
                  </p>
                </div>
                {url && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onLightbox(url, label, key)}
                      className="ed-doc-view-btn inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      title={showImg ? "Preview" : "Open"}>
                      {showImg ? "View" : <ExternalLink size={12} />}
                    </button>
                    <button onClick={() => onDownload(url, key, `${fullName}_${label}`)}
                      className="ed-doc-view-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      disabled={isDl}>
                      {isDl ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════ TAB 2: SALARY ════════════════════ */
function SalaryTab({ employeeId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    fetch(`${SALARY_API}/${employeeId}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <p className="ed-salary-muted text-[13.5px] text-center py-12">Loading salary data…</p>;
  if (error) return <p className="text-[13.5px] text-center py-12" style={{ color: "var(--danger)" }}>Error: {error}</p>;
  if (!data) return <p className="ed-salary-muted text-[13.5px] text-center py-12">No salary data found.</p>;

  const { structure, components = [], breakdown, monthly_ctc, annual_ctc } = data;

  /* Use backend-calculated breakdown values when available */
  const earningRows = breakdown?.earnings?.length
    ? [{ name: "Basic Pay", value: breakdown.basic, calculation_type: "fixed" }, ...breakdown.earnings]
    : components.filter(c => c.component_type === "earning");

  const deductionRows = breakdown?.deductions?.length
    ? breakdown.deductions
    : components.filter(c => c.component_type === "deduction");

  const gross = breakdown?.gross ?? 0;
  const totalDeductions = breakdown?.total_deductions ?? 0;
  const netSalary = breakdown?.net_salary ?? (gross - totalDeductions);

  return (
    <div className="flex flex-col gap-5">

      {/* Structure info card */}
      {structure && (
        <div className="ed-struct-card rounded-2xl px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="ed-struct-name text-[15px] font-bold">{structure.name}</p>
              <span className={`ed-status ed-status-${structure.status}`}>{structure.status}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap mt-1">
              <span className="ed-struct-meta text-[12.5px] flex items-center gap-1">
                <CalendarDays size={12} /> From: {fmtDate(structure.effective_from)}
              </span>
              {structure.effective_to ? (
                <span className="ed-struct-meta text-[12.5px] flex items-center gap-1">
                  <CalendarCheck2 size={12} /> To: {fmtDate(structure.effective_to)}
                </span>
              ) : (
                <span className="text-[12.5px] flex items-center gap-1" style={{ color: "var(--success)" }}>
                  <CalendarCheck2 size={12} /> Open-ended
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="ed-salary-muted text-[11px] mb-0.5">Monthly CTC</p>
              <p className="ed-salary-earning text-[16px] font-extrabold">₹{fmtMoney(monthly_ctc)}</p>
            </div>
            <div className="text-right">
              <p className="ed-salary-muted text-[11px] mb-0.5">Annual CTC</p>
              <p className="ed-salary-primary text-[16px] font-extrabold">₹{fmtMoney(annual_ctc)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Earnings + Deductions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SalarySection title="Earnings" tone="earning" rows={earningRows} />
        <SalarySection title="Deductions" tone="deduction" rows={deductionRows} />
      </div>

      {/* Net Salary summary */}
      <div className="ed-salary-net-card rounded-2xl px-5 py-5">
        <p className="ed-salary-muted text-[12px] font-bold uppercase tracking-wider mb-4">Salary Summary</p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-center">
            <p className="ed-salary-muted text-[12px] mb-1">Gross Earnings</p>
            <p className="ed-salary-earning text-[22px] font-extrabold">₹{fmtMoney(gross)}</p>
            <p className="ed-salary-muted text-[11px] mt-0.5">Basic + all allowances</p>
          </div>
          <Minus size={22} style={{ color: "var(--text-muted)" }} />
          <div className="text-center">
            <p className="ed-salary-muted text-[12px] mb-1">Total Deductions</p>
            <p className="ed-salary-deduction text-[22px] font-extrabold">₹{fmtMoney(totalDeductions)}</p>
            <p className="ed-salary-muted text-[11px] mt-0.5">{deductionRows.length} components</p>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "24px", fontWeight: 300 }}>=</span>
          <div className={`text-center rounded-2xl px-8 py-4 ${netSalary >= 0 ? "ed-net-positive" : "ed-net-negative"}`}>
            <p className="text-[12px] font-semibold mb-1">Net Salary</p>
            <p className="text-[28px] font-extrabold">₹{fmtMoney(netSalary)}</p>
            <p className="text-[11px] font-medium opacity-75 mt-0.5">Per month (estimated)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ FUTURE TAB ════════════════════════ */
function ComingSoonTab({ tab }) {
  const Icon = tab.icon;
  return (
    <div className="ed-coming-soon flex flex-col items-center justify-center gap-4 py-20 text-center rounded-2xl">
      <div className="ed-coming-soon-icon-bg w-16 h-16 rounded-2xl flex items-center justify-center" style={{ color: "var(--btn-bg)" }}>
        <Icon size={28} />
      </div>
      <div>
        <p className="ed-coming-soon-title text-[16px] font-bold mb-1">{tab.label} — Coming Soon</p>
        <p style={{ color: "var(--text-muted)" }} className="text-[13px]">This section is planned for a future release.</p>
      </div>
      <span className="ed-tab-badge-soon">Planned</span>
    </div>
  );
}

/* ═══════════════════ MAIN PAGE ═════════════════════════ */
export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [employee, setEmployee] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [notImage, setNotImage] = useState({});
  const [downloading, setDownloading] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

  /* ── Fetch employee ── */
  const loadEmployee = () => {
    setFetching(true); setFetchError(null);
    dispatch(fetchEmployeeById(id)).unwrap()
      .then((payload) => setEmployee(payload?.employee ?? payload?.data ?? payload ?? null))
      .catch((err) => { setFetchError(err?.message ?? String(err)); setEmployee(null); })
      .finally(() => setFetching(false));
  };
  useEffect(() => { loadEmployee(); }, [dispatch, id]);

  const age = useMemo(() => computeAge(employee?.dob), [employee]);
  const photoUrl = useMemo(() => resolveUrl(findDoc(employee, "photo_url") || findDoc(employee, "photo")), [employee]);
  const sigUrl = useMemo(() => resolveUrl(findDoc(employee, "signature_url") || findDoc(employee, "signature")), [employee]);
  const initials = `${employee?.first_name?.[0] ?? ""}${employee?.last_name?.[0] ?? ""}`.toUpperCase();
  const fullName = `${employee?.first_name ?? ""}_${employee?.last_name ?? ""}`.trim();

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
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status}`);
      const blob = await r.blob();
      const ext = guessExt(url, blob.type);
      const fn = `${baseName}.${ext}`.replace(/\s+/g, "_");
      const bu = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = bu; a.download = fn;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(bu);
    } catch { window.open(url, "_blank", "noopener,noreferrer"); }
    finally { setDownloading((p) => ({ ...p, [key]: false })); }
  };

  const handleExcelExport = () => {
    if (!employee) return;
    const rows = [["Field", "Value"]];
    const sec = (title, fields) => {
      rows.push([title, ""]); fields.forEach(([l, k, t]) => rows.push([l, fieldDisplay(employee[k], t) || ""])); rows.push(["", ""]);
    };
    sec("Personal Details", PERSONAL_FIELDS);
    if (age !== null) rows.push(["Age", `${age} years`]);
    sec("Employment Details", EMPLOYMENT_FIELDS);
    sec("Permanent Address", PERMANENT_ADDRESS_FIELDS);
    if (employee.current_address_same_as_permanent) { rows.push(["Current Address", "Same as permanent"]); rows.push(["", ""]); }
    else sec("Current Address", CURRENT_ADDRESS_FIELDS);
    sec("Emergency Contact", EMERGENCY_FIELDS);
    sec("Bank Details", BANK_FIELDS);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 26 }, { wch: 42 }];
    const docRows = [["Document", "URL"]];
    DOC_FIELDS.forEach(([l, k, ak]) => {
      const u = resolveUrl(findDoc(employee, k) || (ak ? findDoc(employee, ak) : null));
      docRows.push([l, u || "Not uploaded"]);
    });
    const wsDocs = XLSX.utils.aoa_to_sheet(docRows);
    wsDocs["!cols"] = [{ wch: 22 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profile");
    XLSX.utils.book_append_sheet(wb, wsDocs, "Documents");
    XLSX.writeFile(wb, `${fullName}_${employee.id}.xlsx`.replace(/\s+/g, "_"));
  };

  if (fetching && !employee) {
    return <div className="ed-page min-h-screen p-6"><p className="ed-loading text-[14px] py-10 text-center">Loading employee details…</p></div>;
  }
  if (!employee) {
    return (
      <div className="ed-page min-h-screen p-6">
        <button onClick={() => navigate(-1)} className="ed-back-btn inline-flex items-center gap-1.5 text-[13.5px] font-semibold mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center py-16">
          <h2 className="ed-notfound-title text-lg font-bold mb-2">Employee not found</h2>
          <p className="ed-notfound text-[13.5px]">{fetchError || "This employee may not exist."}</p>
          <button onClick={loadEmployee} className="ed-btn-outline inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg text-[13px] font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ed-page min-h-screen p-5 sm:p-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="ed-back-btn inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to Employees
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleExcelExport} className="ed-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => navigate(`/employees?edit=${employee.id}`)}
            className="ed-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
            <Pencil size={15} /> Edit Employee
          </button>
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="ed-hero-card rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div onClick={() => photoUrl && openLightbox(photoUrl, "Employee Photo")}
          className={`ed-avatar-ring w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${photoUrl ? "ed-avatar-clickable" : ""}`}>
          {photoUrl
            ? <img src={photoUrl} alt="Employee" className="w-full h-full object-cover" />
            : <span className="ed-avatar-fallback w-full h-full flex items-center justify-center text-2xl font-bold">{initials || "—"}</span>}
        </div>

        {/* Info */}
        <div className="text-center sm:text-left flex-1">
          <h1 className="ed-hero-name text-2xl font-bold">{employee.first_name} {employee.last_name}</h1>
          <p className="ed-hero-email text-[13.5px] mt-0.5">{employee.email}</p>
          {employee.employee_code && <p className="ed-hero-code text-[12.5px] mt-0.5">{employee.employee_code}</p>}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            {[employee.designation, employee.department, employee.status, employee.mobile].filter(Boolean).map((v, i) => (
              <span key={i} className="ed-chip px-3 py-1 rounded-full text-[12px] font-semibold capitalize">{v}</span>
            ))}
            {age !== null && <span className="ed-chip px-3 py-1 rounded-full text-[12px] font-semibold">{age} years</span>}
          </div>
        </div>

        {/* Signature */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <span className="ed-field-label text-[11px] uppercase tracking-wide">Signature</span>
          {sigUrl ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => openLightbox(sigUrl, "Signature")}
                className="ed-sig-thumb rounded-lg px-3 py-2 h-14 flex items-center justify-center cursor-zoom-in">
                <img src={sigUrl} alt="Signature" className="max-h-9 max-w-[130px] object-contain" />
              </button>
              <button onClick={() => downloadFile(sigUrl, "signature", `${fullName}_signature`)}
                className="ed-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center">
                {downloading.signature ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              </button>
            </div>
          ) : <span className="ed-field-value-empty text-[12.5px]">Not uploaded</span>}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="ed-tab-bar rounded-2xl px-2 mb-5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`ed-tab inline-flex items-center gap-2 px-4 py-4 text-[13.5px] transition-all ${isActive ? "ed-tab-active" : ""}`}>
                <Icon size={15} />
                {tab.label}
                {tab.future && <span className="ed-tab-badge-soon">Soon</span>}
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
            <ProfileTab
              employee={employee} age={age} photoUrl={photoUrl} sigUrl={sigUrl} fullName={fullName}
              notImage={notImage} downloading={downloading}
              onMarkNotImage={markNotImage} onLightbox={openLightbox} onDownload={downloadFile}
            />
          )}

          {activeTab === "salary" && <SalaryTab employeeId={id} />}

          {TABS.filter((t) => t.future).map((t) =>
            activeTab === t.id ? <ComingSoonTab key={t.id} tab={t} /> : null,
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="ed-lightbox-overlay fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <div className="ed-lightbox-frame rounded-2xl p-4 max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="ed-lightbox-label text-[14px] font-semibold">{lightbox.label}</span>
              <button onClick={() => setLightbox(null)} className="ed-lightbox-close w-8 h-8 rounded-full flex items-center justify-center"><X size={18} /></button>
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