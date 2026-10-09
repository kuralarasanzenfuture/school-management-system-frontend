import React from "react";
import {
  GraduationCap,
  BarChart3,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

const LoginLeftPanel = () => {
  return (
    <div className="side">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-icon">
          <GraduationCap size={26} color="#ffffff" strokeWidth={2.2} />
        </div>
        <div>
          <div className="brand-name">Zenfuture</div>
          <div className="brand-tagline">School Management System</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="side-content">
        <div className="side-headline">
          Manage your school
          <br />
          smarter, not harder.
        </div>
        <p className="side-sub">
          One unified platform for administrators, teachers, students, and parents
          to collaborate seamlessly.
        </p>

        {/* Live Metrics */}
        <div className="stats">
          <div className="stat">
            <div className="stat-num">12K+</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat">
            <div className="stat-num">480+</div>
            <div className="stat-label">Faculty</div>
          </div>
          <div className="stat">
            <div className="stat-num">99.4%</div>
            <div className="stat-label">Attendance</div>
          </div>
          <div className="stat">
            <div className="stat-num">50+</div>
            <div className="stat-label">Classes</div>
          </div>
        </div>

        {/* Feature Highlights with Lucide Icons */}
        <div className="features">
          <div className="feature">
            <div className="feature-icon-wrap">
              <BarChart3 size={17} strokeWidth={2.2} />
            </div>
            <span>Real-time academic analytics and grading</span>
          </div>
          <div className="feature">
            <div className="feature-icon-wrap">
              <Calendar size={17} strokeWidth={2.2} />
            </div>
            <span>Automated timetables and event scheduling</span>
          </div>
          <div className="feature">
            <div className="feature-icon-wrap">
              <ShieldCheck size={17} strokeWidth={2.2} />
            </div>
            <span>Enterprise security & role-based permissions</span>
          </div>
        </div>
      </div>

      {/* Social Proof Footer */}
      <div className="side-footer">
        <div className="avatar-stack">
          <div className="av av-1">ZF</div>
          <div className="av av-2">AD</div>
          <div className="av av-3">TC</div>
          <div className="av av-4">PR</div>
        </div>
        <div className="side-footer-text">
          Trusted by 400+ schools
          <br />
          for daily operations
        </div>
      </div>
    </div>
  );
};

export default LoginLeftPanel;
