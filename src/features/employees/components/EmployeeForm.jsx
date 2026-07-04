// import React, { useEffect, useState } from "react";
// import { Loader2, Upload, Check } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchEmployeeDesignations } from "../../../redux/employeeDesignation/employeeDesignationSlice.js";
// import { fetchDepartments } from "../../../redux/schoolSetup/department/departmentSlice.js";
// import {
//   aadharNumber,
//   handleRestrictedInput,
//   ifscCode,
//   mobileNumber,
//   numbersOnly,
//   pincode,
// } from "../../../common/utils/inputHandlers.js";

// // NOTE: fetchSchools was imported previously but never used anywhere in
// // this form (schoolId is passed in as a prop from the parent page). If you
// // actually need a school picker inside this form, say so and I'll wire it
// // up the same way Designation/Department are wired below.

// const EMPTY = {
//   first_name: "",
//   last_name: "",
//   email: "",
//   mobile: "",
//   gender: "",
//   dob: "",
//   blood_group: "",
//   aadhaar_no: "",

//   joining_date: "",
//   designation: "",
//   department: "",
//   qualification: "",
//   experience_years: "",
//   salary: "",
//   status: "active",

//   current_area: "",
//   current_city: "",
//   current_district: "",
//   current_state: "",
//   current_postal_code: "",
//   current_address: "",
//   current_address_same_as_permanent: false,

//   permanent_area: "",
//   permanent_city: "",
//   permanent_district: "",
//   permanent_state: "",
//   permanent_postal_code: "",
//   permanent_address: "",

//   emergency_contact: "",
//   emergency_relationship: "",

//   bank_name: "",
//   branch_name: "",
//   account_number: "",
//   account_type: "",
//   ifsc_code: "",

//   photo_url: "",
//   aadhaar_card_url: "",
//   pan_card_url: "",
//   passport_size_photo_url: "",
//   degree_certificate_url: "",
//   experience_certificate_url: "",
//   signature_url: "",
// };

// const RELATIONSHIPS = [
//   "wife",
//   "husband",
//   "son",
//   "daughter",
//   "friend",
//   "relative",
//   "father",
//   "mother",
//   "other",
// ];

// const DOCUMENT_FIELDS = [
//   { key: "photo_url", label: "Photo" },
//   { key: "passport_size_photo_url", label: "Passport Size Photo" },
//   { key: "signature_url", label: "Signature" },
//   { key: "aadhaar_card_url", label: "Aadhaar Card" },
//   { key: "pan_card_url", label: "PAN Card" },
//   { key: "degree_certificate_url", label: "Degree Certificate" },
//   { key: "experience_certificate_url", label: "Experience Certificate" },
// ];

// // TODO: replace with your actual file-upload API call. It should upload
// // the file and resolve with the URL your backend stores in the *_url
// // columns. Left as a stub since createEmployee/updateEmployee send plain
// // JSON, so there's a separate upload step somewhere in your stack.
// async function uploadFile(file) {
//   throw new Error(
//     "uploadFile() is not wired up yet — connect it to your file upload endpoint.",
//   );
// }

// function SectionTitle({ children }) {
//   return (
//     <h3 className="ep-section-title text-[13.5px] font-bold pb-2 mb-1">
//       {children}
//     </h3>
//   );
// }

// /**
//  * Add/edit form for a single employee. Organized into sections since the
//  * table has ~40 columns. `employee_code` is generated server-side
//  * (EMP-{school_id}-{year}-{seq}) and is never part of the payload — it's
//  * shown read-only when editing.
//  *
//  * NOTE: `designation` and `department` are stored as the *id* selected
//  * from their respective dropdowns (matching how designation is already
//  * wired). If your `employees` table actually stores the plain text name
//  * rather than a foreign key id, let me know and I'll switch these back to
//  * storing/submitting the name instead.
//  *
//  * @param {object|null} initialData
//  * @param {number} schoolId
//  * @param {(payload) => void} onSubmit
//  * @param {() => void} onCancel
//  * @param {boolean} submitting
//  */
// export default function EmployeeForm({
//   initialData = null,
//   schoolId,
//   onSubmit,
//   onCancel,
//   submitting,
// }) {
//   const dispatch = useDispatch();

//   const { employeeDesignations = [], loading: designationsLoading } = useSelector(
//     (state) => state.employeeDesignations,
//   );

//   console.log(employeeDesignations);

//   const { departments = [], loading: departmentsLoading } = useSelector(
//     (state) => state.departments,
//   );

//   useEffect(() => {
//     dispatch(fetchEmployeeDesignations());
//     dispatch(fetchDepartments());
//   }, [dispatch]);

//   const isEdit = Boolean(initialData?.id);
//   const [data, setData] = useState(EMPTY);
//   const [errors, setErrors] = useState({});
//   const [uploading, setUploading] = useState({});

//   useEffect(() => {
//     if (initialData) {
//       setData({
//         ...EMPTY,
//         ...Object.fromEntries(
//           Object.keys(EMPTY).map((key) => [
//             key,
//             initialData[key] === null || initialData[key] === undefined
//               ? EMPTY[key]
//               : key === "dob" || key === "joining_date"
//                 ? String(initialData[key]).slice(0, 10)
//                 : key === "current_address_same_as_permanent"
//                   ? Boolean(initialData[key])
//                   : String(initialData[key]),
//           ]),
//         ),
//       });
//     } else {
//       setData(EMPTY);
//     }
//     setErrors({});
//   }, [initialData]);

//   const set = (key) => (e) => {
//     setData((d) => ({ ...d, [key]: e.target.value }));
//     if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
//   };

//   const toggleSameAsPermanent = (checked) => {
//     setData((d) => ({
//       ...d,
//       current_address_same_as_permanent: checked,
//       ...(checked
//         ? {
//             permanent_area: d.current_area,
//             permanent_city: d.current_city,
//             permanent_district: d.current_district,
//             permanent_state: d.current_state,
//             permanent_postal_code: d.current_postal_code,
//             permanent_address: d.current_address,
//           }
//         : {}),
//     }));
//   };

//   const handleFileChange = (key) => async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploading((u) => ({ ...u, [key]: true }));
//     try {
//       const url = await uploadFile(file);
//       setData((d) => ({ ...d, [key]: url }));
//     } catch (err) {
//       alert(err.message || `Failed to upload ${key}`);
//     } finally {
//       setUploading((u) => ({ ...u, [key]: false }));
//     }
//   };

//   const validate = () => {
//     const e = {};
//     if (!data.first_name.trim()) e.first_name = "First name is required";
//     if (!data.mobile.trim()) e.mobile = "Mobile is required";
//     else if (!/^\d{10}$/.test(data.mobile.trim()))
//       e.mobile = "Enter a 10-digit number";

//     if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
//       e.email = "Enter a valid email";
//     }
//     if (!data.joining_date) e.joining_date = "Joining date is required";
//     if (!data.designation) e.designation = "Designation is required";

//     if (data.experience_years && Number.isNaN(Number(data.experience_years))) {
//       e.experience_years = "Must be a number";
//     }
//     if (data.salary && Number.isNaN(Number(data.salary))) {
//       e.salary = "Must be a number";
//     }
//     if (
//       data.emergency_contact &&
//       !/^\d{10}$/.test(data.emergency_contact.trim())
//     ) {
//       e.emergency_contact = "Enter a 10-digit number";
//     }

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (Object.values(uploading).some(Boolean)) return;
//     if (!validate()) return;

//     const payload = {
//       school_id: schoolId,
//       first_name: data.first_name.trim(),
//       last_name: data.last_name.trim() || null,
//       email: data.email.trim() || null,
//       mobile: data.mobile.trim(),
//       gender: data.gender || null,
//       dob: data.dob || null,
//       blood_group: data.blood_group || null,
//       aadhaar_no: data.aadhaar_no.trim() || null,

//       joining_date: data.joining_date,
//       designation: data.designation,
//       department: data.department || null,
//       qualification: data.qualification.trim() || null,
//       experience_years:
//         data.experience_years === "" ? null : Number(data.experience_years),
//       salary: data.salary === "" ? null : Number(data.salary),
//       status: data.status,

//       current_area: data.current_area.trim() || null,
//       current_city: data.current_city.trim() || null,
//       current_district: data.current_district.trim() || null,
//       current_state: data.current_state.trim() || null,
//       current_postal_code: data.current_postal_code.trim() || null,
//       current_address: data.current_address.trim() || null,
//       current_address_same_as_permanent: data.current_address_same_as_permanent,

//       permanent_area: data.permanent_area.trim() || null,
//       permanent_city: data.permanent_city.trim() || null,
//       permanent_district: data.permanent_district.trim() || null,
//       permanent_state: data.permanent_state.trim() || null,
//       permanent_postal_code: data.permanent_postal_code.trim() || null,
//       permanent_address: data.permanent_address.trim() || null,

//       emergency_contact: data.emergency_contact.trim() || null,
//       emergency_relationship: data.emergency_relationship || null,

//       bank_name: data.bank_name.trim() || null,
//       branch_name: data.branch_name.trim() || null,
//       account_number: data.account_number.trim() || null,
//       account_type: data.account_type.trim() || null,
//       ifsc_code: data.ifsc_code.trim() || null,

//       photo_url: data.photo_url || null,
//       aadhaar_card_url: data.aadhaar_card_url || null,
//       pan_card_url: data.pan_card_url || null,
//       passport_size_photo_url: data.passport_size_photo_url || null,
//       degree_certificate_url: data.degree_certificate_url || null,
//       experience_certificate_url: data.experience_certificate_url || null,
//       signature_url: data.signature_url || null,
//     };

//     onSubmit(payload);
//   };

//   const inputCls = (key) =>
//     `ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "ep-input-error" : ""}`;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//       {isEdit && initialData?.employee_code && (
//         <div className="flex items-center gap-2">
//           <span className="ep-code-badge px-2.5 py-1 rounded-full text-[12px] font-semibold">
//             {initialData.employee_code}
//           </span>
//         </div>
//       )}

