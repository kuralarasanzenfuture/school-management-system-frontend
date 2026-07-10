import React, { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Bookmark,
  X,
  CircleCheck,
  User,
  Users,
  MapPin,
  FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createStudent,
  updateStudent,
} from "../../../redux/student/studentSlice";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice";
import { handleRestrictedInput } from "../../../common/utils/inputHandlers";
import "../styles/AddStudentModal.css";
import StudentForm from "./StudentForm.jsx";

const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Guardian", icon: Users },
  { id: 3, label: "Address", icon: MapPin },
  { id: 4, label: "Documents", icon: FileText },
];
const TOTAL_STEPS = STEPS.length;

const stepVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
};

const INIT = {
  school_id: "",
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
  "birth_certificate",
  "transfer_certificate",
  "aadhaar_front",
  "aadhaar_back",
  "previous_marksheets",
];

const IMAGE_BASE_URL = "http://localhost:5000";

export default function StudentModal({ isOpen, onClose, student = null }) {
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

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  // Non-admins only ever belong to one school — use theirs directly.
  // Admins pick a school in the dropdown instead.
  const fixedSchoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

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
      // New record: start blank, but pre-fill school_id immediately for
      // non-admins if we already know it (avoids a flash of "no school"
      // before the backfill effect below runs).
      setData({ ...INIT, school_id: isAdmin ? "" : (fixedSchoolId ?? "") });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, student]);

  // Backfill school_id for a non-admin creating a new student, in case
  // fixedSchoolId wasn't available yet when the modal first opened (async
  // auth load). Only touches a brand-new record, never an edit in
  // progress, and never overwrites something already picked.
  useEffect(() => {
    if (isOpen && !isEdit && !isAdmin && fixedSchoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: fixedSchoolId }));
    }
  }, [isOpen, isEdit, isAdmin, fixedSchoolId]);

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
      // Active regardless of anything else — an admin must not be able to
      // submit without a school, since every downstream record depends on it.
      if (isAdmin && !data.school_id) {
        validationErrors.school_id = "Please select a school";
      }

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

    // Step 4 (signature) validation intentionally left inactive, matching
    // the WIP state you had — uncomment if you want it enforced:
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

    DOC_KEYS.forEach((docKey) => {
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
                        setData({
                          ...INIT,
                          school_id: isAdmin ? "" : (fixedSchoolId ?? ""),
                        });
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
                      <StudentForm
                        step={step}
                        data={data}
                        errors={errors}
                        set={set}
                        setRestricted={setRestricted}
                        setData={setData}
                        age={age}
                        isAdmin={isAdmin}
                        schools={schools}
                        schoolsLoading={schoolsLoading}
                        photoPreview={photoPreview}
                        handlePhoto={handlePhoto}
                        fileRef={fileRef}
                        signaturePreview={signaturePreview}
                        handleSig={handleSig}
                        sigRef={sigRef}
                        docMeta={docMeta}
                        setDoc={setDoc}
                        removeDoc={removeDoc}
                      />
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
