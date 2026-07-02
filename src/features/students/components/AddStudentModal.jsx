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

const tInput = (hasError) => `${inputBase} ${hasError ? "sm-input-error" : ""}`;

const stepVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
};

const INIT = {
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

  father_name: "",
  mother_name: "",
  father_occupation: "",
  mother_occupation: "",
  parent_mobile: "",
  alternate_mobile: "",
  parent_email: "",
  emergency_contact: "",
  emergency_relationship: "",

  permanent_area: "",
  permanent_city: "",
  permanent_district: "",
  permanent_state: "",
  permanent_postal_code: "",
  permanent_address: "",

  current_address_same_as_permanent: false,
  current_area: "",
  current_city: "",
  current_district: "",
  current_state: "",
  current_postal_code: "",
  current_address: "",
};

const DOC_KEYS = [
  { key: "birth_certificate", label: "Birth Certificate" },
  { key: "transfer_certificate", label: "Transfer Certificate" },
  { key: "aadhaar_front", label: "Aadhaar Front" },
  { key: "aadhaar_back", label: "Aadhaar Back" },
  { key: "previous_marksheets", label: "Previous Marksheet" },
];

const IMAGE_BASE_URL = "http://localhost:5000";

export default function AddStudentModal({ isOpen, onClose, student = null }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(student?.id);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState(INIT);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [docFiles, setDocFiles] = useState({});
  const [docMeta, setDocMeta] = useState({});

  const fileRef = useRef(null);
  const sigRef = useRef(null);

  /* ── Hydrate form in edit mode ── */
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

      setPhotoPreview(
        student.photo_url ? `${IMAGE_BASE_URL}${student.photo_url}` : null,
      );
      setSignaturePreview(
        student.signature_url
          ? `${IMAGE_BASE_URL}${student.signature_url}`
          : null,
      );

      setDocMeta({
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
      });
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

  /* ── Age auto-calc ── */
  const age = useMemo(() => {
    if (!data.date_of_birth) return "";
    const birthDate = new Date(data.date_of_birth);
    if (isNaN(birthDate)) return "";
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      years--;
    return years >= 0 ? `${years} years` : "";
  }, [data.date_of_birth]);

  /* ── Field setters ── */

  // Standard setter: updates data AND clears that field's error
  const set = (fieldKey) => (event) => {
    const value = event?.target ? event.target.value : event;

    setData((prevData) => {
      const updatedData = { ...prevData, [fieldKey]: value };

      // Live-sync current address fields when "same as permanent" is active
      if (prevData.current_address_same_as_permanent) {
        const mirrorMap = {
          permanent_area: "current_area",
          permanent_city: "current_city",
          permanent_district: "current_district",
          permanent_state: "current_state",
          permanent_postal_code: "current_postal_code",
          permanent_address: "current_address",
        };
        if (mirrorMap[fieldKey]) updatedData[mirrorMap[fieldKey]] = value;
      }

      return updatedData;
    });

    setErrors((prevErrors) =>
      prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
    );
  };

  // Restricted setter for digits-only inputs (phone, aadhaar, pincode).
  // Wraps handleRestrictedInput so validation errors clear on keypress,
  // exactly like the standard set() helper.
  const setRestricted = (fieldKey, filterFn) => {
    const restrictedHandler = handleRestrictedInput(
      setData,
      fieldKey,
      filterFn,
    );
    return (event) => {
      restrictedHandler(event);
      setErrors((prevErrors) =>
        prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
      );
    };
  };

  const handlePhoto = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setPhotoFile(selectedFile);
    setPhotoPreview(URL.createObjectURL(selectedFile));
    setErrors((prevErrors) => ({ ...prevErrors, photo: null }));
  };

  const handleSig = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setSignatureFile(selectedFile);
    setSignaturePreview(URL.createObjectURL(selectedFile));
    setErrors((prevErrors) => ({ ...prevErrors, signature: null }));
  };

  const setDoc = (docKey) => (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setDocFiles((prevDocFiles) => ({
      ...prevDocFiles,
      [docKey]: selectedFile,
    }));
    setDocMeta((prevDocMeta) => ({
      ...prevDocMeta,
      [docKey]: {
        name: selectedFile.name,
        size: Math.round(selectedFile.size / 1024),
        existing: false,
      },
    }));
  };

  const removeDoc = (docKey) => () => {
    setDocFiles((prevDocFiles) => {
      const updatedDocFiles = { ...prevDocFiles };
      delete updatedDocFiles[docKey];
      return updatedDocFiles;
    });
    setDocMeta((prevDocMeta) => {
      const updatedDocMeta = { ...prevDocMeta };
      delete updatedDocMeta[docKey];
      return updatedDocMeta;
    });
  };

  /* ── Validation ── */
  const validate = (stepNumber) => {
    const validationErrors = {};

    if (stepNumber === 1) {
      if (!data.first_name.trim())
        validationErrors.first_name = "First name is required";
      if (!data.last_name.trim())
        validationErrors.last_name = "Last name is required";
      if (!data.gender) validationErrors.gender = "Gender is required";
      if (!data.date_of_birth)
        validationErrors.date_of_birth = "Date of birth is required";
      if (!data.mobile_no)
        validationErrors.mobile_no = "Mobile number is required";
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email))
        validationErrors.email = "Enter a valid email";
      if (data.mobile_no && !/^\d{10}$/.test(data.mobile_no))
        validationErrors.mobile_no = "Enter a 10-digit number";
      if (data.aadhaar_no && !/^\d{12}$/.test(data.aadhaar_no))
        validationErrors.aadhaar_no = "Aadhaar must be 12 digits";
    }

    if (stepNumber === 2) {
      if (!data.father_name.trim())
        validationErrors.father_name = "Father's name is required";
      if (!data.parent_mobile)
        validationErrors.parent_mobile = "Parent's mobile number is required";
      if (data.parent_mobile && !/^\d{10}$/.test(data.parent_mobile))
        validationErrors.parent_mobile = "Enter a 10-digit number";
      if (data.alternate_mobile && !/^\d{10}$/.test(data.alternate_mobile))
        validationErrors.alternate_mobile = "Enter a 10-digit number";
      if (data.emergency_contact && !/^\d{10}$/.test(data.emergency_contact))
        validationErrors.emergency_contact = "Enter a 10-digit number";
      if (data.parent_email && !/^\S+@\S+\.\S+$/.test(data.parent_email))
        validationErrors.parent_email = "Enter a valid email";
    }

    if (stepNumber === 3) {
      if (!data.permanent_area.trim())
        validationErrors.permanent_area = "Required";
      if (!data.permanent_city.trim())
        validationErrors.permanent_city = "Required";
      if (!data.permanent_district.trim())
        validationErrors.permanent_district = "Required";
      if (!data.permanent_state.trim())
        validationErrors.permanent_state = "Required";
      if (!data.permanent_address.trim())
        validationErrors.permanent_address = "Required";
      if (
        data.permanent_postal_code &&
        !/^\d{6}$/.test(data.permanent_postal_code)
      )
        validationErrors.permanent_postal_code = "Enter a valid 6-digit code";

      if (!data.current_address_same_as_permanent) {
        if (!data.current_area.trim())
          validationErrors.current_area = "Required";
        if (!data.current_city.trim())
          validationErrors.current_city = "Required";
        if (!data.current_district.trim())
          validationErrors.current_district = "Required";
        if (!data.current_state.trim())
          validationErrors.current_state = "Required";
        if (!data.current_address.trim())
          validationErrors.current_address = "Required";
        if (
          data.current_postal_code &&
          !/^\d{6}$/.test(data.current_postal_code)
        )
          validationErrors.current_postal_code = "Enter a valid 6-digit code";
      }
    }

    // if (stepNumber === 4) {
    //   if (!signatureFile && !signaturePreview)
    //     validationErrors.signature = "Signature upload is required";
    // }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  /* ── Navigation ── */
  const goNext = () => {
    if (!validate(step)) return;
    setDirection(1);
    setStep((prevStep) => Math.min(TOTAL_STEPS, prevStep + 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((prevStep) => Math.max(1, prevStep - 1));
  };

  const onStepClick = (clickedStepId) => {
    if (clickedStepId < step) {
      setDirection(-1);
      setStep(clickedStepId);
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

  /* ── Build FormData ── */
  const buildFormData = () => {
    const formData = new FormData();

    const textFields = [
      "school_id",
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "mobile_no",
      "date_of_birth",
      "gender",
      "blood_group",
      "aadhaar_no",
      "religion",
      "nationality",
      "mother_tongue",
      "father_name",
      "mother_name",
      "father_occupation",
      "mother_occupation",
      "parent_mobile",
      "alternate_mobile",
      "parent_email",
      "emergency_contact",
      "emergency_relationship",
      "permanent_area",
      "permanent_city",
      "permanent_district",
      "permanent_state",
      "permanent_postal_code",
      "permanent_address",
      "current_address_same_as_permanent",
      "current_area",
      "current_city",
      "current_district",
      "current_state",
      "current_postal_code",
      "current_address",
    ];

    textFields.forEach((fieldKey) =>
      formData.append(fieldKey, data[fieldKey] ?? ""),
    );

    if (photoFile) formData.append("photo", photoFile);

    DOC_KEYS.forEach(({ key: docKey }) => {
      if (docFiles[docKey]) formData.append(docKey, docFiles[docKey]);
    });

    return formData;
  };

  /* ── Submit handler ──
     All buttons are type="button", so pressing Enter anywhere in the
     form never triggers an accidental submission.                      ── */
  const handleSubmit = async () => {
    if (!validate(TOTAL_STEPS)) return;

    const formData = buildFormData();
    setSubmitting(true);

    try {
      if (isEdit) {
        await dispatch(updateStudent({ id: student.id, formData })).unwrap();
        resetAndClose();
      } else {
        await dispatch(createStudent(formData)).unwrap();
        resetAndClose();
      }
      setSubmitted(true);
    } catch (submissionError) {
      alert(submissionError?.message ?? String(submissionError));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Doc upload card ── */
  const DocCard = ({ docKey, label }) => {
    const docInfo = docMeta[docKey];
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-all duration-300 ${
          docInfo ? "sm-doc-card-filled" : "sm-doc-card"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {docInfo ? (
            <FileCheck size={20} className="sm-doc-icon-filled shrink-0" />
          ) : (
            <Upload size={20} className="sm-doc-icon-empty shrink-0" />
          )}
          <div className="min-w-0">
            <p className="sm-doc-name text-[13px] font-semibold truncate">
              {label}
            </p>
            <p className="sm-doc-meta text-[11px] truncate">
              {docInfo
                ? docInfo.existing
                  ? docInfo.name
                  : `${docInfo.name} · ${docInfo.size} KB`
                : "Not uploaded yet"}
            </p>
          </div>
        </div>
        {docInfo ? (
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
            onClick={(clickEvent) => clickEvent.stopPropagation()}
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

                  {/* Progress track + animated fill */}
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
                      {STEPS.map((stepItem) => {
                        const StepIcon = stepItem.icon;
                        const isActive = stepItem.id === step;
                        const isDone = stepItem.id < step;
                        return (
                          <button
                            key={stepItem.id}
                            type="button"
                            onClick={() => onStepClick(stepItem.id)}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <motion.div
                              animate={{ scale: isActive ? 1.12 : 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 20,
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                isDone
                                  ? "sm-step-circle-done"
                                  : isActive
                                    ? "sm-step-circle-active"
                                    : "sm-step-circle"
                              }`}
                            >
                              {isDone ? (
                                <Check size={14} strokeWidth={3} />
                              ) : (
                                <StepIcon size={14} />
                              )}
                            </motion.div>
                            <span
                              className={`text-[10.5px] font-medium transition-colors hidden sm:block ${
                                isActive
                                  ? "sm-step-label-active"
                                  : isDone
                                    ? "sm-step-label-done"
                                    : "sm-step-label"
                              }`}
                            >
                              {stepItem.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Step content ── */}
                <div className="px-6 sm:px-8 py-6 overflow-y-auto grow">
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
                                className={`w-24 h-24 rounded-full overflow-hidden border-[3px] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] ${
                                  errors.photo
                                    ? "sm-photo-circle-error"
                                    : "sm-photo-circle"
                                }`}
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
                          <Field label="Email Address" error={errors.email}>
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
                              className={tInput(errors.gender)}
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
                              ].map((bloodType) => (
                                <option key={bloodType}>{bloodType}</option>
                              ))}
                            </select>
                          </Field>
                          <Field
                            label="Mobile Number"
                            required
                            error={errors.mobile_no}
                          >
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              className={tInput(errors.mobile_no)}
                              placeholder="9876543210"
                              value={data.mobile_no}
                              onChange={setRestricted(
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
                              maxLength={12}
                              className={tInput(errors.aadhaar_no)}
                              placeholder="12-digit number"
                              value={data.aadhaar_no}
                              onChange={setRestricted(
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
                              onChange={setRestricted(
                                "parent_mobile",
                                mobileNumber,
                              )}
                            />
                          </Field>
                          <Field
                            label="Alternate Mobile Number"
                            error={errors.alternate_mobile}
                          >
                            <input
                              maxLength={10}
                              className={tInput(errors.alternate_mobile)}
                              placeholder="Alternate mobile"
                              value={data.alternate_mobile}
                              onChange={setRestricted(
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
                            error={errors.emergency_contact}
                          >
                            <input
                              maxLength={10}
                              className={tInput(errors.emergency_contact)}
                              placeholder="Emergency number"
                              value={data.emergency_contact}
                              onChange={setRestricted(
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
                              <option value="">Select</option>
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
                          {/* Permanent Address */}
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
                                error={errors.permanent_postal_code}
                              >
                                <input
                                  maxLength={6}
                                  className={tInput(
                                    errors.permanent_postal_code,
                                  )}
                                  placeholder="600001"
                                  value={data.permanent_postal_code}
                                  onChange={setRestricted(
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
                              onChange={(checkboxEvent) => {
                                const isChecked = checkboxEvent.target.checked;
                                setData((prevData) => ({
                                  ...prevData,
                                  current_address_same_as_permanent: isChecked,
                                  current_area: isChecked
                                    ? prevData.permanent_area
                                    : prevData.current_area,
                                  current_city: isChecked
                                    ? prevData.permanent_city
                                    : prevData.current_city,
                                  current_district: isChecked
                                    ? prevData.permanent_district
                                    : prevData.current_district,
                                  current_state: isChecked
                                    ? prevData.permanent_state
                                    : prevData.current_state,
                                  current_postal_code: isChecked
                                    ? prevData.permanent_postal_code
                                    : prevData.current_postal_code,
                                  current_address: isChecked
                                    ? prevData.permanent_address
                                    : prevData.current_address,
                                }));
                              }}
                            />
                            <span className="sm-checkbox-label text-[13px] font-medium">
                              Current address same as permanent address
                            </span>
                          </label>

                          {/* Current Address */}
                          <div>
                            <h3 className="sm-section-heading text-sm font-bold pb-2 mb-4">
                              Current Address
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                              {[
                                {
                                  fieldKey: "current_area",
                                  fieldLabel: "Area",
                                },
                                {
                                  fieldKey: "current_city",
                                  fieldLabel: "City",
                                },
                                {
                                  fieldKey: "current_district",
                                  fieldLabel: "District",
                                },
                                {
                                  fieldKey: "current_state",
                                  fieldLabel: "State",
                                },
                                {
                                  fieldKey: "current_postal_code",
                                  fieldLabel: "Postal Code",
                                },
                              ].map(({ fieldKey, fieldLabel }) => (
                                <Field
                                  key={fieldKey}
                                  label={fieldLabel}
                                  required={
                                    !data.current_address_same_as_permanent
                                  }
                                  error={errors[fieldKey]}
                                >
                                  <input
                                    disabled={
                                      data.current_address_same_as_permanent
                                    }
                                    maxLength={
                                      fieldKey === "current_postal_code"
                                        ? 6
                                        : undefined
                                    }
                                    className={`${tInput(errors[fieldKey])} ${
                                      data.current_address_same_as_permanent
                                        ? "sm-input-disabled"
                                        : ""
                                    }`}
                                    value={data[fieldKey]}
                                    onChange={
                                      fieldKey === "current_postal_code"
                                        ? setRestricted(fieldKey, pincode)
                                        : set(fieldKey)
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
                                    className={`${tInput(errors.current_address)} ${
                                      data.current_address_same_as_permanent
                                        ? "sm-input-disabled"
                                        : ""
                                    }`}
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
                              {DOC_KEYS.map(
                                ({ key: docKey, label: docLabel }) => (
                                  <DocCard
                                    key={docKey}
                                    docKey={docKey}
                                    label={docLabel}
                                  />
                                ),
                              )}
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
                                    alt="Signature"
                                    className="max-h-7 max-w-[120px]"
                                  />
                                </div>
                              ) : (
                                <span
                                  className={`text-[11.5px] ${
                                    errors.signature
                                      ? "sm-sig-placeholder-error"
                                      : "sm-sig-placeholder"
                                  }`}
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

                  {/* ── Footer buttons ── */}
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
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="sm-btn-submit inline-flex items-center gap-1.5 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