//       {/* Basic Info */}
//       <div>
//         <SectionTitle>Basic Info</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               First Name <span className="ep-field-required">*</span>
//             </label>
//             <input
//               autoFocus
//               className={inputCls("first_name")}
//               value={data.first_name}
//               onChange={set("first_name")}
//             />
//             <div className="h-4">
//               {errors.first_name && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.first_name}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Last Name
//             </label>
//             <input
//               className={inputCls("last_name")}
//               value={data.last_name}
//               onChange={set("last_name")}
//             />
//             <div className="h-4" />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Mobile <span className="ep-field-required">*</span>
//             </label>
//             <input
//               className={inputCls("mobile")}
//               placeholder="1234567890"
//               value={data.mobile}
//               onChange={handleRestrictedInput(setData, "mobile", mobileNumber)}
//             />
//             <div className="h-4">
//               {errors.mobile && (
//                 <p className="ep-field-error text-[11px]">{errors.mobile}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Email
//             </label>
//             <input
//               className={inputCls("email")}
//               placeholder="name@example.com"
//               value={data.email}
//               onChange={set("email")}
//             />
//             <div className="h-4">
//               {errors.email && (
//                 <p className="ep-field-error text-[11px]">{errors.email}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Gender
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.gender}
//               onChange={set("gender")}
//             >
//               <option value="">Select…</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Date of Birth
//             </label>
//             <input
//               type="date"
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.dob}
//               onChange={set("dob")}
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Blood Group
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.blood_group}
//               onChange={set("blood_group")}
//             >
//               <option value="">Select Blood Group</option>
//               <option value="A+">A+</option>
//               <option value="A-">A-</option>
//               <option value="B+">B+</option>
//               <option value="B-">B-</option>
//               <option value="AB+">AB+</option>
//               <option value="AB-">AB-</option>
//               <option value="O+">O+</option>
//               <option value="O-">O-</option>
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Aadhaar Number
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.aadhaar_no}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "aadhaar_no",
//                 aadharNumber,
//               )}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Employment */}
//       <div>
//         <SectionTitle>Employment</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Joining Date <span className="ep-field-required">*</span>
//             </label>
//             <input
//               type="date"
//               className={inputCls("joining_date")}
//               value={data.joining_date}
//               onChange={set("joining_date")}
//             />
//             <div className="h-4">
//               {errors.joining_date && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.joining_date}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Designation <span className="ep-field-required">*</span>
//             </label>
//             <select
//               className={inputCls("designation")}
//               value={data.designation}
//               onChange={set("designation")}
//               disabled={designationsLoading}
//             >
//               <option value="">
//                 {designationsLoading ? "Loading..." : "Select Designation"}
//               </option>
//               {employeeDesignations.map((designation) => (
//                 <option key={designation.id} value={designation.id}>
//                   {designation.name}
//                 </option>
//               ))}
//             </select>
//             <div className="h-4">
//               {errors.designation && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.designation}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Department
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.department}
//               onChange={set("department")}
//               disabled={departmentsLoading}
//             >
//               <option value="">
//                 {departmentsLoading ? "Loading..." : "Select Department"}
//               </option>
//               {departments.map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Qualification
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.qualification}
//               onChange={set("qualification")}
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Experience (years)
//             </label>
//             <input
//               type="number"
//               step="0.1"
//               min="0"
//               className={inputCls("experience_years")}
//               value={data.experience_years}
//               onChange={set("experience_years")}
//             />
//             <div className="h-4">
//               {errors.experience_years && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.experience_years}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Salary
//             </label>
//             <input
//               type="number"
//               step="0.01"
//               min="0"
//               className={inputCls("salary")}
//               value={data.salary}
//               onChange={set("salary")}
//             />
//             <div className="h-4">
//               {errors.salary && (
//                 <p className="ep-field-error text-[11px]">{errors.salary}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5 mt-4">
//           <label className="ep-field-label text-[13px] font-medium">
//             Status
//           </label>
//           <div className="flex flex-wrap gap-2">
//             {["active", "inactive", "resigned", "terminated"].map((s) => (
//               <button
//                 key={s}
//                 type="button"
//                 onClick={() => setData((d) => ({ ...d, status: s }))}
//                 className={`ep-status-toggle rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
//                   data.status === s
//                     ? s === "active"
//                       ? "ep-status-toggle-active"
//                       : "ep-status-toggle-inactive"
//                     : ""
//                 }`}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Current Address */}
//       <div>
//         <SectionTitle>Current Address</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5 sm:col-span-2">
//             <label className="ep-field-label text-[13px] font-medium">
//               Address
//             </label>
//             <textarea
//               rows={2}
//               className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
//               value={data.current_address}
//               onChange={set("current_address")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Area
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_area}
//               onChange={set("current_area")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               City
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_city}
//               onChange={set("current_city")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               District
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_district}
//               onChange={set("current_district")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               State
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_state}
//               onChange={set("current_state")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Postal Code
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_postal_code}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "current_postal_code",
//                 pincode,
//               )}
//             />
//           </div>
//         </div>

//         <label
//           className={`ep-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors mt-4 ${
//             data.current_address_same_as_permanent
//               ? "ep-checkbox-row-checked"
//               : ""
//           }`}
//         >
//           <input
//             type="checkbox"
//             className="ep-checkbox w-4 h-4 rounded"
//             checked={data.current_address_same_as_permanent}
//             onChange={(e) => toggleSameAsPermanent(e.target.checked)}
//           />
//           Permanent address is the same as current address
//         </label>
//       </div>

//       {/* Permanent Address */}
//       {!data.current_address_same_as_permanent && (
//         <div>
//           <SectionTitle>Permanent Address</SectionTitle>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//             <div className="flex flex-col gap-1.5 sm:col-span-2">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Address
//               </label>
//               <textarea
//                 rows={2}
//                 className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
//                 value={data.permanent_address}
//                 onChange={set("permanent_address")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Area
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_area}
//                 onChange={set("permanent_area")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 City
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_city}
//                 onChange={set("permanent_city")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 District
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_district}
//                 onChange={set("permanent_district")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 State
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_state}
//                 onChange={set("permanent_state")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Postal Code
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_postal_code}
//                 onChange={handleRestrictedInput(
//                   setData,
//                   "permanent_postal_code",
//                   pincode,
//                 )}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Emergency Contact */}
//       <div>
//         <SectionTitle>Emergency Contact</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Contact Number
//             </label>
//             <input
//               className={inputCls("emergency_contact")}
//               placeholder="1234567890"
//               value={data.emergency_contact}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "emergency_contact",
//                 mobileNumber,
//               )}
//             />
//             <div className="h-4">
//               {errors.emergency_contact && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.emergency_contact}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Relationship
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.emergency_relationship}
//               onChange={set("emergency_relationship")}
//             >
//               <option value="">Select…</option>
//               {RELATIONSHIPS.map((r) => (
//                 <option key={r} value={r}>
//                   {r.charAt(0).toUpperCase() + r.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Bank Details */}
//       <div>
//         <SectionTitle>Bank Details</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Bank Name
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.bank_name}
//               onChange={set("bank_name")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Branch Name
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.branch_name}
//               onChange={set("branch_name")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Account Number
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.account_number}
//               // onChange={set("account_number")}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "account_number",
//                 numbersOnly,
//               )}
//             />
//           </div>
//           {/* <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Account Type
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               placeholder="Savings / Current"
//               value={data.account_type}
//               onChange={set("account_type")}
//             />
//           </div> */}
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Account Type
//             </label>

//             <select
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.account_type}
//               onChange={set("account_type")}
//             >
//               <option value="">Select Account Type</option>
//               <option value="SAVINGS">Savings</option>
//               <option value="CURRENT">Current</option>
//               <option value="SALARY">Salary</option>
//               <option value="FD">Fixed Deposit (FD)</option>
//               <option value="RD">Recurring Deposit (RD)</option>
//               <option value="NRE">NRE</option>
//               <option value="NRO">NRO</option>
//               <option value="FCNR">FCNR</option>
//               <option value="JOINT">Joint</option>
//               <option value="MINOR">Minor</option>
//             </select>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               IFSC Code
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.ifsc_code}
//               // onChange={set("ifsc_code")}
//               onChange={handleRestrictedInput(setData, "ifsc_code", ifscCode)}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Documents */}
//       <div>
//         <SectionTitle>Documents</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           {DOCUMENT_FIELDS.map(({ key, label }) => (
//             <div key={key} className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 {label}
//               </label>
//               <label className="ep-upload-box flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] cursor-pointer transition-colors">
//                 {uploading[key] ? (
//                   <Loader2 size={15} className="animate-spin" />
//                 ) : data[key] ? (
//                   <Check size={15} />
//                 ) : (
//                   <Upload size={15} />
//                 )}
//                 <span className="ep-upload-filename truncate">
//                   {data[key] ? data[key].split("/").pop() : "Choose file…"}
//                 </span>
//                 <input
//                   type="file"
//                   className="hidden"
//                   onChange={handleFileChange(key)}
//                 />
//               </label>
//             </div>
//           ))}
//         </div>
//         <p className="ep-field-hint text-[11px] mt-2">
//           File uploads need to be connected to your storage endpoint — see the{" "}
//           <code>uploadFile()</code> stub in this component.
//         </p>
//       </div>

//       <div className="ep-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="ep-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={submitting || Object.values(uploading).some(Boolean)}
//           className="ep-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
//         >
//           {submitting && <Loader2 size={14} className="animate-spin" />}
//           {isEdit ? "Update Employee" : "Create Employee"}
//         </button>
//       </div>
//     </form>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { Loader2, Upload, Check } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchEmployeeDesignations } from "../../../redux/employeeDesignation/employeeDesignationSlice.js";
// import { fetchDepartments } from "../../../redux/schoolSetup/department/departmentSlice.js";
// import {
//   aadharNumber,
//   handleRestrictedInput,
//   ifscCode,
//   mobileNumber,
//   numbersOnly,
//   pincode,
// } from "../../../common/utils/inputHandlers.js";

// const EMPTY = {
//   first_name: "",
//   last_name: "",
//   email: "",
//   mobile: "",
//   gender: "",
//   dob: "",
//   blood_group: "",
//   aadhaar_no: "",

//   joining_date: "",
//   designation: "",
//   department: "",
//   qualification: "",
//   experience_years: "",
//   salary: "",
//   status: "active",

//   current_area: "",
//   current_city: "",
//   current_district: "",
//   current_state: "",
//   current_postal_code: "",
//   current_address: "",
//   current_address_same_as_permanent: false,

//   permanent_area: "",
//   permanent_city: "",
//   permanent_district: "",
//   permanent_state: "",
//   permanent_postal_code: "",
//   permanent_address: "",

//   emergency_contact: "",
//   emergency_relationship: "",

//   bank_name: "",
//   branch_name: "",
//   account_number: "",
//   account_type: "",
//   ifsc_code: "",

//   photo_url: "",
//   aadhaar_card_url: "",
//   pan_card_url: "",
//   passport_size_photo_url: "",
//   degree_certificate_url: "",
//   experience_certificate_url: "",
//   signature_url: "",
// };

// const RELATIONSHIPS = [
//   "wife",
//   "husband",
//   "son",
//   "daughter",
//   "friend",
//   "relative",
//   "father",
//   "mother",
//   "other",
// ];

