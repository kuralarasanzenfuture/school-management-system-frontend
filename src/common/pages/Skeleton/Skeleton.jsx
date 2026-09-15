import React from "react";
import "./Skeleton.css";

/**
 * A single pulsing placeholder block. Compose these into whatever
 * layout the real content will have, so the page doesn't jump/reflow
 * once data arrives — e.g.:
 *
 *   <Skeleton className="h-40 w-full rounded-xl mb-4" />
 *   <Skeleton className="h-4 w-3/4 rounded mb-2" />
 *   <Skeleton className="h-4 w-1/4 rounded" />
 *
 * @param {string} [className] - Tailwind sizing/spacing classes (height,
 *   width, margin, rounding) — this component only supplies the pulsing
 *   background color/animation, not layout.
 */
export function Skeleton({ className = "" }) {
  return <div className={`sk-block ${className}`} />;
}

/**
 * Preset matching the reference design exactly: an image block up top,
 * then three rows each pairing a long bar with a short one. Good default
 * for a card/list-item skeleton; swap in your own composition of
 * <Skeleton> blocks for anything more specific.
 */
export function SkeletonCard() {
  return (
    <div className="w-full">
      <Skeleton className="h-40 sm:h-48 w-full rounded-xl mb-4" />
      <div className="flex gap-3 mb-3">
        <Skeleton className="h-4 flex-1 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-full rounded-lg mb-3" />
      <div className="flex gap-3 mb-3">
        <Skeleton className="h-4 flex-1 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-full rounded-lg" />
    </div>
  );
}
