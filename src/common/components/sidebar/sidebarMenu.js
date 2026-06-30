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
} from "react-icons/fa";

const sidebarMenu = [
  {
    label: "Main",
    items: [
      {
        name: "Dashboard",
        icon: FaTachometerAlt,
        path: "/dashboard",
      },
      {
        name: "Students",
        icon: FaUserGraduate,
        path: "/students",
        badge: "1,284",
      },
      {
        name: "Teachers",
        icon: FaChalkboardTeacher,
        path: "/teachers",
      },
      {
        name: "Attendance",
        icon: FaClipboardCheck,
        path: "/attendance",
      },
      {
        name: "Exams",
        icon: FaFileAlt,
        path: "/exams",
        badge: "3",
      },
    ],
  },

  {
    label: "Operations",
    items: [
      {
        name: "Admin",
        icon: FaUserShield,
        path: "/admin",
      },
      {
        name: "Medical",
        icon: FaBriefcaseMedical,
        path: "/medical",
      },
      {
        name: "Sports",
        icon: FaFutbol,
        path: "/sports",
      },
      {
        name: "Fees",
        icon: FaMoneyBillWave,
        path: "/fees",
      },
      {
        name: "Transport",
        icon: FaBus,
        path: "/transport",
      },
      {
        name: "Hostel",
        icon: FaHotel,
        path: "/hostel",
      },
      {
        name: "Library",
        icon: FaBook,
        path: "/library",
      },
      {
        name: "Expenses",
        icon: FaReceipt,
        path: "/expenses",
      },
    ],
  },

  // {
  //   label: "System",
  //   items: [
  //     {
  //       name: "Settings",
  //       icon: FaCog,
  //       path: "/settings",
  //     },
  //   ],
  // },
];

export default sidebarMenu;