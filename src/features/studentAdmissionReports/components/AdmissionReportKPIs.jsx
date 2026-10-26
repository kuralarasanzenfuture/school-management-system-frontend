import React from "react";
import {
  Users,
  UserCheck,
  Clock,
  Bus,
  Home,
  TrendingUp,
} from "lucide-react";

export default function AdmissionReportKPIs({ stats }) {
  const {
    total = 0,
    active = 0,
    pending = 0,
    transport = 0,
    hostel = 0,
    male = 0,
    female = 0,
  } = stats || {};

  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const transportPercent = total > 0 ? Math.round((transport / total) * 100) : 0;
  const hostelPercent = total > 0 ? Math.round((hostel / total) * 100) : 0;

  const kpis = [
    {
      id: "total",
      label: "Total Admissions",
      value: total,
      sublabel: "Records in filter scope",
      icon: Users,
      color: "indigo",
      bgGradient: "from-indigo-500/10 to-indigo-600/5",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60",
      accent: "text-indigo-600 dark:text-indigo-400",
      pill: "Overall Intake",
    },
    {
      id: "active",
      label: "Active Enrolled",
      value: active,
      sublabel: `${activePercent}% conversion rate`,
      icon: UserCheck,
      color: "emerald",
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60",
      accent: "text-emerald-600 dark:text-emerald-400",
      pill: `${activePercent}% Active`,
    },
    {
      id: "pending",
      label: "Pending / In Review",
      value: pending,
      sublabel: "Awaiting documents/verification",
      icon: Clock,
      color: "amber",
      bgGradient: "from-amber-500/10 to-amber-600/5",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60",
      accent: "text-amber-600 dark:text-amber-400",
      pill: pending > 0 ? "Action Required" : "All Processed",
    },
    {
      id: "transport",
      label: "Transport Opt-In",
      value: transport,
      sublabel: `${transportPercent}% of enrolled students`,
      icon: Bus,
      color: "cyan",
      bgGradient: "from-cyan-500/10 to-cyan-600/5",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60",
      accent: "text-cyan-600 dark:text-cyan-400",
      pill: "Bus Route Required",
    },
    {
      id: "hostel",
      label: "Hostel Facility",
      value: hostel,
      sublabel: `${hostelPercent}% boarding students`,
      icon: Home,
      color: "violet",
      bgGradient: "from-violet-500/10 to-violet-600/5",
      iconBg: "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/60",
      accent: "text-violet-600 dark:text-violet-400",
      pill: "Boarder Service",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="sar-card sar-kpi-card rounded-2xl p-4 flex flex-col justify-between relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {kpi.value.toLocaleString()}
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}
              >
                <Icon size={19} />
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {kpi.sublabel}
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300`}
              >
                {kpi.pill}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
