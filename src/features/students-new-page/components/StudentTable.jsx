import React from "react";
import { ArrowUpDown, FileText, Eye, Pencil, Trash2 } from "lucide-react";
import Pagination from "../../../common/components/table/Pagination";
import { avatarColors } from "../../../common/utils/colors";

const IMAGE_BASE_URL = "http://localhost:5000";

function Badge({ children, className = "sp-badge-neutral" }) {
  return (
    <span
      className={`${className} inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold`}
    >
      {children}
    </span>
  );
}

function formatDob(dob) {
  if (!dob) return "—";
  const dateObj = new Date(dob);
  if (isNaN(dateObj)) return "—";
  return dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStudentClass(student) {
  return student.student_class || student.class || student.studentClass || null;
}

function getAvatarColor(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/**
 * Student directory table card: header row (title + export), the table
 * itself, and pagination — all inside the same rounded card, matching the
 * original inline markup exactly.
 *
 * @param {Array<object>} pageRows - current page of student rows
 * @param {Array<number>} selected - selected row ids
 * @param {(e) => void} toggleAll
 * @param {(id: number) => void} toggleOne
 * @param {(path: string) => void} navigate
 * @param {(student: object) => void} openEditModal
 * @param {(id: number) => void} handleDelete
 * @param {number} page
 * @param {number} pageSize
 * @param {number} totalItems
 * @param {(page: number) => void} setPage
 * @param {(size: number) => void} setPageSize
 */
export default function StudentTable({
  pageRows,
  selected,
  toggleAll,
  toggleOne,
  navigate,
  openEditModal,
  handleDelete,
  page,
  pageSize,
  totalItems,
  setPage,
  setPageSize,
}) {
  return (
    <div className="sp-table-card rounded-2xl overflow-hidden">
      {/* Card header */}
      {/* <div className="sp-table-header flex items-center justify-between px-5 py-4">
        <h2 className="sp-table-title text-[15px] font-bold">
          Student directory
        </h2>
        <button className="sp-export-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors">
          <FileText size={14} /> Export CSV
        </button>
      </div> */}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  className="sp-checkbox w-4 h-4 rounded"
                  onChange={toggleAll}
                  checked={
                    pageRows.length > 0 &&
                    pageRows.every((student) => selected.includes(student.id))
                  }
                />
              </th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Student <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Phone <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Gender</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Class <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  City <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Date of Birth <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="sp-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No students found for this filter.
                </td>
              </tr>
            ) : (
              pageRows.map((student) => {
                const initials =
                  `${student.first_name?.[0] ?? ""}${student.last_name?.[0] ?? ""}`.toUpperCase();
                const avatarColor = getAvatarColor(
                  `${student.id}-${student.first_name}-${student.last_name}`,
                );
                const studentClass = getStudentClass(student);
                const city =
                  student.permanent_city || student.current_city || null;
                const imageUrl =
                  student.photo_url &&
                  student.photo_url !== "null" &&
                  student.photo_url.trim() !== ""
                    ? `${IMAGE_BASE_URL}${student.photo_url.startsWith("/") ? "" : "/"}${student.photo_url}`
                    : null;

                return (
                  <tr key={student.id} className="sp-row transition-colors">
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        className="sp-checkbox w-4 h-4 rounded"
                        checked={selected.includes(student.id)}
                        onChange={() => toggleOne(student.id)}
                      />
                    </td>

                    {/* Name + avatar */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-[12px] font-bold shrink-0 ${avatarColor}`}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={student.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <div>
                          <p className="sp-name text-[13.5px] font-semibold">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="sp-email text-[12px]">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                      {student.mobile_no || (
                        <span className="sp-cell-muted">—</span>
                      )}
                    </td>

                    <td className="sp-cell px-3 py-3.5 text-[13.5px] capitalize">
                      {student.gender || (
                        <span className="sp-cell-muted">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      {studentClass ? (
                        <Badge>{studentClass}</Badge>
                      ) : (
                        <Badge className="sp-badge-fallback">—</Badge>
                      )}
                    </td>

                    <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                      {city || <span className="sp-cell-muted">—</span>}
                    </td>

                    <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                      {formatDob(student.date_of_birth)}
                    </td>

                    <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                      {student.status ? (
                        <span
                          className={`sp-status sp-status-${student.status}`}
                        >
                          {student.status}
                        </span>
                      ) : (
                        <span className="sp-cell-muted">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="sp-action-btn sp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        currentPage={page}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
