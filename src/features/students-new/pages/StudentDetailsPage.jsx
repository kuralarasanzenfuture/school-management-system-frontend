import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  Download,
  Pencil,
  X,
  FileText,
  FileImage,
  ExternalLink,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx"; // npm install xlsx
import { getStudentById } from "../../../redux/student/studentSlice";
import "../styles/StudentDetailsPage.css";

// const BASE_URL = process.env.REACT_APP_BASE_URL;
const BASE_URL = "http://localhost:5000";

/* ── Field groups shared by the on-screen layout and the Excel export ── */
const PERSONAL_FIELDS = [
  ["First Name", "first_name"],
  ["Middle Name", "middle_name"],
  ["Last Name", "last_name"],
  ["Email", "email"],
  ["Mobile Number", "mobile_no"],
  ["Date of Birth", "date_of_birth", "date"],
  ["Gender", "gender"],
  ["Blood Group", "blood_group"],
  ["Aadhaar Number", "aadhaar_no"],
  ["Religion", "religion"],
  ["Nationality", "nationality"],
  ["Mother Tongue", "mother_tongue"],
];

const GUARDIAN_FIELDS = [
  ["Father's Name", "father_name"],
  ["Mother's Name", "mother_name"],
  ["Father's Occupation", "father_occupation"],
  ["Mother's Occupation", "mother_occupation"],
  ["Parent Mobile", "parent_mobile"],
  ["Alternate Mobile", "alternate_mobile"],
  ["Parent Email", "parent_email"],
  ["Emergency Contact", "emergency_contact"],
  ["Emergency Relationship", "emergency_relationship"],
];

const PERMANENT_ADDRESS_FIELDS = [
  ["Area", "permanent_area"],
  ["City", "permanent_city"],
  ["District", "permanent_district"],
  ["State", "permanent_state"],
  ["Postal Code", "permanent_postal_code"],
  ["Full Address", "permanent_address"],
];

const CURRENT_ADDRESS_FIELDS = [
  ["Area", "current_area"],
  ["City", "current_city"],
  ["District", "current_district"],
  ["State", "current_state"],
  ["Postal Code", "current_postal_code"],
  ["Full Address", "current_address"],
];

// [label, primaryKey, altKey?]
const DOC_FIELDS = [
  ["Photo", "photo_url", "photo"],
  ["Signature", "signature_url", "signature"],
  ["Birth Certificate", "birth_certificate_url", "birth_certificate"],
  ["Transfer Certificate", "transfer_certificate_url", "transfer_certificate"],
  ["Aadhaar Front", "aadhaar_front_url", "aadhaar_front"],
  ["Aadhaar Back", "aadhaar_back_url", "aadhaar_back"],
  ["Previous Marksheet", "previous_marksheets_url", "previous_marksheets"],
];

/* ── Helpers ── */
function getFileUrl(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.url || value.path || null;
  return null;
}

