import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, CalendarDays, CalendarCheck2, Eye } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination.jsx";
import usePagination from "../../../../common/components/table/usePagination.jsx";
import { getFullImageUrl } from "../../../../config/env.js";


function formatDate(value) {
    if (!value) return null;
    const dateObj = new Date(value);
    if (isNaN(dateObj)) return null;
    return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function getInitials(firstName, lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function isStructureActive(structure) {
    if (structure.status !== "active") return false;
    const today = new Date();
    const from = new Date(structure.effective_from);
    if (isNaN(from) || today < from) return false;
    if (!structure.effective_to) return true;
    const to = new Date(structure.effective_to);
    return today <= to;
}

export default function SalaryStructureTable({
    structures = [],
    onView,
    onEdit,
    onDelete,
    showSchoolColumn = false,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
    employeeMap = null,
}) {
    const navigate = useNavigate();
    const handleView = (s) => (onView ? onView(s) : navigate(`/employee-salary-structures/view/${s.id}`));
    const {
        pagedData,
        currentPage,
        pageSize,
        totalItems,
        setPage,
        setPageSize,
    } = usePagination({ data: structures, initialSize: initialPageSize });

    const colSpan = showSchoolColumn ? 7 : 6;

    return (
        <div className="ss-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="ss-thead text-[11.5px] uppercase tracking-wide">
                            {showSchoolColumn && (
                                <th className="px-5 py-3 font-semibold">School</th>
                            )}
                            <th className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}>
                                Employee
                            </th>
                            <th className="px-3 py-3 font-semibold">Structure Name</th>
                            <th className="px-3 py-3 font-semibold">Effective From</th>
                            <th className="px-3 py-3 font-semibold">Effective To</th>
                            <th className="px-3 py-3 font-semibold text-center">Status</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedData.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan}
                                    className="ss-empty-state px-5 py-12 text-center text-[13.5px]">
                                    No salary structures found.
                                </td>
                            </tr>
                        ) : (
                            pagedData.map((structure) => {
                                const active = isStructureActive(structure);
                                return (
                                    <tr key={structure.id} className="ss-row">

                                        {showSchoolColumn && (
                                            <td className="ss-cell-secondary px-5 py-3.5 text-[13px]">
                                                {structure.school_name ?? "—"}
                                            </td>
                                        )}

                                        {/* Employee */}
                                        <td className={`${showSchoolColumn ? "px-3" : "px-5"} py-3.5`}>
                                            <div className="flex items-center gap-3">
                                                {(() => {
                                                    const emp = employeeMap?.get?.(String(structure.employee_id));
                                                    const rawPhoto =
                                                        structure.photo_url ||
                                                        structure.passport_size_photo_url ||
                                                        structure.profile_image ||
                                                        structure.photo ||
                                                        structure.avatar ||
                                                        structure.image ||
                                                        emp?.photo_url ||
                                                        emp?.passport_size_photo_url ||
                                                        emp?.profile_image ||
                                                        emp?.photo ||
                                                        emp?.avatar;
                                                    const photoUrl = rawPhoto ? getFullImageUrl(rawPhoto) : null;
                                                    const initials = getInitials(structure.first_name, structure.last_name);
                                                    return (
                                                        <div className="ss-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 overflow-hidden relative">
                                                            {photoUrl ? (
                                                                <img
                                                                    src={photoUrl}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = "none";
                                                                        const fb = e.currentTarget.parentElement?.querySelector(".tbl-avatar-fb");
                                                                        if (fb) fb.style.display = "flex";
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <span
                                                                className="tbl-avatar-fb w-full h-full items-center justify-center"
                                                                style={{ display: photoUrl ? "none" : "flex" }}
                                                            >
                                                                {initials}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                                <div
                                                    className="min-w-0 cursor-pointer"
                                                    onClick={() => handleView(structure)}
                                                    title="View salary details"
                                                >
                                                    <p className="ss-cell-primary text-[13.5px] font-semibold truncate hover:text-[var(--btn-bg)] transition-colors">
                                                        {structure.first_name} {structure.last_name ?? ""}
                                                    </p>
                                                    {structure.designation && (
                                                        <span className="ss-designation mt-0.5 inline-block">
                                                            {structure.designation}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Structure name */}
                                        <td className="px-3 py-3.5 max-w-[200px]">
                                            <p className="ss-structure-name truncate">
                                                {structure.structure_name}
                                            </p>
                                            {structure.remarks && (
                                                <p className="ss-cell-muted text-[12px] mt-0.5 truncate">
                                                    {structure.remarks}
                                                </p>
                                            )}
                                        </td>

                                        {/* Effective from */}
                                        <td className="px-3 py-3.5">
                                            <div className="ss-date-chip">
                                                <CalendarDays size={13} />
                                                {formatDate(structure.effective_from) ?? "—"}
                                            </div>
                                        </td>

                                        {/* Effective to */}
                                        <td className="px-3 py-3.5">
                                            {structure.effective_to ? (
                                                <div className="ss-date-chip ss-date-chip-ended">
                                                    <CalendarCheck2 size={13} />
                                                    {formatDate(structure.effective_to)}
                                                </div>
                                            ) : (
                                                <span className="ss-date-chip ss-date-chip-active">
                                                    <CalendarCheck2 size={13} />
                                                    Open-ended
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-3.5 text-center">
                                            <span className={`ss-status ss-status-${structure.status}`}>
                                                {active ? "Active" : structure.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center justify-end gap-1 pr-2">
                                                <button
                                                    onClick={() => handleView(structure)}
                                                    className="ss-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                    title="View Structure & Components"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(structure)}
                                                    className="ss-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(structure)}
                                                    className="ss-action-btn ss-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
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