// // `key` = the *_url field this maps to in local form state / existing record.
// // `fieldName` = the exact multer field name from employeeUpload on the
// // backend (router.post("/", employeeUpload, createEmployee)). These must
// // match exactly or multer will silently drop the file.
// const DOCUMENT_FIELDS = [
//   { key: "photo_url", fieldName: "photo", label: "Photo" },
//   {
//     key: "passport_size_photo_url",
//     fieldName: "passport_size_photo",
//     label: "Passport Size Photo",
//   },
//   { key: "signature_url", fieldName: "signature", label: "Signature" },
//   { key: "aadhaar_card_url", fieldName: "aadhaar_card", label: "Aadhaar Card" },
//   { key: "pan_card_url", fieldName: "pan_card", label: "PAN Card" },
//   {
//     key: "degree_certificate_url",
//     fieldName: "degree_certificate",
//     label: "Degree Certificate",
//   },
//   {
//     key: "experience_certificate_url",
//     fieldName: "experience_certificate",
//     label: "Experience Certificate",
//   },
// ];

// function SectionTitle({ children }) {
//   return (
//     <h3 className="ep-section-title text-[13.5px] font-bold pb-2 mb-1">
//       {children}
//     </h3>
//   );
// }

// /**
//  * Add/edit form for a single employee. Organized into sections since the
//  * table has ~40 columns. `employee_code` is generated server-side
//  * (EMP-{school_id}-{year}-{seq}) and is never part of the payload — it's
//  * shown read-only when editing.
//  *
//  * FILE UPLOADS: the backend route is
//  *   router.post("/", employeeUpload, createEmployee)
//  * where employeeUpload = multer.fields([...]) sits directly on the
//  * create/update route — there is no separate "upload a file, get a URL
//  * back" endpoint. So files are NOT uploaded on selection; they're kept as
//  * raw File objects in `files` state and sent together with the rest of
//  * the form fields in one multipart FormData on submit. `onSubmit` now
//  * receives a FormData instance instead of a plain object — the parent
//  * thunk needs to POST this as multipart/form-data (i.e. do not manually
//  * set a JSON Content-Type header on that request, and make sure no
//  * axios interceptor forces one).
//  *
//  * NOTE: `designation` and `department` are stored as the *id* selected
//  * from their respective dropdowns (matching how designation is already
//  * wired). If your `employees` table actually stores the plain text name
//  * rather than a foreign key id, let me know and I'll switch these back to
//  * storing/submitting the name instead.
//  *
//  * @param {object|null} initialData
//  * @param {number} schoolId
//  * @param {(formData: FormData) => void} onSubmit
//  * @param {() => void} onCancel
//  * @param {boolean} submitting
//  */
// export default function EmployeeForm({
//   initialData = null,
//   schoolId,
//   onSubmit,
//   onCancel,
//   submitting,
// }) {
//   const dispatch = useDispatch();

//   const { employeeDesignations = [], loading: designationsLoading } =
//     useSelector((state) => state.employeeDesignations);

//   const { departments = [], loading: departmentsLoading } = useSelector(
//     (state) => state.departments,
//   );

//   useEffect(() => {
//     dispatch(fetchEmployeeDesignations());
//     dispatch(fetchDepartments());
//   }, [dispatch]);

//   const isEdit = Boolean(initialData?.id);
//   const [data, setData] = useState(EMPTY);
//   const [errors, setErrors] = useState({});

//   // Newly-selected files only, keyed by the *_url key (e.g. "photo_url").
//   // If a field is absent here while editing, the existing URL on the
//   // record is left untouched — we simply don't send that field at all.
//   const [files, setFiles] = useState({});

//   useEffect(() => {
//     if (initialData) {
//       setData({
//         ...EMPTY,
//         ...Object.fromEntries(
//           Object.keys(EMPTY).map((key) => [
//             key,
//             initialData[key] === null || initialData[key] === undefined
//               ? EMPTY[key]
//               : key === "dob" || key === "joining_date"
//                 ? String(initialData[key]).slice(0, 10)
//                 : key === "current_address_same_as_permanent"
//                   ? Boolean(initialData[key])
//                   : String(initialData[key]),
//           ]),
//         ),
//       });
//     } else {
//       setData(EMPTY);
//     }
//     setFiles({});
//     setErrors({});
//   }, [initialData]);

//   const set = (key) => (e) => {
//     setData((d) => ({ ...d, [key]: e.target.value }));
//     if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
//   };

//   const toggleSameAsPermanent = (checked) => {
//     setData((d) => ({
//       ...d,
//       current_address_same_as_permanent: checked,
//       ...(checked
//         ? {
//             permanent_area: d.current_area,
//             permanent_city: d.current_city,
//             permanent_district: d.current_district,
//             permanent_state: d.current_state,
//             permanent_postal_code: d.current_postal_code,
//             permanent_address: d.current_address,
//           }
//         : {}),
//     }));
//   };

//   const handleFileChange = (key) => (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setFiles((f) => ({ ...f, [key]: file }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!data.first_name.trim()) e.first_name = "First name is required";
//     if (!data.mobile.trim()) e.mobile = "Mobile is required";
//     else if (!/^\d{10}$/.test(data.mobile.trim()))
//       e.mobile = "Enter a 10-digit number";

//     if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
//       e.email = "Enter a valid email";
//     }
//     if (!data.joining_date) e.joining_date = "Joining date is required";
//     if (!data.designation) e.designation = "Designation is required";

//     if (data.experience_years && Number.isNaN(Number(data.experience_years))) {
//       e.experience_years = "Must be a number";
//     }
//     if (data.salary && Number.isNaN(Number(data.salary))) {
//       e.salary = "Must be a number";
//     }
//     if (
//       data.emergency_contact &&
//       !/^\d{10}$/.test(data.emergency_contact.trim())
//     ) {
//       e.emergency_contact = "Enter a 10-digit number";
//     }

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     const formData = new FormData();

//     formData.append("school_id", schoolId);
//     formData.append("first_name", data.first_name.trim());
//     formData.append("last_name", data.last_name.trim() || "");
//     formData.append("email", data.email.trim() || "");
//     formData.append("mobile", data.mobile.trim());
//     formData.append("gender", data.gender || "");
//     formData.append("dob", data.dob || "");
//     formData.append("blood_group", data.blood_group || "");
//     formData.append("aadhaar_no", data.aadhaar_no.trim() || "");

//     formData.append("joining_date", data.joining_date);
//     formData.append("designation", data.designation);
//     formData.append("department", data.department || "");
//     formData.append("qualification", data.qualification.trim() || "");
//     formData.append(
//       "experience_years",
//       data.experience_years === "" ? "" : Number(data.experience_years),
//     );
//     formData.append("salary", data.salary === "" ? "" : Number(data.salary));
//     formData.append("status", data.status);

//     formData.append("current_area", data.current_area.trim() || "");
//     formData.append("current_city", data.current_city.trim() || "");
//     formData.append("current_district", data.current_district.trim() || "");
//     formData.append("current_state", data.current_state.trim() || "");
//     formData.append(
//       "current_postal_code",
//       data.current_postal_code.trim() || "",
//     );
//     formData.append("current_address", data.current_address.trim() || "");
//     formData.append(
//       "current_address_same_as_permanent",
//       data.current_address_same_as_permanent,
//     );

//     formData.append("permanent_area", data.permanent_area.trim() || "");
//     formData.append("permanent_city", data.permanent_city.trim() || "");
//     formData.append(
//       "permanent_district",
//       data.permanent_district.trim() || "",
//     );
//     formData.append("permanent_state", data.permanent_state.trim() || "");
//     formData.append(
//       "permanent_postal_code",
//       data.permanent_postal_code.trim() || "",
//     );
//     formData.append(
//       "permanent_address",
//       data.permanent_address.trim() || "",
//     );

//     formData.append(
//       "emergency_contact",
//       data.emergency_contact.trim() || "",
//     );
//     formData.append(
//       "emergency_relationship",
//       data.emergency_relationship || "",
//     );

//     formData.append("bank_name", data.bank_name.trim() || "");
//     formData.append("branch_name", data.branch_name.trim() || "");
//     formData.append("account_number", data.account_number.trim() || "");
//     formData.append("account_type", data.account_type.trim() || "");
//     formData.append("ifsc_code", data.ifsc_code.trim() || "");

//     // Only append files that were actually (re)selected this session —
//     // matches the exact field names multer expects.
//     DOCUMENT_FIELDS.forEach(({ key, fieldName }) => {
//       if (files[key]) {
//         formData.append(fieldName, files[key]);
//       }
//     });

//     onSubmit(formData);
//   };

//   const inputCls = (key) =>
//     `ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "ep-input-error" : ""}`;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//       {isEdit && initialData?.employee_code && (
//         <div className="flex items-center gap-2">
//           <span className="ep-code-badge px-2.5 py-1 rounded-full text-[12px] font-semibold">
//             {initialData.employee_code}
//           </span>
//         </div>
//       )}

