// Numbers only
export const numbersOnly = (value) => value.replace(/\D/g, "");

// Length limit
export const limitLength = (value, length) => value.slice(0, length);

// Mobile
export const mobileNumber = (value) => value.replace(/\D/g, "").slice(0, 10);

// Aadhaar
export const aadharNumber = (value) => value.replace(/\D/g, "").slice(0, 12);

// Pincode
export const pincode = (value) => value.replace(/\D/g, "").slice(0, 6);

// IFSC (uppercase, max 11 chars)
export const ifscCode = (value) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 11);

// IFSC validation
export const isValidIFSC = (value) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);

export const toUpperCase = (value) => value.toUpperCase();

export const toLowerCase = (value) => value.toLowerCase();

export const capitalize = (value) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

export const titleCase = (value) =>
  value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

// Generic handler
export const handleRestrictedInput =
  (setter, field, formatter = (v) => v) =>
  (e) => {
    setter((prev) => ({
      ...prev,
      [field]: formatter(e.target.value),
    }));
  };