// Every upload in this app is served from our own backend (BASE_URL) — no
// cloud/CDN storage involved. We still guard against double-prefixing in
// case a value ever arrives already-absolute.
function resolveUrl(value) {
  const raw = getFileUrl(value);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  return `${BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

// Backend field naming can drift from what the form originally saved
// (snake_case vs camelCase, or nested under a `documents`/`files` object).
// This checks the common variants instead of assuming one exact shape.
function toCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function findDocValue(student, snakeKey) {
  if (!student || !snakeKey) return null;
  const camelKey = toCamel(snakeKey);
  const candidates = [
    student[snakeKey],
    student[camelKey],
    student.documents?.[snakeKey],
    student.documents?.[camelKey],
    student.files?.[snakeKey],
    student.files?.[camelKey],
  ];
  const found = candidates.find(
    (v) => v !== undefined && v !== null && v !== "",
  );
  return found ?? null;
}

// Maps a blob's MIME type (or the URL as a fallback) to a file extension,
// since uploaded filenames on the server often don't carry one.
function guessExtension(url, mimeType) {
  const map = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  if (mimeType && map[mimeType]) return map[mimeType];
  const urlExt = (url.split("?")[0].split(".").pop() || "").toLowerCase();
  if (urlExt && urlExt.length <= 5 && /^[a-z0-9]+$/.test(urlExt)) return urlExt;
  return "file";
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function computeAge(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  if (isNaN(b)) return null;
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a >= 0 ? a : null;
}

function fieldDisplay(value, type) {
  if (value === undefined || value === null || value === "") return null;
  return type === "date" ? formatDate(value) : String(value);
}

/* ── Small pieces ── */
function FieldRow({ label, value, type }) {
  const display = fieldDisplay(value, type);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="sd-field-label text-[11.5px] uppercase tracking-wide">
        {label}
      </span>
      {display ? (
        <span className="sd-field-value text-[14px] font-medium">
          {display}
        </span>
      ) : (
        <span className="sd-field-value-empty text-[13.5px]">Not provided</span>
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="sd-section-card rounded-2xl p-5">
      <h3 className="sd-section-title text-[14px] font-bold pb-2.5 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
        {children}
      </div>
    </div>
  );
}

function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { src, label }

  // Tracks which document keys failed to render as an <img> — this is how we
  // actually know a file isn't an image, instead of guessing from its URL.
  const [notImage, setNotImage] = useState({});
  // Tracks in-flight downloads so the button can show a spinner per doc.
  const [downloading, setDownloading] = useState({});

  const loadStudent = () => {
    setFetching(true);
    setFetchError(null);
    dispatch(getStudentById(id))
      .unwrap()
      .then((payload) => {
        // Unwrap common response shapes ({ student }, { data }, or the raw object).
        const data = payload?.student || payload?.data || payload;
        setStudent(data || null);
      })
      .catch((err) => {
        setFetchError(err?.message || err || "Failed to load student");
        setStudent(null);
      })
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  const age = student ? computeAge(student.date_of_birth) : null;
  const photoUrl = student
    ? resolveUrl(
        findDocValue(student, "photo_url") || findDocValue(student, "photo"),
      )
    : null;
  const sigUrl = student
    ? resolveUrl(
        findDocValue(student, "signature_url") ||
          findDocValue(student, "signature"),
      )
    : null;

  const markNotImage = (key) =>
    setNotImage((prev) => ({ ...prev, [key]: true }));

  const openLightbox = (url, label, key) => {
    if (!url) return;
    if (key && notImage[key]) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    setLightbox({ src: url, label });
  };

  // Forces an actual file download (rather than navigating the tab to the
  // URL) by fetching the bytes and saving them as a blob with a real name.
  const downloadFile = async (url, key, baseName) => {
    if (!url) return;
    setDownloading((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const blob = await response.blob();
      const ext = guessExtension(url, blob.type);
      const filename = `${baseName}.${ext}`.replace(/\s+/g, "_");

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed, opening file directly instead:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleExportExcel = () => {
    if (!student) return;

    const rows = [["Field", "Value"]];
    const pushSection = (title, fields) => {
      rows.push([title, ""]);
      fields.forEach(([label, key, type]) => {
        rows.push([label, fieldDisplay(student[key], type) || ""]);
      });
      rows.push(["", ""]);
    };

    pushSection("Personal Details", PERSONAL_FIELDS);
    if (age !== null) rows.push(["Age", `${age} years`]);
    pushSection("Guardian Details", GUARDIAN_FIELDS);
    pushSection("Permanent Address", PERMANENT_ADDRESS_FIELDS);

    if (student.current_address_same_as_permanent) {
      rows.push(["Current Address", "Same as permanent address"]);
      rows.push(["", ""]);
    } else {
      pushSection("Current Address", CURRENT_ADDRESS_FIELDS);
    }

    const wsProfile = XLSX.utils.aoa_to_sheet(rows);
    wsProfile["!cols"] = [{ wch: 26 }, { wch: 42 }];

    const docRows = [["Document", "URL"]];
    DOC_FIELDS.forEach(([label, key, altKey]) => {
      const url = resolveUrl(
        findDocValue(student, key) ||
          (altKey ? findDocValue(student, altKey) : null),
      );
      docRows.push([label, url || "Not uploaded"]);
    });
    const wsDocs = XLSX.utils.aoa_to_sheet(docRows);
    wsDocs["!cols"] = [{ wch: 22 }, { wch: 60 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsProfile, "Profile");
    XLSX.utils.book_append_sheet(wb, wsDocs, "Documents");

    const fileName =
      `${student.first_name || "student"}_${student.last_name || ""}_${student.id}.xlsx`.replace(
        /\s+/g,
        "_",
      );
    XLSX.writeFile(wb, fileName);
  };

  if (fetching && !student) {
    return (
      <div className="sd-page min-h-screen p-6">
        <p className="sd-loading">Loading student details…</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="sd-page min-h-screen p-6">
        <button
          onClick={() => navigate(-1)}
          className="sd-back-btn inline-flex items-center gap-1.5 text-[13.5px] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center py-16">
          <h2 className="sd-notfound-title text-lg font-bold mb-1.5">
            Student not found
          </h2>
          <p className="sd-notfound text-[13.5px]">
            {fetchError || "This student may not exist, or hasn't loaded yet."}
          </p>
          <button
            onClick={loadStudent}
            className="sd-btn-outline inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const initials =
    `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();
  const fullName =
    `${student.first_name || ""}_${student.last_name || ""}`.trim();

  return (
    <div className="sd-page min-h-screen p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="sd-back-btn inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition-colors"
        >
          <ArrowLeft size={16} /> Back to Students
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="sd-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors"
          >
            <Download size={16} /> Download Excel
          </button>
          <button
            onClick={() => navigate(`/students?edit=${student.id}`)}
            className="sd-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors"
          >
            <Pencil size={15} /> Edit Student
          </button>
        </div>
      </div>

      {/* Hero / profile summary */}
      <div className="sd-hero-card rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div
          onClick={() => photoUrl && openLightbox(photoUrl, "Student Photo")}
          className={`sd-avatar-ring w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${photoUrl ? "sd-avatar-clickable" : ""}`}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Student"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="sd-avatar-fallback w-full h-full flex items-center justify-center text-2xl font-bold">
              {initials || "—"}
            </span>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h1 className="sd-hero-name text-2xl font-bold">
            {student.first_name} {student.middle_name} {student.last_name}
          </h1>
          <p className="sd-hero-email text-[13.5px] mt-0.5">{student.email}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            {student.gender && (
              <span className="sd-chip px-3 py-1 rounded-full text-[12px] font-semibold capitalize">
                {student.gender}
              </span>
            )}
            {age !== null && (
              <span className="sd-chip px-3 py-1 rounded-full text-[12px] font-semibold">
                {age} years
              </span>
            )}
            {student.blood_group && (
              <span className="sd-chip px-3 py-1 rounded-full text-[12px] font-semibold">
                {student.blood_group}
              </span>
            )}
            {student.mobile_no && (
              <span className="sd-chip px-3 py-1 rounded-full text-[12px] font-semibold">
                {student.mobile_no}
              </span>
            )}
          </div>
        </div>

        {/* Signature preview */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <span className="sd-field-label text-[11px] uppercase tracking-wide">
            Signature
          </span>
          {sigUrl ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openLightbox(sigUrl, "Guardian Signature")}
                className="sd-doc-thumb rounded-lg px-3 py-2 h-14 flex items-center justify-center cursor-zoom-in"
              >
                <img
                  src={sigUrl}
                  alt="Signature"
                  className="max-h-9 max-w-[130px] object-contain"
                />
              </button>
              <button
                onClick={() =>
                  downloadFile(sigUrl, "signature", `${fullName}_signature`)
                }
                className="sd-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                title="Download signature"
              >
                {downloading.signature ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
              </button>
            </div>
          ) : (
            <span className="sd-field-value-empty text-[12.5px]">
              Not uploaded
            </span>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <SectionCard title="Personal Details">
          {PERSONAL_FIELDS.map(([label, key, type]) => (
            <FieldRow
              key={key}
              label={label}
              value={student[key]}
              type={type}
            />
          ))}
          {age !== null && <FieldRow label="Age" value={`${age} years`} />}
        </SectionCard>

        <SectionCard title="Guardian Details">
          {GUARDIAN_FIELDS.map(([label, key]) => (
            <FieldRow key={key} label={label} value={student[key]} />
          ))}
        </SectionCard>

        <SectionCard title="Permanent Address">
          {PERMANENT_ADDRESS_FIELDS.map(([label, key]) => (
            <FieldRow key={key} label={label} value={student[key]} />
          ))}
        </SectionCard>

        <div className="sd-section-card rounded-2xl p-5">
          <h3 className="sd-section-title text-[14px] font-bold pb-2.5 mb-4">
            Current Address
          </h3>
          {student.current_address_same_as_permanent ? (
            <p className="sd-note text-[13px] rounded-lg px-3 py-2.5">
              Same as permanent address.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              {CURRENT_ADDRESS_FIELDS.map(([label, key]) => (
                <FieldRow key={key} label={label} value={student[key]} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="sd-section-card rounded-2xl p-5">
        <h3 className="sd-section-title text-[14px] font-bold pb-2.5 mb-4">
          Documents
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DOC_FIELDS.filter(
            ([label]) => label !== "Photo" && label !== "Signature",
          ).map(([label, key, altKey]) => {
            const url = resolveUrl(
              findDocValue(student, key) ||
                (altKey ? findDocValue(student, altKey) : null),
            );
            const showAsImage = url && !notImage[key];
            const isDownloading = downloading[key];

            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${url ? "sd-doc-card-filled" : "sd-doc-card"}`}
              >
                <div className="sd-doc-thumb w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {showAsImage ? (
                    <img
                      src={url}
                      alt={label}
                      className="w-full h-full object-cover"
                      onError={() => markNotImage(key)}
                    />
                  ) : url ? (
                    <FileText size={18} className="sd-doc-icon-filled" />
                  ) : (
                    <FileImage size={18} className="sd-doc-icon-empty" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="sd-doc-name text-[13px] font-semibold truncate">
                    {label}
                  </p>
                  <p
                    className={`text-[11px] truncate ${url ? "sd-doc-icon-filled" : "sd-doc-missing"}`}
                  >
                    {url ? "Uploaded" : "Not uploaded"}
                  </p>
                </div>
                {url && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openLightbox(url, label, key)}
                      className="sd-doc-view-btn inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      title={showAsImage ? "Preview" : "Open in new tab"}
                    >
                      {showAsImage ? "View" : <ExternalLink size={12} />}
                    </button>
                    <button
                      onClick={() =>
                        downloadFile(url, key, `${fullName}_${label}`)
                      }
                      className="sd-doc-view-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      title="Download"
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Download size={13} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="sd-lightbox-overlay fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div
            className="sd-lightbox-frame rounded-2xl p-4 max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="sd-lightbox-label text-[14px] font-semibold">
                {lightbox.label}
              </span>
              <button
                onClick={() => setLightbox(null)}
                className="sd-lightbox-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center">
              <img
                src={lightbox.src}
                alt={lightbox.label}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDetailsPage;
