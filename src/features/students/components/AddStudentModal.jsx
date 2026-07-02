import React, { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Trash2,
  User,
  Users,
  MapPin,
  FileText,
  FileCheck,
  Bookmark,
  X,
  CircleCheck,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  createStudent,
  updateStudent,
} from "../../../redux/student/studentSlice";
import "../styles/AddStudentModal.css";
import {
  aadharNumber,
  handleRestrictedInput,
  mobileNumber,
  pincode,
} from "../../../common/utils/inputHandlers";

// Sequential IDs 1-4 matching the actual step counter
const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Guardian", icon: Users },
  { id: 3, label: "Address", icon: MapPin },
  { id: 4, label: "Documents", icon: FileText },
];

const TOTAL_STEPS = STEPS.length;

/* ── Field wrapper ── */
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="sm-field-label text-[13px] font-medium">
        {label} {required && <span className="sm-field-required">*</span>}
      </label>
      {children}
      <div className="h-4">
        {error && <p className="sm-field-error text-[11px]">{error}</p>}
      </div>
    </div>
  );
}

const inputBase =
  "sm-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200";

const tInput = (err) => `${inputBase} ${err ? "sm-input-error" : ""}`;

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

/* ── Initial form state (snake_case matches DB schema) ── */
const INIT = {
  // Student
  school_id: 1,
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  mobile_no: "",
  date_of_birth: "",
  gender: "",
  blood_group: "",
  aadhaar_no: "",
  religion: "",
  nationality: "INDIAN",
  mother_tongue: "",

  // Parents
  father_name: "",
  mother_name: "",
  father_occupation: "",
  mother_occupation: "",
  parent_mobile: "",
  alternate_mobile: "",
  parent_email: "",
  emergency_contact: "",
  emergency_relationship: "",

  // Permanent address
  permanent_area: "",
  permanent_city: "",
  permanent_district: "",
  permanent_state: "",
  permanent_postal_code: "",
  permanent_address: "",

  // Current address
  current_address_same_as_permanent: false,
  current_area: "",
  current_city: "",
  current_district: "",
  current_state: "",
  current_postal_code: "",
  current_address: "",
};

// Document keys that use the DocCard uploader
const DOC_KEYS = [
  { key: "birth_certificate", label: "Birth Certificate" },
  { key: "transfer_certificate", label: "Transfer Certificate" },
  { key: "aadhaar_front", label: "Aadhaar Front" },
  { key: "aadhaar_back", label: "Aadhaar Back" },
  { key: "previous_marksheets", label: "Previous Marksheet" },
];

/**
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {object|null} student - pass an existing student record to switch the
 *   modal into edit mode. Must include `id` plus the same snake_case fields
 *   used in INIT. File fields may include a `url` so existing uploads render
 *   instead of showing "not uploaded".
 */
