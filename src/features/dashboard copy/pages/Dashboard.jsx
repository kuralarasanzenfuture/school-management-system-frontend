// import React from "react";
// import StatTiles from "../components/StatTiles.jsx";
// import AttendanceChart from "../components/AttendanceChart.jsx";
// import FeeSeal from "../components/FeeSeal.jsx";
// import RollCallLedger from "../components/RollCallLedger.jsx";
// import QuickActionTabs from "../components/QuickActionTabs.jsx";
// import "../styles/dashboard.css";

// const TODAY = new Date().toLocaleDateString("en-IN", {
//   weekday: "long",
//   day: "2-digit",
//   month: "long",
//   year: "numeric",
// });

// export default function DashboardPage() {
//   // TODO: wire up real data later — see dashboardSlice.js / dashboardService.js
//   // for the scaffolded thunks. Every child component currently imports its
//   // data straight from dashboardData.js; once the API is ready, either:
//   //   (a) dispatch fetchDashboardOverview() here and pass the results down
//   //       as props, or
//   //   (b) have each component read from useSelector(state => state.dashboard)
//   //       instead of the static dashboardData.js import.
//   // Both are one-line changes per component since the data shapes already
//   // match what a real response would look like.

//   const handleQuickAction = (actionId) => {
//     // TODO: route each action to its real destination, e.g.
//     // navigate('/students/new') for add_student, open a modal, etc.
//     console.log("Quick action:", actionId);
//   };

//   return (
//     <div className="db-root">
//       <div className="db-masthead">
//         <div>
//           <span className="db-eyebrow">Admin Register</span>
//           <h1 className="db-masthead-title">Good morning, Admin</h1>
//         </div>
//         <div className="db-masthead-date">
//           Today
//           <strong>{TODAY}</strong>
//         </div>
//       </div>

//       <StatTiles />

//       <div className="db-grid-2">
//         <AttendanceChart />
//         <FeeSeal />
//       </div>

//       <div className="db-grid-2">
//         <RollCallLedger />
//         <QuickActionTabs onAction={handleQuickAction} />
//       </div>
//     </div>
//   );
// }


import React from "react";
import StatTiles from "../components/StatTiles.jsx";
import AttendanceChart from "../components/AttendanceChart.jsx";
import FeeChart from "../components/FeeChart.jsx";
import RecentStudents from "../components/RecentStudents.jsx";
import QuickActions from "../components/QuickActions.jsx";
import "../styles/dashboard.css";

const TODAY = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function DashboardPage() {
  // TODO: wire up real data later — see dashboardSlice.js / dashboardService.js
  // for the scaffolded thunks. Every child component currently imports its
  // data straight from dashboardData.js; once the API is ready, either:
  //   (a) dispatch fetchDashboardOverview() here and pass results down as
  //       props, or
  //   (b) have each component read from useSelector(state => state.dashboard)
  //       instead of the static dashboardData.js import.

  const handleQuickAction = (actionId) => {
    // TODO: route each action to its real destination.
    console.log("Quick action:", actionId);
  };

  return (
    <div className="db-root">
      <div className="db-hero">
        <span className="db-hero-eyebrow">Dashboard</span>
        <h1 className="db-hero-title">Welcome back, Admin 👋</h1>
        <p className="db-hero-date">{TODAY}</p>
      </div>

      <StatTiles />

      <div className="db-grid-2">
        <AttendanceChart />
        <FeeChart />
      </div>

      <div className="db-grid-2">
        <RecentStudents />
        <QuickActions onAction={handleQuickAction} />
      </div>
    </div>
  );
}
