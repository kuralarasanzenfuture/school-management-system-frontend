import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, ChevronLeft } from "lucide-react";
import "./PermissionDeniedState.css";

/**
 * Global permission-denied overlay — camera/mic/location/notifications,
 * whatever browser permission got blocked. Same pattern as SuccessState
 * and SessionExpiredState: one consistent UI dropped in wherever a
 * permission check fails, instead of a bespoke inline message per page.
 *
 * Responsive the same way as the other two: clamp()-based icon sizing,
 * width-capped centered card with outer padding.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {string} description
 * @param {string} actionLabel - primary button text
 * @param {() => void} onAction - primary button handler (e.g. open browser/app settings)
 * @param {boolean} [dismissible] - show the back chevron / allow Escape
 * @param {() => void} [onBack] - required if dismissible
 */
export default function PermissionDeniedState({
    open,
    title = "Permission Denied",
    description = "We need access to your camera to take photos. Please allow permission in settings.",
    actionLabel = "Go to Settings",
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
                    className="pds-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {dismissible && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="pds-back absolute top-5 left-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
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
                        className="pds-card w-full max-w-sm rounded-3xl px-6 py-10 sm:px-8 sm:py-12 text-center"
                    >
                        <div className="pds-icon-wrap relative mx-auto mb-6">
                            <motion.div
                                className="pds-halo absolute inset-0 rounded-full"
                                initial={{ scale: 0.6, opacity: 0.5 }}
                                animate={{ scale: [0.6, 1.3], opacity: [0.5, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                            />

                            <motion.div
                                initial={{ scale: 0.5, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                                className="pds-circle relative rounded-full flex items-center justify-center mx-auto"
                            >
                                <Lock className="pds-lock-icon" fill="currentColor" strokeWidth={1.5} />
                            </motion.div>
                        </div>

                        <h2 className="pds-title text-[21px] sm:text-[24px] font-bold mb-2">{title}</h2>
                        <p className="pds-desc text-[14px] sm:text-[15px] leading-relaxed mb-7">
                            {description}
                        </p>

                        <button
                            onClick={onAction}
                            className="pds-btn-primary w-full py-3 rounded-xl text-[14.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
                        >
                            {actionLabel}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


// import PermissionDeniedState from "../../../common/components/PermissionDeniedState.jsx";

// <PermissionDeniedState
//   open={cameraBlocked}
//   description="We need access to your camera to take photos. Please allow permission in settings."
//   onAction={() => {
//     // Browsers can't programmatically open OS permission settings —
//     // typically this either opens your app's own in-app permission
//     // help screen, or (on web) just shows instructions since there's
//     // no JS API to jump straight to browser settings.
//     setCameraBlocked(false);
//   }}
// />


