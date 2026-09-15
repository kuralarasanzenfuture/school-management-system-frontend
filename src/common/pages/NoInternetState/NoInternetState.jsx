import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, ChevronLeft } from "lucide-react";
import "./NoInternetState.css";

/**
 * Global no-internet overlay. Same family as SuccessState,
 * SessionExpiredState, and PermissionDeniedState — one consistent UI
 * dropped in wherever a network check fails, instead of a bespoke inline
 * message per page. Neutral gray-toned rather than warning/danger, since
 * a dropped connection is a routine fact, not an error condition.
 *
 * Natural trigger point: pair this with the browser's online/offline
 * events —
 *   const [offline, setOffline] = useState(!navigator.onLine);
 *   useEffect(() => {
 *     const goOffline = () => setOffline(true);
 *     const goOnline = () => setOffline(false);
 *     window.addEventListener("offline", goOffline);
 *     window.addEventListener("online", goOnline);
 *     return () => {
 *       window.removeEventListener("offline", goOffline);
 *       window.removeEventListener("online", goOnline);
 *     };
 *   }, []);
 * mounted once near the root of the app rather than per-page.
 *
 * Responsive the same way as the others: clamp()-based icon sizing,
 * width-capped centered card with outer padding.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {string} description
 * @param {string} actionLabel - primary button text
 * @param {() => void} onAction - Retry handler (e.g. refetch, or just re-check navigator.onLine)
 * @param {boolean} [dismissible] - show the back chevron / allow Escape
 * @param {() => void} [onBack] - required if dismissible
 */
export default function NoInternetState({
  open,
  title = "No Internet Connection",
  description = "Please check your internet connection and try again.",
  actionLabel = "Retry",
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
          className="nis-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {dismissible && (
            <button
              type="button"
              onClick={onBack}
              className="nis-back absolute top-5 left-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
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
            className="nis-card w-full max-w-sm rounded-3xl px-6 py-10 sm:px-8 sm:py-12 text-center"
          >
            <div className="nis-icon-wrap relative mx-auto mb-6">
              <motion.div
                className="nis-halo absolute inset-0 rounded-full"
                initial={{ scale: 0.6, opacity: 0.5 }}
                animate={{ scale: [0.6, 1.3], opacity: [0.5, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />

              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                  delay: 0.1,
                }}
                className="nis-circle relative rounded-full flex items-center justify-center mx-auto"
              >
                <WifiOff className="nis-icon" strokeWidth={2} />
              </motion.div>
            </div>

            <h2 className="nis-title text-[21px] sm:text-[24px] font-bold mb-2">
              {title}
            </h2>
            <p className="nis-desc text-[14px] sm:text-[15px] leading-relaxed mb-7">
              {description}
            </p>

            <button
              onClick={onAction}
              className="nis-btn-primary w-full py-3 rounded-xl text-[14.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
            >
              {actionLabel}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// import { useEffect, useState } from "react";
// import NoInternetState from "../../../common/components/NoInternetState.jsx";

// function App() {
//   const [offline, setOffline] = useState(!navigator.onLine);

//   useEffect(() => {
//     const goOffline = () => setOffline(true);
//     const goOnline = () => setOffline(false);
//     window.addEventListener("offline", goOffline);
//     window.addEventListener("online", goOnline);
//     return () => {
//       window.removeEventListener("offline", goOffline);
//       window.removeEventListener("online", goOnline);
//     };
//   }, []);

//   return (
//     <>
//       {/* rest of your app */}
//       <NoInternetState
//         open={offline}
//         onAction={() => window.location.reload()}
//       />
//     </>
//   );
// }
