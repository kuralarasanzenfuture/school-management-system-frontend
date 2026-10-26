import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, ShieldAlert } from "lucide-react";

const GENDER_COLORS = {
  Male: "#3b82f6", // Blue
  Female: "#ec4899", // Pink
  Other: "#8b5cf6", // Purple
  Unknown: "#94a3b8", // Slate
};

const FACILITY_COLORS = {
  "Transport Only": "#06b6d4",
  "Hostel Only": "#8b5cf6",
  "Transport & Hostel": "#10b981",
  "Day Scholar": "#cbd5e1",
};

// Custom Chart Tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-lg text-xs">
      <div className="font-bold text-slate-800 dark:text-white mb-1">{label}</div>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdmissionReportCharts({
  timelineData = [],
  classData = [],
  genderData = [],
  facilityData = [],
  totalAdmissions = 0,
  loading = false,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Admission Intake Timeline (Area Chart) */}
      <div className="lg:col-span-8 sar-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                Admission Intake Trend
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Monthly admissions registration volume
              </p>
            </div>
          </div>
          {loading ? (
            <div className="sar-skeleton h-5 w-24 rounded-full" />
          ) : (
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
              {totalAdmissions} Total Recorded
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-2">
          {loading ? (
            <div className="h-full w-full flex flex-col justify-between p-2">
              <div className="sar-skeleton h-[180px] w-full rounded-xl" />
              <div className="flex justify-between gap-4 pt-3">
                <div className="sar-skeleton h-3 w-10 rounded" />
                <div className="sar-skeleton h-3 w-10 rounded" />
                <div className="sar-skeleton h-3 w-10 rounded" />
                <div className="sar-skeleton h-3 w-10 rounded" />
                <div className="sar-skeleton h-3 w-10 rounded" />
                <div className="sar-skeleton h-3 w-10 rounded" />
              </div>
            </div>
          ) : timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No timeline intake data for selected filters.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="admissionTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Admissions"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#admissionTrendGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Gender Distribution (Donut Chart) */}
      <div className="lg:col-span-4 sar-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2.5 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <PieIcon size={16} />
          </div>
          <div>
            <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
              Gender Distribution
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Male / Female student ratio
            </p>
          </div>
        </div>

        <div className="h-[210px] w-full flex items-center justify-center relative">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="sar-skeleton w-36 h-36 rounded-full" />
            </div>
          ) : genderData.length === 0 ? (
            <div className="text-slate-400 text-xs">No gender data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {genderData.map((entry) => (
                    <Cell
                      key={`gender-cell-${entry.name}`}
                      fill={GENDER_COLORS[entry.name] || "#94a3b8"}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-xs font-medium">
          {loading ? (
            <div className="flex gap-4">
              <div className="sar-skeleton h-3.5 w-16 rounded" />
              <div className="sar-skeleton h-3.5 w-16 rounded" />
            </div>
          ) : (
            genderData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: GENDER_COLORS[item.name] || "#94a3b8" }}
                />
                <span>{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Class-Wise Intake Breakdown (Bar Chart) */}
      <div className="lg:col-span-8 sar-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                Class-wise Admission Distribution
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total enrollments grouped by class/standard
              </p>
            </div>
          </div>
          {loading ? (
            <div className="sar-skeleton h-4 w-24 rounded" />
          ) : (
            <span className="text-[11px] font-medium text-slate-500">
              {classData.length} Classes Enrolled
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-2">
          {loading ? (
            <div className="h-full w-full flex items-end justify-between gap-3 p-4">
              <div className="sar-skeleton h-24 flex-1 rounded-t-lg" />
              <div className="sar-skeleton h-40 flex-1 rounded-t-lg" />
              <div className="sar-skeleton h-32 flex-1 rounded-t-lg" />
              <div className="sar-skeleton h-48 flex-1 rounded-t-lg" />
              <div className="sar-skeleton h-28 flex-1 rounded-t-lg" />
              <div className="sar-skeleton h-36 flex-1 rounded-t-lg" />
              <div className="sar-skeleton h-20 flex-1 rounded-t-lg" />
            </div>
          ) : classData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No class distribution data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" vertical={false} />
                <XAxis
                  dataKey="className"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Students"
                  fill="#10b981"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Facilities Allocation Breakdown */}
      <div className="lg:col-span-4 sar-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2.5 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <PieIcon size={16} />
          </div>
          <div>
            <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
              Facility Breakdown
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hostel vs Transport requirements
            </p>
          </div>
        </div>

        <div className="h-[210px] w-full flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="sar-skeleton w-36 h-36 rounded-full" />
            </div>
          ) : facilityData.length === 0 ? (
            <div className="text-slate-400 text-xs">No facility data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={facilityData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {facilityData.map((entry) => (
                    <Cell
                      key={`fac-cell-${entry.name}`}
                      fill={FACILITY_COLORS[entry.name] || "#94a3b8"}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-medium">
          {facilityData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: FACILITY_COLORS[item.name] || "#94a3b8" }}
              />
              <span className="truncate">{item.name}:</span>
              <span className="font-bold text-slate-900 dark:text-white ml-auto">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
