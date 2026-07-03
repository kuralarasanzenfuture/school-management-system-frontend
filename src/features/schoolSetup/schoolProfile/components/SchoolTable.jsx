import React from "react";
import {
  Pencil,
  Trash2,
  School as SchoolIcon,
  ArrowUpDown,
} from "lucide-react";


const BASE_URL = "http://localhost:5000";

function resolveUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SchoolTable({ schools, onEdit, onDelete, deletingId }) {
  return (
    <div className="scp-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="scp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  School <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Contact</th>
              <th className="px-3 py-3 font-semibold">Location</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Created <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => {
              const logo = resolveUrl(school.logo_url);
              const location = [school.city, school.state]
                .filter(Boolean)
                .join(", ");

              return (
                <tr key={school.id} className="scp-row transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="scp-logo w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                        {logo ? (
                          <img
                            src={logo}
                            alt={school.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <SchoolIcon size={18} />
                        )}
                      </div>
                      <div>
                        <p className="scp-name text-[13.5px] font-semibold">
                          {school.name}
                        </p>
                        {school.code && (
                          <p className="scp-code text-[12px]">{school.code}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="scp-cell px-3 py-3.5 text-[13px]">
                    {school.email || school.phone ? (
                      <>
                        {school.email && <div>{school.email}</div>}
                        {school.phone && (
                          <div className="scp-cell-muted">{school.phone}</div>
                        )}
                      </>
                    ) : (
                      <span className="scp-cell-muted">—</span>
                    )}
                  </td>
                  <td className="scp-cell px-3 py-3.5 text-[13px]">
                    {location || <span className="scp-cell-muted">—</span>}
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`scp-status ${
                        school.status === "active"
                          ? "scp-status-active"
                          : "scp-status-inactive"
                      }`}
                    >
                      {school.status}
                    </span>
                  </td>
                  <td className="scp-cell-muted px-3 py-3.5 text-[13px]">
                    {formatDate(school.created_at)}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => onEdit(school)}
                        className="scp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(school.id)}
                        disabled={deletingId === school.id}
                        className="scp-action-btn scp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {schools.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="scp-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No schools found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
