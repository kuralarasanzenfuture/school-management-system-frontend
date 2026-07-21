// import React, { useState, useMemo, useRef, useEffect } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { ChevronLeft, ChevronRight, Check, CircleCheck, User, Users, MapPin, FileText } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//     createStudent,
//     updateStudent,
//     getStudents,
// } from "../../../redux/student/studentSlice.js";
// import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// import { handleRestrictedInput } from "../../../common/utils/inputHandlers.js";
// import Breadcrumb from "../../../common/components/Breadcrumb.jsx";
// import StudentForm from "../components/StudentForm.jsx";
// import "../styles/StudentFormPage.css";

// const STEPS = [
//     { id: 1, label: "Personal", icon: User },
//     { id: 2, label: "Guardian", icon: Users },
//     { id: 3, label: "Address", icon: MapPin },
//     { id: 4, label: "Documents", icon: FileText },
// ];
// const TOTAL_STEPS = STEPS.length;

// const stepVariants = {
//     enter: (direction) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
//     center: { opacity: 1, x: 0 },
//     exit: (direction) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
// };

// const INIT = {
//     school_id: "",
//     first_name: "",
//     middle_name: "",
//     last_name: "",
//     email: "",
//     mobile_no: "",
//     date_of_birth: "",
//     gender: "",
//     blood_group: "",
//     aadhaar_no: "",
//     religion: "",
//     nationality: "INDIAN",
//     mother_tongue: "",

//     father_name: "",
//     mother_name: "",
//     father_occupation: "",
//     mother_occupation: "",
//     parent_mobile: "",
//     alternate_mobile: "",
//     parent_email: "",
//     emergency_contact: "",
//     emergency_relationship: "",

//     permanent_area: "",
//     permanent_city: "",
//     permanent_district: "",
//     permanent_state: "",
//     permanent_postal_code: "",
//     permanent_address: "",

//     current_address_same_as_permanent: false,
//     current_area: "",
//     current_city: "",
//     current_district: "",
//     current_state: "",
//     current_postal_code: "",
//     current_address: "",
// };

// const DOC_KEYS = [
//     "birth_certificate",
//     "transfer_certificate",
//     "aadhaar_front",
//     "aadhaar_back",
//     "previous_marksheets",
// ];

// const IMAGE_BASE_URL = "http://localhost:5000";

// export default function StudentFormPage() {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const isEdit = Boolean(id);

//     const { students, loading: studentsLoading } = useSelector((state) => state.students);
//     const student = useMemo(
//         () => (isEdit ? students?.find((s) => String(s.id) === String(id)) : null),
//         [students, id, isEdit],
//     );

//     // Direct-URL edits (refresh, shared link) may land here before the list
//     // has loaded — fetch it if it's missing.
//     useEffect(() => {
//         if (isEdit && !student && !studentsLoading) dispatch(getStudents());
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isEdit, student, studentsLoading]);

//     const [step, setStep] = useState(1);
//     const [direction, setDirection] = useState(1);
//     const [submitted, setSubmitted] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [data, setData] = useState(INIT);
//     const [hydrated, setHydrated] = useState(false);

//     const [photoFile, setPhotoFile] = useState(null);
//     const [photoPreview, setPhotoPreview] = useState(null);
//     const [signatureFile, setSignatureFile] = useState(null);
//     const [signaturePreview, setSignaturePreview] = useState(null);
//     const [docFiles, setDocFiles] = useState({});
//     const [docMeta, setDocMeta] = useState({});

//     const fileRef = useRef(null);
//     const sigRef = useRef(null);

//     const { user } = useSelector((state) => state.auth);
//     const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//     const fixedSchoolId = isAdmin ? null : user?.school_id;

//     const schools = useSelector((state) => state.schoolProfile?.schools || []);
//     const schoolsLoading = useSelector((state) => state.schoolProfile?.loading || false);

//     useEffect(() => {
//         if (isAdmin && schools.length === 0) dispatch(fetchSchools());
//     }, [dispatch, isAdmin, schools.length]);

//     /* ── Hydrate form ── */
//     useEffect(() => {
//         if (isEdit && student) {
//             setData({
//                 ...INIT,
//                 ...student,
//                 current_address_same_as_permanent: Boolean(
//                     Number(student.current_address_same_as_permanent),
//                 ),
//             });
//             setPhotoPreview(student.photo_url ? `${IMAGE_BASE_URL}${student.photo_url}` : null);
//             setSignaturePreview(
//                 student.signature_url ? `${IMAGE_BASE_URL}${student.signature_url}` : null,
//             );
//             setDocMeta({
//                 birth_certificate: student.birth_certificate_url
//                     ? { name: "Birth Certificate", url: `${IMAGE_BASE_URL}${student.birth_certificate_url}`, existing: true }
//                     : null,
//                 aadhaar_front: student.aadhaar_front_url
//                     ? { name: "Aadhaar Front", url: `${IMAGE_BASE_URL}${student.aadhaar_front_url}`, existing: true }
//                     : null,
//                 aadhaar_back: student.aadhaar_back_url
//                     ? { name: "Aadhaar Back", url: `${IMAGE_BASE_URL}${student.aadhaar_back_url}`, existing: true }
//                     : null,
//                 transfer_certificate: student.transfer_certificate_url
//                     ? { name: "Transfer Certificate", url: `${IMAGE_BASE_URL}${student.transfer_certificate_url}`, existing: true }
//                     : null,
//                 previous_marksheets: student.previous_marksheets_url
//                     ? { name: "Previous Marksheet", url: `${IMAGE_BASE_URL}${student.previous_marksheets_url}`, existing: true }
//                     : null,
//             });
//             setHydrated(true);
//         } else if (!isEdit) {
//             setData({ ...INIT, school_id: isAdmin ? "" : (fixedSchoolId ?? "") });
//             setHydrated(true);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isEdit, student]);

//     // Backfill school_id for a non-admin creating a new student, in case
//     // fixedSchoolId wasn't available yet on first render (async auth load).
//     useEffect(() => {
//         if (!isEdit && !isAdmin && fixedSchoolId) {
//             setData((d) => (d.school_id ? d : { ...d, school_id: fixedSchoolId }));
//         }
//     }, [isEdit, isAdmin, fixedSchoolId]);

//     /* ── Age auto-calc ── */
//     const age = useMemo(() => {
//         if (!data.date_of_birth) return "";
//         const birthDate = new Date(data.date_of_birth);
//         if (isNaN(birthDate)) return "";
//         const today = new Date();
//         let years = today.getFullYear() - birthDate.getFullYear();
//         const monthDiff = today.getMonth() - birthDate.getMonth();
//         if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) years--;
//         return years >= 0 ? `${years} years` : "";
//     }, [data.date_of_birth]);

//     /* ── Field setters ── */
//     const set = (fieldKey) => (event) => {
//         const value = event?.target ? event.target.value : event;

//         setData((prevData) => {
//             const updatedData = { ...prevData, [fieldKey]: value };
//             if (prevData.current_address_same_as_permanent) {
//                 const mirrorMap = {
//                     permanent_area: "current_area",
//                     permanent_city: "current_city",
//                     permanent_district: "current_district",
//                     permanent_state: "current_state",
//                     permanent_postal_code: "current_postal_code",
//                     permanent_address: "current_address",
//                 };
//                 if (mirrorMap[fieldKey]) updatedData[mirrorMap[fieldKey]] = value;
//             }
//             return updatedData;
//         });

