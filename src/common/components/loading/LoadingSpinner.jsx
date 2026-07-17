import React from "react";
import "./LoadingSpinner.css";

/**
 * Full-screen animated loading indicator (the folding-cube SVG), themed
 * with the app's CSS variables instead of hardcoded black/white so it
 * matches whichever theme (light/dark) is active.
 *
 * Usage: <LoadingSpinner /> — renders fixed/centered, covering the
 * viewport. Conditionally render it wherever you're currently doing
 * `if (loading) return <h3>Loading...</h3>`.
 */
export default function LoadingSpinner() {
    return (
        <div className="ld-overlay">
            <svg className="ld-svg" viewBox="0 0 100 100">
                <g
                    className="ld-stroke"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="6"
                >
                    {/* left line */}
                    <path d="M 21 40 V 59">
                        <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            values="0 21 59; 180 21 59"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>
                    {/* right line */}
                    <path d="M 79 40 V 59">
                        <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            values="0 79 59; -180 79 59"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>
                    {/* top line */}
                    <path d="M 50 21 V 40">
                        <animate
                            attributeName="d"
                            values="M 50 21 V 40; M 50 59 V 40"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>
                    {/* bottom line */}
                    <path d="M 50 60 V 79">
                        <animate
                            attributeName="d"
                            values="M 50 60 V 79; M 50 98 V 79"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>
                    {/* top box */}
                    <path
                        className="ld-fade-out"
                        d="M 50 21 L 79 40 L 50 60 L 21 40 Z"
                    />
                    {/* mid box */}
                    <path d="M 50 40 L 79 59 L 50 79 L 21 59 Z" />
                    {/* bottom box */}
                    <path
                        className="ld-fade-in"
                        d="M 50 59 L 79 78 L 50 98 L 21 78 Z"
                    />
                    <animateTransform
                        attributeName="transform"
                        attributeType="XML"
                        type="translate"
                        values="0 0; 0 -19"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </g>
            </svg>
        </div>
    );
}