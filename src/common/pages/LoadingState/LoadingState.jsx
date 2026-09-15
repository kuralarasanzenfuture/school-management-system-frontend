import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./LoadingState.css";

/**
 * Global loading overlay — a spinning ring + "Loading… / Please wait a
 * moment", for whenever the whole screen is waiting on something (initial
 * page fetch, a slow mutation) rather than one specific list/table. Same
 * family as SuccessState/ErrorState/etc, but intentionally has no button
 * — a loading state isn't actionable, so nothing to click while it's up.
 *
 * Not dismissible — there's nothing to dismiss to (the content genuinely
 * isn't ready yet). If you need a cancelable version (e.g. an upload the
 * user can abort), that's a different component; don't overload this one.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {string} description
 */
export default function LoadingState({
  open,
  title = "Loading…",
  description = "Please wait a moment",
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lds-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="lds-card rounded-3xl px-10 py-9 text-center"
          >
            <div className="lds-spinner mx-auto mb-5" />
            <h2 className="lds-title text-[17px] sm:text-[18px] font-bold mb-1">
              {title}
            </h2>
            <p className="lds-desc text-[13px] sm:text-[13.5px]">
              {description}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// import LoadingState from "../../../common/components/LoadingState.jsx";
// import { SkeletonCard } from "../../../common/components/Skeleton.jsx";

// {loading ? (
//   <>
//     <SkeletonCard />
//     <LoadingState open title="Loading…" description="Please wait a moment" />
//   </>
// ) : (
//   // real content
// )}
