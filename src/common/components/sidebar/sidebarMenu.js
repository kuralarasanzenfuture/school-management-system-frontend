// const sidebarMenu = [
//   {
//     label: "Main",
//     items: [
//       {
//         name: "Dashboard",
//         icon: "ti ti-layout-dashboard",
//         path: "/dashboard",
//       },
//       {
//         name: "Students",
//         icon: "ti ti-users",
//         path: "/students",
//         badge: "1,284",
//       },
//       {
//         name: "Teachers",
//         icon: "ti ti-user-circle",
//         path: "/teachers",
//       },
//       {
//         name: "Attendance",
//         icon: "ti ti-calendar-event",
//         path: "/attendance",
//       },
//       {
//         name: "Exams",
//         icon: "ti ti-file-text",
//         path: "/exams",
//         badge: "3",
//       },
//     ],
//   },

//   {
//     label: "Operations",
//     items: [
//       {
//         name: "Admin",
//         icon: "ti ti-briefcase",
//         path: "/admin",
//       },
//       {
//         name: "Medical",
//         icon: "ti ti-first-aid-kit",
//         path: "/medical",
//       },
//       {
//         name: "Sports",
//         icon: "ti ti-trophy",
//         path: "/sports",
//       },
//       {
//         name: "Fees",
//         icon: "ti ti-credit-card",
//         path: "/fees",
//       },
//       {
//         name: "Transport",
//         icon: "ti ti-bus",
//         path: "/transport",
//       },
//       {
//         name: "Hostel",
//         icon: "ti ti-building-community",
//         path: "/hostel",
//       },
//       {
//         name: "Library",
//         icon: "ti ti-books",
//         path: "/library",
//       },
//       {
//         name: "Expenses",
//         icon: "ti ti-receipt-2",
//         path: "/expenses",
//       },
//     ],
//   },

//   // {
//   //   label: "System",
//   //   items: [
//   //     {
//   //       name: "Settings",
//   //       icon: "ti ti-settings",
//   //       path: "/settings",
//   //     },
//   //   ],
//   // },
// ];

// export default sidebarMenu;

import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaFileAlt,
  FaUserShield,
  FaBriefcaseMedical,
  FaFutbol,
  FaMoneyBillWave,
  FaBus,
  FaHotel,
  FaBook,
  FaReceipt,
  FaCog,
  FaSchool,
  FaCalendarAlt,
  FaBuilding,
  FaLayerGroup,
  FaObjectGroup,
  FaBookOpen,
  FaBookReader,
  FaClipboardList,
  FaUserPlus,
  FaChartBar,
  FaFolderOpen,
  FaArrowUp,
  FaFileExport,
  FaCertificate,
  FaIdCard,
  FaGraduationCap,
  FaUsers,
  FaUserTie,
  FaCalendarTimes,
  FaMoneyCheckAlt,
  FaClock,
  FaTasks,
  FaFolder,
  FaUserCheck,
  FaChartLine,
  FaFileSignature,
  FaPen,
  FaAward,
  FaTrophy,
  FaTags,
  FaWallet,
  FaGift,
  FaCoins,
  FaRoute,
  FaMapMarkerAlt,
  FaIdBadge,
  FaBusAlt,
  FaBed,
  FaDoorOpen,
  FaExchangeAlt,
  FaUndo,
  FaSyringe,
  FaHeartbeat,
  FaSms,
  FaWhatsapp,
  FaEnvelope,
  FaBell,
  FaChartPie,
  FaChartArea,
  FaUsersCog,
  FaKey,
  FaUserCog,
  FaHistory,
  FaDatabase,
} from "react-icons/fa";

// This file is unchanged from your original — just relocated into the
// Sidebar/ folder so everything the sidebar needs lives together.
//
// IMPORTANT: paste your original react-icons import line(s) back at the top
// here (e.g. `import { FaTachometerAlt, FaSchool, ... } from "react-icons/fa";`).
// They were above the array in your source but weren't included in what
// you pasted, so re-add them before using this file.

