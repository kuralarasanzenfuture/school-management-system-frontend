/**
 * Audit Log Constants & Helpers
 * Clean, human-designed definitions matching backend ENUMs and features
 */

export const AUDIT_ACTIONS = [
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "RESTORE", label: "Restore" },
  { value: "ACTIVATE", label: "Activate" },
  { value: "DEACTIVATE", label: "Deactivate" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "LOGIN_FAILED", label: "Login Failed" },
  { value: "PASSWORD_CHANGE", label: "Password Change" },
  { value: "PASSWORD_RESET", label: "Password Reset" },
  { value: "APPROVE", label: "Approve" },
  { value: "REJECT", label: "Reject" },
  { value: "SUBMIT", label: "Submit" },
  { value: "CANCEL", label: "Cancel" },
  { value: "EXPORT", label: "Export" },
  { value: "IMPORT", label: "Import" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "UPLOAD", label: "Upload" },
  { value: "PRINT", label: "Print" },
  { value: "VIEW", label: "View" },
];

export const AUDIT_MODULES = [
  { value: "auth", label: "Authentication" },
  { value: "roles", label: "Roles" },
  { value: "users", label: "Users" },
  { value: "schools", label: "School Profile" },
  { value: "departments", label: "Departments" },
  { value: "academic_years", label: "Academic Years" },
  { value: "classes", label: "Classes" },
  { value: "sections", label: "Sections" },
  { value: "class_sections", label: "Class Sections" },
  { value: "subjects", label: "Subjects" },
  { value: "subject_groups", label: "Subject Groups" },
  { value: "class_subjects", label: "Class Subjects" },
  { value: "students", label: "Students" },
  { value: "student_admissions", label: "Admissions" },
  { value: "student_section_allocations", label: "Student Allocations" },
  { value: "student_attendance", label: "Student Attendance" },
  { value: "employees", label: "Employees" },
  { value: "employee_designations", label: "Designations" },
  { value: "employee_attendance", label: "Employee Attendance" },
  { value: "employee_shifts", label: "Shifts" },
  { value: "employee_leave", label: "Leaves" },
  { value: "employee_leave_types", label: "Leave Types" },
  { value: "employee_payroll", label: "Payroll" },
  { value: "employee_salary_components", label: "Salary Components" },
  { value: "employee_salary_structures", label: "Salary Structures" },
  { value: "employee_salary_structure_details", label: "Salary Details" },
];

export const AUDIT_ENTITIES = [
  { value: "role", label: "Role" },
  { value: "user", label: "User" },
  { value: "school", label: "School" },
  { value: "department", label: "Department" },
  { value: "academic_year", label: "Academic Year" },
  { value: "class", label: "Class" },
  { value: "section", label: "Section" },
  { value: "class_section", label: "Class Section" },
  { value: "class_subject", label: "Class Subject" },
  { value: "student", label: "Student" },
  { value: "student_admission", label: "Admission" },
  { value: "student_section_allocation", label: "Section Allocation" },
  { value: "student_attendance", label: "Attendance" },
  { value: "student_attendance_session", label: "Attendance Session" },
  { value: "employee", label: "Employee" },
  { value: "employee_designation", label: "Designation" },
  { value: "employee_shift", label: "Shift" },
  { value: "employee_leave_type", label: "Leave Type" },
  { value: "employee_salary_component", label: "Salary Component" },
  { value: "employee_salary_structure", label: "Salary Structure" },
  { value: "employee_salary_structure_detail", label: "Salary Detail" },
  { value: "subject", label: "Subject" },
  { value: "subject_group", label: "Subject Group" },
];

export const AUDIT_STATUSES = [
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

export const SORT_OPTIONS = [
  { value: "created_at:DESC", label: "Most recent first" },
  { value: "created_at:ASC", label: "Oldest first" },
  { value: "action:ASC", label: "Action (A-Z)" },
  { value: "module:ASC", label: "Module (A-Z)" },
  { value: "status:ASC", label: "Status (Success to Failed)" },
  { value: "id:DESC", label: "Log ID (High to Low)" },
];

export const DATE_PRESETS = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Past 7 days" },
  { key: "last30", label: "Past 30 days" },
  { key: "thisMonth", label: "This month" },
];

/**
 * Clean, subtle tag styles for actions
 */
export function getActionBadgeClass(action) {
  const upper = String(action || "").toUpperCase().trim();
  switch (upper) {
    case "CREATE":
    case "RESTORE":
    case "ACTIVATE":
    case "APPROVE":
      return "al-badge-success";
    case "UPDATE":
    case "UPLOAD":
    case "SUBMIT":
      return "al-badge-primary";
    case "DELETE":
    case "LOGIN_FAILED":
    case "REJECT":
      return "al-badge-danger";
    case "LOGIN":
    case "LOGOUT":
    case "PASSWORD_CHANGE":
    case "PASSWORD_RESET":
      return "al-badge-purple";
    case "DEACTIVATE":
    case "CANCEL":
      return "al-badge-warning";
    default:
      return "al-badge-neutral";
  }
}
