import React from "react";
import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import "./EmptyState.css";

/**
 * Inline "nothing here yet" empty state — for a genuinely empty
 * list/table (no records exist at all), as distinct from NoResultsState
 * (a search/filter that matched zero of the records that DO exist).
 * Same inline-card pattern as NoResultsState — renders within whatever
 * container you put it in, not an overlay.
 *
 * @param {string} [title]
 * @param {string} [description]
 * @param {string} [actionLabel] - Add button text; button is hidden
 *   entirely if omitted (e.g. for a read-only list with nothing to add)
 * @param {() => void} [onAction]
 * @param {React.ComponentType} [icon] - defaults to lucide's PackageOpen
 */
export default function EmptyState({
  title = "No items yet",
  description = "Looks like you haven't added anything here yet.",
  actionLabel,
  onAction,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="es-wrap rounded-2xl px-6 py-14 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="es-icon-wrap relative mx-auto mb-6"
      >
        <span className="es-cloud es-cloud-1" />
        <span className="es-cloud es-cloud-2" />
        <div className="es-circle relative rounded-full flex items-center justify-center mx-auto">
          <Icon className="es-icon" strokeWidth={1.75} />
        </div>
      </motion.div>

      <h3 className="es-title text-[17px] sm:text-[18px] font-bold mb-2">
        {title}
      </h3>
      <p className="es-desc text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-sm mx-auto mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="es-btn-add inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// import EmptyState from "../../../common/components/EmptyState.jsx";

// {departments.length === 0 ? (
//   <EmptyState
//     title="No departments yet"
//     description="Looks like you haven't added any departments here yet."
//     actionLabel="Add Department"
//     onAction={() => setShowAddModal(true)}
//   />
// ) : filteredDepartments.length === 0 ? (
//   <NoResultsState query={searchQuery} onClear={() => setSearchQuery("")} />
// ) : (
//   // table...
// )}
