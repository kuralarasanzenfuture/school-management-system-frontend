// import React from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";
// import { attendanceWeek } from "../data/dashboardData.js";

// function LedgerTooltip({ active, payload, label }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div
//       style={{
//         background: "#fffdf8",
//         border: "1px solid #182338",
//         borderRadius: 3,
//         padding: "6px 10px",
//         fontFamily: "'IBM Plex Mono', monospace",
//         fontSize: 12,
//       }}
//     >
//       <div style={{ color: "#6b7690", marginBottom: 2 }}>{label}</div>
//       <div style={{ color: "#182338", fontWeight: 600 }}>
//         {payload[0].value}% present
//       </div>
//     </div>
//   );
// }

// export default function AttendanceChart() {
//   return (
//     <div className="db-panel">
//       <div className="db-panel-head">
//         <div>
//           <h3 className="db-panel-title">Weekly Attendance</h3>
//           <p className="db-panel-subtitle">Percentage present, Mon–Sat</p>
//         </div>
//       </div>

//       <ResponsiveContainer width="100%" height={260}>
//         <LineChart data={attendanceWeek} margin={{ left: -20 }}>
//           <CartesianGrid stroke="#ded6c0" strokeDasharray="3 5" vertical={false} />
//           <XAxis
//             dataKey="day"
//             tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: "#6b7690" }}
//             axisLine={{ stroke: "#ded6c0" }}
//             tickLine={false}
//           />
//           <YAxis
//             domain={[60, 100]}
//             tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: "#6b7690" }}
//             axisLine={false}
//             tickLine={false}
//             width={34}
//           />
//           <Tooltip content={<LedgerTooltip />} />
//           <Line
//             dataKey="value"
//             stroke="#b8873a"
//             strokeWidth={2.5}
//             dot={{ r: 3.5, fill: "#182338", strokeWidth: 0 }}
//             activeDot={{ r: 5, fill: "#8e2f3b" }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { attendanceWeek } from "../data/dashboardData.js";

// Hardcoded to match app.css light-theme tokens (--btn-bg, --accent2,
// --divider, --text-muted, --panel-bg). Recharts renders raw SVG, so CSS
// var() resolution can be inconsistent across browsers/exports — these
// are kept in sync with app.css by hand. If you re-theme app.css, update
// these to match.
const COLOR_LINE = "#3949ab"; // --btn-bg
const COLOR_DOT = "#1a237e"; // --side-bg
const COLOR_ACTIVE_DOT = "#e91e63"; // --accent
const COLOR_GRID = "#eaedf8"; // --divider
const COLOR_AXIS_TEXT = "#9ea3b8"; // --text-muted

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #eaedf8",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12.5,
        boxShadow: "0 4px 20px rgba(26,35,126,0.12)",
      }}
    >
      <div style={{ color: "#9ea3b8", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#1a1a2e", fontWeight: 700 }}>
        {payload[0].value}% present
      </div>
    </div>
  );
}

export default function AttendanceChart() {
  return (
    <div className="db-panel">
      <div className="db-panel-head">
        <div>
          <h3 className="db-panel-title">Weekly Attendance</h3>
          <p className="db-panel-subtitle">Percentage present, Mon–Sat</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={attendanceWeek} margin={{ left: -18 }}>
          <CartesianGrid stroke={COLOR_GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: COLOR_AXIS_TEXT }}
            axisLine={{ stroke: COLOR_GRID }}
            tickLine={false}
          />
          <YAxis
            domain={[60, 100]}
            tick={{ fontSize: 12, fill: COLOR_AXIS_TEXT }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            dataKey="value"
            stroke={COLOR_LINE}
            strokeWidth={3}
            dot={{ r: 4, fill: COLOR_DOT, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: COLOR_ACTIVE_DOT }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}