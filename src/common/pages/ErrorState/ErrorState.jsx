import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import "./ErrorState.css";

// Radiating dash marks around the circle, matching the reference's
// "burst" decoration — same idea as SuccessState's confetti flecks, but
// short straight lines instead of dots, arranged at 8 points around the
// circle and rotated to point outward.
const DASHES = [
  { angle: -45, dist: 78, delay: 0 },
  { angle: 45, dist: 78, delay: 0.05 },
  { angle: -135, dist: 78, delay: 0.1 },
  { angle: 135, dist: 78, delay: 0.15 },
  { angle: 0, dist: 90, delay: 0.2 },
  { angle: 90, dist: 90, delay: 0.25 },
  { angle: 180, dist: 90, delay: 0.3 },
  { angle: -90, dist: 90, delay: 0.35 },
];

/**
 * Global error-state overlay — "something went wrong" for a failed load,
 * a rejected mutation, an unexpected exception boundary, etc. Same
 * family as SuccessState/SessionExpiredState/PermissionDeniedState/
 * NoInternetState: one consistent UI dropped in wherever needed instead
 * of a bespoke inline error block per page.
 *
 * Responsive the same way as the others: clamp()-based icon sizing,
 * width-capped centered card with outer padding.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {string} description
 * @param {string} actionLabel - primary button text
 * @param {() => void} onAction - Try Again handler (e.g. refetch)
 * @param {boolean} [dismissible] - show the back chevron / allow Escape
 * @param {() => void} [onBack] - required if dismissible
 */
export default function ErrorState({
  open,
  title = "Something went wrong!",
  description = "We couldn't load the data. Please try again.",
  actionLabel = "Try Again",
  onAction,
  dismissible = false,
  onBack,
}) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onBack?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible, onBack]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ers-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {dismissible && (
            <button
              type="button"
              onClick={onBack}
              className="ers-back absolute top-5 left-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ChevronLeft size={19} />
            </button>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="ers-card w-full max-w-sm rounded-3xl px-6 py-10 sm:px-8 sm:py-12 text-center"
          >
            <div className="ers-icon-wrap relative mx-auto mb-6">
              {DASHES.map((d, i) => (
                <motion.span
                  key={i}
                  className="ers-dash"
                  style={{
                    transform: `rotate(${d.angle}deg) translate(${d.dist}px)`,
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0.6], scale: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: d.delay,
                    ease: "easeOut",
                  }}
                />
              ))}

              <motion.div
                className="ers-halo absolute inset-0 rounded-full"
                initial={{ scale: 0.6, opacity: 0.5 }}
                animate={{ scale: [0.6, 1.3], opacity: [0.5, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />

              <motion.div
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                  delay: 0.1,
                }}
                className="ers-circle relative rounded-full flex items-center justify-center mx-auto"
              >
                <X className="ers-x-icon" strokeWidth={3.5} />
              </motion.div>
            </div>

            <h2 className="ers-title text-[21px] sm:text-[24px] font-bold mb-2">
              {title}
            </h2>
            <p className="ers-desc text-[14px] sm:text-[15px] leading-relaxed mb-7">
              {description}
            </p>

            <button
              onClick={onAction}
              className="ers-btn-primary w-full py-3 rounded-xl text-[14.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
            >
              {actionLabel}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// import ErrorState from "../../../common/components/ErrorState.jsx";

// <ErrorState
//   open={fetchFailed}
//   onAction={() => dispatch(fetchStudents())}
// />