//       {/* Basic Info */}
//       <div>
//         <SectionTitle>Basic Info</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               First Name <span className="ep-field-required">*</span>
//             </label>
//             <input
//               autoFocus
//               className={inputCls("first_name")}
//               value={data.first_name}
//               onChange={set("first_name")}
//             />
//             <div className="h-4">
//               {errors.first_name && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.first_name}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Last Name
//             </label>
//             <input
//               className={inputCls("last_name")}
//               value={data.last_name}
//               onChange={set("last_name")}
//             />
//             <div className="h-4" />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Mobile <span className="ep-field-required">*</span>
//             </label>
//             <input
//               className={inputCls("mobile")}
//               placeholder="1234567890"
//               value={data.mobile}
//               onChange={handleRestrictedInput(setData, "mobile", mobileNumber)}
//             />
//             <div className="h-4">
//               {errors.mobile && (
//                 <p className="ep-field-error text-[11px]">{errors.mobile}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Email
//             </label>
//             <input
//               className={inputCls("email")}
//               placeholder="name@example.com"
//               value={data.email}
//               onChange={set("email")}
//             />
//             <div className="h-4">
//               {errors.email && (
//                 <p className="ep-field-error text-[11px]">{errors.email}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Gender
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.gender}
//               onChange={set("gender")}
//             >
//               <option value="">Select…</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Date of Birth
//             </label>
//             <input
//               type="date"
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.dob}
//               onChange={set("dob")}
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Blood Group
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.blood_group}
//               onChange={set("blood_group")}
//             >
//               <option value="">Select Blood Group</option>
//               <option value="A+">A+</option>
//               <option value="A-">A-</option>
//               <option value="B+">B+</option>
//               <option value="B-">B-</option>
//               <option value="AB+">AB+</option>
//               <option value="AB-">AB-</option>
//               <option value="O+">O+</option>
//               <option value="O-">O-</option>
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Aadhaar Number
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.aadhaar_no}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "aadhaar_no",
//                 aadharNumber,
//               )}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Employment */}
//       <div>
//         <SectionTitle>Employment</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Joining Date <span className="ep-field-required">*</span>
//             </label>
//             <input
//               type="date"
//               className={inputCls("joining_date")}
//               value={data.joining_date}
//               onChange={set("joining_date")}
//             />
//             <div className="h-4">
//               {errors.joining_date && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.joining_date}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Designation <span className="ep-field-required">*</span>
//             </label>
//             <select
//               className={inputCls("designation")}
//               value={data.designation}
//               onChange={set("designation")}
//               disabled={designationsLoading}
//             >
//               <option value="">
//                 {designationsLoading ? "Loading..." : "Select Designation"}
//               </option>
//               {employeeDesignations.map((designation) => (
//                 <option key={designation.id} value={designation.id}>
//                   {designation.name}
//                 </option>
//               ))}
//             </select>
//             <div className="h-4">
//               {errors.designation && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.designation}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Department
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.department}
//               onChange={set("department")}
//               disabled={departmentsLoading}
//             >
//               <option value="">
//                 {departmentsLoading ? "Loading..." : "Select Department"}
//               </option>
//               {departments.map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Qualification
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.qualification}
//               onChange={set("qualification")}
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Experience (years)
//             </label>
//             <input
//               type="number"
//               step="0.1"
//               min="0"
//               className={inputCls("experience_years")}
//               value={data.experience_years}
//               onChange={set("experience_years")}
//             />
//             <div className="h-4">
//               {errors.experience_years && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.experience_years}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Salary
//             </label>
//             <input
//               type="number"
//               step="0.01"
//               min="0"
//               className={inputCls("salary")}
//               value={data.salary}
//               onChange={set("salary")}
//             />
//             <div className="h-4">
//               {errors.salary && (
//                 <p className="ep-field-error text-[11px]">{errors.salary}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5 mt-4">
//           <label className="ep-field-label text-[13px] font-medium">
//             Status
//           </label>
//           <div className="flex flex-wrap gap-2">
//             {["active", "inactive", "resigned", "terminated"].map((s) => (
//               <button
//                 key={s}
//                 type="button"
//                 onClick={() => setData((d) => ({ ...d, status: s }))}
//                 className={`ep-status-toggle rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
//                   data.status === s
//                     ? s === "active"
//                       ? "ep-status-toggle-active"
//                       : "ep-status-toggle-inactive"
//                     : ""
//                 }`}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Current Address */}
//       <div>
//         <SectionTitle>Current Address</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5 sm:col-span-2">
//             <label className="ep-field-label text-[13px] font-medium">
//               Address
//             </label>
//             <textarea
//               rows={2}
//               className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
//               value={data.current_address}
//               onChange={set("current_address")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Area
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_area}
//               onChange={set("current_area")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               City
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_city}
//               onChange={set("current_city")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               District
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_district}
//               onChange={set("current_district")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               State
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_state}
//               onChange={set("current_state")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Postal Code
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_postal_code}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "current_postal_code",
//                 pincode,
//               )}
//             />
//           </div>
//         </div>

//         <label
//           className={`ep-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors mt-4 ${
//             data.current_address_same_as_permanent
//               ? "ep-checkbox-row-checked"
//               : ""
//           }`}
//         >
//           <input
//             type="checkbox"
//             className="ep-checkbox w-4 h-4 rounded"
//             checked={data.current_address_same_as_permanent}
//             onChange={(e) => toggleSameAsPermanent(e.target.checked)}
//           />
//           Permanent address is the same as current address
//         </label>
//       </div>

//       {/* Permanent Address */}
//       {!data.current_address_same_as_permanent && (
//         <div>
//           <SectionTitle>Permanent Address</SectionTitle>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//             <div className="flex flex-col gap-1.5 sm:col-span-2">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Address
//               </label>
//               <textarea
//                 rows={2}
//                 className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
//                 value={data.permanent_address}
//                 onChange={set("permanent_address")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Area
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_area}
//                 onChange={set("permanent_area")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 City
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_city}
//                 onChange={set("permanent_city")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 District
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_district}
//                 onChange={set("permanent_district")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 State
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_state}
//                 onChange={set("permanent_state")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Postal Code
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_postal_code}
//                 onChange={handleRestrictedInput(
//                   setData,
//                   "permanent_postal_code",
//                   pincode,
//                 )}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Emergency Contact */}
//       <div>
//         <SectionTitle>Emergency Contact</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Contact Number
//             </label>
//             <input
//               className={inputCls("emergency_contact")}
//               placeholder="1234567890"
//               value={data.emergency_contact}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "emergency_contact",
//                 mobileNumber,
//               )}
//             />
//             <div className="h-4">
//               {errors.emergency_contact && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.emergency_contact}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Relationship
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.emergency_relationship}
//               onChange={set("emergency_relationship")}
//             >
//               <option value="">Select…</option>
//               {RELATIONSHIPS.map((r) => (
//                 <option key={r} value={r}>
//                   {r.charAt(0).toUpperCase() + r.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Bank Details */}
//       <div>
//         <SectionTitle>Bank Details</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Bank Name
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.bank_name}
//               onChange={set("bank_name")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Branch Name
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.branch_name}
//               onChange={set("branch_name")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Account Number
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.account_number}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "account_number",
//                 numbersOnly,
//               )}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Account Type
//             </label>

//             <select
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.account_type}
//               onChange={set("account_type")}
//             >
//               <option value="">Select Account Type</option>
//               <option value="SAVINGS">Savings</option>
//               <option value="CURRENT">Current</option>
//               <option value="SALARY">Salary</option>
//               <option value="FD">Fixed Deposit (FD)</option>
//               <option value="RD">Recurring Deposit (RD)</option>
//               <option value="NRE">NRE</option>
//               <option value="NRO">NRO</option>
//               <option value="FCNR">FCNR</option>
//               <option value="JOINT">Joint</option>
//               <option value="MINOR">Minor</option>
//             </select>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               IFSC Code
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.ifsc_code}
//               onChange={handleRestrictedInput(setData, "ifsc_code", ifscCode)}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Documents */}
//       <div>
//         <SectionTitle>Documents</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           {DOCUMENT_FIELDS.map(({ key, label }) => {
//             const pickedFile = files[key];
//             const existingUrl = data[key];
//             const displayName = pickedFile
//               ? pickedFile.name
//               : existingUrl
//                 ? existingUrl.split("/").pop()
//                 : "Choose file…";

//             return (
//               <div key={key} className="flex flex-col gap-1.5">
//                 <label className="ep-field-label text-[13px] font-medium">
//                   {label}
//                 </label>
//                 <label className="ep-upload-box flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] cursor-pointer transition-colors">
//                   {pickedFile || existingUrl ? (
//                     <Check size={15} />
//                   ) : (
//                     <Upload size={15} />
//                   )}
//                   <span className="ep-upload-filename truncate">
//                     {displayName}
//                   </span>
//                   <input
//                     type="file"
//                     className="hidden"
//                     onChange={handleFileChange(key)}
//                   />
//                 </label>
//               </div>
//             );
//           })}
//         </div>
//         <p className="ep-field-hint text-[11px] mt-2">
//           Files are uploaded together with the rest of the form when you
//           submit — nothing uploads until you click{" "}
//           {isEdit ? "Update Employee" : "Create Employee"}.
//         </p>
//       </div>

//       <div className="ep-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="ep-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={submitting}
//           className="ep-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
//         >
//           {submitting && <Loader2 size={14} className="animate-spin" />}
//           {isEdit ? "Update Employee" : "Create Employee"}
//         </button>
//       </div>
//     </form>
//   );
// }

// import React, { useEffect, useRef, useState } from "react";
// import { Loader2, Upload, Check, Eye, X, FileText } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchEmployeeDesignations } from "../../../redux/employeeDesignation/employeeDesignationSlice.js";
// import { fetchDepartments } from "../../../redux/schoolSetup/department/departmentSlice.js";
// import {
//   aadharNumber,
//   handleRestrictedInput,
//   ifscCode,
//   mobileNumber,
//   numbersOnly,
//   pincode,
// } from "../../../common/utils/inputHandlers.js";

// const EMPTY = {
//   first_name: "",
//   last_name: "",
//   email: "",
//   mobile: "",
//   gender: "",
//   dob: "",
//   blood_group: "",
//   aadhaar_no: "",

//   joining_date: "",
//   designation: "",
//   department: "",
//   qualification: "",
//   experience_years: "",
//   salary: "",
//   status: "active",

//   current_area: "",
//   current_city: "",
//   current_district: "",
//   current_state: "",
//   current_postal_code: "",
//   current_address: "",
//   current_address_same_as_permanent: false,

//   permanent_area: "",
//   permanent_city: "",
//   permanent_district: "",
//   permanent_state: "",
//   permanent_postal_code: "",
//   permanent_address: "",

//   emergency_contact: "",
//   emergency_relationship: "",

//   bank_name: "",
//   branch_name: "",
//   account_number: "",
//   account_type: "",
//   ifsc_code: "",

//   photo_url: "",
//   aadhaar_card_url: "",
//   pan_card_url: "",
//   passport_size_photo_url: "",
//   degree_certificate_url: "",
//   experience_certificate_url: "",
//   signature_url: "",
// };

// const RELATIONSHIPS = [
//   "wife",
//   "husband",
//   "son",
//   "daughter",
//   "friend",
//   "relative",
//   "father",
//   "mother",
//   "other",
// ];

// // `key` = the *_url field this maps to in local form state / existing record.
// // `fieldName` = the exact multer field name from employeeUpload on the
// // backend (router.post("/", employeeUpload, createEmployee)). These must
// // match exactly or multer will silently drop the file.
// const DOCUMENT_FIELDS = [
//   { key: "photo_url", fieldName: "photo", label: "Photo" },
//   {
//     key: "passport_size_photo_url",
//     fieldName: "passport_size_photo",
//     label: "Passport Size Photo",
//   },
//   { key: "signature_url", fieldName: "signature", label: "Signature" },
//   { key: "aadhaar_card_url", fieldName: "aadhaar_card", label: "Aadhaar Card" },
//   { key: "pan_card_url", fieldName: "pan_card", label: "PAN Card" },
//   {
//     key: "degree_certificate_url",
//     fieldName: "degree_certificate",
//     label: "Degree Certificate",
//   },
//   {
//     key: "experience_certificate_url",
//     fieldName: "experience_certificate",
//     label: "Experience Certificate",
//   },
// ];

// function SectionTitle({ children }) {
//   return (
//     <h3 className="ep-section-title text-[13.5px] font-bold pb-2 mb-1">
//       {children}
//     </h3>
//   );
// }

// function isImageUrl(url) {
//   return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url || "");
// }

