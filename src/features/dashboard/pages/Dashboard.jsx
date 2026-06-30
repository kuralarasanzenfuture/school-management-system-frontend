import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaCalendarCheck,
} from "react-icons/fa";

import DashboardCard from "../components/DashboardCard";
import AttendanceChart from "../components/AttendanceChart";
import FeeChart from "../components/FeeChart";
import RecentStudents from "../components/RecentStudents";
import QuickActions from "../components/QuickActions";

import "../styles/dashboard.css";
import DashboardCards from "../components/DashboardCards";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div>
        <p className="mt-1 text-sm text-slate-500">Welcome back, Admin 👋</p>
      </div>

      {/* Cards */}

      {/* <div className="dashboard-cards">
        <DashboardCard
          title="Students"
          value="1,284"
          icon={<FaUserGraduate />}
          color="#4F46E5"
        />

        <DashboardCard
          title="Teachers"
          value="58"
          icon={<FaChalkboardTeacher />}
          color="#16A34A"
        />

        <DashboardCard
          title="Fees Collection"
          value="₹8.4L"
          icon={<FaMoneyBillWave />}
          color="#F59E0B"
        />

        <DashboardCard
          title="Attendance"
          value="94%"
          icon={<FaCalendarCheck />}
          color="#EF4444"
        />
        
      </div> */}
      <DashboardCards />

      {/* Charts */}

      <div className="dashboard-grid">
        <div>
          <AttendanceChart />
        </div>

        <FeeChart />
      </div>

      {/* Bottom */}

      <div className="dashboard-grid">
        <RecentStudents />

        <QuickActions />
      </div>
    </div>
  );
}