const sidebarMenu = [
  {
    label: "Dashboard",
    items: [{ name: "Dashboard", icon: FaTachometerAlt, path: "/dashboard" }],
  },

  {
    label: "School Setup",
    items: [
      { name: "School Profile", icon: FaSchool, path: "/school-profile" },
      { name: "Academic Years", icon: FaCalendarAlt, path: "/academic-years" },
      { name: "Departments", icon: FaBuilding, path: "/departments" },
      { name: "Classes", icon: FaSchool, path: "/classes" },
      { name: "Sections", icon: FaLayerGroup, path: "/sections" },
      { name: "Class Sections", icon: FaObjectGroup, path: "/class-sections" },
      { name: "Subjects", icon: FaBookOpen, path: "/subjects" },
      { name: "Subject Groups", icon: FaBookReader, path: "/subject-groups" },
      {
        name: "Class Subjects",
        icon: FaClipboardList,
        path: "/class-subjects",
      },
    ],
  },

  {
    label: "Admissions",
    items: [
      {
        name: "Student Admissions",
        icon: FaUserPlus,
        path: "/student-admissions",
      },
      {
        name: "Admission Enquiry",
        icon: FaClipboardCheck,
        path: "/admission-enquiry",
      },
      {
        name: "Admission Reports",
        icon: FaChartBar,
        path: "/admission-reports",
      },
    ],
  },

  {
    label: "Students",
    items: [
      { name: "Students", icon: FaUserGraduate, path: "/students" },
      {
        name: "Student Documents",
        icon: FaFolderOpen,
        path: "/student-documents",
      },
      {
        name: "Student Promotion",
        icon: FaArrowUp,
        path: "/student-promotion",
      },
      {
        name: "Transfer Certificate",
        icon: FaFileExport,
        path: "/transfer-certificate",
      },
      { name: "Bonafide Certificate", icon: FaCertificate, path: "/bonafide" },
      { name: "ID Cards", icon: FaIdCard, path: "/student-id-card" },
      { name: "Alumni", icon: FaGraduationCap, path: "/alumni" },
    ],
  },

  {
    label: "Employees",
    items: [
      { name: "Employees", icon: FaUsers, path: "/employees" },
      { name: "Designations", icon: FaUserTie, path: "/employee-designations" },
      { name: "Departments", icon: FaBuilding, path: "/employee-departments" },
      { name: "Employee Shifts", icon: FaClock, path: "/employee-shifts" },
      {
        name: "Employee Documents",
        icon: FaFolderOpen,
        path: "/employee-documents",
      },
      {
        name: "Attendance",
        icon: FaClipboardCheck,
        path: "/employee-attendance",
      },
      {
        name: "Leave Management",
        icon: FaCalendarTimes,
        path: "/employee-leaves",
      },
      { name: "Payroll", icon: FaMoneyCheckAlt, path: "/payroll" },
      { name: "Salary Slips", icon: FaReceipt, path: "/salary-slips" },
    ],
  },

  {
    label: "Academics",
    items: [
      { name: "Subjects", icon: FaBook, path: "/subjects" },
      { name: "Timetable", icon: FaClock, path: "/timetable" },
      { name: "Assignments", icon: FaTasks, path: "/assignments" },
      { name: "Homework", icon: FaClipboardList, path: "/homework" },
      { name: "Lesson Plans", icon: FaBookReader, path: "/lesson-plans" },
      { name: "Study Materials", icon: FaFolder, path: "/study-materials" },
    ],
  },

  {
    label: "Attendance",
    items: [
      {
        name: "Student Attendance",
        icon: FaClipboardCheck,
        path: "/student-attendance",
      },
      {
        name: "Employee Attendance",
        icon: FaUserCheck,
        path: "/employee-attendance",
      },
      {
        name: "Attendance Reports",
        icon: FaChartLine,
        path: "/attendance-reports",
      },
    ],
  },

  {
    label: "Examinations",
    items: [
      { name: "Exam Types", icon: FaFileAlt, path: "/exam-types" },
      { name: "Exams", icon: FaFileSignature, path: "/exams" },
      { name: "Marks Entry", icon: FaPen, path: "/marks-entry" },
      { name: "Grade System", icon: FaAward, path: "/grade-system" },
      { name: "Report Cards", icon: FaChartBar, path: "/report-cards" },
      { name: "Rank List", icon: FaTrophy, path: "/rank-list" },
    ],
  },

  {
    label: "Finance",
    items: [
      { name: "Fee Categories", icon: FaTags, path: "/fee-categories" },
      { name: "Fee Structure", icon: FaMoneyBillWave, path: "/fee-structure" },
      { name: "Fee Collection", icon: FaWallet, path: "/fee-collection" },
      { name: "Scholarships", icon: FaGift, path: "/scholarships" },
      { name: "Expenses", icon: FaReceipt, path: "/expenses" },
      { name: "Income", icon: FaCoins, path: "/income" },
      { name: "Payroll", icon: FaMoneyCheckAlt, path: "/payroll" },
    ],
  },

  {
    label: "Transport",
    items: [
      { name: "Vehicles", icon: FaBus, path: "/vehicles" },
      { name: "Routes", icon: FaRoute, path: "/routes" },
      { name: "Stops", icon: FaMapMarkerAlt, path: "/stops" },
      { name: "Drivers", icon: FaIdBadge, path: "/drivers" },
      {
        name: "Transport Assignments",
        icon: FaBusAlt,
        path: "/transport-assignments",
      },
    ],
  },

  {
    label: "Hostel",
    items: [
      { name: "Hostels", icon: FaHotel, path: "/hostels" },
      { name: "Rooms", icon: FaBed, path: "/rooms" },
      { name: "Room Allocation", icon: FaDoorOpen, path: "/room-allocation" },
      { name: "Hostel Fees", icon: FaMoneyBillWave, path: "/hostel-fees" },
    ],
  },

  {
    label: "Library",
    items: [
      { name: "Books", icon: FaBook, path: "/books" },
      { name: "Categories", icon: FaFolderOpen, path: "/book-categories" },
      { name: "Issue Books", icon: FaExchangeAlt, path: "/issue-books" },
      { name: "Returns", icon: FaUndo, path: "/book-returns" },
      {
        name: "Fine Collection",
        icon: FaMoneyBillWave,
        path: "/library-fines",
      },
    ],
  },

  {
    label: "Medical",
    items: [
      {
        name: "Medical Records",
        icon: FaBriefcaseMedical,
        path: "/medical-records",
      },
      { name: "Vaccinations", icon: FaSyringe, path: "/vaccinations" },
      { name: "Health Checkups", icon: FaHeartbeat, path: "/health-checkups" },
    ],
  },

  {
    label: "Communication",
    items: [
      { name: "SMS", icon: FaSms, path: "/sms" },
      { name: "WhatsApp", icon: FaWhatsapp, path: "/whatsapp" },
      { name: "Email", icon: FaEnvelope, path: "/email" },
      { name: "Notifications", icon: FaBell, path: "/notifications" },
    ],
  },

  {
    label: "Reports",
    items: [
      { name: "Student Reports", icon: FaChartPie, path: "/reports/students" },
      {
        name: "Employee Reports",
        icon: FaChartPie,
        path: "/reports/employees",
      },
      {
        name: "Attendance Reports",
        icon: FaChartLine,
        path: "/reports/attendance",
      },
      { name: "Finance Reports", icon: FaChartBar, path: "/reports/finance" },
      { name: "Exam Reports", icon: FaChartArea, path: "/reports/exams" },
    ],
  },

  {
    label: "Administration",
    items: [
      { name: "Users", icon: FaUsersCog, path: "/users" },
      { name: "Roles", icon: FaUserShield, path: "/roles" },
      { name: "Permissions", icon: FaKey, path: "/permissions" },
      { name: "User Roles", icon: FaUserCog, path: "/user-roles" },
      { name: "Audit Logs", icon: FaHistory, path: "/audit-logs" },
      { name: "Settings", icon: FaCog, path: "/settings" },
      { name: "Backup & Restore", icon: FaDatabase, path: "/backup" },
    ],
  },
];

export default sidebarMenu;
