import React, { useState } from "react";
import { Link2, Unlink, Building2, Briefcase, Mail, Phone } from "lucide-react";
import usePagination from "../../../../common/components/table/usePagination.jsx";
import Pagination from "../../../../common/components/table/Pagination.jsx";

import { IMAGE_BASE_URL, getFullImageUrl } from "../../../../config/env.js";

function employeeFullName(emp) {
  if (!emp) return "—";
  if (emp.name) return emp.name;
  const full = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
  return full || emp.employee_code || `#${emp.id}`;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function resolvePhotoUrl(emp) {
  if (!emp) return null;
  const raw =
    emp.photo_url ||
    emp.passport_size_photo_url ||
    emp.photo ||
    emp.avatar ||
    emp.image ||
    emp.profile_image ||
    (Array.isArray(emp.documents)
      ? emp.documents.find(
          (d) =>
            d.document_type === "photo" ||
            d.name === "photo" ||
            d.document_type === "passport_size_photo",
        )?.file_url
      : null);

  return getFullImageUrl(raw);
}

function EmployeeAvatar({ emp, name }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = resolvePhotoUrl(emp);

  if (photoUrl && !imgError) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border/60 shadow-sm bg-muted/40 relative">
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="ea-avatar w-10 h-10 rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0">
      {getInitials(name)}
    </div>
  );
}

function getAssignedUser(emp, users = []) {
  if (emp.user && typeof emp.user === "object") return emp.user;
  const uid = emp.user_id;
  if (!uid) return null;
  return users.find((u) => String(u.id) === String(uid)) || { id: uid, username: `#${uid}` };
}

function getUserRoleLabel(user) {
  if (!user || !user.roles) return "";
  if (Array.isArray(user.roles)) {
    const firstRole = user.roles[0];
    if (typeof firstRole === "object") return firstRole?.name || "";
    return String(firstRole).split(":")[1] || String(firstRole);
  }
  if (typeof user.roles === "string") {
    return user.roles.split(",")[0]?.split(":")[1] || user.roles.split(",")[0];
  }
  return "";
}

/**
 * EmployeeAssignTable component
 * Displays list of employees with photo/avatar, employee code, email, phone,
 * department, designation, school, linked user status, and assignment actions.
 */
export default function EmployeeAssignTable({
  employees = [],
  users = [],
  schools = [],
  isAdmin = false,
  onAssign,
  onUnassign,
  unassigningId = null,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: employees, initialSize: initialPageSize });

  const showSchoolColumn =
    isAdmin ||
    schools.length > 1 ||
    employees.some((e) => e.school_id || e.school || e.school_name);

  const colSpan = showSchoolColumn ? 5 : 4;

  return (
    <div className="ea-table-card rounded-2xl overflow-hidden shadow-sm border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="ea-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Employee</th>
              <th className="px-3 py-3 font-semibold">Department & Role</th>
              {showSchoolColumn && <th className="px-3 py-3 font-semibold">School</th>}
              <th className="px-3 py-3 font-semibold">Linked User</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="ea-empty-state px-5 py-12 text-center text-[13.5px]"
                >
                  No employees found matching the filters.
                </td>
              </tr>
            ) : (
              pagedData.map((emp) => {
                const assignedUser = getAssignedUser(emp, users);
                const name = employeeFullName(emp);
                const roleLabel = getUserRoleLabel(assignedUser);
                const dept = emp.department || emp.department_name;
                const desig = emp.designation || emp.designation_name;
                const phone = emp.mobile || emp.phone;

                const empSchoolId = emp.school_id ?? emp.school?.id;
                const matchedSchool = schools.find(
                  (s) => String(s.id ?? s.school_id) === String(empSchoolId),
                );
                const schoolName =
                  emp.school_name ||
                  emp.school?.name ||
                  matchedSchool?.name ||
                  matchedSchool?.school_name;

                const isUnassigning = unassigningId === emp.id;

                return (
                  <tr key={emp.id} className="ea-row transition-colors">
                    {/* Employee Profile (Photo, Name, Code, Email, Phone) */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar emp={emp} name={name} />
                        <div className="min-w-0">
                          <p className="ea-name text-[13.5px] font-semibold truncate leading-tight">
                            {name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[12px] ea-cell-muted">
                            {emp.employee_code && (
                              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-muted/50 border border-border/40 shrink-0">
                                {emp.employee_code}
                              </span>
                            )}
                            {emp.email && (
                              <span className="truncate max-w-[160px] inline-flex items-center gap-1">
                                <Mail size={11} className="shrink-0 text-muted-foreground" />
                                <span className="truncate">{emp.email}</span>
                              </span>
                            )}
                            {phone && (
                              <span className="truncate max-w-[140px] inline-flex items-center gap-1 font-mono text-[11.5px]">
                                <Phone size={11} className="shrink-0 text-muted-foreground" />
                                <span>{phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Designation */}
                    <td className="px-3 py-3.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium ea-cell truncate flex items-center gap-1.5">
                          <Briefcase size={12} className="ea-cell-muted shrink-0" />
                          {desig || "General Staff"}
                        </p>
                        {dept && (
                          <p className="text-[11.5px] ea-cell-muted truncate mt-0.5">
                            {dept}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* School Column */}
                    {showSchoolColumn && (
                      <td className="px-3 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-[12.5px] ea-cell font-medium max-w-[190px] truncate">
                          <Building2 size={13} className="ea-cell-muted shrink-0" />
                          <span className="truncate">
                            {schoolName || (empSchoolId ? `School #${empSchoolId}` : "—")}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Linked User */}
                    <td className="px-3 py-3.5">
                      {assignedUser ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="ea-link-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium">
                            <Link2 size={12} className="shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {assignedUser.username || assignedUser.email}
                            </span>
                          </span>
                          {roleLabel && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium border border-border/30">
                              {roleLabel}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="ea-unlinked-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium">
                          Not linked
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {assignedUser ? (
                          <button
                            type="button"
                            onClick={() => onUnassign(emp)}
                            disabled={isUnassigning}
                            className="ea-unassign-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors border border-transparent hover:border-destructive/20 cursor-pointer"
                            title="Unlink user account from this employee"
                          >
                            <Unlink size={13} />
                            Unassign
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssign(emp)}
                            className="ea-assign-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                            title="Assign a user login account to this employee"
                          >
                            <Link2 size={13} />
                            Assign User
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}