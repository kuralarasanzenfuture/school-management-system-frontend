// import React from "react";
// import { Camera, Upload, Trash2, FileCheck } from "lucide-react";
// import {
//   aadharNumber,
//   mobileNumber,
//   pincode,
// } from "../../../common/utils/inputHandlers";

// /* ── Field wrapper ── */
// function Field({ label, required, error, children }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="sm-field-label text-[13px] font-medium">
//         {label} {required && <span className="sm-field-required">*</span>}
//       </label>
//       {children}
//       <div className="h-4">
//         {error && <p className="sm-field-error text-[11px]">{error}</p>}
//       </div>
//     </div>
//   );
// }

// const inputBase =
//   "sm-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200";

// const tInput = (hasError) => `${inputBase} ${hasError ? "sm-input-error" : ""}`;

// const DOC_KEYS = [
//   { key: "birth_certificate", label: "Birth Certificate" },
//   { key: "transfer_certificate", label: "Transfer Certificate" },
//   { key: "aadhaar_front", label: "Aadhaar Front" },
//   { key: "aadhaar_back", label: "Aadhaar Back" },
//   { key: "previous_marksheets", label: "Previous Marksheet" },
// ];

// /* ── Doc upload card ── */
// function DocCard({ docKey, label, docMeta, setDoc, removeDoc }) {
//   const docInfo = docMeta[docKey];
//   return (
//     <div
//       className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-all duration-300 ${
//         docInfo ? "sm-doc-card-filled" : "sm-doc-card"
//       }`}
//     >
//       <div className="flex items-center gap-3 min-w-0">
//         {docInfo ? (
//           <FileCheck size={20} className="sm-doc-icon-filled shrink-0" />
//         ) : (
//           <Upload size={20} className="sm-doc-icon-empty shrink-0" />
//         )}
//         <div className="min-w-0">
//           <p className="sm-doc-name text-[13px] font-semibold truncate">
//             {label}
//           </p>
//           <p className="sm-doc-meta text-[11px] truncate">
//             {docInfo
//               ? docInfo.existing
//                 ? docInfo.name
//                 : `${docInfo.name} · ${docInfo.size} KB`
//               : "Not uploaded yet"}
//           </p>
//         </div>
//       </div>
//       {docInfo ? (
//         <button
//           type="button"
//           onClick={removeDoc(docKey)}
//           className="sm-doc-remove shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//         >
//           <Trash2 size={15} />
//         </button>
//       ) : (
//         <label className="sm-doc-upload-btn shrink-0 cursor-pointer text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors">
//           Upload
//           <input
//             type="file"
//             accept=".pdf,.jpg,.jpeg,.png"
//             className="hidden"
//             onChange={setDoc(docKey)}
//           />
//         </label>
//       )}
//     </div>
//   );
// }

// /**
//  * Renders the fields for a single step of the student admission wizard.
//  * Pure/presentational — all state, handlers, and navigation live in
//  * StudentModal; this component only reads props and calls the setters
//  * it's given.
//  *
//  * @param {number} step - which step (1-4) to render
//  * @param {object} data - current form values
//  * @param {object} errors - field-keyed validation errors
//  * @param {(key: string) => (e) => void} set - standard field setter
//  * @param {(key: string, filterFn: Function) => (e) => void} setRestricted -
//  *   digits-only field setter (mobile, aadhaar, pincode)
//  * @param {Function} setData - raw setState, used for the "same as
//  *   permanent" checkbox which touches multiple fields atomically
//  * @param {string} age - auto-calculated age display string
//  * @param {boolean} isAdmin
//  * @param {Array<{id, name}>} schools
//  * @param {boolean} schoolsLoading
//  * @param {string|null} photoPreview
//  * @param {(e) => void} handlePhoto
//  * @param {React.Ref} fileRef
//  * @param {string|null} signaturePreview
//  * @param {(e) => void} handleSig
//  * @param {React.Ref} sigRef
//  * @param {object} docMeta
//  * @param {(key: string) => (e) => void} setDoc
//  * @param {(key: string) => () => void} removeDoc
//  */
// export default function StudentForm({
//   step,
//   data,
//   errors,
//   set,
//   setRestricted,
//   setData,
//   age,
//   isAdmin,
//   schools,
//   schoolsLoading,
//   photoPreview,
//   handlePhoto,
//   fileRef,
//   signaturePreview,
//   handleSig,
//   sigRef,
//   docMeta,
//   setDoc,
//   removeDoc,
// }) {
//   return (
//     <>
//       {/* ═══ STEP 1 — Personal ═══ */}
//       {step === 1 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
//           {/* Photo upload */}
//           <div className="sm:col-span-2 flex justify-center mb-1">
//             <label htmlFor="photo" className="cursor-pointer group">
//               <div
//                 className={`w-24 h-24 rounded-full overflow-hidden border-[3px] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] ${
//                   errors.photo ? "sm-photo-circle-error" : "sm-photo-circle"
//                 }`}
//               >
//                 {photoPreview ? (
//                   <img
//                     src={photoPreview}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="sm-photo-placeholder text-center text-[10px] font-semibold">
//                     <Camera size={20} className="mx-auto mb-1" />
//                     Upload Photo
//                   </div>
//                 )}
//               </div>
//             </label>
//             <input
//               id="photo"
//               type="file"
//               accept=".jpg,.jpeg,.png"
//               className="hidden"
//               onChange={handlePhoto}
//               ref={fileRef}
//             />
//           </div>

