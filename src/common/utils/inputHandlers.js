// src/utils/inputHandlers.js

export const numbersOnly = (value) => value.replace(/\D/g, "");

export const limitLength = (value, length) => value.slice(0, length);

export const mobileNumber = (value) => value.replace(/\D/g, "").slice(0, 10);

export const aadharNumber = (value) => value.replace(/\D/g, "").slice(0, 12);

export const pincode = (value) => value.replace(/\D/g, "").slice(0, 6);

export const handleRestrictedInput =
  (setter, field, formatter = (v) => v) =>
  (e) => {
    setter((prev) => ({
      ...prev,
      [field]: formatter(e.target.value),
    }));
  };
