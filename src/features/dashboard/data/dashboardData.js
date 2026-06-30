import {
  FaUsers,
  FaUserCheck,
  FaIndianRupeeSign,
  FaClipboardCheck,
} from "react-icons/fa6";

import {
  HiTrendingUp,
  HiTrendingDown,
} from "react-icons/hi";

export const statsData = [
  {
    id: 1,
    title: "Total Students",
    value: "1,284",
    subtitle: "32 enrolled this month",
    icon: FaUsers,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trend: "+4.2%",
    trendIcon: HiTrendingUp,
    trendColor: "text-green-600",
  },
  {
    id: 2,
    title: "Total Teachers",
    value: "86",
    subtitle: "4 on leave today",
    icon: FaUserCheck,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    trend: "+2.1%",
    trendIcon: HiTrendingUp,
    trendColor: "text-green-600",
  },
  {
    id: 3,
    title: "Fee Collected",
    value: "₹18.4L",
    subtitle: "₹2.6L Pending",
    icon: FaIndianRupeeSign,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    trend: "+12%",
    trendIcon: HiTrendingUp,
    trendColor: "text-green-600",
  },
  {
    id: 4,
    title: "Attendance Today",
    value: "91.8%",
    subtitle: "1179 / 1284 Present",
    icon: FaClipboardCheck,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    trend: "-1.3%",
    trendIcon: HiTrendingDown,
    trendColor: "text-red-500",
  },
];