//           {isAdmin && (
//             <Field label="School" required error={errors.school_id}>
//               <select
//                 className={tInput(errors.school_id)}
//                 value={data.school_id}
//                 onChange={set("school_id")}
//                 disabled={schoolsLoading}
//               >
//                 <option value="">
//                   {schoolsLoading ? "Loading schools..." : "Select a school"}
//                 </option>
//                 {schools.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.name}
//                   </option>
//                 ))}
//               </select>
//             </Field>
//           )}

//           <Field label="First Name" required error={errors.first_name}>
//             <input
//               className={tInput(errors.first_name)}
//               placeholder="Aryan"
//               value={data.first_name}
//               onChange={set("first_name")}
//             />
//           </Field>
//           <Field label="Last Name" required error={errors.last_name}>
//             <input
//               className={tInput(errors.last_name)}
//               placeholder="Kapoor"
//               value={data.last_name}
//               onChange={set("last_name")}
//             />
//           </Field>
//           <Field label="Middle Name">
//             <input
//               className={tInput()}
//               placeholder="Dev"
//               value={data.middle_name}
//               onChange={set("middle_name")}
//             />
//           </Field>
//           <Field label="Email Address" error={errors.email}>
//             <input
//               className={tInput(errors.email)}
//               placeholder="student@school.in"
//               value={data.email}
//               onChange={set("email")}
//             />
//           </Field>
//           <Field label="Date of Birth" required error={errors.date_of_birth}>
//             <input
//               type="date"
//               className={tInput(errors.date_of_birth)}
//               value={data.date_of_birth}
//               onChange={set("date_of_birth")}
//             />
//           </Field>
//           <Field label="Auto-Calculated Age">
//             <input
//               disabled
//               className={`${tInput()} sm-input-disabled font-semibold`}
//               value={age}
//               placeholder="Enter DOB to calculate"
//             />
//           </Field>
//           <Field label="Gender" required error={errors.gender}>
//             <select
//               className={tInput(errors.gender)}
//               value={data.gender}
//               onChange={set("gender")}
//             >
//               <option value="">Select Gender</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>
//           </Field>
//           <Field label="Blood Group">
//             <select
//               className={tInput()}
//               value={data.blood_group}
//               onChange={set("blood_group")}
//             >
//               <option value="">Select Blood Group</option>
//               {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
//                 (bloodType) => (
//                   <option key={bloodType}>{bloodType}</option>
//                 ),
//               )}
//             </select>
//           </Field>
//           <Field label="Mobile Number" required error={errors.mobile_no}>
//             <input
//               type="tel"
//               inputMode="numeric"
//               maxLength={10}
//               className={tInput(errors.mobile_no)}
//               placeholder="9876543210"
//               value={data.mobile_no}
//               onChange={setRestricted("mobile_no", mobileNumber)}
//             />
//           </Field>
//           <Field label="Aadhaar / National ID" error={errors.aadhaar_no}>
//             <input
//               maxLength={12}
//               className={tInput(errors.aadhaar_no)}
//               placeholder="12-digit number"
//               value={data.aadhaar_no}
//               onChange={setRestricted("aadhaar_no", aadharNumber)}
//             />
//           </Field>
//           <Field label="Religion">
//             <input
//               className={tInput()}
//               placeholder="Hindu / Christian / Muslim"
//               value={data.religion}
//               onChange={set("religion")}
//             />
//           </Field>
//           <Field label="Mother Tongue">
//             <input
//               className={tInput()}
//               placeholder="Hindi / Tamil / English"
//               value={data.mother_tongue}
//               onChange={set("mother_tongue")}
//             />
//           </Field>
//         </div>
//       )}