// /**
//  * Add/edit form for a single employee. Organized into sections since the
//  * table has ~40 columns. `employee_code` is generated server-side
//  * (EMP-{school_id}-{year}-{seq}) and is never part of the payload — it's
//  * shown read-only when editing.
//  *
//  * FILE UPLOADS: the backend route is
//  *   router.post("/", employeeUpload, createEmployee)
//  * where employeeUpload = multer.fields([...]) sits directly on the
//  * create/update route — there is no separate "upload a file, get a URL
//  * back" endpoint. So files are NOT uploaded on selection; they're kept as
//  * raw File objects in `files` state and sent together with the rest of
//  * the form fields in one multipart FormData on submit. `onSubmit` now
//  * receives a FormData instance instead of a plain object — the parent
//  * thunk needs to POST this as multipart/form-data (i.e. do not manually
//  * set a JSON Content-Type header on that request, and make sure no
//  * axios interceptor forces one).
//  *
//  * NOTE: `designation` and `department` are stored as the *id* selected
//  * from their respective dropdowns (matching how designation is already
//  * wired). If your `employees` table actually stores the plain text name
//  * rather than a foreign key id, let me know and I'll switch these back to
//  * storing/submitting the name instead.
//  *
//  * @param {object|null} initialData
//  * @param {number} schoolId
//  * @param {(formData: FormData) => void} onSubmit
//  * @param {() => void} onCancel
//  * @param {boolean} submitting
//  */
// export default function EmployeeForm({
//   initialData = null,
//   schoolId,
//   onSubmit,
//   onCancel,
//   submitting,
// }) {
//   const dispatch = useDispatch();

//   const { employeeDesignations = [], loading: designationsLoading } =
//     useSelector((state) => state.employeeDesignations);

//   const { departments = [], loading: departmentsLoading } = useSelector(
//     (state) => state.departments,
//   );

//   useEffect(() => {
//     dispatch(fetchEmployeeDesignations());
//     dispatch(fetchDepartments());
//   }, [dispatch]);

//   const isEdit = Boolean(initialData?.id);
//   const [data, setData] = useState(EMPTY);
//   const [errors, setErrors] = useState({});

//   // Newly-selected files only, keyed by the *_url key (e.g. "photo_url").
//   // If a field is absent here while editing, the existing URL on the
//   // record is left untouched — we simply don't send that field at all.
//   const [files, setFiles] = useState({});

//   // Local object: URLs for newly-picked files, so we can show an instant
//   // thumbnail/lightbox without waiting on an upload round-trip.
//   const [previewUrls, setPreviewUrls] = useState({});
//   const [lightboxUrl, setLightboxUrl] = useState(null);

//   // Track the latest previewUrls in a ref so the unmount cleanup effect
//   // below can revoke whatever is current at teardown time, not whatever
//   // was current when the effect was first set up.
//   const previewUrlsRef = useRef({});
//   useEffect(() => {
//     previewUrlsRef.current = previewUrls;
//   }, [previewUrls]);

//   useEffect(() => {
//     return () => {
//       Object.values(previewUrlsRef.current).forEach((url) =>
//         URL.revokeObjectURL(url),
//       );
//     };
//   }, []);

//   useEffect(() => {
//     if (initialData) {
//       setData({
//         ...EMPTY,
//         ...Object.fromEntries(
//           Object.keys(EMPTY).map((key) => [
//             key,
//             initialData[key] === null || initialData[key] === undefined
//               ? EMPTY[key]
//               : key === "dob" || key === "joining_date"
//                 ? String(initialData[key]).slice(0, 10)
//                 : key === "current_address_same_as_permanent"
//                   ? Boolean(initialData[key])
//                   : String(initialData[key]),
//           ]),
//         ),
//       });
//     } else {
//       setData(EMPTY);
//     }

//     // Revoke any leftover object URLs from the previous record before
//     // clearing selections for the new one.
//     setPreviewUrls((prev) => {
//       Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
//       return {};
//     });
//     setFiles({});
//     setErrors({});
//   }, [initialData]);

//   const set = (key) => (e) => {
//     setData((d) => ({ ...d, [key]: e.target.value }));
//     if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
//   };

//   const toggleSameAsPermanent = (checked) => {
//     setData((d) => ({
//       ...d,
//       current_address_same_as_permanent: checked,
//       ...(checked
//         ? {
//             permanent_area: d.current_area,
//             permanent_city: d.current_city,
//             permanent_district: d.current_district,
//             permanent_state: d.current_state,
//             permanent_postal_code: d.current_postal_code,
//             permanent_address: d.current_address,
//           }
//         : {}),
//     }));
//   };

//   const handleFileChange = (key) => (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setFiles((f) => ({ ...f, [key]: file }));

//     setPreviewUrls((prev) => {
//       if (prev[key]) URL.revokeObjectURL(prev[key]);
//       return { ...prev, [key]: URL.createObjectURL(file) };
//     });
//   };

//   // Clears a picked file (and, client-side, the existing URL for that
//   // field). NOTE: this only affects local form state — it does NOT tell
//   // the backend to delete the previously-uploaded file, since your
//   // employeeUpload route only handles new uploads. If you want removal
//   // to actually delete the stored file/DB value, the backend needs a way
//   // to receive that signal (e.g. a `remove_photo=true` field) — let me
//   // know and I'll add that once you confirm the backend supports it.
//   const handleRemoveFile = (key) => () => {
//     setFiles((f) => {
//       const next = { ...f };
//       delete next[key];
//       return next;
//     });
//     setPreviewUrls((prev) => {
//       if (prev[key]) URL.revokeObjectURL(prev[key]);
//       const next = { ...prev };
//       delete next[key];
//       return next;
//     });
//     setData((d) => ({ ...d, [key]: "" }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!data.first_name.trim()) e.first_name = "First name is required";
//     if (!data.mobile.trim()) e.mobile = "Mobile is required";
//     else if (!/^\d{10}$/.test(data.mobile.trim()))
//       e.mobile = "Enter a 10-digit number";

//     if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
//       e.email = "Enter a valid email";
//     }
//     if (!data.joining_date) e.joining_date = "Joining date is required";
//     if (!data.designation) e.designation = "Designation is required";

//     if (data.experience_years && Number.isNaN(Number(data.experience_years))) {
//       e.experience_years = "Must be a number";
//     }
//     if (data.salary && Number.isNaN(Number(data.salary))) {
//       e.salary = "Must be a number";
//     }
//     if (
//       data.emergency_contact &&
//       !/^\d{10}$/.test(data.emergency_contact.trim())
//     ) {
//       e.emergency_contact = "Enter a 10-digit number";
//     }

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     const formData = new FormData();

//     formData.append("school_id", schoolId);
//     formData.append("first_name", data.first_name.trim());
//     formData.append("last_name", data.last_name.trim() || "");
//     formData.append("email", data.email.trim() || "");
//     formData.append("mobile", data.mobile.trim());
//     formData.append("gender", data.gender || "");
//     formData.append("dob", data.dob || "");
//     formData.append("blood_group", data.blood_group || "");
//     formData.append("aadhaar_no", data.aadhaar_no.trim() || "");

//     formData.append("joining_date", data.joining_date);
//     formData.append("designation", data.designation);
//     formData.append("department", data.department || "");
//     formData.append("qualification", data.qualification.trim() || "");
//     formData.append(
//       "experience_years",
//       data.experience_years === "" ? "" : Number(data.experience_years),
//     );
//     formData.append("salary", data.salary === "" ? "" : Number(data.salary));
//     formData.append("status", data.status);

//     formData.append("current_area", data.current_area.trim() || "");
//     formData.append("current_city", data.current_city.trim() || "");
//     formData.append("current_district", data.current_district.trim() || "");
//     formData.append("current_state", data.current_state.trim() || "");
//     formData.append(
//       "current_postal_code",
//       data.current_postal_code.trim() || "",
//     );
//     formData.append("current_address", data.current_address.trim() || "");
//     formData.append(
//       "current_address_same_as_permanent",
//       data.current_address_same_as_permanent,
//     );

//     formData.append("permanent_area", data.permanent_area.trim() || "");
//     formData.append("permanent_city", data.permanent_city.trim() || "");
//     formData.append(
//       "permanent_district",
//       data.permanent_district.trim() || "",
//     );
//     formData.append("permanent_state", data.permanent_state.trim() || "");
//     formData.append(
//       "permanent_postal_code",
//       data.permanent_postal_code.trim() || "",
//     );
//     formData.append(
//       "permanent_address",
//       data.permanent_address.trim() || "",
//     );

//     formData.append(
//       "emergency_contact",
//       data.emergency_contact.trim() || "",
//     );
//     formData.append(
//       "emergency_relationship",
//       data.emergency_relationship || "",
//     );

//     formData.append("bank_name", data.bank_name.trim() || "");
//     formData.append("branch_name", data.branch_name.trim() || "");
//     formData.append("account_number", data.account_number.trim() || "");
//     formData.append("account_type", data.account_type.trim() || "");
//     formData.append("ifsc_code", data.ifsc_code.trim() || "");

//     // Only append files that were actually (re)selected this session —
//     // matches the exact field names multer expects.
//     DOCUMENT_FIELDS.forEach(({ key, fieldName }) => {
//       if (files[key]) {
//         formData.append(fieldName, files[key]);
//       }
//     });

//     onSubmit(formData);
//   };

//   const inputCls = (key) =>
//     `ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "ep-input-error" : ""}`;

//   return (
//     <>
//     <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//       {isEdit && initialData?.employee_code && (
//         <div className="flex items-center gap-2">
//           <span className="ep-code-badge px-2.5 py-1 rounded-full text-[12px] font-semibold">
//             {initialData.employee_code}
//           </span>
//         </div>
//       )}

