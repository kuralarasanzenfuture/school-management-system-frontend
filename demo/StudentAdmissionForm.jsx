import React, { useState, useMemo, useRef } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Trash2,
  User,
  GraduationCap,
  Users,
  MapPin,
  FileText,
  FileCheck,
  Bookmark,
  X,
  CircleCheck,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Academic", icon: GraduationCap },
  { id: 3, label: "Guardian", icon: Users },
  { id: 4, label: "Address", icon: MapPin },
  { id: 5, label: "Documents", icon: FileText },
];

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-stone-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      <div className="h-4">
        {error && (
          <p className="text-[11px] text-rose-500 animate-[shake_0.3s_ease]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-400 outline-none transition-all duration-200 focus:ring-4";

function tInput(err) {
  return `${inputBase} ${
    err
      ? "border-rose-400 ring-rose-100 focus:ring-rose-100"
      : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"
  }`;
}

export default function StudentAdmissionForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const sigRef = useRef(null);

  const [data, setData] = useState({
    photo: null,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    dob: "",
    gender: "Male",
    bloodGroup: "A+",
    studentMobile: "",
    aadhaarNumber: "",
    religion: "",
    motherTongue: "",
    studentClass: "I",
    section: "A",
    admissionNo: "",
    roll: "",
    academicYear: "2026-2027",
    previousSchool: "",
    joiningDate: "",
    houseTeam: "Red",
    subjectsGroup: "",
    transportRequired: "No",
    hostelRequired: "No",
    fatherName: "",
    motherName: "",
    parentOccupation: "",
    parentMobile: "",
    alternateMobile: "",
    parentEmail: "",
    emergencyContact: "",
    relationship: "Father",
    permanentAddress: "",
    sameAddress: false,
    currentAddress: "",
    city: "",
    state: "",
    pincode: "",
    allergies: "",
    medicalConditions: "",
    doctorName: "",
    emergencyMedicalNotes: "",
    feeCategory: "Regular",
    scholarshipDetails: "",
    busRoute: "",
    pickupPoint: "",
    signature: null,
    docs: {
      birthCert: null,
      transCert: null,
      aadhaarCopy: null,
      marksheet: null,
      passportPhoto: null,
    },
  });

  const age = useMemo(() => {
    if (!data.dob) return "";
    const b = new Date(data.dob);
    if (isNaN(b)) return "";
    const now = new Date();
    let a = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
    return a >= 0 ? `${a} years` : "";
  }, [data.dob]);

  const set = (key) => (e) => {
    const v = e?.target ? e.target.value : e;
    setData((d) => ({ ...d, [key]: v }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (f) setData((d) => ({ ...d, photo: URL.createObjectURL(f) }));
  };
  const handleSig = (e) => {
    const f = e.target.files?.[0];
    if (f) setData((d) => ({ ...d, signature: URL.createObjectURL(f) }));
  };
  const setDoc = (key) => (e) => {
    const f = e.target.files?.[0];
    if (f)
      setData((d) => ({
        ...d,
        docs: {
          ...d.docs,
          [key]: { name: f.name, size: Math.round(f.size / 1024) },
        },
      }));
  };
  const removeDoc = (key) => () =>
    setData((d) => ({ ...d, docs: { ...d.docs, [key]: null } }));

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!data.firstName.trim()) e.firstName = "First name is required";
      if (!data.lastName.trim()) e.lastName = "Last name is required";
      if (!data.email.trim()) e.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(data.email))
        e.email = "Enter a valid email";
      if (!data.dob) e.dob = "Date of birth is required";
      if (data.studentMobile && !/^\d{10}$/.test(data.studentMobile))
        e.studentMobile = "Enter a 10-digit number";
      if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber))
        e.aadhaarNumber = "Aadhaar must be 12 digits";
    }
    if (s === 2) {
      if (!data.admissionNo.trim()) e.admissionNo = "Admission ID is required";
      if (!data.roll.trim()) e.roll = "Roll number is required";
      if (!data.joiningDate) e.joiningDate = "Joining date is required";
    }
    if (s === 3) {
      if (!data.fatherName.trim()) e.fatherName = "Father's name is required";
      if (!/^\d{10}$/.test(data.parentMobile))
        e.parentMobile = "Enter a 10-digit number";
      if (!data.emergencyContact.trim())
        e.emergencyContact = "Emergency contact is required";
      if (data.parentEmail && !/^\S+@\S+\.\S+$/.test(data.parentEmail))
        e.parentEmail = "Enter a valid email";
    }
    if (s === 4) {
      if (!data.permanentAddress.trim())
        e.permanentAddress = "Permanent address is required";
      if (!data.sameAddress && !data.currentAddress.trim())
        e.currentAddress = "Current address is required";
      if (!data.city.trim()) e.city = "City is required";
      if (!data.state.trim()) e.state = "State is required";
      if (!/^\d{6}$/.test(data.pincode)) e.pincode = "Enter a 6-digit pincode";
    }
    if (s === 5) {
      if (!data.signature) e.signature = "Signature upload is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate(step)) return;
    setDirection(1);
    setStep((s) => Math.min(5, s + 1));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };
  const onStepClick = (id) => {
    if (id < step) {
      setDirection(id < step ? -1 : 1);
      setStep(id);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate(5)) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FBF7EF] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-10 max-w-md w-full text-center animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <Check className="text-emerald-600" size={30} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-1.5">
            Admission saved
          </h2>
          <p className="text-[14px] text-stone-500 mb-6">
            {data.firstName} {data.lastName} has been enrolled into Class{" "}
            {data.studentClass} - {data.section}.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
            }}
            className="px-5 py-2.5 rounded-lg bg-amber-600 text-white text-[14px] font-semibold hover:bg-amber-700 transition-colors"
          >
            Add another student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EF] flex items-center justify-center p-4 sm:p-6">
      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(.92) } to { opacity:1; transform:scale(1) } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        @keyframes slideInRight { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-24px) } to { opacity:1; transform:translateX(0) } }
        @keyframes fillBar { from { transform: scaleX(var(--from)) } to { transform: scaleX(var(--to)) } }
      `}</style>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[19px] font-bold text-stone-800 tracking-tight">
                New Student Admission
              </h1>
              <p className="text-[12.5px] text-stone-400">
                Step {step} of 5 &middot; {STEPS[step - 1].label} Details
              </p>
            </div>
            <button className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Stepper */}
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-[2px] bg-stone-150 bg-stone-200 rounded-full" />
            <div
              className="absolute top-4 left-4 h-[2px] bg-amber-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% * (1 - 32px/100%))`,
                maxWidth: "calc(100% - 32px)",
              }}
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
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        done
                          ? "bg-amber-500 border-amber-500 text-white scale-100"
                          : active
                            ? "bg-white border-amber-500 text-amber-600 scale-110 shadow-[0_0_0_4px_rgba(245,158,11,0.15)]"
                            : "bg-white border-stone-200 text-stone-300"
                      }`}
                    >
                      {done ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <Icon size={14} />
                      )}
                    </div>
                    <span
                      className={`text-[10.5px] font-medium transition-colors hidden sm:block ${
                        active
                          ? "text-amber-600"
                          : done
                            ? "text-stone-500"
                            : "text-stone-300"
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

        {/* Body */}
        <form onSubmit={submit} className="px-6 sm:px-8 py-6">
          <div
            key={step}
            className="animate-[slideInRight_0.35s_ease]"
            style={{
              animationName: direction === 1 ? "slideInRight" : "slideInLeft",
            }}
          >
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div className="sm:col-span-2 flex justify-center mb-1">
                  <label htmlFor="photo" className="cursor-pointer group">
                    <div
                      className={`w-24 h-24 rounded-full overflow-hidden border-[3px] flex items-center justify-center bg-amber-50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] ${
                        errors.photo ? "border-rose-400" : "border-amber-400"
                      }`}
                    >
                      {data.photo ? (
                        <img
                          src={data.photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-amber-600 text-[10px] font-semibold">
                          <Camera size={20} className="mx-auto mb-1" />
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

                <Field label="First Name" required error={errors.firstName}>
                  <input
                    className={tInput(errors.firstName)}
                    placeholder="Aryan"
                    value={data.firstName}
                    onChange={set("firstName")}
                  />
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <input
                    className={tInput(errors.lastName)}
                    placeholder="Kapoor"
                    value={data.lastName}
                    onChange={set("lastName")}
                  />
                </Field>
                <Field label="Middle Name">
                  <input
                    className={tInput()}
                    placeholder="Dev"
                    value={data.middleName}
                    onChange={set("middleName")}
                  />
                </Field>
                <Field label="Email Address" required error={errors.email}>
                  <input
                    className={tInput(errors.email)}
                    placeholder="student@school.in"
                    value={data.email}
                    onChange={set("email")}
                  />
                </Field>
                <Field label="Date of Birth" required error={errors.dob}>
                  <input
                    type="date"
                    className={tInput(errors.dob)}
                    value={data.dob}
                    onChange={set("dob")}
                  />
                </Field>
                <Field label="Auto-Calculated Age">
                  <input
                    disabled
                    className={`${tInput()} bg-stone-50 font-semibold text-stone-500`}
                    value={age}
                    placeholder="Enter DOB to calculate"
                  />
                </Field>
                <Field label="Gender" required>
                  <select
                    className={tInput()}
                    value={data.gender}
                    onChange={set("gender")}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Blood Group">
                  <select
                    className={tInput()}
                    value={data.bloodGroup}
                    onChange={set("bloodGroup")}
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (b) => (
                        <option key={b}>{b}</option>
                      ),
                    )}
                  </select>
                </Field>
                <Field
                  label="Student Mobile Number"
                  error={errors.studentMobile}
                >
                  <input
                    className={tInput(errors.studentMobile)}
                    placeholder="9876543210"
                    value={data.studentMobile}
                    onChange={set("studentMobile")}
                  />
                </Field>
                <Field
                  label="Aadhaar / National ID"
                  error={errors.aadhaarNumber}
                >
                  <input
                    className={tInput(errors.aadhaarNumber)}
                    placeholder="12-digit number"
                    value={data.aadhaarNumber}
                    onChange={set("aadhaarNumber")}
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
                    value={data.motherTongue}
                    onChange={set("motherTongue")}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <Field label="Class" required>
                  <select
                    className={tInput()}
                    value={data.studentClass}
                    onChange={set("studentClass")}
                  >
                    {[
                      "LKG",
                      "UKG",
                      "I",
                      "II",
                      "III",
                      "IV",
                      "V",
                      "VI",
                      "VII",
                      "VIII",
                      "IX",
                      "X",
                      "XI",
                      "XII",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Section" required>
                  <select
                    className={tInput()}
                    value={data.section}
                    onChange={set("section")}
                  >
                    {["A", "B", "C", "D"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Admission / Student ID"
                  required
                  error={errors.admissionNo}
                >
                  <input
                    className={tInput(errors.admissionNo)}
                    value={data.admissionNo}
                    onChange={set("admissionNo")}
                    placeholder="ADM-2026-001"
                  />
                </Field>
                <Field label="Roll Number" required error={errors.roll}>
                  <input
                    className={tInput(errors.roll)}
                    value={data.roll}
                    onChange={set("roll")}
                    placeholder="14"
                  />
                </Field>
                <Field label="Academic Year" required>
                  <select
                    className={tInput()}
                    value={data.academicYear}
                    onChange={set("academicYear")}
                  >
                    <option>2026-2027</option>
                    <option>2025-2026</option>
                  </select>
                </Field>
                <Field label="Previous School Name">
                  <input
                    className={tInput()}
                    placeholder="Greenwood Public School"
                    value={data.previousSchool}
                    onChange={set("previousSchool")}
                  />
                </Field>
                <Field label="Joining Date" required error={errors.joiningDate}>
                  <input
                    type="date"
                    className={tInput(errors.joiningDate)}
                    value={data.joiningDate}
                    onChange={set("joiningDate")}
                  />
                </Field>
                <Field label="House / Team Name">
                  <select
                    className={tInput()}
                    value={data.houseTeam}
                    onChange={set("houseTeam")}
                  >
                    <option>Red</option>
                    <option>Blue</option>
                    <option>Green</option>
                    <option>Yellow</option>
                  </select>
                </Field>
                <Field label="Subjects / Group Category">
                  <input
                    className={tInput()}
                    placeholder="Science / Commerce / General"
                    value={data.subjectsGroup}
                    onChange={set("subjectsGroup")}
                  />
                </Field>
                <Field label="Transport Required?">
                  <select
                    className={tInput()}
                    value={data.transportRequired}
                    onChange={set("transportRequired")}
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </Field>
                <Field label="Hostel Required?">
                  <select
                    className={tInput()}
                    value={data.hostelRequired}
                    onChange={set("hostelRequired")}
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <Field
                  label="Father's Full Name"
                  required
                  error={errors.fatherName}
                >
                  <input
                    className={tInput(errors.fatherName)}
                    placeholder="Ramesh Kapoor"
                    value={data.fatherName}
                    onChange={set("fatherName")}
                  />
                </Field>
                <Field label="Mother's Full Name">
                  <input
                    className={tInput()}
                    placeholder="Kiran Kapoor"
                    value={data.motherName}
                    onChange={set("motherName")}
                  />
                </Field>
                <Field label="Parent Occupation">
                  <input
                    className={tInput()}
                    placeholder="Software Engineer / Business"
                    value={data.parentOccupation}
                    onChange={set("parentOccupation")}
                  />
                </Field>
                <Field
                  label="Parent Mobile Number"
                  required
                  error={errors.parentMobile}
                >
                  <input
                    maxLength={10}
                    className={tInput(errors.parentMobile)}
                    placeholder="10-digit number"
                    value={data.parentMobile}
                    onChange={set("parentMobile")}
                  />
                </Field>
                <Field label="Alternate Mobile Number">
                  <input
                    className={tInput()}
                    placeholder="Alternate mobile"
                    value={data.alternateMobile}
                    onChange={set("alternateMobile")}
                  />
                </Field>
                <Field label="Parent Email Address" error={errors.parentEmail}>
                  <input
                    className={tInput(errors.parentEmail)}
                    placeholder="parent@domain.com"
                    value={data.parentEmail}
                    onChange={set("parentEmail")}
                  />
                </Field>
                <Field
                  label="Emergency Contact Number"
                  required
                  error={errors.emergencyContact}
                >
                  <input
                    className={tInput(errors.emergencyContact)}
                    placeholder="Emergency number"
                    value={data.emergencyContact}
                    onChange={set("emergencyContact")}
                  />
                </Field>
                <Field label="Relationship with Emergency Contact">
                  <select
                    className={tInput()}
                    value={data.relationship}
                    onChange={set("relationship")}
                  >
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Uncle</option>
                    <option>Guardian</option>
                  </select>
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div className="sm:col-span-2">
                  <Field
                    label="Permanent Address"
                    required
                    error={errors.permanentAddress}
                  >
                    <input
                      className={tInput(errors.permanentAddress)}
                      placeholder="Street name, house no, locality"
                      value={data.permanentAddress}
                      onChange={set("permanentAddress")}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 -mt-1">
                  <input
                    id="same"
                    type="checkbox"
                    checked={data.sameAddress}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        sameAddress: e.target.checked,
                        currentAddress: e.target.checked
                          ? d.permanentAddress
                          : d.currentAddress,
                      }))
                    }
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <label
                    htmlFor="same"
                    className="text-[13px] font-medium text-stone-600 cursor-pointer"
                  >
                    Current address is same as permanent address
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Current Address"
                    required
                    error={errors.currentAddress}
                  >
                    <input
                      disabled={data.sameAddress}
                      className={`${tInput(errors.currentAddress)} ${data.sameAddress ? "bg-stone-50 text-stone-400" : ""}`}
                      placeholder="Street name, house no"
                      value={
                        data.sameAddress
                          ? data.permanentAddress
                          : data.currentAddress
                      }
                      onChange={set("currentAddress")}
                    />
                  </Field>
                </div>

                <Field label="City" required error={errors.city}>
                  <input
                    className={tInput(errors.city)}
                    placeholder="Chennai / Mumbai"
                    value={data.city}
                    onChange={set("city")}
                  />
                </Field>
                <Field label="State" required error={errors.state}>
                  <input
                    className={tInput(errors.state)}
                    placeholder="Tamil Nadu / Maharashtra"
                    value={data.state}
                    onChange={set("state")}
                  />
                </Field>
                <Field label="Pincode" required error={errors.pincode}>
                  <input
                    className={tInput(errors.pincode)}
                    placeholder="600001"
                    value={data.pincode}
                    onChange={set("pincode")}
                  />
                </Field>

                <div className="sm:col-span-2 pt-3 mt-1 border-t border-stone-100">
                  <p className="text-[13px] font-bold text-amber-600 mb-1">
                    Medical & Health Information
                  </p>
                </div>

                <Field label="Allergies (if any)">
                  <input
                    className={tInput()}
                    placeholder="Peanuts / Dust / Penicillin"
                    value={data.allergies}
                    onChange={set("allergies")}
                  />
                </Field>
                <Field label="Chronic Medical Conditions">
                  <input
                    className={tInput()}
                    placeholder="Asthma / Diabetes / Epilepsy"
                    value={data.medicalConditions}
                    onChange={set("medicalConditions")}
                  />
                </Field>
                <Field label="Family Doctor Name">
                  <input
                    className={tInput()}
                    placeholder="Dr. Sharma"
                    value={data.doctorName}
                    onChange={set("doctorName")}
                  />
                </Field>
                <Field label="Emergency Medical Notes">
                  <input
                    className={tInput()}
                    placeholder="Specific emergency protocols"
                    value={data.emergencyMedicalNotes}
                    onChange={set("emergencyMedicalNotes")}
                  />
                </Field>
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[13px] font-bold text-amber-600 mb-3">
                    Required Document Uploads
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "birthCert", label: "Birth Certificate" },
                      { key: "transCert", label: "Transfer Certificate" },
                      { key: "aadhaarCopy", label: "Aadhaar Copy" },
                      { key: "marksheet", label: "Previous Marksheet" },
                      { key: "passportPhoto", label: "Passport Size Photo" },
                    ].map((doc) => {
                      const f = data.docs[doc.key];
                      return (
                        <div
                          key={doc.key}
                          className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-all duration-300 ${
                            f
                              ? "border-emerald-200 bg-emerald-50/60"
                              : "border-stone-200 bg-stone-50/60"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {f ? (
                              <FileCheck
                                size={20}
                                className="text-emerald-600 shrink-0"
                              />
                            ) : (
                              <Upload
                                size={20}
                                className="text-amber-500 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-stone-700 truncate">
                                {doc.label} *
                              </p>
                              <p className="text-[11px] text-stone-400 truncate">
                                {f
                                  ? `${f.name} • ${f.size}KB`
                                  : "Not uploaded yet"}
                              </p>
                            </div>
                          </div>
                          {f ? (
                            <button
                              type="button"
                              onClick={removeDoc(doc.key)}
                              className="shrink-0 w-8 h-8 rounded-lg hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <label className="shrink-0 cursor-pointer text-[12px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                              Upload
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={setDoc(doc.key)}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <p className="text-[13px] font-bold text-amber-600 mb-3">
                    Fee & Transport Setup
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <Field label="Fee Category" required>
                      <select
                        className={tInput()}
                        value={data.feeCategory}
                        onChange={set("feeCategory")}
                      >
                        <option>Regular</option>
                        <option>Scholarship</option>
                        <option>Staff Ward</option>
                      </select>
                    </Field>
                    <Field label="Scholarship Details">
                      <input
                        disabled={data.feeCategory !== "Scholarship"}
                        className={`${tInput()} ${data.feeCategory !== "Scholarship" ? "bg-stone-50 text-stone-400" : ""}`}
                        placeholder="25% Academic Waiver"
                        value={data.scholarshipDetails}
                        onChange={set("scholarshipDetails")}
                      />
                    </Field>
                    {data.transportRequired === "Yes" && (
                      <>
                        <Field label="Bus Route / ID">
                          <input
                            className={tInput()}
                            placeholder="Route 12 - Adyar"
                            value={data.busRoute}
                            onChange={set("busRoute")}
                          />
                        </Field>
                        <Field label="Pickup / Drop Point">
                          <input
                            className={tInput()}
                            placeholder="Adyar Bus Stop"
                            value={data.pickupPoint}
                            onChange={set("pickupPoint")}
                          />
                        </Field>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <label className="text-[13px] font-medium text-stone-600">
                    Parent / Guardian Signature Upload{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <label
                      htmlFor="sig"
                      className="cursor-pointer inline-flex items-center gap-1.5 text-[12.5px] font-semibold border border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-stone-600 px-3.5 py-2 rounded-lg transition-colors"
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
                    {data.signature ? (
                      <div className="border border-stone-200 rounded-lg bg-white px-3 py-1.5 h-10 flex items-center animate-[popIn_0.3s_ease]">
                        <img
                          src={data.signature}
                          alt=""
                          className="max-h-7 max-w-[120px]"
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-[11.5px] ${errors.signature ? "text-rose-500" : "text-stone-400"}`}
                      >
                        {errors.signature || "No signature uploaded yet."}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-7 pt-5 border-t border-stone-100">
            {step === 1 && (
              <button
                type="button"
                className="mr-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 hover:text-amber-600 transition-colors"
              >
                <Bookmark size={15} /> Save Draft
              </button>
            )}
            {step > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 px-4 py-2.5 rounded-lg transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
            )}
            <button
              type="button"
              onClick={() => {}}
              className={`${step === 1 ? "" : "ml-auto"} text-[13.5px] font-semibold text-stone-500 hover:text-stone-700 px-4 py-2.5 transition-colors`}
            >
              Cancel
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all duration-150 shadow-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] px-5 py-2.5 rounded-lg transition-all duration-150 shadow-sm"
              >
                <CircleCheck size={16} /> Save Student
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