//       {/* ═══ STEP 2 — Guardian ═══ */}
//       {step === 2 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
//           <Field label="Father's Full Name" required error={errors.father_name}>
//             <input
//               className={tInput(errors.father_name)}
//               placeholder="Ramesh Kapoor"
//               value={data.father_name}
//               onChange={set("father_name")}
//             />
//           </Field>
//           <Field label="Mother's Full Name">
//             <input
//               className={tInput()}
//               placeholder="Kiran Kapoor"
//               value={data.mother_name}
//               onChange={set("mother_name")}
//             />
//           </Field>
//           <Field label="Father's Occupation">
//             <input
//               className={tInput()}
//               placeholder="Engineer / Business"
//               value={data.father_occupation}
//               onChange={set("father_occupation")}
//             />
//           </Field>
//           <Field label="Mother's Occupation">
//             <input
//               className={tInput()}
//               placeholder="Teacher / Homemaker"
//               value={data.mother_occupation}
//               onChange={set("mother_occupation")}
//             />
//           </Field>
//           <Field
//             label="Parent Mobile Number"
//             required
//             error={errors.parent_mobile}
//           >
//             <input
//               maxLength={10}
//               className={tInput(errors.parent_mobile)}
//               placeholder="10-digit number"
//               value={data.parent_mobile}
//               onChange={setRestricted("parent_mobile", mobileNumber)}
//             />
//           </Field>
//           <Field
//             label="Alternate Mobile Number"
//             error={errors.alternate_mobile}
//           >
//             <input
//               maxLength={10}
//               className={tInput(errors.alternate_mobile)}
//               placeholder="Alternate mobile"
//               value={data.alternate_mobile}
//               onChange={setRestricted("alternate_mobile", mobileNumber)}
//             />
//           </Field>
//           <Field label="Parent Email Address" error={errors.parent_email}>
//             <input
//               className={tInput(errors.parent_email)}
//               placeholder="parent@domain.com"
//               value={data.parent_email}
//               onChange={set("parent_email")}
//             />
//           </Field>
//           <Field
//             label="Emergency Contact Number"
//             error={errors.emergency_contact}
//           >
//             <input
//               maxLength={10}
//               className={tInput(errors.emergency_contact)}
//               placeholder="Emergency number"
//               value={data.emergency_contact}
//               onChange={setRestricted("emergency_contact", mobileNumber)}
//             />
//           </Field>
//           <Field label="Relationship with Emergency Contact">
//             <select
//               className={tInput()}
//               value={data.emergency_relationship}
//               onChange={set("emergency_relationship")}
//             >
//               <option value="">Select</option>
//               <option value="FATHER">Father</option>
//               <option value="MOTHER">Mother</option>
//               <option value="UNCLE">Uncle</option>
//               <option value="GUARDIAN">Guardian</option>
//             </select>
//           </Field>
//         </div>
//       )}