//       {/* Basic Info */}
//       <div>
//         <SectionTitle>Basic Info</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               First Name <span className="ep-field-required">*</span>
//             </label>
//             <input
//               autoFocus
//               className={inputCls("first_name")}
//               value={data.first_name}
//               onChange={set("first_name")}
//             />
//             <div className="h-4">
//               {errors.first_name && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.first_name}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Last Name
//             </label>
//             <input
//               className={inputCls("last_name")}
//               value={data.last_name}
//               onChange={set("last_name")}
//             />
//             <div className="h-4" />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Mobile <span className="ep-field-required">*</span>
//             </label>
//             <input
//               className={inputCls("mobile")}
//               placeholder="1234567890"
//               value={data.mobile}
//               onChange={handleRestrictedInput(setData, "mobile", mobileNumber)}
//             />
//             <div className="h-4">
//               {errors.mobile && (
//                 <p className="ep-field-error text-[11px]">{errors.mobile}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Email
//             </label>
//             <input
//               className={inputCls("email")}
//               placeholder="name@example.com"
//               value={data.email}
//               onChange={set("email")}
//             />
//             <div className="h-4">
//               {errors.email && (
//                 <p className="ep-field-error text-[11px]">{errors.email}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Gender
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.gender}
//               onChange={set("gender")}
//             >
//               <option value="">Select…</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Date of Birth
//             </label>
//             <input
//               type="date"
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.dob}
//               onChange={set("dob")}
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Blood Group
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.blood_group}
//               onChange={set("blood_group")}
//             >
//               <option value="">Select Blood Group</option>
//               <option value="A+">A+</option>
//               <option value="A-">A-</option>
//               <option value="B+">B+</option>
//               <option value="B-">B-</option>
//               <option value="AB+">AB+</option>
//               <option value="AB-">AB-</option>
//               <option value="O+">O+</option>
//               <option value="O-">O-</option>
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Aadhaar Number
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.aadhaar_no}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "aadhaar_no",
//                 aadharNumber,
//               )}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Employment */}
//       <div>
//         <SectionTitle>Employment</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Joining Date <span className="ep-field-required">*</span>
//             </label>
//             <input
//               type="date"
//               className={inputCls("joining_date")}
//               value={data.joining_date}
//               onChange={set("joining_date")}
//             />
//             <div className="h-4">
//               {errors.joining_date && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.joining_date}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Designation <span className="ep-field-required">*</span>
//             </label>
//             <select
//               className={inputCls("designation")}
//               value={data.designation}
//               onChange={set("designation")}
//               disabled={designationsLoading}
//             >
//               <option value="">
//                 {designationsLoading ? "Loading..." : "Select Designation"}
//               </option>
//               {employeeDesignations.map((designation) => (
//                 <option key={designation.id} value={designation.id}>
//                   {designation.name}
//                 </option>
//               ))}
//             </select>
//             <div className="h-4">
//               {errors.designation && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.designation}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Department
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.department}
//               onChange={set("department")}
//               disabled={departmentsLoading}
//             >
//               <option value="">
//                 {departmentsLoading ? "Loading..." : "Select Department"}
//               </option>
//               {departments.map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Qualification
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.qualification}
//               onChange={set("qualification")}
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Experience (years)
//             </label>
//             <input
//               type="number"
//               step="0.1"
//               min="0"
//               className={inputCls("experience_years")}
//               value={data.experience_years}
//               onChange={set("experience_years")}
//             />
//             <div className="h-4">
//               {errors.experience_years && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.experience_years}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Salary
//             </label>
//             <input
//               type="number"
//               step="0.01"
//               min="0"
//               className={inputCls("salary")}
//               value={data.salary}
//               onChange={set("salary")}
//             />
//             <div className="h-4">
//               {errors.salary && (
//                 <p className="ep-field-error text-[11px]">{errors.salary}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5 mt-4">
//           <label className="ep-field-label text-[13px] font-medium">
//             Status
//           </label>
//           <div className="flex flex-wrap gap-2">
//             {["active", "inactive", "resigned", "terminated"].map((s) => (
//               <button
//                 key={s}
//                 type="button"
//                 onClick={() => setData((d) => ({ ...d, status: s }))}
//                 className={`ep-status-toggle rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
//                   data.status === s
//                     ? s === "active"
//                       ? "ep-status-toggle-active"
//                       : "ep-status-toggle-inactive"
//                     : ""
//                 }`}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Current Address */}
//       <div>
//         <SectionTitle>Current Address</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5 sm:col-span-2">
//             <label className="ep-field-label text-[13px] font-medium">
//               Address
//             </label>
//             <textarea
//               rows={2}
//               className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
//               value={data.current_address}
//               onChange={set("current_address")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Area
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_area}
//               onChange={set("current_area")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               City
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_city}
//               onChange={set("current_city")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               District
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_district}
//               onChange={set("current_district")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               State
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_state}
//               onChange={set("current_state")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Postal Code
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.current_postal_code}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "current_postal_code",
//                 pincode,
//               )}
//             />
//           </div>
//         </div>

//         <label
//           className={`ep-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors mt-4 ${
//             data.current_address_same_as_permanent
//               ? "ep-checkbox-row-checked"
//               : ""
//           }`}
//         >
//           <input
//             type="checkbox"
//             className="ep-checkbox w-4 h-4 rounded"
//             checked={data.current_address_same_as_permanent}
//             onChange={(e) => toggleSameAsPermanent(e.target.checked)}
//           />
//           Permanent address is the same as current address
//         </label>
//       </div>

//       {/* Permanent Address */}
//       {!data.current_address_same_as_permanent && (
//         <div>
//           <SectionTitle>Permanent Address</SectionTitle>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//             <div className="flex flex-col gap-1.5 sm:col-span-2">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Address
//               </label>
//               <textarea
//                 rows={2}
//                 className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
//                 value={data.permanent_address}
//                 onChange={set("permanent_address")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Area
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_area}
//                 onChange={set("permanent_area")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 City
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_city}
//                 onChange={set("permanent_city")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 District
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_district}
//                 onChange={set("permanent_district")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 State
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_state}
//                 onChange={set("permanent_state")}
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="ep-field-label text-[13px] font-medium">
//                 Postal Code
//               </label>
//               <input
//                 className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//                 value={data.permanent_postal_code}
//                 onChange={handleRestrictedInput(
//                   setData,
//                   "permanent_postal_code",
//                   pincode,
//                 )}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Emergency Contact */}
//       <div>
//         <SectionTitle>Emergency Contact</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Contact Number
//             </label>
//             <input
//               className={inputCls("emergency_contact")}
//               placeholder="1234567890"
//               value={data.emergency_contact}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "emergency_contact",
//                 mobileNumber,
//               )}
//             />
//             <div className="h-4">
//               {errors.emergency_contact && (
//                 <p className="ep-field-error text-[11px]">
//                   {errors.emergency_contact}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Relationship
//             </label>
//             <select
//               className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.emergency_relationship}
//               onChange={set("emergency_relationship")}
//             >
//               <option value="">Select…</option>
//               {RELATIONSHIPS.map((r) => (
//                 <option key={r} value={r}>
//                   {r.charAt(0).toUpperCase() + r.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Bank Details */}
//       <div>
//         <SectionTitle>Bank Details</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Bank Name
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.bank_name}
//               onChange={set("bank_name")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Branch Name
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.branch_name}
//               onChange={set("branch_name")}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Account Number
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.account_number}
//               onChange={handleRestrictedInput(
//                 setData,
//                 "account_number",
//                 numbersOnly,
//               )}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               Account Type
//             </label>

//             <select
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.account_type}
//               onChange={set("account_type")}
//             >
//               <option value="">Select Account Type</option>
//               <option value="SAVINGS">Savings</option>
//               <option value="CURRENT">Current</option>
//               <option value="SALARY">Salary</option>
//               <option value="FD">Fixed Deposit (FD)</option>
//               <option value="RD">Recurring Deposit (RD)</option>
//               <option value="NRE">NRE</option>
//               <option value="NRO">NRO</option>
//               <option value="FCNR">FCNR</option>
//               <option value="JOINT">Joint</option>
//               <option value="MINOR">Minor</option>
//             </select>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="ep-field-label text-[13px] font-medium">
//               IFSC Code
//             </label>
//             <input
//               className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//               value={data.ifsc_code}
//               onChange={handleRestrictedInput(setData, "ifsc_code", ifscCode)}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Documents */}
//       <div>
//         <SectionTitle>Documents</SectionTitle>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//           {DOCUMENT_FIELDS.map(({ key, label }) => {
//             const pickedFile = files[key];
//             const existingUrl = data[key];
//             const hasFile = Boolean(pickedFile || existingUrl);

//             const displayName = pickedFile
//               ? pickedFile.name
//               : existingUrl
//                 ? existingUrl.split("/").pop()
//                 : "Choose file…";

//             const isImage = pickedFile
//               ? pickedFile.type.startsWith("image/")
//               : isImageUrl(existingUrl);

//             // Prefer the freshly-picked file's local preview; fall back
//             // to the existing stored URL if it looks like an image.
//             const previewUrl =
//               previewUrls[key] || (isImage ? existingUrl : null);

//             return (
//               <div key={key} className="flex flex-col gap-1.5">
//                 <label className="ep-field-label text-[13px] font-medium">
//                   {label}
//                 </label>
//                 <div className="flex items-center gap-2">
//                   {/* Thumbnail */}
//                   {hasFile && (
//                     <div className="ep-doc-thumb w-11 h-11 rounded-lg overflow-hidden border flex items-center justify-center shrink-0">
//                       {isImage && previewUrl ? (
//                         <img
//                           src={previewUrl}
//                           alt={label}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <FileText size={18} />
//                       )}
//                     </div>
//                   )}

//                   <label className="ep-upload-box flex-1 min-w-0 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] cursor-pointer transition-colors">
//                     {hasFile ? <Check size={15} /> : <Upload size={15} />}
//                     <span className="ep-upload-filename truncate">
//                       {displayName}
//                     </span>
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*,.pdf"
//                       onChange={handleFileChange(key)}
//                     />
//                   </label>

//                   {isImage && previewUrl && (
//                     <button
//                       type="button"
//                       onClick={() => setLightboxUrl(previewUrl)}
//                       className="ep-doc-action-btn w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
//                       title="View full size"
//                     >
//                       <Eye size={15} />
//                     </button>
//                   )}

//                   {hasFile && (
//                     <button
//                       type="button"
//                       onClick={handleRemoveFile(key)}
//                       className="ep-doc-action-btn ep-doc-action-btn-danger w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
//                       title="Remove"
//                     >
//                       <X size={15} />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//         <p className="ep-field-hint text-[11px] mt-2">
//           Files are uploaded together with the rest of the form when you
//           submit — nothing uploads until you click{" "}
//           {isEdit ? "Update Employee" : "Create Employee"}.
//         </p>
//       </div>

//       <div className="ep-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="ep-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={submitting}
//           className="ep-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
//         >
//           {submitting && <Loader2 size={14} className="animate-spin" />}
//           {isEdit ? "Update Employee" : "Create Employee"}
//         </button>
//       </div>
//     </form>

//     {lightboxUrl && (
//       <div
//         className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
//         onClick={() => setLightboxUrl(null)}
//       >
//         <img
//           src={lightboxUrl}
//           alt="Document preview"
//           className="max-w-full max-h-full rounded-lg object-contain"
//           onClick={(e) => e.stopPropagation()}
//         />
//         <button
//           type="button"
//           onClick={() => setLightboxUrl(null)}
//           className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
//           title="Close"
//         >
//           <X size={20} />
//         </button>
//       </div>
//     )}
//     </>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Upload, Check, Eye, X, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployeeDesignations } from "../../../redux/employeeDesignation/employeeDesignationSlice.js";
import { fetchDepartments } from "../../../redux/schoolSetup/department/departmentSlice.js";
import {
  aadharNumber,
  handleRestrictedInput,
  ifscCode,
  mobileNumber,
  numbersOnly,
  pincode,
} from "../../../common/utils/inputHandlers.js";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  mobile: "",
  gender: "",
  dob: "",
  blood_group: "",
  aadhaar_no: "",

  joining_date: "",
  designation: "",
  department: "",
  qualification: "",
  experience_years: "",
  salary: "",
  status: "active",

  current_area: "",
  current_city: "",
  current_district: "",
  current_state: "",
  current_postal_code: "",
  current_address: "",
  current_address_same_as_permanent: false,

  permanent_area: "",
  permanent_city: "",
  permanent_district: "",
  permanent_state: "",
  permanent_postal_code: "",
  permanent_address: "",

  emergency_contact: "",
  emergency_relationship: "",

  bank_name: "",
  branch_name: "",
  account_number: "",
  account_type: "",
  ifsc_code: "",

  photo_url: "",
  aadhaar_card_url: "",
  pan_card_url: "",
  passport_size_photo_url: "",
  degree_certificate_url: "",
  experience_certificate_url: "",
  signature_url: "",
};