export default function AddStudentModal({ isOpen, onClose, student = null }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(student?.id);
  // console.log("isEdit", isEdit, student);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState(INIT);

  // Files are tracked separately from `data` so we never accidentally send a
  // blob: preview URL to the server — only real File objects get uploaded.
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [docFiles, setDocFiles] = useState({}); // { [docKey]: File }
  const [docMeta, setDocMeta] = useState({}); // { [docKey]: { name, size, url?, existing? } }

  const fileRef = useRef(null);
  const sigRef = useRef(null);

  const IMAGE_BASE_URL = "http://localhost:5000";
  /* ── Hydrate form when opening in edit mode ── */
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && student) {
      setData({
        ...INIT,
        ...student,
        current_address_same_as_permanent: Boolean(
          Number(student.current_address_same_as_permanent),
        ),
      });
      // console.log("Hydrating form with student data:", student);
      // console.log(student.current_address_same_as_permanent);
      // console.log(typeof student.current_address_same_as_permanent);

      // Photo
      setPhotoPreview(
        student.photo_url ? `${IMAGE_BASE_URL}${student.photo_url}` : null,
      );

      // Signature
      setSignaturePreview(
        student.signature_url
          ? `${IMAGE_BASE_URL}${student.signature_url}`
          : null,
      );

      // Existing Documents
      const meta = {
        birth_certificate: student.birth_certificate_url
          ? {
              name: "Birth Certificate",
              url: `${IMAGE_BASE_URL}${student.birth_certificate_url}`,
              existing: true,
            }
          : null,

        aadhaar_front: student.aadhaar_front_url
          ? {
              name: "Aadhaar Front",
              url: `${IMAGE_BASE_URL}${student.aadhaar_front_url}`,
              existing: true,
            }
          : null,

        aadhaar_back: student.aadhaar_back_url
          ? {
              name: "Aadhaar Back",
              url: `${IMAGE_BASE_URL}${student.aadhaar_back_url}`,
              existing: true,
            }
          : null,

        transfer_certificate: student.transfer_certificate_url
          ? {
              name: "Transfer Certificate",
              url: `${IMAGE_BASE_URL}${student.transfer_certificate_url}`,
              existing: true,
            }
          : null,

        previous_marksheets: student.previous_marksheets_url
          ? {
              name: "Previous Marksheet",
              url: `${IMAGE_BASE_URL}${student.previous_marksheets_url}`,
              existing: true,
            }
          : null,
      };

      setDocMeta(meta);
    } else {
      setData(INIT);
      setPhotoPreview(null);
      setSignaturePreview(null);
      setDocMeta({});
    }

    setPhotoFile(null);
    setSignatureFile(null);
    setDocFiles({});
    setStep(1);
    setErrors({});
    setSubmitted(false);
  }, [isOpen, isEdit, student]);

  // useEffect(() => {
  //   console.log(data.current_address_same_as_permanent);
  // }, [data]);

  /* ── Age auto-calc ── */
  const age = useMemo(() => {
    if (!data.date_of_birth) return "";
    const b = new Date(data.date_of_birth);
    if (isNaN(b)) return "";
    const now = new Date();
    let a = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
    return a >= 0 ? `${a} years` : "";
  }, [data.date_of_birth]);

  /* ── Helpers ── */
  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;

    setData((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      // Sync current address with permanent address
      if (prev.current_address_same_as_permanent) {
        const fieldMap = {
          permanent_area: "current_area",
          permanent_city: "current_city",
          permanent_district: "current_district",
          permanent_state: "current_state",
          permanent_postal_code: "current_postal_code",
          permanent_address: "current_address",
        };

        if (fieldMap[key]) {
          updated[fieldMap[key]] = value;
        }
      }

      return updated;
    });

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: null,
      }));
    }
  };

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
    if (errors.photo) setErrors((er) => ({ ...er, photo: null }));
  };

  const handleSig = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSignatureFile(f);
    setSignaturePreview(URL.createObjectURL(f));
    if (errors.signature) setErrors((er) => ({ ...er, signature: null }));
  };

  const setDoc = (key) => (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setDocFiles((d) => ({ ...d, [key]: f }));
    setDocMeta((d) => ({
      ...d,
      [key]: { name: f.name, size: Math.round(f.size / 1024), existing: false },
    }));
  };

  const removeDoc = (key) => () => {
    setDocFiles((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
    setDocMeta((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
  };

  /* ── Validation per step ── */
  const validate = (s) => {
    const e = {};

    if (s === 1) {
      if (!data.first_name.trim()) e.first_name = "First name is required";
      if (!data.last_name.trim()) e.last_name = "Last name is required";
      // if (!data.email.trim()) e.email = "Email is required";
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email))
        e.email = "Enter a valid email";
      if (!data.date_of_birth) e.date_of_birth = "Date of birth is required";
      if (data.mobile_no && !/^\d{10}$/.test(data.mobile_no))
        e.mobile_no = "Enter a 10-digit number";
      if (data.aadhaar_no && !/^\d{12}$/.test(data.aadhaar_no))
        e.aadhaar_no = "Aadhaar must be 12 digits";
      if (!data.gender) e.gender = "Gender  is required";
    }

    if (s === 2) {
      if (!data.father_name.trim()) e.father_name = "Father's name is required";
      if (data.parent_mobile && !/^\d{10}$/.test(data.parent_mobile))
        e.parent_mobile = "Enter a 10-digit number";
      // if (!data.emergency_contact.trim())
      //   e.emergency_contact = "Emergency contact is required";
      if (data.emergency_relationship && !data.emergency_relationship.trim())
        e.emergency_relationship = "Emergency relationship is required";
      if (data.parent_email && !/^\S+@\S+\.\S+$/.test(data.parent_email))
        e.parent_email = "Enter a valid email";
    }

    if (s === 3) {
      if (!data.permanent_address.trim()) e.permanent_address = "Required";
      if (!data.permanent_area.trim()) e.permanent_area = "Required";
      if (!data.permanent_city.trim()) e.permanent_city = "Required";
      if (!data.permanent_district.trim()) e.permanent_district = "Required";
      if (!data.permanent_state.trim()) e.permanent_state = "Required";
      if (
        data.permanent_postal_code &&
        !/^\d{6}$/.test(data.permanent_postal_code)
      )
        e.permanent_postal_code = "Enter a valid 6-digit code";

      if (!data.current_address_same_as_permanent) {
        if (!data.current_address.trim()) e.current_address = "Required";
        if (!data.current_area.trim()) e.current_area = "Required";
        if (!data.current_city.trim()) e.current_city = "Required";
        if (!data.current_district.trim()) e.current_district = "Required";
        if (!data.current_state.trim()) e.current_state = "Required";
        if (
          data.current_postal_code &&
          !/^\d{6}$/.test(data.current_postal_code)
        )
          e.current_postal_code = "Enter a valid 6-digit code";
      }
    }

    if (s === 4) {
      if (!signatureFile && !signaturePreview)
        e.signature = "Signature upload is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Navigation ── */
  const goNext = () => {
    if (!validate(step)) return;
    setDirection(1);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };
  const onStepClick = (id) => {
    if (id < step) {
      setDirection(-1);
      setStep(id);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSubmitted(false);
      setErrors({});
      setData(INIT);
      setPhotoFile(null);
      setPhotoPreview(null);
      setSignatureFile(null);
      setSignaturePreview(null);
      setDocFiles({});
      setDocMeta({});
    }, 250);
  };

  /* ── Build FormData shared by create + update ── */
  const buildFormData = () => {
    const formData = new FormData();

    // Basic Details
    formData.append("school_id", data.school_id);
    formData.append("first_name", data.first_name);
    formData.append("middle_name", data.middle_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("mobile_no", data.mobile_no);

    formData.append("date_of_birth", data.date_of_birth);
    formData.append("gender", data.gender);
    formData.append("blood_group", data.blood_group);
    formData.append("aadhaar_no", data.aadhaar_no);
    formData.append("religion", data.religion);
    formData.append("nationality", data.nationality);
    formData.append("mother_tongue", data.mother_tongue);

    // Parent Details
    formData.append("father_name", data.father_name);
    formData.append("mother_name", data.mother_name);
    formData.append("father_occupation", data.father_occupation);
    formData.append("mother_occupation", data.mother_occupation);

    formData.append("parent_mobile", data.parent_mobile);
    formData.append("alternate_mobile", data.alternate_mobile);
    formData.append("parent_email", data.parent_email);

    formData.append("emergency_contact", data.emergency_contact);
    formData.append("emergency_relationship", data.emergency_relationship);

    // Permanent Address
    formData.append("permanent_area", data.permanent_area);
    formData.append("permanent_city", data.permanent_city);
    formData.append("permanent_district", data.permanent_district);
    formData.append("permanent_state", data.permanent_state);
    formData.append("permanent_postal_code", data.permanent_postal_code);
    formData.append("permanent_address", data.permanent_address);

    // Current Address
    formData.append(
      "current_address_same_as_permanent",
      data.current_address_same_as_permanent,
    );
    formData.append("current_area", data.current_area);
    formData.append("current_city", data.current_city);
    formData.append("current_district", data.current_district);
    formData.append("current_state", data.current_state);
    formData.append("current_postal_code", data.current_postal_code);
    formData.append("current_address", data.current_address);

    // Files — only append when the user actually picked a new one.
    // In edit mode, omitting the field means "keep the existing file" on
    // the backend (adjust if your API instead expects an explicit
    // "keep_photo" / "keep_signature" flag).
    if (photoFile) formData.append("photo", photoFile);
    // if (signatureFile) formData.append("signature", signatureFile);

    DOC_KEYS.forEach(({ key }) => {
      if (docFiles[key]) formData.append(key, docFiles[key]);
    });

    return formData;
  };

  const logFormData = (formData) => {
    console.log("========== FormData ==========");

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value);
    }

    console.log("==============================");
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!validate(TOTAL_STEPS)) return;

    const formData = buildFormData();
    // logFormData(formData);
    setSubmitting(true);

    try {
      if (isEdit) {
        await dispatch(updateStudent({ id: student.id, formData })).unwrap();
        alert("Student Updated Successfully");
        onClose();
      } else {
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
        await dispatch(createStudent(formData)).unwrap();
        alert("Student Created Successfully");
        onClose();
      }
      setSubmitted(true);
    } catch (err) {
      console.log(err);
      alert(err?.message || err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Doc upload card ── */
  const DocCard = ({ docKey, label }) => {
    const f = docMeta[docKey];
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-all duration-300 ${
          f ? "sm-doc-card-filled" : "sm-doc-card"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {f ? (
            <FileCheck size={20} className="sm-doc-icon-filled shrink-0" />
          ) : (
            <Upload size={20} className="sm-doc-icon-empty shrink-0" />
          )}
          <div className="min-w-0">
            <p className="sm-doc-name text-[13px] font-semibold truncate">
              {label}
            </p>
            <p className="sm-doc-meta text-[11px] truncate">
              {f
                ? f.existing
                  ? f.name
                  : `${f.name} · ${f.size} KB`
                : "Not uploaded yet"}
            </p>
          </div>
        </div>
        {f ? (
          <button
            type="button"
            onClick={removeDoc(docKey)}
            className="sm-doc-remove shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <label className="sm-doc-upload-btn shrink-0 cursor-pointer text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors">
            Upload
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={setDoc(docKey)}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sm-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25 }}
            className="sm-panel w-full max-w-3xl rounded-3xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* ── Success screen ── */}
            {submitted ? (
              <div className="p-10 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="sm-success-circle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <Check
                    className="sm-success-icon"
                    size={30}
                    strokeWidth={2.5}
                  />
                </motion.div>
                <h2 className="sm-success-title text-xl font-bold mb-1.5">
                  {isEdit ? "Admission updated" : "Admission saved"}
                </h2>
                <p className="sm-success-desc text-[14px] mb-6">
                  {data.first_name} {data.last_name} has been successfully{" "}
                  {isEdit ? "updated" : "enrolled"}.
                </p>
                <div className="flex items-center justify-center gap-3">
                  {!isEdit && (
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setStep(1);
                        setData(INIT);
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        setSignatureFile(null);
                        setSignaturePreview(null);
                        setDocFiles({});
                        setDocMeta({});
                      }}
                      className="sm-btn-outline px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors"
                    >
                      Add another
                    </button>
                  )}
                  <button
                    onClick={resetAndClose}
                    className="sm-btn-done px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ── Header + Stepper ── */}
                <div className="sm-header px-6 sm:px-8 pt-6 pb-5 shrink-0">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h1 className="sm-title text-[19px] font-bold tracking-tight">
                        {isEdit
                          ? "Edit Student Admission"
                          : "New Student Admission"}
                      </h1>
                      <p className="sm-subtitle text-[12.5px]">
                        Step {step} of {TOTAL_STEPS} · {STEPS[step - 1].label}{" "}
                        Details
                      </p>
                    </div>
                    <button
                      onClick={resetAndClose}
                      className="sm-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Progress bar + dots */}
                  <div className="relative">
                    <div className="sm-step-track absolute top-4 left-4 right-4 h-[2px] rounded-full" />
                    <motion.div
                      className="sm-step-fill absolute top-4 left-4 h-[2px] rounded-full"
                      initial={false}
                      animate={{
                        width: `calc(${((step - 1) / (TOTAL_STEPS - 1)) * 100}% - ${((step - 1) / (TOTAL_STEPS - 1)) * 32}px)`,
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    <div className="relative flex justify-between">
                      {STEPS.map((s) => {
                        const Icon = s.icon;
                        const active = s.id === step;
                        const done = s.id < step;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onStepClick(s.id)}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <motion.div
                              animate={{ scale: active ? 1.12 : 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 20,
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                done
                                  ? "sm-step-circle-done"
                                  : active
                                    ? "sm-step-circle-active"
                                    : "sm-step-circle"
                              }`}
                            >
                              {done ? (
                                <Check size={14} strokeWidth={3} />
                              ) : (
                                <Icon size={14} />
                              )}
                            </motion.div>
                            <span
                              className={`text-[10.5px] font-medium transition-colors hidden sm:block ${
                                active
                                  ? "sm-step-label-active"
                                  : done
                                    ? "sm-step-label-done"
                                    : "sm-step-label"
                              }`}
                            >
                              {s.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Form body ── */}
                <form
                  onSubmit={handlesubmit}
                  className="px-6 sm:px-8 py-6 overflow-y-auto grow"
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {/* ═══ STEP 1 — Personal ═══ */}
                      {step === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                          {/* Photo upload */}
                          <div className="sm:col-span-2 flex justify-center mb-1">
                            <label
                              htmlFor="photo"
                              className="cursor-pointer group"
                            >
                              <div
                                className={`w-24 h-24 rounded-full overflow-hidden border-[3px] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] ${errors.photo ? "sm-photo-circle-error" : "sm-photo-circle"}`}
                              >
                                {photoPreview ? (
                                  <img
                                    src={photoPreview}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="sm-photo-placeholder text-center text-[10px] font-semibold">
                                    <Camera
                                      size={20}
                                      className="mx-auto mb-1"
                                    />
                                    Upload Photo
                                  </div>
                                )}
                              </div>
                            </label>
                            <input
                              id="photo"
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              className="hidden"
                              onChange={handlePhoto}
                              ref={fileRef}
                            />
                          </div>

                          <Field
                            label="First Name"
                            required
                            error={errors.first_name}
                          >
                            <input
                              className={tInput(errors.first_name)}
                              placeholder="Aryan"
                              value={data.first_name}
                              onChange={set("first_name")}
                            />
                          </Field>
                          <Field
                            label="Last Name"
                            required
                            error={errors.last_name}
                          >
                            <input
                              className={tInput(errors.last_name)}
                              placeholder="Kapoor"
                              value={data.last_name}
                              onChange={set("last_name")}
                            />
                          </Field>
                          <Field label="Middle Name">
                            <input
                              className={tInput()}
                              placeholder="Dev"
                              value={data.middle_name}
                              onChange={set("middle_name")}
                            />
                          </Field>
                          <Field
                            label="Email Address"
                            required
                            error={errors.email}
                          >
                            <input
                              className={tInput(errors.email)}
                              placeholder="student@school.in"
                              value={data.email}
                              onChange={set("email")}
                            />
                          </Field>
                          <Field
                            label="Date of Birth"
                            required
                            error={errors.date_of_birth}
                          >
                            <input
                              type="date"
                              className={tInput(errors.date_of_birth)}
                              value={data.date_of_birth}
                              onChange={set("date_of_birth")}
                            />
                          </Field>
                          <Field label="Auto-Calculated Age">
                            <input
                              disabled
                              className={`${tInput()} sm-input-disabled font-semibold`}
                              value={age}
                              placeholder="Enter DOB to calculate"
                            />
                          </Field>
                          <Field label="Gender" required error={errors.gender}>
                            <select
                              className={tInput()}
                              value={data.gender}
                              onChange={set("gender")}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </Field>
                          <Field label="Blood Group">
                            <select
                              className={tInput()}
                              value={data.blood_group}
                              onChange={set("blood_group")}
                            >
                              <option value="">Select Blood Group</option>
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "AB+",
                                "AB-",
                                "O+",
                                "O-",
                              ].map((b) => (
                                <option key={b}>{b}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Mobile Number" error={errors.mobile_no}>
                            <input
                              type="tel"
                              inputMode="numeric"
                              className={tInput(errors.mobile_no)}
                              placeholder="9876543210"
                              value={data.mobile_no}
                              maxLength={10}
                              onChange={handleRestrictedInput(
                                setData,
                                "mobile_no",
                                mobileNumber,
                              )}
                            />
                          </Field>
                          <Field
                            label="Aadhaar / National ID"
                            error={errors.aadhaar_no}
                          >
                            <input
                              className={tInput(errors.aadhaar_no)}
                              placeholder="12-digit number"
                              value={data.aadhaar_no}
                              onChange={handleRestrictedInput(
                                setData,
                                "aadhaar_no",
                                aadharNumber,
                              )}
                            />
                          </Field>
                          <Field label="Religion">
                            <input
                              className={tInput()}
                              placeholder="Hindu / Christian / Muslim"
                              value={data.religion}
                              onChange={set("religion")}
                            />
                          </Field>
                          <Field label="Mother Tongue">
                            <input
                              className={tInput()}
                              placeholder="Hindi / Tamil / English"
                              value={data.mother_tongue}
                              onChange={set("mother_tongue")}
                            />
                          </Field>
                        </div>
                      )}

                      {/* ═══ STEP 2 — Guardian ═══ */}
                      {step === 2 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                          <Field
                            label="Father's Full Name"
                            required
                            error={errors.father_name}
                          >
                            <input
                              className={tInput(errors.father_name)}
                              placeholder="Ramesh Kapoor"
                              value={data.father_name}
                              onChange={set("father_name")}
                            />
                          </Field>
                          <Field label="Mother's Full Name">
                            <input
                              className={tInput()}
                              placeholder="Kiran Kapoor"
                              value={data.mother_name}
                              onChange={set("mother_name")}
                            />
                          </Field>
                          <Field label="Father's Occupation">
                            <input
                              className={tInput()}
                              placeholder="Engineer / Business"
                              value={data.father_occupation}
                              onChange={set("father_occupation")}
                            />
                          </Field>
                          <Field label="Mother's Occupation">
                            <input
                              className={tInput()}
                              placeholder="Teacher / Homemaker"
                              value={data.mother_occupation}
                              onChange={set("mother_occupation")}
                            />
                          </Field>
                          <Field
                            label="Parent Mobile Number"
                            required
                            error={errors.parent_mobile}
                          >
                            <input
                              maxLength={10}
                              className={tInput(errors.parent_mobile)}
                              placeholder="10-digit number"
                              value={data.parent_mobile}
                              onChange={handleRestrictedInput(
                                setData,
                                "parent_mobile",
                                mobileNumber,
                              )}
                            />
                          </Field>
                          <Field label="Alternate Mobile Number">
                            <input
                              className={tInput()}
                              placeholder="Alternate mobile"
                              value={data.alternate_mobile}
                              onChange={handleRestrictedInput(
                                setData,
                                "alternate_mobile",
                                mobileNumber,
                              )}
                            />
                          </Field>
                          <Field
                            label="Parent Email Address"
                            error={errors.parent_email}
                          >
                            <input
                              className={tInput(errors.parent_email)}
                              placeholder="parent@domain.com"
                              value={data.parent_email}
                              onChange={set("parent_email")}
                            />
                          </Field>
                          <Field
                            label="Emergency Contact Number"
                            required
                            error={errors.emergency_contact}
                          >
                            <input
                              className={tInput(errors.emergency_contact)}
                              placeholder="Emergency number"
                              value={data.emergency_contact}
                              onChange={handleRestrictedInput(
                                setData,
                                "emergency_contact",
                                mobileNumber,
                              )}
                            />
                          </Field>
                          <Field label="Relationship with Emergency Contact">
                            <select
                              className={tInput()}
                              value={data.emergency_relationship}
                              onChange={set("emergency_relationship")}
                            >
                              <option value="">select</option>
                              <option value="FATHER">Father</option>
                              <option value="MOTHER">Mother</option>
                              <option value="UNCLE">Uncle</option>
                              <option value="GUARDIAN">Guardian</option>
                            </select>
                          </Field>
                        </div>
                      )}

                      {/* ═══ STEP 3 — Address ═══ */}
                      {step === 3 && (
                        <div className="space-y-7">
                          {/* Permanent */}
                          <div>
                            <h3 className="sm-section-heading text-sm font-bold pb-2 mb-4">
                              Permanent Address
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                              <Field
                                label="Area"
                                required
                                error={errors.permanent_area}
                              >
                                <input
                                  className={tInput(errors.permanent_area)}
                                  placeholder="Area / Locality"
                                  value={data.permanent_area}
                                  onChange={set("permanent_area")}
                                />
                              </Field>
                              <Field
                                label="City"
                                required
                                error={errors.permanent_city}
                              >
                                <input
                                  className={tInput(errors.permanent_city)}
                                  placeholder="City"
                                  value={data.permanent_city}
                                  onChange={set("permanent_city")}
                                />
                              </Field>
                              <Field
                                label="District"
                                required
                                error={errors.permanent_district}
                              >
                                <input
                                  className={tInput(errors.permanent_district)}
                                  placeholder="District"
                                  value={data.permanent_district}
                                  onChange={set("permanent_district")}
                                />
                              </Field>
                              <Field
                                label="State"
                                required
                                error={errors.permanent_state}
                              >
                                <input
                                  className={tInput(errors.permanent_state)}
                                  placeholder="State"
                                  value={data.permanent_state}
                                  onChange={set("permanent_state")}
                                />
                              </Field>
                              <Field
                                label="Postal Code"
                                required
                                error={errors.permanent_postal_code}
                              >
                                <input
                                  className={tInput(
                                    errors.permanent_postal_code,
                                  )}
                                  placeholder="600001"
                                  value={data.permanent_postal_code}
                                  onChange={handleRestrictedInput(
                                    setData,
                                    "permanent_postal_code",
                                    pincode,
                                  )}
                                />
                              </Field>
                              <div className="sm:col-span-2">
                                <Field
                                  label="Full Address"
                                  required
                                  error={errors.permanent_address}
                                >
                                  <textarea
                                    rows={2}
                                    className={tInput(errors.permanent_address)}
                                    placeholder="House No, Street, Landmark…"
                                    value={data.permanent_address}
                                    onChange={set("permanent_address")}
                                  />
                                </Field>
                              </div>
                            </div>
                          </div>

                          {/* Same-address checkbox */}
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={data.current_address_same_as_permanent}
                              onChange={(e) => {
                                const checked = e.target.checked;

                                setData((prev) => ({
                                  ...prev,
                                  current_address_same_as_permanent: checked,

                                  current_area: checked
                                    ? prev.permanent_area
                                    : prev.current_area,
                                  current_city: checked
                                    ? prev.permanent_city
                                    : prev.current_city,
                                  current_district: checked
                                    ? prev.permanent_district
                                    : prev.current_district,
                                  current_state: checked
                                    ? prev.permanent_state
                                    : prev.current_state,
                                  current_postal_code: checked
                                    ? prev.permanent_postal_code
                                    : prev.current_postal_code,
                                  current_address: checked
                                    ? prev.permanent_address
                                    : prev.current_address,
                                }));
                              }}
                            />
                            <span className="sm-checkbox-label text-[13px] font-medium">
                              Current address same as permanent address
                            </span>
                          </label>

                          {/* Current */}
                          <div>
                            <h3 className="sm-section-heading text-sm font-bold pb-2 mb-4">
                              Current Address
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                              {[
                                {
                                  key: "current_area",
                                  label: "Area",
                                  err: errors.current_area,
                                },
                                {
                                  key: "current_city",
                                  label: "City",
                                  err: errors.current_city,
                                },
                                {
                                  key: "current_district",
                                  label: "District",
                                  err: errors.current_district,
                                },
                                {
                                  key: "current_state",
                                  label: "State",
                                  err: errors.current_state,
                                },
                                {
                                  key: "current_postal_code",
                                  label: "Postal Code",
                                  err: errors.current_postal_code,
                                },
                              ].map(({ key, label, err }) => (
                                <Field
                                  key={key}
                                  label={label}
                                  required={
                                    !data.current_address_same_as_permanent
                                  }
                                  error={err}
                                >
                                  <input
                                    disabled={
                                      data.current_address_same_as_permanent
                                    }
                                    className={`${tInput(err)} ${data.current_address_same_as_permanent ? "sm-input-disabled" : ""}`}
                                    value={data[key]}
                                    // onChange={set(key)}
                                    onChange={
                                      key === "current_postal_code"
                                        ? handleRestrictedInput(
                                            setData,
                                            key,
                                            pincode,
                                          )
                                        : set(key)
                                    }
                                  />
                                </Field>
                              ))}
                              <div className="sm:col-span-2">
                                <Field
                                  label="Full Address"
                                  required={
                                    !data.current_address_same_as_permanent
                                  }
                                  error={errors.current_address}
                                >
                                  <textarea
                                    rows={2}
                                    disabled={
                                      data.current_address_same_as_permanent
                                    }
                                    className={`${tInput(errors.current_address)} ${data.current_address_same_as_permanent ? "sm-input-disabled" : ""}`}
                                    placeholder="House No, Street, Landmark…"
                                    value={data.current_address}
                                    onChange={set("current_address")}
                                  />
                                </Field>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ═══ STEP 4 — Documents ═══ */}
                      {step === 4 && (
                        <div className="flex flex-col gap-6">
                          <div>
                            <p className="sm-section-heading text-[13px] font-bold mb-3 pb-0 border-none">
                              Required Document Uploads
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {DOC_KEYS.map(({ key, label }) => (
                                <DocCard key={key} docKey={key} label={label} />
                              ))}
                            </div>
                          </div>

                          {/* Signature */}
                          <div className="sm-footer pt-4">
                            <p className="sm-field-label text-[13px] font-medium mb-2">
                              Parent / Guardian Signature{" "}
                              <span className="sm-field-required">*</span>
                            </p>
                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="sig"
                                className="sm-sig-label cursor-pointer inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3.5 py-2 rounded-lg transition-colors"
                              >
                                <Upload size={14} /> Upload Signature
                              </label>
                              <input
                                id="sig"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSig}
                                ref={sigRef}
                              />
                              {signaturePreview ? (
                                <div className="sm-sig-preview rounded-lg px-3 py-1.5 h-10 flex items-center">
                                  <img
                                    src={signaturePreview}
                                    alt="sig"
                                    className="max-h-7 max-w-[120px]"
                                  />
                                </div>
                              ) : (
                                <span
                                  className={`text-[11.5px] ${errors.signature ? "sm-sig-placeholder-error" : "sm-sig-placeholder"}`}
                                >
                                  {errors.signature ||
                                    "No signature uploaded yet."}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* ── Footer ── */}
                  <div className="sm-footer flex items-center gap-3 mt-7 pt-5">
                    {step === 1 && !isEdit && (
                      <button
                        type="button"
                        className="sm-btn-draft mr-auto inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
                      >
                        <Bookmark size={15} /> Save Draft
                      </button>
                    )}
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={goPrev}
                        className="sm-btn-prev inline-flex items-center gap-1 text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetAndClose}
                      className={`sm-btn-cancel ${step === 1 && !isEdit ? "" : "ml-auto"} text-[13.5px] font-semibold px-4 py-2.5 transition-colors`}
                    >
                      Cancel
                    </button>
                    {step < TOTAL_STEPS ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="sm-btn-next inline-flex items-center gap-1 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="sm-btn-submit inline-flex items-center gap-1.5 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm"
                      >
                        <CircleCheck size={16} />
                        {submitting
                          ? isEdit
                            ? "Updating…"
                            : "Saving…"
                          : isEdit
                            ? "Update Student"
                            : "Save Student"}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
