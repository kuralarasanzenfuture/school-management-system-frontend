import React, { useEffect, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
// import { useDebounce } from "react-use";
import { handleRestrictedInput, mobileNumber, pincode } from "../../../../common/utils/inputHandlers.js";

const BASE_URL = "http://localhost:5000";

const EMPTY = {
  name: "",
  code: "",
  email: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  postal_code: "",
  website: "",
  status: "active",
};

function resolveUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Add/edit form for a single school.
 *
 * @param {object|null} initialData - pass an existing school to edit it.
 * @param {(formData: FormData) => void} onSubmit - receives a ready-to-send
 *   FormData instance (matches schoolService's multipart upload).
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function SchoolForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [data, setData] = useState(EMPTY);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setData({
        name: initialData.name || "",
        code: initialData.code || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address_line1: initialData.address_line1 || "",
        address_line2: initialData.address_line2 || "",
        city: initialData.city || "",
        district: initialData.district || "",
        state: initialData.state || "",
        country: initialData.country || "India",
        postal_code: initialData.postal_code || "",
        website: initialData.website || "",
        status: initialData.status || "active",
      });
      setLogoPreview(resolveUrl(initialData.logo_url));
    } else {
      setData(EMPTY);
      setLogoPreview(null);
    }
    setLogoFile(null);
    setErrors({});
  }, [initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const handleLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = "School name is required";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email))
      e.email = "Enter a valid email";
    if (data.phone && !/^\d{7,15}$/.test(data.phone.replace(/[\s-]/g, ""))) {
      e.phone = "Enter a valid phone number";
    }
    if (data.postal_code && !/^\d{4,10}$/.test(data.postal_code)) {
      e.postal_code = "Enter a valid postal code";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });
    if (logoFile) formData.append("logo", logoFile);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Logo */}
      <div className="flex justify-center">
        <label htmlFor="school-logo" className="cursor-pointer group">
          <div className="scp-logo-upload w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center transition-colors">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-[10px] font-semibold">
                <Camera size={20} className="mx-auto mb-1" />
                Upload Logo
              </div>
            )}
          </div>
        </label>
        <input
          id="school-logo"
          type="file"
          accept=".jpg,.jpeg,.png,.svg,.webp"
          className="hidden"
          onChange={handleLogo}
        />
      </div>

      {/* Basic Info */}
      <div>
        <h3 className="scp-section-title text-sm font-bold pb-2 mb-3">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              School Name <span className="scp-field-required">*</span>
            </label>
            <input
              className={`scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.name ? "scp-input-error" : ""}`}
              placeholder="Zenfuture Public School"
              value={data.name}
              onChange={set("name")}
            />
            <div className="h-4">
              {errors.name && (
                <p className="scp-field-error text-[11px]">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              School Code (Auto Generated)
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              placeholder="ZFPS-001"
              value={data.code}
              onChange={set("code")}
              disabled
            />
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="scp-section-title text-sm font-bold pb-2 mb-3">
          Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              Email
            </label>
            <input
              className={`scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.email ? "scp-input-error" : ""}`}
              placeholder="office@school.in"
              value={data.email}
              onChange={set("email")}
            />
            <div className="h-4">
              {errors.email && (
                <p className="scp-field-error text-[11px]">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              Phone
            </label>
            <input
              className={`scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.phone ? "scp-input-error" : ""}`}
              placeholder="04272 123456"
              value={data.phone}
            //   onChange={set("phone")}
                onChange={handleRestrictedInput(setData, "phone", mobileNumber)}
            />
            <div className="h-4">
              {errors.phone && (
                <p className="scp-field-error text-[11px]">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              Website
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              placeholder="https://school.in"
              value={data.website}
              onChange={set("website")}
            />
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="scp-section-title text-sm font-bold pb-2 mb-3">
          Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              Address Line 1
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              value={data.address_line1}
              onChange={set("address_line1")}
            />
            <div className="h-4" />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              Address Line 2
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              value={data.address_line2}
              onChange={set("address_line2")}
            />
            <div className="h-4" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              City
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              value={data.city}
              onChange={set("city")}
            />
            <div className="h-4" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              District
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              value={data.district}
              onChange={set("district")}
            />
            <div className="h-4" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              State
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              value={data.state}
              onChange={set("state")}
            />
            <div className="h-4" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              Country
            </label>
            <input
              className="scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
              value={data.country}
              onChange={set("country")}
            />
            <div className="h-4" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="scp-field-label text-[13px] font-medium">
              Postal Code
            </label>
            <input
              className={`scp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.postal_code ? "scp-input-error" : ""}`}
              value={data.postal_code}
              //   onChange={set("postal_code")}
              onChange={handleRestrictedInput(setData, "postal_code", pincode)}
            />
            <div className="h-4">
              {errors.postal_code && (
                <p className="scp-field-error text-[11px]">
                  {errors.postal_code}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label className="scp-field-label text-[13px] font-medium">
          Status
        </label>
        <div className="flex gap-2 max-w-xs">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`scp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "scp-status-toggle-active"
                    : "scp-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="scp-form-footer flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="scp-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="scp-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {initialData ? "Update School" : "Create School"}
        </button>
      </div>
    </form>
  );
}
