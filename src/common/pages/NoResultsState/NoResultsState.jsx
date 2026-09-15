import React from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import "./NoResultsState.css";

/**
 * Inline "no results" empty state — for search/filter results that came
 * back empty. Unlike SuccessState/SessionExpiredState/PermissionDeniedState
 * (which are full-screen overlays for a whole-app moment), this renders
 * inline within whatever container you put it in — a table card, a list
 * page, a search panel — the same way the various one-off ".xx-empty-state"
 * blocks already scattered across this app's pages do (DepartmentPage,
 * AttendancePage, etc). Use this one component everywhere instead.
 *
 * @param {string} [query] - the search term that returned nothing; if
 *   given, it's woven into the default description ("...for "query"...")
 * @param {() => void} [onClear] - Clear Search button handler; button is
 *   hidden entirely if omitted (e.g. for a generic "no data yet" empty
 *   state that isn't the result of a search)
 * @param {string} [title]
 * @param {React.ReactNode} [description] - overrides the auto-generated,
 *   query-aware description entirely
 * @param {string} [clearLabel]
 * @param {React.ComponentType} [icon] - defaults to lucide's SearchX
 */
export default function NoResultsState({
  query,
  onClear,
  title = "No results found",
  description,
  clearLabel = "Clear Search",
  icon: Icon = SearchX,
}) {
  const desc =
    description ??
    (query ? (
      <>
        We couldn't find anything for{" "}
        <span className="nrs-query">"{query}"</span>. Try different keywords.
      </>
    ) : (
      "Try different keywords or check your spelling."
    ));

  return (
    <div className="nrs-wrap rounded-2xl px-6 py-14 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="nrs-icon-wrap relative mx-auto mb-6"
      >
        <span className="nrs-blob nrs-blob-1" />
        <span className="nrs-blob nrs-blob-2" />
        <span className="nrs-blob nrs-blob-3" />
        <div className="nrs-circle relative rounded-full flex items-center justify-center mx-auto">
          <Icon className="nrs-icon" strokeWidth={2} />
        </div>
      </motion.div>

      <h3 className="nrs-title text-[17px] sm:text-[18px] font-bold mb-2">
        {title}
      </h3>
      <p className="nrs-desc text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-sm mx-auto mb-6">
        {desc}
      </p>

      {onClear && (
        <button
          onClick={onClear}
          className="nrs-btn-clear inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}

// import NoResultsState from "../../../common/components/NoResultsState.jsx";

// {pagedRows.length === 0 ? (
//   <NoResultsState
//     query={searchQuery}
//     onClear={() => { setSearchQuery(""); reset(); }}
//   />
// ) : (
//   // table...
// )}
