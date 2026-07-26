/**
 * StudentProfileTab.jsx
 * Personal / guardian / address / document tab for StudentDetailsPage.
 * Pure presentational — no Redux, no fetch.
 */
import React from "react";
import { Download, FileText, FileImage, ExternalLink, Loader2 } from "lucide-react";
import "../styles/StudentDetailsPage.css";

const PERSONAL_FIELDS = [
    ["First Name", "first_name"], ["Middle Name", "middle_name"], ["Last Name", "last_name"],
    ["Email", "email"], ["Mobile Number", "mobile_no"],
    ["Date of Birth", "date_of_birth", "date"], ["Gender", "gender"],
    ["Blood Group", "blood_group"], ["Aadhaar Number", "aadhaar_no"],
    ["Religion", "religion"], ["Nationality", "nationality"], ["Mother Tongue", "mother_tongue"],
];
const GUARDIAN_FIELDS = [
    ["Father's Name", "father_name"], ["Mother's Name", "mother_name"],
    ["Father's Occupation", "father_occupation"], ["Mother's Occupation", "mother_occupation"],
    ["Parent Mobile", "parent_mobile"], ["Alternate Mobile", "alternate_mobile"],
    ["Parent Email", "parent_email"], ["Emergency Contact", "emergency_contact"],
    ["Emergency Relationship", "emergency_relationship"],
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
const DOC_FIELDS = [
    ["Photo", "photo_url", "photo"], ["Signature", "signature_url", "signature"],
    ["Birth Certificate", "birth_certificate_url", "birth_certificate"],
    ["Transfer Certificate", "transfer_certificate_url", "transfer_certificate"],
    ["Aadhaar Front", "aadhaar_front_url", "aadhaar_front"],
    ["Aadhaar Back", "aadhaar_back_url", "aadhaar_back"],
    ["Previous Marksheet", "previous_marksheets_url", "previous_marksheets"],
];

function formatDate(v) {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fieldDisplay(v, type) {
    if (v === undefined || v === null || v === "") return null;
    return type === "date" ? formatDate(v) : String(v);
}

function FieldRow({ label, value, type }) {
    const display = fieldDisplay(value, type);
    return (
        <div className="flex flex-col gap-0.5">
            <span className="sd-field-label text-[11.5px] uppercase tracking-wide">{label}</span>
            {display
                ? <span className="sd-field-value text-[14px] font-medium">{display}</span>
                : <span className="sd-field-value-empty text-[13.5px]">Not provided</span>}
        </div>
    );
}
function SectionCard({ title, children }) {
    return (
        <div className="sd-section-card rounded-2xl p-5">
            <h3 className="sd-section-title text-[14px] font-bold pb-2.5 mb-4">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">{children}</div>
        </div>
    );
}

export default function StudentProfileTab({
    student, age, notImage, downloading, onMarkNotImage, onLightbox, onDownload, fullName,
}) {
    const BASE_URL = "http://localhost:5000";
    function toCamel(s) { return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }
    function findDoc(obj, key) {
        if (!obj || !key) return null;
        const ck = toCamel(key);
        const list = [obj[key], obj[ck], obj.documents?.[key], obj.documents?.[ck], obj.files?.[key], obj.files?.[ck]];
        return list.find((v) => v !== undefined && v !== null && v !== "") ?? null;
    }
    function resolveUrl(v) {
        const raw = typeof v === "string" ? v : v?.url || v?.path || null;
        if (!raw) return null;
        if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
        return `${BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <SectionCard title="Personal Details">
                    {PERSONAL_FIELDS.map(([l, k, t]) => <FieldRow key={k} label={l} value={student[k]} type={t} />)}
                    {age !== null && <FieldRow label="Age" value={`${age} years`} />}
                </SectionCard>

                <SectionCard title="Guardian Details">
                    {GUARDIAN_FIELDS.map(([l, k]) => <FieldRow key={k} label={l} value={student[k]} />)}
                </SectionCard>

                <SectionCard title="Permanent Address">
                    {PERMANENT_ADDRESS_FIELDS.map(([l, k]) => <FieldRow key={k} label={l} value={student[k]} />)}
                </SectionCard>

                <div className="sd-section-card rounded-2xl p-5">
                    <h3 className="sd-section-title text-[14px] font-bold pb-2.5 mb-4">Current Address</h3>
                    {student.current_address_same_as_permanent ? (
                        <p className="sd-note text-[13px] rounded-lg px-3 py-2.5">Same as permanent address.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                            {CURRENT_ADDRESS_FIELDS.map(([l, k]) => <FieldRow key={k} label={l} value={student[k]} />)}
                        </div>
                    )}
                </div>
            </div>

            {/* Documents */}
            <div className="sd-section-card rounded-2xl p-5">
                <h3 className="sd-section-title text-[14px] font-bold pb-2.5 mb-4">Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {DOC_FIELDS.filter(([l]) => l !== "Photo" && l !== "Signature").map(([label, key, altKey]) => {
                        const url = resolveUrl(findDoc(student, key) || (altKey ? findDoc(student, altKey) : null));
                        const showImg = url && !notImage[key];
                        const isDl = downloading[key];
                        return (
                            <div key={key} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${url ? "sd-doc-card-filled" : "sd-doc-card"}`}>
                                <div className="sd-doc-thumb w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                    {showImg
                                        ? <img src={url} alt={label} className="w-full h-full object-cover" onError={() => onMarkNotImage(key)} />
                                        : url ? <FileText size={18} className="sd-doc-icon-filled" /> : <FileImage size={18} className="sd-doc-icon-empty" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="sd-doc-name text-[13px] font-semibold truncate">{label}</p>
                                    <p className={`text-[11px] truncate ${url ? "sd-doc-icon-filled" : "sd-doc-missing"}`}>
                                        {url ? "Uploaded" : "Not uploaded"}
                                    </p>
                                </div>
                                {url && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => onLightbox(url, label, key)}
                                            className="sd-doc-view-btn inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors">
                                            {showImg ? "View" : <ExternalLink size={12} />}
                                        </button>
                                        <button onClick={() => onDownload(url, key, `${fullName}_${label}`)}
                                            className="sd-doc-view-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors" disabled={isDl}>
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