//       {/* ═══ STEP 3 — Address ═══ */}
//       {step === 3 && (
//         <div className="space-y-7">
//           {/* Permanent Address */}
//           <div>
//             <h3 className="sm-section-heading text-sm font-bold pb-2 mb-4">
//               Permanent Address
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
//               <Field label="Area" required error={errors.permanent_area}>
//                 <input
//                   className={tInput(errors.permanent_area)}
//                   placeholder="Area / Locality"
//                   value={data.permanent_area}
//                   onChange={set("permanent_area")}
//                 />
//               </Field>
//               <Field label="City" required error={errors.permanent_city}>
//                 <input
//                   className={tInput(errors.permanent_city)}
//                   placeholder="City"
//                   value={data.permanent_city}
//                   onChange={set("permanent_city")}
//                 />
//               </Field>
//               <Field
//                 label="District"
//                 required
//                 error={errors.permanent_district}
//               >
//                 <input
//                   className={tInput(errors.permanent_district)}
//                   placeholder="District"
//                   value={data.permanent_district}
//                   onChange={set("permanent_district")}
//                 />
//               </Field>
//               <Field label="State" required error={errors.permanent_state}>
//                 <input
//                   className={tInput(errors.permanent_state)}
//                   placeholder="State"
//                   value={data.permanent_state}
//                   onChange={set("permanent_state")}
//                 />
//               </Field>
//               <Field label="Postal Code" error={errors.permanent_postal_code}>
//                 <input
//                   maxLength={6}
//                   className={tInput(errors.permanent_postal_code)}
//                   placeholder="600001"
//                   value={data.permanent_postal_code}
//                   onChange={setRestricted("permanent_postal_code", pincode)}
//                 />
//               </Field>
//               <div className="sm:col-span-2">
//                 <Field
//                   label="Full Address"
//                   required
//                   error={errors.permanent_address}
//                 >
//                   <textarea
//                     rows={2}
//                     className={tInput(errors.permanent_address)}
//                     placeholder="House No, Street, Landmark…"
//                     value={data.permanent_address}
//                     onChange={set("permanent_address")}
//                   />
//                 </Field>
//               </div>
//             </div>
//           </div>

//           {/* Same-address checkbox */}
//           <label className="flex items-center gap-3 cursor-pointer select-none">
//             <input
//               type="checkbox"
//               checked={data.current_address_same_as_permanent}
//               onChange={(checkboxEvent) => {
//                 const isChecked = checkboxEvent.target.checked;
//                 setData((prevData) => ({
//                   ...prevData,
//                   current_address_same_as_permanent: isChecked,
//                   current_area: isChecked
//                     ? prevData.permanent_area
//                     : prevData.current_area,
//                   current_city: isChecked
//                     ? prevData.permanent_city
//                     : prevData.current_city,
//                   current_district: isChecked
//                     ? prevData.permanent_district
//                     : prevData.current_district,
//                   current_state: isChecked
//                     ? prevData.permanent_state
//                     : prevData.current_state,
//                   current_postal_code: isChecked
//                     ? prevData.permanent_postal_code
//                     : prevData.current_postal_code,
//                   current_address: isChecked
//                     ? prevData.permanent_address
//                     : prevData.current_address,
//                 }));
//               }}
//             />
//             <span className="sm-checkbox-label text-[13px] font-medium">
//               Current address same as permanent address
//             </span>
//           </label>

