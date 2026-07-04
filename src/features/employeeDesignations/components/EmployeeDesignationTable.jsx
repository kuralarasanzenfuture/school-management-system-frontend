import React from "react";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";


export default function EmployeeDesignationTable({
  designations,
  onEdit,
  onDelete,
  deletingId,
}) {

    // console.log("Designations:", designations);

  return (
    <div className="edp-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="edp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Designation <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Description</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {designations.map((designation) => (
              <tr key={designation.id} className="edp-row transition-colors">
                <td className="edp-name px-5 py-3.5 text-[13.5px] font-semibold">
                  {designation.name}
                </td>
                <td className="edp-desc px-3 py-3.5 text-[13px] max-w-[360px] truncate">
                  {designation.description || (
                    <span className="edp-cell-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`edp-status ${
                      designation.status === "active"
                        ? "edp-status-active"
                        : "edp-status-inactive"
                    }`}
                  >
                    {designation.status}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1 pr-2">
                    <button
                      onClick={() => onEdit(designation)}
                      className="edp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(designation.id)}
                      disabled={deletingId === designation.id}
                      className="edp-action-btn edp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {designations.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="edp-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No designations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
