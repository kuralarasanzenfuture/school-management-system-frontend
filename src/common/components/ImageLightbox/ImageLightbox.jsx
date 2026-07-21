import React, { useEffect } from "react";
import { X } from "lucide-react";
import "./ImageLightbox.css";

/**
 * Full-screen overlay for viewing an image at its best available quality.
 * Pass the same URL used for the thumbnail (object URL for a freshly
 * picked File, or the server URL for an existing upload) — this doesn't
 * re-encode or downscale anything, it just displays that image larger,
 * via object-fit: contain so it never upscales past its natural size.
 *
 * @param {string|null} src - image URL to show; lightbox is closed when null
 * @param {string} [alt]
 * @param {() => void} onClose
 */
export default function ImageLightbox({ src, alt = "", onClose }) {
    useEffect(() => {
        if (!src) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [src, onClose]);

    if (!src) return null;

    return (
        <div className="ilb-overlay" onClick={onClose}>
            <button
                type="button"
                className="ilb-close"
                onClick={onClose}
                aria-label="Close"
            >
                <X size={20} />
            </button>
            <img
                src={src}
                alt={alt}
                className="ilb-image"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}