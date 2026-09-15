import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, ChevronLeft } from "lucide-react";
import "./SessionExpiredState.css";

/**
 * Global session-expired overlay. Use this anywhere an API call comes
 * back 401/token-expired instead of a bespoke inline message — one
 * consistent UI across the whole app, same pattern as SuccessState.
 *
 * Not dismissible by default (a expired session usually should block
 * interaction until the user re-authenticates) — pass `dismissible` and
 * `onBack` if you want the back-chevron shown, e.g. for a "session about
 * to expire, keep working or log in again" variant rather than a hard
 * block.
 *
 * Responsive the same way as SuccessState: icon/circle sizes use
 * clamp() instead of fixed px, card is width-capped and centered with
 * outer padding so it never touches the screen edge on mobile.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {string} description
 * @param {string} actionLabel - primary button text
 * @param {() => void} onAction - primary button handler (e.g. navigate to login)
 * @param {boolean} [dismissible] - show the back chevron / allow Escape
 * @param {() => void} [onBack] - required if dismissible
 */
export default function SessionExpiredState({
    open,
    title = "Session Expired",
    description = "Your session has expired for security reasons. Please log in again to continue.",
    actionLabel = "Log In Again",
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
                    className="sxp-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {dismissible && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="sxp-back absolute top-5 left-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
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
                        className="sxp-card w-full max-w-sm rounded-3xl px-6 py-10 sm:px-8 sm:py-12 text-center"
                    >
                        <div className="sxp-icon-wrap relative mx-auto mb-6">
                            <motion.div
                                className="sxp-halo absolute inset-0 rounded-full"
                                initial={{ scale: 0.6, opacity: 0.5 }}
                                animate={{ scale: [0.6, 1.3], opacity: [0.5, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                            />

                            <motion.div
                                initial={{ scale: 0.5, rotate: 12 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                                className="sxp-circle relative rounded-full flex items-center justify-center mx-auto"
                            >
                                <Clock className="sxp-clock-icon" strokeWidth={2.5} />
                            </motion.div>
                        </div>

                        <h2 className="sxp-title text-[21px] sm:text-[24px] font-bold mb-2">{title}</h2>
                        <p className="sxp-desc text-[14px] sm:text-[15px] leading-relaxed mb-7">
                            {description}
                        </p>

                        <button
                            onClick={onAction}
                            className="sxp-btn-primary w-full py-3 rounded-xl text-[14.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
                        >
                            {actionLabel}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}