//         setErrors((prevErrors) =>
//             prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
//         );
//     };

//     const setRestricted = (fieldKey, filterFn) => {
//         const restrictedHandler = handleRestrictedInput(setData, fieldKey, filterFn);
//         return (event) => {
//             restrictedHandler(event);
//             setErrors((prevErrors) =>
//                 prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
//             );
//         };
//     };

//     const handlePhoto = (event) => {
//         const selectedFile = event.target.files?.[0];
//         if (!selectedFile) return;
//         setPhotoFile(selectedFile);
//         setPhotoPreview(URL.createObjectURL(selectedFile));
//         setErrors((prevErrors) => ({ ...prevErrors, photo: null }));
//     };

//     const handleSig = (event) => {
//         const selectedFile = event.target.files?.[0];
//         if (!selectedFile) return;
//         setSignatureFile(selectedFile);
//         setSignaturePreview(URL.createObjectURL(selectedFile));
//         setErrors((prevErrors) => ({ ...prevErrors, signature: null }));
//     };

//     const setDoc = (docKey) => (event) => {
//         const selectedFile = event.target.files?.[0];
//         if (!selectedFile) return;
//         setDocFiles((prevDocFiles) => ({ ...prevDocFiles, [docKey]: selectedFile }));
//         setDocMeta((prevDocMeta) => ({
//             ...prevDocMeta,
//             [docKey]: { name: selectedFile.name, size: Math.round(selectedFile.size / 1024), existing: false },
//         }));
//     };

//     const removeDoc = (docKey) => () => {
//         setDocFiles((prevDocFiles) => {
//             const updatedDocFiles = { ...prevDocFiles };
//             delete updatedDocFiles[docKey];
//             return updatedDocFiles;
//         });
//         setDocMeta((prevDocMeta) => {
//             const updatedDocMeta = { ...prevDocMeta };
//             delete updatedDocMeta[docKey];
//             return updatedDocMeta;
//         });
//     };

//     /* ── Validation ── */
//     const validate = (stepNumber) => {
//         const validationErrors = {};

//         if (stepNumber === 1) {
//             if (isAdmin && !data.school_id) validationErrors.school_id = "Please select a school";
//             if (!data.first_name.trim()) validationErrors.first_name = "First name is required";
//             if (!data.last_name.trim()) validationErrors.last_name = "Last name is required";
//             if (!data.gender) validationErrors.gender = "Gender is required";
//             if (!data.date_of_birth) validationErrors.date_of_birth = "Date of birth is required";
//             if (!data.mobile_no) validationErrors.mobile_no = "Mobile number is required";
//             if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) validationErrors.email = "Enter a valid email";
//             if (data.mobile_no && !/^\d{10}$/.test(data.mobile_no)) validationErrors.mobile_no = "Enter a 10-digit number";
//             if (data.aadhaar_no && !/^\d{12}$/.test(data.aadhaar_no)) validationErrors.aadhaar_no = "Aadhaar must be 12 digits";
//         }

//         if (stepNumber === 2) {
//             if (!data.father_name.trim()) validationErrors.father_name = "Father's name is required";
//             if (!data.parent_mobile) validationErrors.parent_mobile = "Parent's mobile number is required";
//             if (data.parent_mobile && !/^\d{10}$/.test(data.parent_mobile)) validationErrors.parent_mobile = "Enter a 10-digit number";
//             if (data.alternate_mobile && !/^\d{10}$/.test(data.alternate_mobile)) validationErrors.alternate_mobile = "Enter a 10-digit number";
//             if (data.emergency_contact && !/^\d{10}$/.test(data.emergency_contact)) validationErrors.emergency_contact = "Enter a 10-digit number";
//             if (data.parent_email && !/^\S+@\S+\.\S+$/.test(data.parent_email)) validationErrors.parent_email = "Enter a valid email";
//         }

//         if (stepNumber === 3) {
//             if (!data.permanent_area.trim()) validationErrors.permanent_area = "Required";
//             if (!data.permanent_city.trim()) validationErrors.permanent_city = "Required";
//             if (!data.permanent_district.trim()) validationErrors.permanent_district = "Required";
//             if (!data.permanent_state.trim()) validationErrors.permanent_state = "Required";
//             if (!data.permanent_address.trim()) validationErrors.permanent_address = "Required";
//             if (data.permanent_postal_code && !/^\d{6}$/.test(data.permanent_postal_code))
//                 validationErrors.permanent_postal_code = "Enter a valid 6-digit code";

//             if (!data.current_address_same_as_permanent) {
//                 if (!data.current_area.trim()) validationErrors.current_area = "Required";
//                 if (!data.current_city.trim()) validationErrors.current_city = "Required";
//                 if (!data.current_district.trim()) validationErrors.current_district = "Required";
//                 if (!data.current_state.trim()) validationErrors.current_state = "Required";
//                 if (!data.current_address.trim()) validationErrors.current_address = "Required";
//                 if (data.current_postal_code && !/^\d{6}$/.test(data.current_postal_code))
//                     validationErrors.current_postal_code = "Enter a valid 6-digit code";
//             }
//         }

//         setErrors(validationErrors);
//         return Object.keys(validationErrors).length === 0;
//     };