const RELATIONSHIPS = [
  "wife",
  "husband",
  "son",
  "daughter",
  "friend",
  "relative",
  "father",
  "mother",
  "other",
];

// `key` = the *_url field this maps to in local form state / existing record.
// `fieldName` = the exact multer field name from employeeUpload on the
// backend (router.post("/", employeeUpload, createEmployee)). These must
// match exactly or multer will silently drop the file.
const DOCUMENT_FIELDS = [
  { key: "photo_url", fieldName: "photo", label: "Photo" },
  {
    key: "passport_size_photo_url",
    fieldName: "passport_size_photo",
    label: "Passport Size Photo",
  },
  { key: "signature_url", fieldName: "signature", label: "Signature" },
  { key: "aadhaar_card_url", fieldName: "aadhaar_card", label: "Aadhaar Card" },
  { key: "pan_card_url", fieldName: "pan_card", label: "PAN Card" },
  {
    key: "degree_certificate_url",
    fieldName: "degree_certificate",
    label: "Degree Certificate",
  },
  {
    key: "experience_certificate_url",
    fieldName: "experience_certificate",
    label: "Experience Certificate",
  },
];

function SectionTitle({ children }) {
  return (
    <h3 className="ep-section-title text-[13.5px] font-bold pb-2 mb-1">
      {children}
    </h3>
  );
}

function isImageUrl(url) {
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url || "");
}

