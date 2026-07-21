// Dummy data for the dashboard. Every export here is shaped the way a
// real API response would be, so swapping to live data later is a
// find-and-replace of the import, not a rewrite of the components.
// See dashboardSlice.js / dashboardService.js for the scaffolded thunks
// this will eventually route through.

export const statsData = [
  {
    id: "students",
    tab: "Roll",
    tone: "ink",
    label: "Total Students",
    value: "1,284",
    sub: "32 enrolled this month",
    delta: "+4.2%",
    direction: "up",
  },
  {
    id: "teachers",
    tab: "Staff",
    tone: "moss",
    label: "Total Teachers",
    value: "86",
    sub: "4 on leave today",
    delta: "+2.1%",
    direction: "up",
  },
  {
    id: "fees",
    tab: "Ledger",
    tone: "brass",
    label: "Fee Collected",
    value: "₹18.4L",
    sub: "₹2.6L pending",
    delta: "+12%",
    direction: "up",
  },
  {
    id: "attendance",
    tab: "Today",
    tone: "redink",
    label: "Attendance Today",
    value: "91.8%",
    sub: "1,179 / 1,284 present",
    delta: "-1.3%",
    direction: "down",
  },
];

export const attendanceWeek = [
  { day: "Mon", value: 90 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 94 },
  { day: "Thu", value: 91 },
  { day: "Fri", value: 97 },
  { day: "Sat", value: 95 },
];

export const feeSummary = {
  collectedPct: 82,
  pendingPct: 18,
  collectedAmount: "₹18.4L",
  pendingAmount: "₹2.6L",
};

export const rollCallStudents = [
  {
    id: 1,
    roll: "1042",
    initials: "AK",
    name: "Aryan Kapoor",
    email: "aryan.k@school.in",
    className: "X-A",
    attendance: "94%",
    grade: "A+",
    status: "active",
  },
  {
    id: 2,
    roll: "0987",
    initials: "SM",
    name: "Sneha Mehta",
    email: "sneha.m@school.in",
    className: "IX-B",
    attendance: "88%",
    grade: "B+",
    status: "active",
  },
  {
    id: 3,
    roll: "1158",
    initials: "RN",
    name: "Rohan Nair",
    email: "rohan.n@school.in",
    className: "XI-C",
    attendance: "76%",
    grade: "C",
    status: "warning",
  },
  {
    id: 4,
    roll: "0834",
    initials: "PJ",
    name: "Pooja Joshi",
    email: "pooja.j@school.in",
    className: "VIII-A",
    attendance: "97%",
    grade: "A+",
    status: "active",
  },
  {
    id: 5,
    roll: "1301",
    initials: "KS",
    name: "Karan Singh",
    email: "karan.s@school.in",
    className: "XII-B",
    attendance: "63%",
    grade: "D",
    status: "at_risk",
  },
  {
    id: 6,
    roll: "1067",
    initials: "DA",
    name: "Divya Anand",
    email: "divya.a@school.in",
    className: "X-B",
    attendance: "91%",
    grade: "B+",
    status: "active",
  },
];

export const quickActions = [
  { id: "add_student", tab: "Admissions", tone: "ink", title: "Add Student" },
  { id: "add_teacher", tab: "Staff", tone: "moss", title: "Add Teacher" },
  {
    id: "generate_report",
    tab: "Reports",
    tone: "brass",
    title: "Generate Report",
  },
  {
    id: "send_notice",
    tab: "Notices",
    tone: "redink",
    title: "Send Notification",
  },
];
