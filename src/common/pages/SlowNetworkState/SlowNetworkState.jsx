import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Snail } from "lucide-react";
import "./SlowNetworkState.css";

/**
 * Global slow-network overlay — for a request that's taking noticeably
 * longer than a normal loading state (i.e. show this *instead of*
 * LoadingState once some threshold has passed, e.g. 5s+), so the user
 * gets a "still working, just slow" message rather than either total
 * silence or a scary error. Same family as the other overlay states.
 *
 * Progress bar is indeterminate by default (a looping sweep, since you
 * generally don't have a real percentage for "how much longer will this
 * take"). Pass a numeric `progress` (0-100) if you do have one — e.g.
 * upload percentage — and it switches to a determinate fill instead.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {string} description
 * @param {number} [progress] - 0-100; omit for the indeterminate sweep
 */
export default function SlowNetworkState({
  open,
  title = "It's taking longer than usual",
  description = "You're on a slow connection. Please wait…",
  progress,
}) {
  const isDeterminate = typeof progress === "number";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sns-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="sns-card w-full max-w-sm rounded-3xl px-6 py-10 sm:px-8 sm:py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 16,
                delay: 0.1,
              }}
              className="sns-circle relative rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <motion.div
                animate={{ x: [-2, 2, -2] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Snail className="sns-icon" strokeWidth={1.75} />
              </motion.div>
            </motion.div>

            <h2 className="sns-title text-[19px] sm:text-[21px] font-bold mb-2">
              {title}
            </h2>
            <p className="sns-desc text-[14px] sm:text-[15px] leading-relaxed mb-7">
              {description}
            </p>

            <div className="sns-track w-full rounded-full overflow-hidden">
              {isDeterminate ? (
                <div
                  className="sns-fill sns-fill-determinate h-full rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              ) : (
                <div className="sns-fill sns-fill-indeterminate h-full rounded-full" />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