//           {/* Current Address */}
//           <div>
//             <h3 className="sm-section-heading text-sm font-bold pb-2 mb-4">
//               Current Address
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
//               {[
//                 { fieldKey: "current_area", fieldLabel: "Area" },
//                 { fieldKey: "current_city", fieldLabel: "City" },
//                 { fieldKey: "current_district", fieldLabel: "District" },
//                 { fieldKey: "current_state", fieldLabel: "State" },
//                 {
//                   fieldKey: "current_postal_code",
//                   fieldLabel: "Postal Code",
//                 },
//               ].map(({ fieldKey, fieldLabel }) => (
//                 <Field
//                   key={fieldKey}
//                   label={fieldLabel}
//                   required={!data.current_address_same_as_permanent}
//                   error={errors[fieldKey]}
//                 >
//                   <input
//                     disabled={data.current_address_same_as_permanent}
//                     maxLength={
//                       fieldKey === "current_postal_code" ? 6 : undefined
//                     }
//                     className={`${tInput(errors[fieldKey])} ${
//                       data.current_address_same_as_permanent
//                         ? "sm-input-disabled"
//                         : ""
//                     }`}
//                     value={data[fieldKey]}
//                     onChange={
//                       fieldKey === "current_postal_code"
//                         ? setRestricted(fieldKey, pincode)
//                         : set(fieldKey)
//                     }
//                   />
//                 </Field>
//               ))}
//               <div className="sm:col-span-2">
//                 <Field
//                   label="Full Address"
//                   required={!data.current_address_same_as_permanent}
//                   error={errors.current_address}
//                 >
//                   <textarea
//                     rows={2}
//                     disabled={data.current_address_same_as_permanent}
//                     className={`${tInput(errors.current_address)} ${
//                       data.current_address_same_as_permanent
//                         ? "sm-input-disabled"
//                         : ""
//                     }`}
//                     placeholder="House No, Street, Landmark…"
//                     value={data.current_address}
//                     onChange={set("current_address")}
//                   />
//                 </Field>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ═══ STEP 4 — Documents ═══ */}
//       {step === 4 && (
//         <div className="flex flex-col gap-6">
//           <div>
//             <p className="sm-section-heading text-[13px] font-bold mb-3 pb-0 border-none">
//               Required Document Uploads
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {DOC_KEYS.map(({ key: docKey, label: docLabel }) => (
//                 <DocCard
//                   key={docKey}
//                   docKey={docKey}
//                   label={docLabel}
//                   docMeta={docMeta}
//                   setDoc={setDoc}
//                   removeDoc={removeDoc}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Signature */}
//           <div className="sm-footer pt-4">
//             <p className="sm-field-label text-[13px] font-medium mb-2">
//               Parent / Guardian Signature{" "}
//               <span className="sm-field-required">*</span>
//             </p>
//             <div className="flex items-center gap-3">
//               <label
//                 htmlFor="sig"
//                 className="sm-sig-label cursor-pointer inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3.5 py-2 rounded-lg transition-colors"
//               >
//                 <Upload size={14} /> Upload Signature
//               </label>
//               <input
//                 id="sig"
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleSig}
//                 ref={sigRef}
//               />
//               {signaturePreview ? (
//                 <div className="sm-sig-preview rounded-lg px-3 py-1.5 h-10 flex items-center">
//                   <img
//                     src={signaturePreview}
//                     alt="Signature"
//                     className="max-h-7 max-w-[120px]"
//                   />
//                 </div>
//               ) : (
//                 <span
//                   className={`text-[11.5px] ${
//                     errors.signature
//                       ? "sm-sig-placeholder-error"
//                       : "sm-sig-placeholder"
//                   }`}
//                 >
//                   {errors.signature || "No signature uploaded yet."}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import React, { useState } from "react";
import { Camera, Upload, Trash2, FileCheck, Eye, FileText } from "lucide-react";
import {
  aadharNumber,
  mobileNumber,
  pincode,
} from "../../../common/utils/inputHandlers";
import ImageLightbox from "../../../common/components/ImageLightbox/ImageLightbox.jsx";

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

const DOC_KEYS = [
  { key: "birth_certificate", label: "Birth Certificate" },
  { key: "transfer_certificate", label: "Transfer Certificate" },
  { key: "aadhaar_front", label: "Aadhaar Front" },
  { key: "aadhaar_back", label: "Aadhaar Back" },
  { key: "previous_marksheets", label: "Previous Marksheet" },
];

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp)$/i;

// Keep these in sync with the caps enforced in StudentFormPage.jsx —
// used here only for the hint captions shown under each upload.
const MAX_PHOTO_MB = 2;
const MAX_SIGNATURE_MB = 1;
const MAX_DOC_MB = 5;

/** True if a doc's filename looks like an image we can preview/lightbox. */
function isImageDoc(name = "") {
  return IMAGE_EXT_RE.test(name);
}

/* ── Doc upload card ──
   Shows an actual image thumbnail (instead of just a generic file icon)
   whenever the upload is an image — for existing uploads this uses the
   server URL (docInfo.url), for freshly picked files it uses the object
   URL generated in setDoc (docInfo.previewUrl). An Eye button opens that
   same URL in the full-size lightbox — nothing is re-encoded/downscaled,
   so "view" always shows the actual uploaded quality. Non-image docs
   (e.g. PDFs) keep the plain file icon; there's nothing to preview inline
   for those. */
function DocCard({ docKey, label, docMeta, setDoc, removeDoc, onView, error }) {
  const docInfo = docMeta[docKey];
  const previewSrc = docInfo && (docInfo.url || docInfo.previewUrl);
  const isImage = docInfo && isImageDoc(docInfo.name) && previewSrc;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 transition-all duration-300 ${docInfo ? "sm-doc-card-filled" : error ? "sm-doc-card-error" : "sm-doc-card"
          }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isImage ? (
            <img
              src={previewSrc}
              alt={label}
              className="sm-doc-thumb w-10 h-10 rounded-lg object-cover shrink-0"
            />
          ) : docInfo ? (
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
          <div className="flex items-center gap-1 shrink-0">
            {isImage && (
              <button
                type="button"
                onClick={() => onView(previewSrc, label)}
                className="sm-doc-view w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                title="View full size"
              >
                <Eye size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={removeDoc(docKey)}
              className="sm-doc-remove w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              title="Remove"
            >
              <Trash2 size={15} />
            </button>
          </div>
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
      <p className={error ? "sm-field-error text-[11px]" : "sm-doc-hint text-[11px]"}>
        {error || `PDF, JPG or PNG — max ${MAX_DOC_MB}MB`}
      </p>
    </div>
  );
}

/**
 * Renders the fields for a single step of the student admission wizard.
 * Pure/presentational — all state, handlers, and navigation live in
 * StudentModal; this component only reads props and calls the setters
 * it's given. The one piece of local state is the lightbox (which image
 * is currently being viewed full-size), since that's purely a display
 * concern that doesn't need to live in the parent's form state.
 *
 * @param {number} step - which step (1-4) to render
 * @param {object} data - current form values
 * @param {object} errors - field-keyed validation errors
 * @param {(key: string) => (e) => void} set - standard field setter
 * @param {(key: string, filterFn: Function) => (e) => void} setRestricted -
 *   digits-only field setter (mobile, aadhaar, pincode)
 * @param {Function} setData - raw setState, used for the "same as
 *   permanent" checkbox which touches multiple fields atomically
 * @param {string} age - auto-calculated age display string
 * @param {boolean} isAdmin
 * @param {Array<{id, name}>} schools
 * @param {boolean} schoolsLoading
 * @param {string|null} photoPreview
 * @param {(e) => void} handlePhoto
 * @param {React.Ref} fileRef
 * @param {string|null} signaturePreview
 * @param {(e) => void} handleSig
 * @param {React.Ref} sigRef
 * @param {object} docMeta
 * @param {(key: string) => (e) => void} setDoc
 * @param {(key: string) => () => void} removeDoc
 */
export default function StudentForm({
  step,
  data,
  errors,
  set,
  setRestricted,
  setData,
  age,
  isAdmin,
  schools,
  schoolsLoading,
  photoPreview,
  handlePhoto,
  fileRef,
  signaturePreview,
  handleSig,
  sigRef,
  docMeta,
  setDoc,
  removeDoc,
}) {
  const [lightbox, setLightbox] = useState({ src: null, alt: "" });
  const openLightbox = (src, alt) => setLightbox({ src, alt });
  const closeLightbox = () => setLightbox({ src: null, alt: "" });

  return (
    <>
      {/* ═══ STEP 1 — Personal ═══ */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          {/* Photo upload */}
          <div className="sm:col-span-2 flex justify-center mb-1">
            <div className="relative group">
              <label htmlFor="photo" className="cursor-pointer">
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden border-[3px] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] ${errors.photo ? "sm-photo-circle-error" : "sm-photo-circle"
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
                      <Camera size={20} className="mx-auto mb-1" />
                      Upload Photo
                    </div>
                  )}
                </div>
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => openLightbox(photoPreview, "Student photo")}
                  className="sm-photo-view absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  title="View full size"
                >
                  <Eye size={14} />
                </button>
              )}
            </div>
            <input
              id="photo"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handlePhoto}
              ref={fileRef}
            />
          </div>
          <div className="sm:col-span-2 -mt-3 mb-1 text-center">
            <p className={errors.photo ? "sm-field-error text-[11px]" : "sm-doc-hint text-[11px]"}>
              {errors.photo || `JPG or PNG — max ${MAX_PHOTO_MB}MB`}
            </p>
          </div>

          {isAdmin && (
            <Field label="School" required error={errors.school_id}>
              <select
                className={tInput(errors.school_id)}
                value={data.school_id}
                onChange={set("school_id")}
                disabled={schoolsLoading}
              >
                <option value="">
                  {schoolsLoading ? "Loading schools..." : "Select a school"}
                </option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="First Name" required error={errors.first_name}>
            <input
              className={tInput(errors.first_name)}
              placeholder="Aryan"
              value={data.first_name}
              onChange={set("first_name")}
            />
          </Field>
          <Field label="Last Name" required error={errors.last_name}>
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
          <Field label="Date of Birth" required error={errors.date_of_birth}>
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
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (bloodType) => (
                  <option key={bloodType}>{bloodType}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="Mobile Number" required error={errors.mobile_no}>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={tInput(errors.mobile_no)}
              placeholder="9876543210"
              value={data.mobile_no}
              onChange={setRestricted("mobile_no", mobileNumber)}
            />
          </Field>
          <Field label="Aadhaar / National ID" error={errors.aadhaar_no}>
            <input
              maxLength={12}
              className={tInput(errors.aadhaar_no)}
              placeholder="12-digit number"
              value={data.aadhaar_no}
              onChange={setRestricted("aadhaar_no", aadharNumber)}
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
          <Field label="Father's Full Name" required error={errors.father_name}>
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
              onChange={setRestricted("parent_mobile", mobileNumber)}
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
              onChange={setRestricted("alternate_mobile", mobileNumber)}
            />
          </Field>
          <Field label="Parent Email Address" error={errors.parent_email}>
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
              onChange={setRestricted("emergency_contact", mobileNumber)}
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
              <Field label="Area" required error={errors.permanent_area}>
                <input
                  className={tInput(errors.permanent_area)}
                  placeholder="Area / Locality"
                  value={data.permanent_area}
                  onChange={set("permanent_area")}
                />
              </Field>
              <Field label="City" required error={errors.permanent_city}>
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
              <Field label="State" required error={errors.permanent_state}>
                <input
                  className={tInput(errors.permanent_state)}
                  placeholder="State"
                  value={data.permanent_state}
                  onChange={set("permanent_state")}
                />
              </Field>
              <Field label="Postal Code" error={errors.permanent_postal_code}>
                <input
                  maxLength={6}
                  className={tInput(errors.permanent_postal_code)}
                  placeholder="600001"
                  value={data.permanent_postal_code}
                  onChange={setRestricted("permanent_postal_code", pincode)}
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
                { fieldKey: "current_area", fieldLabel: "Area" },
                { fieldKey: "current_city", fieldLabel: "City" },
                { fieldKey: "current_district", fieldLabel: "District" },
                { fieldKey: "current_state", fieldLabel: "State" },
                {
                  fieldKey: "current_postal_code",
                  fieldLabel: "Postal Code",
                },
              ].map(({ fieldKey, fieldLabel }) => (
                <Field
                  key={fieldKey}
                  label={fieldLabel}
                  required={!data.current_address_same_as_permanent}
                  error={errors[fieldKey]}
                >
                  <input
                    disabled={data.current_address_same_as_permanent}
                    maxLength={
                      fieldKey === "current_postal_code" ? 6 : undefined
                    }
                    className={`${tInput(errors[fieldKey])} ${data.current_address_same_as_permanent
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
                  required={!data.current_address_same_as_permanent}
                  error={errors.current_address}
                >
                  <textarea
                    rows={2}
                    disabled={data.current_address_same_as_permanent}
                    className={`${tInput(errors.current_address)} ${data.current_address_same_as_permanent
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
              {DOC_KEYS.map(({ key: docKey, label: docLabel }) => (
                <DocCard
                  key={docKey}
                  docKey={docKey}
                  label={docLabel}
                  docMeta={docMeta}
                  setDoc={setDoc}
                  removeDoc={removeDoc}
                  onView={openLightbox}
                  error={errors[`doc_${docKey}`]}
                />
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
                <div className="sm-sig-preview rounded-lg px-3 py-1.5 h-10 flex items-center gap-2">
                  <img
                    src={signaturePreview}
                    alt="Signature"
                    className="max-h-7 max-w-[120px]"
                  />
                  <button
                    type="button"
                    onClick={() => openLightbox(signaturePreview, "Signature")}
                    className="sm-sig-view w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0"
                    title="View full size"
                  >
                    <Eye size={13} />
                  </button>
                </div>
              ) : (
                <span
                  className={`text-[11.5px] ${errors.signature
                      ? "sm-sig-placeholder-error"
                      : "sm-sig-placeholder"
                    }`}
                >
                  {errors.signature || "No signature uploaded yet."}
                </span>
              )}
            </div>
            <p className="sm-doc-hint text-[11px] mt-1.5">
              PNG or JPG — max {MAX_SIGNATURE_MB}MB
            </p>
          </div>
        </div>
      )}

      <ImageLightbox
        src={lightbox.src}
        alt={lightbox.alt}
        onClose={closeLightbox}
      />
    </>
  );
}