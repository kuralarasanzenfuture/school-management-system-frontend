/**
 * Utility functions for Role Management
 */

export const generateRoleCodePreview = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isSystemRole = (role) => {
  if (!role) return false;
  return (
    role.is_system === 1 ||
    role.is_system === "1" ||
    role.is_system === true ||
    Number(role.id) === 1 ||
    role.name === "ADMIN" ||
    role.role_code === "ADMIN"
  );
};