//     /* ── Navigation ── */
//     const goNext = () => {
//         if (!validate(step)) return;
//         setDirection(1);
//         setStep((prevStep) => Math.min(TOTAL_STEPS, prevStep + 1));
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     const goPrev = () => {
//         setDirection(-1);
//         setStep((prevStep) => Math.max(1, prevStep - 1));
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     const onStepClick = (clickedStepId) => {
//         if (clickedStepId < step) {
//             setDirection(-1);
//             setStep(clickedStepId);
//         }
//     };

//     const goBackToList = () => navigate("/students");

//     /* ── Build FormData ── */
//     const buildFormData = () => {
//         const formData = new FormData();
//         const textFields = [
//             "school_id", "first_name", "middle_name", "last_name", "email", "mobile_no",
//             "date_of_birth", "gender", "blood_group", "aadhaar_no", "religion", "nationality",
//             "mother_tongue", "father_name", "mother_name", "father_occupation", "mother_occupation",
//             "parent_mobile", "alternate_mobile", "parent_email", "emergency_contact",
//             "emergency_relationship", "permanent_area", "permanent_city", "permanent_district",
//             "permanent_state", "permanent_postal_code", "permanent_address",
//             "current_address_same_as_permanent", "current_area", "current_city", "current_district",
//             "current_state", "current_postal_code", "current_address",
//         ];
//         textFields.forEach((fieldKey) => formData.append(fieldKey, data[fieldKey] ?? ""));
//         if (photoFile) formData.append("photo", photoFile);
//         DOC_KEYS.forEach((docKey) => {
//             if (docFiles[docKey]) formData.append(docKey, docFiles[docKey]);
//         });
//         return formData;
//     };

//     const handleSubmit = async () => {
//         if (!validate(TOTAL_STEPS)) return;
//         const formData = buildFormData();
//         setSubmitting(true);
//         try {
//             if (isEdit) {
//                 await dispatch(updateStudent({ id, formData })).unwrap();
//             } else {
//                 await dispatch(createStudent(formData)).unwrap();
//             }
//             dispatch(getStudents());
//             setSubmitted(true);
//         } catch (submissionError) {
//             alert(submissionError?.message ?? String(submissionError));
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const addAnother = () => {
//         setSubmitted(false);
//         setStep(1);
//         setData({ ...INIT, school_id: isAdmin ? "" : (fixedSchoolId ?? "") });
//         setPhotoFile(null);
//         setPhotoPreview(null);
//         setSignatureFile(null);
//         setSignaturePreview(null);
//         setDocFiles({});
//         setDocMeta({});
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     if (isEdit && !hydrated) {
//         return (
//             <div className="sfp-page min-h-screen p-6">
//                 <Breadcrumb items={[{ label: "Students", to: "/students" }, { label: "Edit Student" }]} />
//                 <p className="sfp-loading px-1 py-10">Loading student…</p>
//             </div>
//         );
//     }

//     return (
//         <div className="sfp-page min-h-screen p-6">
//             {/* <Breadcrumb
//                 items={[
//                     { label: "Students", to: "/students" },
//                     { label: isEdit ? "Edit Student" : "Add Student" },
//                 ]}
//             /> */}

//             <div className="sfp-card w-full max-w-3xl mx-auto rounded-3xl overflow-hidden">
//                 {submitted ? (
//                     <div className="p-10 text-center">
//                         <motion.div
//                             initial={{ scale: 0.6, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             transition={{ type: "spring", stiffness: 300, damping: 18 }}
//                             className="sfp-success-circle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
//                         >
//                             <Check className="sfp-success-icon" size={30} strokeWidth={2.5} />
//                         </motion.div>
//                         <h2 className="sfp-success-title text-xl font-bold mb-1.5">
//                             {isEdit ? "Admission updated" : "Admission saved"}
//                         </h2>
//                         <p className="sfp-success-desc text-[14px] mb-6">
//                             {data.first_name} {data.last_name} has been successfully {isEdit ? "updated" : "enrolled"}.
//                         </p>
//                         <div className="flex items-center justify-center gap-3">
//                             {!isEdit && (
//                                 <button onClick={addAnother} className="sfp-btn-outline px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">
//                                     Add another
//                                 </button>
//                             )}
//                             <button onClick={goBackToList} className="sfp-btn-done px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">
//                                 Back to Students
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     <>
//                         {/* ── Header + Stepper ── */}
//                         <div className="sfp-header px-6 sm:px-8 pt-6 pb-5">
//                             <div className="flex items-center justify-between mb-5">
//                                 <div>
//                                     <h1 className="sfp-title text-[19px] font-bold tracking-tight">
//                                         {isEdit ? "Edit Student Admission" : "New Student Admission"}
//                                     </h1>
//                                     <p className="sfp-subtitle text-[12.5px]">
//                                         Step {step} of {TOTAL_STEPS} · {STEPS[step - 1].label} Details
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={goBackToList}
//                                     className="sfp-cancel-link text-[13px] font-semibold transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>

//                             <div className="relative">
//                                 <div className="sfp-step-track absolute top-4 left-4 right-4 h-[2px] rounded-full" />
//                                 <motion.div
//                                     className="sfp-step-fill absolute top-4 left-4 h-[2px] rounded-full"
//                                     initial={false}
//                                     animate={{
//                                         width: `calc(${((step - 1) / (TOTAL_STEPS - 1)) * 100}% - ${((step - 1) / (TOTAL_STEPS - 1)) * 32}px)`,
//                                     }}
//                                     transition={{ duration: 0.4, ease: "easeOut" }}
//                                 />
//                                 <div className="relative flex justify-between">
//                                     {STEPS.map((stepItem) => {
//                                         const StepIcon = stepItem.icon;
//                                         const isActive = stepItem.id === step;
//                                         const isDone = stepItem.id < step;
//                                         return (
//                                             <button
//                                                 key={stepItem.id}
//                                                 type="button"
//                                                 onClick={() => onStepClick(stepItem.id)}
//                                                 className="flex flex-col items-center gap-1.5"
//                                             >
//                                                 <motion.div
//                                                     animate={{ scale: isActive ? 1.12 : 1 }}
//                                                     transition={{ type: "spring", stiffness: 400, damping: 20 }}
//                                                     className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isDone ? "sfp-step-circle-done" : isActive ? "sfp-step-circle-active" : "sfp-step-circle"
//                                                         }`}
//                                                 >
//                                                     {isDone ? <Check size={14} strokeWidth={3} /> : <StepIcon size={14} />}
//                                                 </motion.div>
//                                                 <span
//                                                     className={`text-[10.5px] font-medium transition-colors hidden sm:block ${isActive ? "sfp-step-label-active" : isDone ? "sfp-step-label-done" : "sfp-step-label"
//                                                         }`}
//                                                 >
//                                                     {stepItem.label}
//                                                 </span>
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* ── Step content ── */}
//                         <div className="px-6 sm:px-8 py-6">
//                             <AnimatePresence mode="wait" custom={direction}>
//                                 <motion.div
//                                     key={step}
//                                     custom={direction}
//                                     variants={stepVariants}
//                                     initial="enter"
//                                     animate="center"
//                                     exit="exit"
//                                     transition={{ duration: 0.25, ease: "easeOut" }}
//                                 >
//                                     <StudentForm
//                                         step={step}
//                                         data={data}
//                                         errors={errors}
//                                         set={set}
//                                         setRestricted={setRestricted}
//                                         setData={setData}
//                                         age={age}
//                                         isAdmin={isAdmin}
//                                         schools={schools}
//                                         schoolsLoading={schoolsLoading}
//                                         photoPreview={photoPreview}
//                                         handlePhoto={handlePhoto}
//                                         fileRef={fileRef}
//                                         signaturePreview={signaturePreview}
//                                         handleSig={handleSig}
//                                         sigRef={sigRef}
//                                         docMeta={docMeta}
//                                         setDoc={setDoc}
//                                         removeDoc={removeDoc}
//                                     />
//                                 </motion.div>
//                             </AnimatePresence>

//                             {/* ── Footer buttons ── */}
//                             <div className="sfp-footer flex items-center gap-3 mt-7 pt-5">
//                                 {step > 1 && (
//                                     <button
//                                         type="button"
//                                         onClick={goPrev}
//                                         className="sfp-btn-prev inline-flex items-center gap-1 text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
//                                     >
//                                         <ChevronLeft size={16} /> Previous
//                                     </button>
//                                 )}
//                                 <button
//                                     type="button"
//                                     onClick={goBackToList}
//                                     className={`sfp-btn-cancel ${step === 1 ? "" : "ml-auto"} text-[13.5px] font-semibold px-4 py-2.5 transition-colors`}
//                                 >
//                                     Cancel
//                                 </button>
//                                 {step < TOTAL_STEPS ? (
//                                     <button
//                                         type="button"
//                                         onClick={goNext}
//                                         className="sfp-btn-next inline-flex items-center gap-1 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm"
//                                     >
//                                         Next <ChevronRight size={16} />
//                                     </button>
//                                 ) : (
//                                     <button
//                                         type="button"
//                                         disabled={submitting}
//                                         onClick={handleSubmit}
//                                         className="sfp-btn-submit inline-flex items-center gap-1.5 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
//                                     >
//                                         <CircleCheck size={16} />
//                                         {submitting ? (isEdit ? "Updating…" : "Saving…") : isEdit ? "Update Student" : "Save Student"}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// import React, { useState, useMemo, useRef, useEffect } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { ChevronLeft, ChevronRight, Check, CircleCheck, User, Users, MapPin, FileText } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//     createStudent,
//     updateStudent,
//     getStudents,
// } from "../../../redux/student/studentSlice";
// import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice";
// import { handleRestrictedInput } from "../../../common/utils/inputHandlers";
// import StudentForm from "../components/StudentForm.jsx";
// import "../styles/StudentFormPage.css";

// const STEPS = [
//     { id: 1, label: "Personal", icon: User },
//     { id: 2, label: "Guardian", icon: Users },
//     { id: 3, label: "Address", icon: MapPin },
//     { id: 4, label: "Documents", icon: FileText },
// ];
// const TOTAL_STEPS = STEPS.length;

// const stepVariants = {
//     enter: (direction) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
//     center: { opacity: 1, x: 0 },
//     exit: (direction) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
// };

// const INIT = {
//     school_id: "",
//     first_name: "",
//     middle_name: "",
//     last_name: "",
//     email: "",
//     mobile_no: "",
//     date_of_birth: "",
//     gender: "",
//     blood_group: "",
//     aadhaar_no: "",
//     religion: "",
//     nationality: "INDIAN",
//     mother_tongue: "",

//     father_name: "",
//     mother_name: "",
//     father_occupation: "",
//     mother_occupation: "",
//     parent_mobile: "",
//     alternate_mobile: "",
//     parent_email: "",
//     emergency_contact: "",
//     emergency_relationship: "",

//     permanent_area: "",
//     permanent_city: "",
//     permanent_district: "",
//     permanent_state: "",
//     permanent_postal_code: "",
//     permanent_address: "",

//     current_address_same_as_permanent: false,
//     current_area: "",
//     current_city: "",
//     current_district: "",
//     current_state: "",
//     current_postal_code: "",
//     current_address: "",
// };

// const DOC_KEYS = [
//     "birth_certificate",
//     "transfer_certificate",
//     "aadhaar_front",
//     "aadhaar_back",
//     "previous_marksheets",
// ];

// const IMAGE_BASE_URL = "http://localhost:5000";

// export default function StudentFormPage() {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const isEdit = Boolean(id);

//     const { students, loading: studentsLoading } = useSelector((state) => state.students);
//     const student = useMemo(
//         () => (isEdit ? students?.find((s) => String(s.id) === String(id)) : null),
//         [students, id, isEdit],
//     );

//     // Direct-URL edits (refresh, shared link) may land here before the list
//     // has loaded — fetch it if it's missing.
//     useEffect(() => {
//         if (isEdit && !student && !studentsLoading) dispatch(getStudents());
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isEdit, student, studentsLoading]);

//     const [step, setStep] = useState(1);
//     const [direction, setDirection] = useState(1);
//     const [submitted, setSubmitted] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [data, setData] = useState(INIT);
//     const [hydrated, setHydrated] = useState(false);

//     const [photoFile, setPhotoFile] = useState(null);
//     const [photoPreview, setPhotoPreview] = useState(null);
//     const [signatureFile, setSignatureFile] = useState(null);
//     const [signaturePreview, setSignaturePreview] = useState(null);
//     const [docFiles, setDocFiles] = useState({});
//     const [docMeta, setDocMeta] = useState({});

//     const fileRef = useRef(null);
//     const sigRef = useRef(null);

//     const { user } = useSelector((state) => state.auth);
//     const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//     const fixedSchoolId = isAdmin ? null : user?.school_id;

//     const schools = useSelector((state) => state.schoolProfile?.schools || []);
//     const schoolsLoading = useSelector((state) => state.schoolProfile?.loading || false);

//     useEffect(() => {
//         if (isAdmin && schools.length === 0) dispatch(fetchSchools());
//     }, [dispatch, isAdmin, schools.length]);

//     /* ── Hydrate form ── */
//     useEffect(() => {
//         if (isEdit && student) {
//             setData({
//                 ...INIT,
//                 ...student,
//                 current_address_same_as_permanent: Boolean(
//                     Number(student.current_address_same_as_permanent),
//                 ),
//             });
//             setPhotoPreview(student.photo_url ? `${IMAGE_BASE_URL}${student.photo_url}` : null);
//             setSignaturePreview(
//                 student.signature_url ? `${IMAGE_BASE_URL}${student.signature_url}` : null,
//             );
//             setDocMeta({
//                 birth_certificate: student.birth_certificate_url
//                     ? { name: "Birth Certificate", url: `${IMAGE_BASE_URL}${student.birth_certificate_url}`, existing: true }
//                     : null,
//                 aadhaar_front: student.aadhaar_front_url
//                     ? { name: "Aadhaar Front", url: `${IMAGE_BASE_URL}${student.aadhaar_front_url}`, existing: true }
//                     : null,
//                 aadhaar_back: student.aadhaar_back_url
//                     ? { name: "Aadhaar Back", url: `${IMAGE_BASE_URL}${student.aadhaar_back_url}`, existing: true }
//                     : null,
//                 transfer_certificate: student.transfer_certificate_url
//                     ? { name: "Transfer Certificate", url: `${IMAGE_BASE_URL}${student.transfer_certificate_url}`, existing: true }
//                     : null,
//                 previous_marksheets: student.previous_marksheets_url
//                     ? { name: "Previous Marksheet", url: `${IMAGE_BASE_URL}${student.previous_marksheets_url}`, existing: true }
//                     : null,
//             });
//             setHydrated(true);
//         } else if (!isEdit) {
//             setData({ ...INIT, school_id: isAdmin ? "" : (fixedSchoolId ?? "") });
//             setHydrated(true);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isEdit, student]);

//     // Backfill school_id for a non-admin creating a new student, in case
//     // fixedSchoolId wasn't available yet on first render (async auth load).
//     useEffect(() => {
//         if (!isEdit && !isAdmin && fixedSchoolId) {
//             setData((d) => (d.school_id ? d : { ...d, school_id: fixedSchoolId }));
//         }
//     }, [isEdit, isAdmin, fixedSchoolId]);

//     /* ── Age auto-calc ── */
//     const age = useMemo(() => {
//         if (!data.date_of_birth) return "";
//         const birthDate = new Date(data.date_of_birth);
//         if (isNaN(birthDate)) return "";
//         const today = new Date();
//         let years = today.getFullYear() - birthDate.getFullYear();
//         const monthDiff = today.getMonth() - birthDate.getMonth();
//         if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) years--;
//         return years >= 0 ? `${years} years` : "";
//     }, [data.date_of_birth]);

//     /* ── Field setters ── */
//     const set = (fieldKey) => (event) => {
//         const value = event?.target ? event.target.value : event;

//         setData((prevData) => {
//             const updatedData = { ...prevData, [fieldKey]: value };
//             if (prevData.current_address_same_as_permanent) {
//                 const mirrorMap = {
//                     permanent_area: "current_area",
//                     permanent_city: "current_city",
//                     permanent_district: "current_district",
//                     permanent_state: "current_state",
//                     permanent_postal_code: "current_postal_code",
//                     permanent_address: "current_address",
//                 };
//                 if (mirrorMap[fieldKey]) updatedData[mirrorMap[fieldKey]] = value;
//             }
//             return updatedData;
//         });

//         setErrors((prevErrors) =>
//             prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
//         );
//     };

//     const setRestricted = (fieldKey, filterFn) => {
//         const restrictedHandler = handleRestrictedInput(setData, fieldKey, filterFn);
//         return (event) => {
//             restrictedHandler(event);
//             setErrors((prevErrors) =>
//                 prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
//             );
//         };
//     };

//     const handlePhoto = (event) => {
//         const selectedFile = event.target.files?.[0];
//         if (!selectedFile) return;
//         setPhotoFile(selectedFile);
//         setPhotoPreview(URL.createObjectURL(selectedFile));
//         setErrors((prevErrors) => ({ ...prevErrors, photo: null }));
//     };

//     const handleSig = (event) => {
//         const selectedFile = event.target.files?.[0];
//         if (!selectedFile) return;
//         setSignatureFile(selectedFile);
//         setSignaturePreview(URL.createObjectURL(selectedFile));
//         setErrors((prevErrors) => ({ ...prevErrors, signature: null }));
//     };

//     const setDoc = (docKey) => (event) => {
//         const selectedFile = event.target.files?.[0];
//         if (!selectedFile) return;
//         setDocFiles((prevDocFiles) => ({ ...prevDocFiles, [docKey]: selectedFile }));
//         setDocMeta((prevDocMeta) => ({
//             ...prevDocMeta,
//             [docKey]: { name: selectedFile.name, size: Math.round(selectedFile.size / 1024), existing: false },
//         }));
//     };

//     const removeDoc = (docKey) => () => {
//         setDocFiles((prevDocFiles) => {
//             const updatedDocFiles = { ...prevDocFiles };
//             delete updatedDocFiles[docKey];
//             return updatedDocFiles;
//         });
//         setDocMeta((prevDocMeta) => {
//             const updatedDocMeta = { ...prevDocMeta };
//             delete updatedDocMeta[docKey];
//             return updatedDocMeta;
//         });
//     };

//     /* ── Validation ── */
//     const validate = (stepNumber) => {
//         const validationErrors = {};

//         if (stepNumber === 1) {
//             if (isAdmin && !data.school_id) validationErrors.school_id = "Please select a school";
//             if (!data.first_name.trim()) validationErrors.first_name = "First name is required";
//             if (!data.last_name.trim()) validationErrors.last_name = "Last name is required";
//             if (!data.gender) validationErrors.gender = "Gender is required";
//             if (!data.date_of_birth) validationErrors.date_of_birth = "Date of birth is required";
//             if (!data.mobile_no) validationErrors.mobile_no = "Mobile number is required";
//             if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) validationErrors.email = "Enter a valid email";
//             if (data.mobile_no && !/^\d{10}$/.test(data.mobile_no)) validationErrors.mobile_no = "Enter a 10-digit number";
//             if (data.aadhaar_no && !/^\d{12}$/.test(data.aadhaar_no)) validationErrors.aadhaar_no = "Aadhaar must be 12 digits";
//         }

//         if (stepNumber === 2) {
//             if (!data.father_name.trim()) validationErrors.father_name = "Father's name is required";
//             if (!data.parent_mobile) validationErrors.parent_mobile = "Parent's mobile number is required";
//             if (data.parent_mobile && !/^\d{10}$/.test(data.parent_mobile)) validationErrors.parent_mobile = "Enter a 10-digit number";
//             if (data.alternate_mobile && !/^\d{10}$/.test(data.alternate_mobile)) validationErrors.alternate_mobile = "Enter a 10-digit number";
//             if (data.emergency_contact && !/^\d{10}$/.test(data.emergency_contact)) validationErrors.emergency_contact = "Enter a 10-digit number";
//             if (data.parent_email && !/^\S+@\S+\.\S+$/.test(data.parent_email)) validationErrors.parent_email = "Enter a valid email";
//         }

//         if (stepNumber === 3) {
//             if (!data.permanent_area.trim()) validationErrors.permanent_area = "Required";
//             if (!data.permanent_city.trim()) validationErrors.permanent_city = "Required";
//             if (!data.permanent_district.trim()) validationErrors.permanent_district = "Required";
//             if (!data.permanent_state.trim()) validationErrors.permanent_state = "Required";
//             if (!data.permanent_address.trim()) validationErrors.permanent_address = "Required";
//             if (data.permanent_postal_code && !/^\d{6}$/.test(data.permanent_postal_code))
//                 validationErrors.permanent_postal_code = "Enter a valid 6-digit code";

//             if (!data.current_address_same_as_permanent) {
//                 if (!data.current_area.trim()) validationErrors.current_area = "Required";
//                 if (!data.current_city.trim()) validationErrors.current_city = "Required";
//                 if (!data.current_district.trim()) validationErrors.current_district = "Required";
//                 if (!data.current_state.trim()) validationErrors.current_state = "Required";
//                 if (!data.current_address.trim()) validationErrors.current_address = "Required";
//                 if (data.current_postal_code && !/^\d{6}$/.test(data.current_postal_code))
//                     validationErrors.current_postal_code = "Enter a valid 6-digit code";
//             }
//         }

//         setErrors(validationErrors);
//         return Object.keys(validationErrors).length === 0;
//     };

//     /* ── Navigation ── */
//     const goNext = () => {
//         if (!validate(step)) return;
//         setDirection(1);
//         setStep((prevStep) => Math.min(TOTAL_STEPS, prevStep + 1));
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     const goPrev = () => {
//         setDirection(-1);
//         setStep((prevStep) => Math.max(1, prevStep - 1));
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     const onStepClick = (clickedStepId) => {
//         if (clickedStepId < step) {
//             setDirection(-1);
//             setStep(clickedStepId);
//         }
//     };

//     const goBackToList = () => navigate("/students");

//     /* ── Build FormData ── */
//     const buildFormData = () => {
//         const formData = new FormData();
//         const textFields = [
//             "school_id", "first_name", "middle_name", "last_name", "email", "mobile_no",
//             "date_of_birth", "gender", "blood_group", "aadhaar_no", "religion", "nationality",
//             "mother_tongue", "father_name", "mother_name", "father_occupation", "mother_occupation",
//             "parent_mobile", "alternate_mobile", "parent_email", "emergency_contact",
//             "emergency_relationship", "permanent_area", "permanent_city", "permanent_district",
//             "permanent_state", "permanent_postal_code", "permanent_address",
//             "current_address_same_as_permanent", "current_area", "current_city", "current_district",
//             "current_state", "current_postal_code", "current_address",
//         ];
//         textFields.forEach((fieldKey) => formData.append(fieldKey, data[fieldKey] ?? ""));
//         if (photoFile) formData.append("photo", photoFile);
//         DOC_KEYS.forEach((docKey) => {
//             if (docFiles[docKey]) formData.append(docKey, docFiles[docKey]);
//         });
//         return formData;
//     };

//     const handleSubmit = async () => {
//         if (!validate(TOTAL_STEPS)) return;
//         const formData = buildFormData();
//         setSubmitting(true);
//         try {
//             if (isEdit) {
//                 await dispatch(updateStudent({ id, formData })).unwrap();
//             } else {
//                 await dispatch(createStudent(formData)).unwrap();
//             }
//             dispatch(getStudents());
//             setSubmitted(true);
//         } catch (submissionError) {
//             alert(submissionError?.message ?? String(submissionError));
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const addAnother = () => {
//         setSubmitted(false);
//         setStep(1);
//         setData({ ...INIT, school_id: isAdmin ? "" : (fixedSchoolId ?? "") });
//         setPhotoFile(null);
//         setPhotoPreview(null);
//         setSignatureFile(null);
//         setSignaturePreview(null);
//         setDocFiles({});
//         setDocMeta({});
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     if (isEdit && !hydrated) {
//         return (
//             <div className="sfp-page min-h-full p-6">
//                 <p className="sfp-loading px-1 py-10">Loading student…</p>
//             </div>
//         );
//     }

//     return (
//         <div className="sfp-page min-h-full p-6">
//             <div className="sfp-card w-full rounded-3xl overflow-hidden">
//                 {submitted ? (
//                     <div className="p-10 text-center">
//                         <motion.div
//                             initial={{ scale: 0.6, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             transition={{ type: "spring", stiffness: 300, damping: 18 }}
//                             className="sfp-success-circle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
//                         >
//                             <Check className="sfp-success-icon" size={30} strokeWidth={2.5} />
//                         </motion.div>
//                         <h2 className="sfp-success-title text-xl font-bold mb-1.5">
//                             {isEdit ? "Admission updated" : "Admission saved"}
//                         </h2>
//                         <p className="sfp-success-desc text-[14px] mb-6">
//                             {data.first_name} {data.last_name} has been successfully {isEdit ? "updated" : "enrolled"}.
//                         </p>
//                         <div className="flex items-center justify-center gap-3">
//                             {!isEdit && (
//                                 <button onClick={addAnother} className="sfp-btn-outline px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">
//                                     Add another
//                                 </button>
//                             )}
//                             <button onClick={goBackToList} className="sfp-btn-done px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">
//                                 Back to Students
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     <>
//                         {/* ── Header + Stepper (scrolls away with the page — not pinned) ── */}
//                         <div className="sfp-header px-6 sm:px-8 pt-6 pb-5">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div>
//                                     <h1 className="sfp-title text-[16px] font-bold tracking-tight">
//                                         {isEdit ? "Edit Student Admission" : "New Student Admission"}
//                                     </h1>
//                                     <p className="sfp-subtitle text-[12.5px]">
//                                         Step {step} of {TOTAL_STEPS} · {STEPS[step - 1].label} Details
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={goBackToList}
//                                     className="sfp-cancel-link text-[13px] font-semibold transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>

//                             <div className="relative">
//                                 <div className="sfp-step-track absolute top-4 left-4 right-4 h-[2px] rounded-full" />
//                                 <motion.div
//                                     className="sfp-step-fill absolute top-4 left-4 h-[2px] rounded-full"
//                                     initial={false}
//                                     animate={{
//                                         width: `calc(${((step - 1) / (TOTAL_STEPS - 1)) * 100}% - ${((step - 1) / (TOTAL_STEPS - 1)) * 32}px)`,
//                                     }}
//                                     transition={{ duration: 0.4, ease: "easeOut" }}
//                                 />
//                                 <div className="relative flex justify-between">
//                                     {STEPS.map((stepItem) => {
//                                         const StepIcon = stepItem.icon;
//                                         const isActive = stepItem.id === step;
//                                         const isDone = stepItem.id < step;
//                                         return (
//                                             <button
//                                                 key={stepItem.id}
//                                                 type="button"
//                                                 onClick={() => onStepClick(stepItem.id)}
//                                                 className="flex flex-col items-center gap-1.5"
//                                             >
//                                                 <motion.div
//                                                     animate={{ scale: isActive ? 1.12 : 1 }}
//                                                     transition={{ type: "spring", stiffness: 400, damping: 20 }}
//                                                     className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isDone ? "sfp-step-circle-done" : isActive ? "sfp-step-circle-active" : "sfp-step-circle"
//                                                         }`}
//                                                 >
//                                                     {isDone ? <Check size={14} strokeWidth={3} /> : <StepIcon size={14} />}
//                                                 </motion.div>
//                                                 <span
//                                                     className={`text-[10.5px] font-medium transition-colors hidden sm:block ${isActive ? "sfp-step-label-active" : isDone ? "sfp-step-label-done" : "sfp-step-label"
//                                                         }`}
//                                                 >
//                                                     {stepItem.label}
//                                                 </span>
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* ── Step content — no internal scroll container, just flows with the page ── */}
//                         <div className="px-6 sm:px-8 py-6">
//                             <AnimatePresence mode="wait" custom={direction}>
//                                 <motion.div
//                                     key={step}
//                                     custom={direction}
//                                     variants={stepVariants}
//                                     initial="enter"
//                                     animate="center"
//                                     exit="exit"
//                                     transition={{ duration: 0.25, ease: "easeOut" }}
//                                 >
//                                     <StudentForm
//                                         step={step}
//                                         data={data}
//                                         errors={errors}
//                                         set={set}
//                                         setRestricted={setRestricted}
//                                         setData={setData}
//                                         age={age}
//                                         isAdmin={isAdmin}
//                                         schools={schools}
//                                         schoolsLoading={schoolsLoading}
//                                         photoPreview={photoPreview}
//                                         handlePhoto={handlePhoto}
//                                         fileRef={fileRef}
//                                         signaturePreview={signaturePreview}
//                                         handleSig={handleSig}
//                                         sigRef={sigRef}
//                                         docMeta={docMeta}
//                                         setDoc={setDoc}
//                                         removeDoc={removeDoc}
//                                     />
//                                 </motion.div>
//                             </AnimatePresence>

//                             {/* ── Footer buttons ── */}
//                             <div className="sfp-footer flex items-center gap-3 mt-7 pt-5">
//                                 {step > 1 && (
//                                     <button
//                                         type="button"
//                                         onClick={goPrev}
//                                         className="sfp-btn-prev inline-flex items-center gap-1 text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
//                                     >
//                                         <ChevronLeft size={16} /> Previous
//                                     </button>
//                                 )}
//                                 <button
//                                     type="button"
//                                     onClick={goBackToList}
//                                     className={`sfp-btn-cancel ${step === 1 ? "" : "ml-auto"} text-[13.5px] font-semibold px-4 py-2.5 transition-colors`}
//                                 >
//                                     Cancel
//                                 </button>
//                                 {step < TOTAL_STEPS ? (
//                                     <button
//                                         type="button"
//                                         onClick={goNext}
//                                         className="sfp-btn-next inline-flex items-center gap-1 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm"
//                                     >
//                                         Next <ChevronRight size={16} />
//                                     </button>
//                                 ) : (
//                                     <button
//                                         type="button"
//                                         disabled={submitting}
//                                         onClick={handleSubmit}
//                                         className="sfp-btn-submit inline-flex items-center gap-1.5 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
//                                     >
//                                         <CircleCheck size={16} />
//                                         {submitting ? (isEdit ? "Updating…" : "Saving…") : isEdit ? "Update Student" : "Save Student"}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

import React, { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, CircleCheck, User, Users, MapPin, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    createStudent,
    updateStudent,
    getStudents,
} from "../../../redux/student/studentSlice";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice";
import { handleRestrictedInput } from "../../../common/utils/inputHandlers";
import StudentForm from "../components/StudentForm.jsx";
import "../styles/StudentFormPage.css";

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

// Upload size caps — adjust per your backend's actual limits.
const MAX_PHOTO_MB = 2;
const MAX_SIGNATURE_MB = 1;
const MAX_DOC_MB = 5;
const toBytes = (mb) => mb * 1024 * 1024;
// Extension check, not selectedFile.type — File.type is unreliable across
// browsers/OS (can come back as "" for some filenames), so doc thumbnails
// wouldn't reliably appear if this relied on the browser-reported MIME type.
const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp)$/i;
const isImageFile = (file) => IMAGE_EXT_RE.test(file.name);

export default function StudentFormPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { students, loading: studentsLoading } = useSelector((state) => state.students);
    const student = useMemo(
        () => (isEdit ? students?.find((s) => String(s.id) === String(id)) : null),
        [students, id, isEdit],
    );

    // Direct-URL edits (refresh, shared link) may land here before the list
    // has loaded — fetch it if it's missing.
    useEffect(() => {
        if (isEdit && !student && !studentsLoading) dispatch(getStudents());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, student, studentsLoading]);

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState(INIT);
    const [hydrated, setHydrated] = useState(false);

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
    const fixedSchoolId = isAdmin ? null : user?.school_id;

    const schools = useSelector((state) => state.schoolProfile?.schools || []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading || false);

    useEffect(() => {
        if (isAdmin && schools.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schools.length]);

    /* ── Hydrate form ── */
    useEffect(() => {
        if (isEdit && student) {
            setData({
                ...INIT,
                ...student,
                current_address_same_as_permanent: Boolean(
                    Number(student.current_address_same_as_permanent),
                ),
            });
            setPhotoPreview(student.photo_url ? `${IMAGE_BASE_URL}${student.photo_url}` : null);
            setSignaturePreview(
                student.signature_url ? `${IMAGE_BASE_URL}${student.signature_url}` : null,
            );
            setDocMeta({
                birth_certificate: student.birth_certificate_url
                    ? { name: "Birth Certificate", url: `${IMAGE_BASE_URL}${student.birth_certificate_url}`, existing: true }
                    : null,
                aadhaar_front: student.aadhaar_front_url
                    ? { name: "Aadhaar Front", url: `${IMAGE_BASE_URL}${student.aadhaar_front_url}`, existing: true }
                    : null,
                aadhaar_back: student.aadhaar_back_url
                    ? { name: "Aadhaar Back", url: `${IMAGE_BASE_URL}${student.aadhaar_back_url}`, existing: true }
                    : null,
                transfer_certificate: student.transfer_certificate_url
                    ? { name: "Transfer Certificate", url: `${IMAGE_BASE_URL}${student.transfer_certificate_url}`, existing: true }
                    : null,
                previous_marksheets: student.previous_marksheets_url
                    ? { name: "Previous Marksheet", url: `${IMAGE_BASE_URL}${student.previous_marksheets_url}`, existing: true }
                    : null,
            });
            setHydrated(true);
        } else if (!isEdit) {
            setData({ ...INIT, school_id: isAdmin ? "" : (fixedSchoolId ?? "") });
            setHydrated(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, student]);

    // Backfill school_id for a non-admin creating a new student, in case
    // fixedSchoolId wasn't available yet on first render (async auth load).
    useEffect(() => {
        if (!isEdit && !isAdmin && fixedSchoolId) {
            setData((d) => (d.school_id ? d : { ...d, school_id: fixedSchoolId }));
        }
    }, [isEdit, isAdmin, fixedSchoolId]);

    /* ── Age auto-calc ── */
    const age = useMemo(() => {
        if (!data.date_of_birth) return "";
        const birthDate = new Date(data.date_of_birth);
        if (isNaN(birthDate)) return "";
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) years--;
        return years >= 0 ? `${years} years` : "";
    }, [data.date_of_birth]);

    /* ── Field setters ── */
    const set = (fieldKey) => (event) => {
        const value = event?.target ? event.target.value : event;

        setData((prevData) => {
            const updatedData = { ...prevData, [fieldKey]: value };
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

    const setRestricted = (fieldKey, filterFn) => {
        const restrictedHandler = handleRestrictedInput(setData, fieldKey, filterFn);
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
        if (selectedFile.size > toBytes(MAX_PHOTO_MB)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                photo: `File too large — max ${MAX_PHOTO_MB}MB`,
            }));
            event.target.value = ""; // allow re-selecting the same (fixed) file
            return;
        }
        setPhotoFile(selectedFile);
        setPhotoPreview(URL.createObjectURL(selectedFile));
        setErrors((prevErrors) => ({ ...prevErrors, photo: null }));
    };

    const handleSig = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;
        if (selectedFile.size > toBytes(MAX_SIGNATURE_MB)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                signature: `File too large — max ${MAX_SIGNATURE_MB}MB`,
            }));
            event.target.value = "";
            return;
        }
        setSignatureFile(selectedFile);
        setSignaturePreview(URL.createObjectURL(selectedFile));
        setErrors((prevErrors) => ({ ...prevErrors, signature: null }));
    };

    const setDoc = (docKey) => (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;
        if (selectedFile.size > toBytes(MAX_DOC_MB)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`doc_${docKey}`]: `File too large — max ${MAX_DOC_MB}MB`,
            }));
            event.target.value = "";
            return;
        }
        setErrors((prevErrors) =>
            prevErrors[`doc_${docKey}`] ? { ...prevErrors, [`doc_${docKey}`]: null } : prevErrors,
        );
        setDocFiles((prevDocFiles) => ({ ...prevDocFiles, [docKey]: selectedFile }));
        setDocMeta((prevDocMeta) => ({
            ...prevDocMeta,
            [docKey]: {
                name: selectedFile.name,
                size: Math.round(selectedFile.size / 1024),
                existing: false,
                // Only images get a preview URL — PDFs etc. just show a
                // file icon in DocCard (no lightbox for those).
                previewUrl: isImageFile(selectedFile)
                    ? URL.createObjectURL(selectedFile)
                    : null,
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
            if (updatedDocMeta[docKey]?.previewUrl) {
                URL.revokeObjectURL(updatedDocMeta[docKey].previewUrl);
            }
            delete updatedDocMeta[docKey];
            return updatedDocMeta;
        });
    };

    /* ── Validation ── */
    const validate = (stepNumber) => {
        const validationErrors = {};

        if (stepNumber === 1) {
            if (isAdmin && !data.school_id) validationErrors.school_id = "Please select a school";
            if (!data.first_name.trim()) validationErrors.first_name = "First name is required";
            if (!data.last_name.trim()) validationErrors.last_name = "Last name is required";
            if (!data.gender) validationErrors.gender = "Gender is required";
            if (!data.date_of_birth) validationErrors.date_of_birth = "Date of birth is required";
            if (!data.mobile_no) validationErrors.mobile_no = "Mobile number is required";
            if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) validationErrors.email = "Enter a valid email";
            if (data.mobile_no && !/^\d{10}$/.test(data.mobile_no)) validationErrors.mobile_no = "Enter a 10-digit number";
            if (data.aadhaar_no && !/^\d{12}$/.test(data.aadhaar_no)) validationErrors.aadhaar_no = "Aadhaar must be 12 digits";
        }

        if (stepNumber === 2) {
            if (!data.father_name.trim()) validationErrors.father_name = "Father's name is required";
            if (!data.parent_mobile) validationErrors.parent_mobile = "Parent's mobile number is required";
            if (data.parent_mobile && !/^\d{10}$/.test(data.parent_mobile)) validationErrors.parent_mobile = "Enter a 10-digit number";
            if (data.alternate_mobile && !/^\d{10}$/.test(data.alternate_mobile)) validationErrors.alternate_mobile = "Enter a 10-digit number";
            if (data.emergency_contact && !/^\d{10}$/.test(data.emergency_contact)) validationErrors.emergency_contact = "Enter a 10-digit number";
            if (data.parent_email && !/^\S+@\S+\.\S+$/.test(data.parent_email)) validationErrors.parent_email = "Enter a valid email";
        }

        if (stepNumber === 3) {
            if (!data.permanent_area.trim()) validationErrors.permanent_area = "Required";
            if (!data.permanent_city.trim()) validationErrors.permanent_city = "Required";
            if (!data.permanent_district.trim()) validationErrors.permanent_district = "Required";
            if (!data.permanent_state.trim()) validationErrors.permanent_state = "Required";
            if (!data.permanent_address.trim()) validationErrors.permanent_address = "Required";
            if (data.permanent_postal_code && !/^\d{6}$/.test(data.permanent_postal_code))
                validationErrors.permanent_postal_code = "Enter a valid 6-digit code";

            if (!data.current_address_same_as_permanent) {
                if (!data.current_area.trim()) validationErrors.current_area = "Required";
                if (!data.current_city.trim()) validationErrors.current_city = "Required";
                if (!data.current_district.trim()) validationErrors.current_district = "Required";
                if (!data.current_state.trim()) validationErrors.current_state = "Required";
                if (!data.current_address.trim()) validationErrors.current_address = "Required";
                if (data.current_postal_code && !/^\d{6}$/.test(data.current_postal_code))
                    validationErrors.current_postal_code = "Enter a valid 6-digit code";
            }
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    /* ── Navigation ── */
    const goNext = () => {
        if (!validate(step)) return;
        setDirection(1);
        setStep((prevStep) => Math.min(TOTAL_STEPS, prevStep + 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goPrev = () => {
        setDirection(-1);
        setStep((prevStep) => Math.max(1, prevStep - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onStepClick = (clickedStepId) => {
        if (clickedStepId < step) {
            setDirection(-1);
            setStep(clickedStepId);
        }
    };

    const goBackToList = () => navigate("/students");

    /* ── Build FormData ── */
    const buildFormData = () => {
        const formData = new FormData();
        const textFields = [
            "school_id", "first_name", "middle_name", "last_name", "email", "mobile_no",
            "date_of_birth", "gender", "blood_group", "aadhaar_no", "religion", "nationality",
            "mother_tongue", "father_name", "mother_name", "father_occupation", "mother_occupation",
            "parent_mobile", "alternate_mobile", "parent_email", "emergency_contact",
            "emergency_relationship", "permanent_area", "permanent_city", "permanent_district",
            "permanent_state", "permanent_postal_code", "permanent_address",
            "current_address_same_as_permanent", "current_area", "current_city", "current_district",
            "current_state", "current_postal_code", "current_address",
        ];
        textFields.forEach((fieldKey) => formData.append(fieldKey, data[fieldKey] ?? ""));
        if (photoFile) formData.append("photo", photoFile);
        DOC_KEYS.forEach((docKey) => {
            if (docFiles[docKey]) formData.append(docKey, docFiles[docKey]);
        });
        return formData;
    };

    const handleSubmit = async () => {
        if (!validate(TOTAL_STEPS)) return;
        const formData = buildFormData();
        setSubmitting(true);
        try {
            if (isEdit) {
                await dispatch(updateStudent({ id, formData })).unwrap();
            } else {
                await dispatch(createStudent(formData)).unwrap();
            }
            dispatch(getStudents());
            setSubmitted(true);
        } catch (submissionError) {
            alert(submissionError?.message ?? String(submissionError));
        } finally {
            setSubmitting(false);
        }
    };

    const addAnother = () => {
        setSubmitted(false);
        setStep(1);
        setData({ ...INIT, school_id: isAdmin ? "" : (fixedSchoolId ?? "") });
        setPhotoFile(null);
        setPhotoPreview(null);
        setSignatureFile(null);
        setSignaturePreview(null);
        setDocFiles({});
        setDocMeta({});
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (isEdit && !hydrated) {
        return (
            <div className="sfp-page min-h-full p-6">
                <p className="sfp-loading px-1 py-10">Loading student…</p>
            </div>
        );
    }

    return (
        <div className="sfp-page min-h-full p-6">
            <div className="sfp-card w-full rounded-3xl overflow-hidden">
                {submitted ? (
                    <div className="p-10 text-center">
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 18 }}
                            className="sfp-success-circle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        >
                            <Check className="sfp-success-icon" size={30} strokeWidth={2.5} />
                        </motion.div>
                        <h2 className="sfp-success-title text-xl font-bold mb-1.5">
                            {isEdit ? "Admission updated" : "Admission saved"}
                        </h2>
                        <p className="sfp-success-desc text-[14px] mb-6">
                            {data.first_name} {data.last_name} has been successfully {isEdit ? "updated" : "enrolled"}.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            {!isEdit && (
                                <button onClick={addAnother} className="sfp-btn-outline px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">
                                    Add another
                                </button>
                            )}
                            <button onClick={goBackToList} className="sfp-btn-done px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">
                                Back to Students
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Header + Stepper (scrolls away with the page — not pinned) ── */}
                        <div className="sfp-header px-6 sm:px-8 pt-6 pb-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="sfp-title text-[16px] font-bold tracking-tight">
                                        {isEdit ? "Edit Student Admission" : "New Student Admission"}
                                    </h1>
                                    <p className="sfp-subtitle text-[12.5px]">
                                        Step {step} of {TOTAL_STEPS} · {STEPS[step - 1].label} Details
                                    </p>
                                </div>
                                <button
                                    onClick={goBackToList}
                                    className="sfp-cancel-link text-[13px] font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="relative">
                                <div className="sfp-step-track absolute top-4 left-4 right-4 h-[2px] rounded-full" />
                                <motion.div
                                    className="sfp-step-fill absolute top-4 left-4 h-[2px] rounded-full"
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
                                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isDone ? "sfp-step-circle-done" : isActive ? "sfp-step-circle-active" : "sfp-step-circle"
                                                        }`}
                                                >
                                                    {isDone ? <Check size={14} strokeWidth={3} /> : <StepIcon size={14} />}
                                                </motion.div>
                                                <span
                                                    className={`text-[10.5px] font-medium transition-colors hidden sm:block ${isActive ? "sfp-step-label-active" : isDone ? "sfp-step-label-done" : "sfp-step-label"
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

                        {/* ── Step content — no internal scroll container, just flows with the page ── */}
                        <div className="px-6 sm:px-8 py-6">
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
                            <div className="sfp-footer flex items-center gap-3 mt-7 pt-5">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={goPrev}
                                        className="sfp-btn-prev inline-flex items-center gap-1 text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={16} /> Previous
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={goBackToList}
                                    className={`sfp-btn-cancel ${step === 1 ? "" : "ml-auto"} text-[13.5px] font-semibold px-4 py-2.5 transition-colors`}
                                >
                                    Cancel
                                </button>
                                {step < TOTAL_STEPS ? (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        className="sfp-btn-next inline-flex items-center gap-1 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm"
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleSubmit}
                                        className="sfp-btn-submit inline-flex items-center gap-1.5 text-[13.5px] font-semibold active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <CircleCheck size={16} />
                                        {submitting ? (isEdit ? "Updating…" : "Saving…") : isEdit ? "Update Student" : "Save Student"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}