/**
 * Add/edit form for a single employee. Organized into sections since the
 * table has ~40 columns. `employee_code` is generated server-side
 * (EMP-{school_id}-{year}-{seq}) and is never part of the payload — it's
 * shown read-only when editing.
 *
 * FILE UPLOADS: the backend route is
 *   router.post("/", employeeUpload, createEmployee)
 * where employeeUpload = multer.fields([...]) sits directly on the
 * create/update route — there is no separate "upload a file, get a URL
 * back" endpoint. So files are NOT uploaded on selection; they're kept as
 * raw File objects in `files` state and sent together with the rest of
 * the form fields in one multipart FormData on submit. `onSubmit` now
 * receives a FormData instance instead of a plain object — the parent
 * thunk needs to POST this as multipart/form-data (i.e. do not manually
 * set a JSON Content-Type header on that request, and make sure no
 * axios interceptor forces one).
 *
 * NOTE: `designation` and `department` are stored as the *id* selected
 * from their respective dropdowns (matching how designation is already
 * wired). If your `employees` table actually stores the plain text name
 * rather than a foreign key id, let me know and I'll switch these back to
 * storing/submitting the name instead.
 *
 * @param {object|null} initialData
 * @param {number} schoolId
 * @param {(formData: FormData) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function EmployeeForm({
  initialData = null,
  schoolId,
  onSubmit,
  onCancel,
  submitting,
}) {
  const dispatch = useDispatch();

  const { employeeDesignations = [], loading: designationsLoading } =
    useSelector((state) => state.employeeDesignations);

  const { departments = [], loading: departmentsLoading } = useSelector(
    (state) => state.departments,
  );

  useEffect(() => {
    dispatch(fetchEmployeeDesignations());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Newly-selected files only, keyed by the *_url key (e.g. "photo_url").
  // If a field is absent here while editing, the existing URL on the
  // record is left untouched — we simply don't send that field at all.
  const [files, setFiles] = useState({});

  // Local object: URLs for newly-picked files, so we can show an instant
  // thumbnail/lightbox without waiting on an upload round-trip.
  const [previewUrls, setPreviewUrls] = useState({});
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Track the latest previewUrls in a ref so the unmount cleanup effect
  // below can revoke whatever is current at teardown time, not whatever
  // was current when the effect was first set up.
  const previewUrlsRef = useRef({});
  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, []);

  // console.log(data)

  const API_URL = import.meta.env.VITE_API_URL;

  // useEffect(() => {
  //   if (initialData) {
  //     setData({
  //       ...EMPTY,
  //       ...Object.fromEntries(
  //         Object.keys(EMPTY).map((key) => [
  //           key,
  //           initialData[key] === null || initialData[key] === undefined
  //             ? EMPTY[key]
  //             : key === "dob" || key === "joining_date"
  //               ? String(initialData[key]).slice(0, 10)
  //               : key === "current_address_same_as_permanent"
  //                 ? Boolean(initialData[key])
  //                 : String(initialData[key]),
  //         ]),
  //       ),
  //     });
  //   } else {
  //     setData(EMPTY);
  //   }

  //   // Revoke any leftover object URLs from the previous record before
  //   // clearing selections for the new one.
  //   setPreviewUrls((prev) => {
  //     Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
  //     return {};
  //   });
  //   setFiles({});
  //   setErrors({});
  // }, [initialData]);


  useEffect(() => {
  if (initialData) {
    setData({
      ...EMPTY,
      ...Object.fromEntries(
        Object.keys(EMPTY).map((key) => [
          key,
          initialData[key] == null
            ? EMPTY[key]
            : key === "dob" || key === "joining_date"
            ? String(initialData[key]).slice(0, 10)
            : key === "current_address_same_as_permanent"
            ? Boolean(initialData[key])
            : String(initialData[key]),
        ])
      ),
    });

    // Existing uploaded image preview
    setPreviewUrls({
      photo_url: initialData.photo_url
        ? `${API_URL}${initialData.photo_url}`
        : "",
      passport_size_photo_url: initialData.passport_size_photo_url
        ? `${API_URL}${initialData.passport_size_photo_url}`
        : "",
      aadhaar_card_url: initialData.aadhaar_card_url
        ? `${API_URL}${initialData.aadhaar_card_url}`
        : "",
      pan_card_url: initialData.pan_card_url
        ? `${API_URL}${initialData.pan_card_url}`
        : "",
      signature_url: initialData.signature_url
        ? `${API_URL}${initialData.signature_url}`
        : "",
      degree_certificate_url: initialData.degree_certificate_url
        ? `${API_URL}${initialData.degree_certificate_url}`
        : "",
      experience_certificate_url: initialData.experience_certificate_url
        ? `${API_URL}${initialData.experience_certificate_url}`
        : "",
    });
  } else {
    setData(EMPTY);

    setPreviewUrls((prev) => {
      Object.values(prev).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      return {};
    });

    setFiles({});
    setErrors({});
  }
}, [initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const toggleSameAsPermanent = (checked) => {
    setData((d) => ({
      ...d,
      current_address_same_as_permanent: checked,
      ...(checked
        ? {
            permanent_area: d.current_area,
            permanent_city: d.current_city,
            permanent_district: d.current_district,
            permanent_state: d.current_state,
            permanent_postal_code: d.current_postal_code,
            permanent_address: d.current_address,
          }
        : {}),
    }));
  };

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles((f) => ({ ...f, [key]: file }));

    setPreviewUrls((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      return { ...prev, [key]: URL.createObjectURL(file) };
    });
  };

  // Clears a picked file (and, client-side, the existing URL for that
  // field). NOTE: this only affects local form state — it does NOT tell
  // the backend to delete the previously-uploaded file, since your
  // employeeUpload route only handles new uploads. If you want removal
  // to actually delete the stored file/DB value, the backend needs a way
  // to receive that signal (e.g. a `remove_photo=true` field) — let me
  // know and I'll add that once you confirm the backend supports it.
  const handleRemoveFile = (key) => () => {
    setFiles((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
    setPreviewUrls((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setData((d) => ({ ...d, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!data.first_name.trim()) e.first_name = "First name is required";
    if (!data.mobile.trim()) e.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(data.mobile.trim()))
      e.mobile = "Enter a 10-digit number";

    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      e.email = "Enter a valid email";
    }
    if (!data.joining_date) e.joining_date = "Joining date is required";
    if (!data.designation) e.designation = "Designation is required";

    if (data.experience_years && Number.isNaN(Number(data.experience_years))) {
      e.experience_years = "Must be a number";
    }
    if (data.salary && Number.isNaN(Number(data.salary))) {
      e.salary = "Must be a number";
    }
    if (
      data.emergency_contact &&
      !/^\d{10}$/.test(data.emergency_contact.trim())
    ) {
      e.emergency_contact = "Enter a 10-digit number";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();

    formData.append("school_id", schoolId);
    formData.append("first_name", data.first_name.trim());
    formData.append("last_name", data.last_name.trim() || "");
    formData.append("email", data.email.trim() || "");
    formData.append("mobile", data.mobile.trim());
    formData.append("gender", data.gender || "");
    formData.append("dob", data.dob || "");
    formData.append("blood_group", data.blood_group || "");
    formData.append("aadhaar_no", data.aadhaar_no.trim() || "");

    formData.append("joining_date", data.joining_date);
    formData.append("designation", data.designation);
    formData.append("department", data.department || "");
    formData.append("qualification", data.qualification.trim() || "");
    formData.append(
      "experience_years",
      data.experience_years === "" ? "" : Number(data.experience_years),
    );
    formData.append("salary", data.salary === "" ? "" : Number(data.salary));
    formData.append("status", data.status);

    formData.append("current_area", data.current_area.trim() || "");
    formData.append("current_city", data.current_city.trim() || "");
    formData.append("current_district", data.current_district.trim() || "");
    formData.append("current_state", data.current_state.trim() || "");
    formData.append(
      "current_postal_code",
      data.current_postal_code.trim() || "",
    );
    formData.append("current_address", data.current_address.trim() || "");
    formData.append(
      "current_address_same_as_permanent",
      data.current_address_same_as_permanent,
    );

    formData.append("permanent_area", data.permanent_area.trim() || "");
    formData.append("permanent_city", data.permanent_city.trim() || "");
    formData.append("permanent_district", data.permanent_district.trim() || "");
    formData.append("permanent_state", data.permanent_state.trim() || "");
    formData.append(
      "permanent_postal_code",
      data.permanent_postal_code.trim() || "",
    );
    formData.append("permanent_address", data.permanent_address.trim() || "");

    formData.append("emergency_contact", data.emergency_contact.trim() || "");
    formData.append(
      "emergency_relationship",
      data.emergency_relationship || "",
    );

    formData.append("bank_name", data.bank_name.trim() || "");
    formData.append("branch_name", data.branch_name.trim() || "");
    formData.append("account_number", data.account_number.trim() || "");
    formData.append("account_type", data.account_type.trim() || "");
    formData.append("ifsc_code", data.ifsc_code.trim() || "");

    // Only append files that were actually (re)selected this session —
    // matches the exact field names multer expects.
    DOCUMENT_FIELDS.forEach(({ key, fieldName }) => {
      if (files[key]) {
        formData.append(fieldName, files[key]);
      }
    });

    onSubmit(formData);
  };

  const inputCls = (key) =>
    `ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "ep-input-error" : ""}`;

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {isEdit && initialData?.employee_code && (
          <div className="flex items-center gap-2">
            <span className="ep-code-badge px-2.5 py-1 rounded-full text-[12px] font-semibold">
              {initialData.employee_code}
            </span>
          </div>
        )}

        {/* Basic Info */}
        <div>
          <SectionTitle>Basic Info</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                First Name <span className="ep-field-required">*</span>
              </label>
              <input
                autoFocus
                className={inputCls("first_name")}
                value={data.first_name}
                onChange={set("first_name")}
              />
              <div className="h-4">
                {errors.first_name && (
                  <p className="ep-field-error text-[11px]">
                    {errors.first_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Last Name
              </label>
              <input
                className={inputCls("last_name")}
                value={data.last_name}
                onChange={set("last_name")}
              />
              <div className="h-4" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Mobile <span className="ep-field-required">*</span>
              </label>
              <input
                className={inputCls("mobile")}
                placeholder="1234567890"
                value={data.mobile}
                onChange={handleRestrictedInput(
                  setData,
                  "mobile",
                  mobileNumber,
                )}
              />
              <div className="h-4">
                {errors.mobile && (
                  <p className="ep-field-error text-[11px]">{errors.mobile}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Email
              </label>
              <input
                className={inputCls("email")}
                placeholder="name@example.com"
                value={data.email}
                onChange={set("email")}
              />
              <div className="h-4">
                {errors.email && (
                  <p className="ep-field-error text-[11px]">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Gender
              </label>
              <select
                className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.gender}
                onChange={set("gender")}
              >
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.dob}
                onChange={set("dob")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Blood Group
              </label>
              <select
                className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.blood_group}
                onChange={set("blood_group")}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Aadhaar Number
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.aadhaar_no}
                onChange={handleRestrictedInput(
                  setData,
                  "aadhaar_no",
                  aadharNumber,
                )}
              />
            </div>
          </div>
        </div>

        {/* Employment */}
        <div>
          <SectionTitle>Employment</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Joining Date <span className="ep-field-required">*</span>
              </label>
              <input
                type="date"
                className={inputCls("joining_date")}
                value={data.joining_date}
                onChange={set("joining_date")}
              />
              <div className="h-4">
                {errors.joining_date && (
                  <p className="ep-field-error text-[11px]">
                    {errors.joining_date}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Designation <span className="ep-field-required">*</span>
              </label>
              <select
                className={inputCls("designation")}
                value={data.designation}
                onChange={set("designation")}
                disabled={designationsLoading}
              >
                <option value="">
                  {designationsLoading ? "Loading..." : "Select Designation"}
                </option>
                {employeeDesignations.map((designation) => (
                  <option key={designation.id} value={designation.id}>
                    {designation.name}
                  </option>
                ))}
              </select>
              <div className="h-4">
                {errors.designation && (
                  <p className="ep-field-error text-[11px]">
                    {errors.designation}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Department
              </label>
              <select
                className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.department}
                onChange={set("department")}
                disabled={departmentsLoading}
              >
                <option value="">
                  {departmentsLoading ? "Loading..." : "Select Department"}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Qualification
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.qualification}
                onChange={set("qualification")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Experience (years)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                className={inputCls("experience_years")}
                value={data.experience_years}
                onChange={set("experience_years")}
              />
              <div className="h-4">
                {errors.experience_years && (
                  <p className="ep-field-error text-[11px]">
                    {errors.experience_years}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Salary
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputCls("salary")}
                value={data.salary}
                onChange={set("salary")}
              />
              <div className="h-4">
                {errors.salary && (
                  <p className="ep-field-error text-[11px]">{errors.salary}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label className="ep-field-label text-[13px] font-medium">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["active", "inactive", "resigned", "terminated"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, status: s }))}
                  className={`ep-status-toggle rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                    data.status === s
                      ? s === "active"
                        ? "ep-status-toggle-active"
                        : "ep-status-toggle-inactive"
                      : ""
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Address */}
        <div>
          <SectionTitle>Current Address</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="ep-field-label text-[13px] font-medium">
                Address
              </label>
              <textarea
                rows={2}
                className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
                value={data.current_address}
                onChange={set("current_address")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Area
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.current_area}
                onChange={set("current_area")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                City
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.current_city}
                onChange={set("current_city")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                District
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.current_district}
                onChange={set("current_district")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                State
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.current_state}
                onChange={set("current_state")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Postal Code
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.current_postal_code}
                onChange={handleRestrictedInput(
                  setData,
                  "current_postal_code",
                  pincode,
                )}
              />
            </div>
          </div>

          <label
            className={`ep-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors mt-4 ${
              data.current_address_same_as_permanent
                ? "ep-checkbox-row-checked"
                : ""
            }`}
          >
            <input
              type="checkbox"
              className="ep-checkbox w-4 h-4 rounded"
              checked={data.current_address_same_as_permanent}
              onChange={(e) => toggleSameAsPermanent(e.target.checked)}
            />
            Permanent address is the same as current address
          </label>
        </div>

        {/* Permanent Address */}
        {!data.current_address_same_as_permanent && (
          <div>
            <SectionTitle>Permanent Address</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="ep-field-label text-[13px] font-medium">
                  Address
                </label>
                <textarea
                  rows={2}
                  className="ep-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
                  value={data.permanent_address}
                  onChange={set("permanent_address")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="ep-field-label text-[13px] font-medium">
                  Area
                </label>
                <input
                  className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                  value={data.permanent_area}
                  onChange={set("permanent_area")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="ep-field-label text-[13px] font-medium">
                  City
                </label>
                <input
                  className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                  value={data.permanent_city}
                  onChange={set("permanent_city")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="ep-field-label text-[13px] font-medium">
                  District
                </label>
                <input
                  className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                  value={data.permanent_district}
                  onChange={set("permanent_district")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="ep-field-label text-[13px] font-medium">
                  State
                </label>
                <input
                  className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                  value={data.permanent_state}
                  onChange={set("permanent_state")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="ep-field-label text-[13px] font-medium">
                  Postal Code
                </label>
                <input
                  className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                  value={data.permanent_postal_code}
                  onChange={handleRestrictedInput(
                    setData,
                    "permanent_postal_code",
                    pincode,
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div>
          <SectionTitle>Emergency Contact</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Contact Number
              </label>
              <input
                className={inputCls("emergency_contact")}
                placeholder="1234567890"
                value={data.emergency_contact}
                onChange={handleRestrictedInput(
                  setData,
                  "emergency_contact",
                  mobileNumber,
                )}
              />
              <div className="h-4">
                {errors.emergency_contact && (
                  <p className="ep-field-error text-[11px]">
                    {errors.emergency_contact}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Relationship
              </label>
              <select
                className="ep-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.emergency_relationship}
                onChange={set("emergency_relationship")}
              >
                <option value="">Select…</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <SectionTitle>Bank Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Bank Name
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.bank_name}
                onChange={set("bank_name")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Branch Name
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.branch_name}
                onChange={set("branch_name")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Account Number
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.account_number}
                onChange={handleRestrictedInput(
                  setData,
                  "account_number",
                  numbersOnly,
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                Account Type
              </label>

              <select
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.account_type}
                onChange={set("account_type")}
              >
                <option value="">Select Account Type</option>
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
                <option value="SALARY">Salary</option>
                <option value="FD">Fixed Deposit (FD)</option>
                <option value="RD">Recurring Deposit (RD)</option>
                <option value="NRE">NRE</option>
                <option value="NRO">NRO</option>
                <option value="FCNR">FCNR</option>
                <option value="JOINT">Joint</option>
                <option value="MINOR">Minor</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ep-field-label text-[13px] font-medium">
                IFSC Code
              </label>
              <input
                className="ep-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
                value={data.ifsc_code}
                onChange={handleRestrictedInput(setData, "ifsc_code", ifscCode)}
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <SectionTitle>Documents</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {DOCUMENT_FIELDS.map(({ key, label }) => {
              const pickedFile = files[key];
              const existingUrl = data[key];
              const hasFile = Boolean(pickedFile || existingUrl);

              const displayName = pickedFile
                ? pickedFile.name
                : existingUrl
                  ? existingUrl.split("/").pop()
                  : "Choose file…";

              const isImage = pickedFile
                ? pickedFile.type.startsWith("image/")
                : isImageUrl(existingUrl);

              // Prefer the freshly-picked file's local preview; fall back
              // to the existing stored URL if it looks like an image.
              const previewUrl =
                previewUrls[key] || (isImage ? existingUrl : null);

              console.log("previewUrl:", previewUrl);

              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="ep-field-label text-[13px] font-medium">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Thumbnail */}
                    {hasFile && (
                      <div className="ep-doc-thumb w-11 h-11 rounded-lg overflow-hidden border flex items-center justify-center shrink-0">
                        {isImage && previewUrl ? (
                          <img
                            src={`${previewUrl}`}
                            alt={label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText size={18} />
                        )}
                      </div>
                    )}

                    {/* File chip: name on the left, view/remove icons pinned
                      to the right edge of the same box */}
                    <div className="ep-upload-box flex-1 min-w-0 flex items-center gap-2 rounded-lg pl-3.5 pr-2 py-2 text-[13px]">
                      <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                        {hasFile ? <Check size={15} /> : <Upload size={15} />}
                        <span className="ep-upload-filename truncate">
                          {displayName}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={handleFileChange(key)}
                        />
                      </label>

                      {hasFile && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {isImage && previewUrl && (
                            <button
                              type="button"
                              onClick={() => setLightboxUrl(previewUrl)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-200/70 hover:text-blue-800 transition-colors"
                              title="View full size"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveFile(key)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="ep-field-hint text-[11px] mt-2">
            Files are uploaded together with the rest of the form when you
            submit — nothing uploads until you click{" "}
            {isEdit ? "Update Employee" : "Create Employee"}.
          </p>
        </div>

        <div className="ep-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="ep-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="ep-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Update Employee" : "Create Employee"}
          </button>
        </div>
      </form>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Document preview"
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}
