
// "09:00:00" or "09:00" -> "09:00 AM"
export function formatTime(value) {
  if (!value) return "—";
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

// Minutes since midnight, handling overnight (end < start) shifts by
// treating the end as falling on the next day.
export function toMinutes(value) {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function computeWorkingHours(start, end) {
  const startMin = toMinutes(start);
  let endMin = toMinutes(end);
  if (startMin == null || endMin == null) return "";
  if (endMin <= startMin) endMin += 24 * 60; // overnight shift
  return ((endMin - startMin) / 60).toFixed(2);
}

// Returns { leftPct, widthPct } describing where the shift sits across a
// 24-hour strip, for the timeline visual on each shift card. Overnight
// shifts render as two segments (end-of-day + start-of-day) via the
// `wraps` flag.
export function shiftTimelinePosition(start, end) {
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const DAY = 24 * 60;
  if (startMin == null || endMin == null) {
    return { leftPct: 0, widthPct: 0, wraps: false };
  }
  if (endMin > startMin) {
    return {
      leftPct: (startMin / DAY) * 100,
      widthPct: ((endMin - startMin) / DAY) * 100,
      wraps: false,
    };
  }
  // Overnight: shift runs from start to midnight, then midnight to end.
  return {
    leftPct: (startMin / DAY) * 100,
    widthPct: ((DAY - startMin) / DAY) * 100,
    wraps: true,
    secondSegmentWidthPct: (endMin / DAY) * 100,
  };
}
