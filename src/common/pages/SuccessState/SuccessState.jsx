import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./SuccessState.css";

// Small burst of "confetti" flecks around the checkmark circle, matching
// the reference design. Positions are relative offsets from center, in
// px — kept small so it still reads fine on a narrow phone screen.
const PARTICLES = [
    { x: -60, y: -70, delay: 0, tone: "success" },
    { x: 55, y: -80, delay: 0.05, tone: "warning" },
    { x: -80, y: 10, delay: 0.1, tone: "success" },
    { x: 75, y: 20, delay: 0.15, tone: "warning" },
    { x: -40, y: 80, delay: 0.2, tone: "success" },
    { x: 60, y: 70, delay: 0.25, tone: "warning" },
    { x: 0, y: -95, delay: 0.3, tone: "success" },
];

/**
 * Global success-state overlay. Use this anywhere an action just
 * completed successfully (form saved, record created, payment done,
 * etc.) instead of a bespoke inline "Success!" block — one consistent,
 * polished UI across the whole app, web and mobile.
 *
 * Fully responsive: the card is width-capped and centered with outer
 * padding so it never touches the screen edges, and the icon/particle
 * cluster shrinks on very narrow phones via a media query rather than
 * relying on JS breakpoints.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {string} description
 * @param {string} continueLabel - primary button text
 * @param {() => void} onContinue - primary button handler
 * @param {string} [secondaryLabel] - optional second button (e.g. "Add another")
 * @param {() => void} [onSecondary]
 * @param {boolean} [dismissible] - allow backdrop click / Escape to close
 * @param {() => void} [onClose] - required if dismissible
 */
export default function SuccessState({
    open,
    title = "Success!",
    description = "Your changes have been saved successfully.",
    continueLabel = "Continue",
    onContinue,
    secondaryLabel,
    onSecondary,
    dismissible = false,
    onClose,
}) {
    useEffect(() => {
        if (!open || !dismissible) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, dismissible, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="ssx-overlay fixed inset-0 z-[70] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={dismissible ? onClose : undefined}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 24 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        className="ssx-card w-full max-w-sm rounded-3xl px-6 py-10 sm:px-8 sm:py-12 text-center"
                    >
                        <div className="ssx-icon-wrap relative mx-auto mb-6">
                            {PARTICLES.map((p, i) => (
                                <motion.span
                                    key={i}
                                    className={`ssx-particle ssx-particle-${p.tone}`}
                                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                                    animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: 1 }}
                                    transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
                                />
                            ))}

                            <motion.div
                                className="ssx-halo absolute inset-0 rounded-full"
                                initial={{ scale: 0.6, opacity: 0.5 }}
                                animate={{ scale: [0.6, 1.4], opacity: [0.5, 0] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                            />

                            <motion.div
                                initial={{ scale: 0.5, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                                className="ssx-circle relative rounded-full flex items-center justify-center mx-auto"
                            >
                                <svg viewBox="0 0 52 52" className="ssx-check">
                                    <motion.path
                                        d="M14 27 L23 36 L38 17"
                                        fill="none"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                                    />
                                </svg>
                            </motion.div>
                        </div>

                        <h2 className="ssx-title text-[21px] sm:text-[24px] font-bold mb-2">{title}</h2>
                        <p className="ssx-desc text-[14px] sm:text-[15px] leading-relaxed mb-7">
                            {description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {secondaryLabel && (
                                <button
                                    onClick={onSecondary}
                                    className="ssx-btn-secondary flex-1 py-3 rounded-xl text-[14.5px] font-semibold transition-colors"
                                >
                                    {secondaryLabel}
                                </button>
                            )}
                            <button
                                onClick={onContinue}
                                className="ssx-btn-primary flex-1 py-3 rounded-xl text-[14.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
                            >
                                {continueLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}