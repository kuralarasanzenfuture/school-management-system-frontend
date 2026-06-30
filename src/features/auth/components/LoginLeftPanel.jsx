import React from "react";

const LoginLeftPanel = () => {
  return (
    <div>
      <div className="side">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <div>
            <div className="brand-name">EduCore</div>
            <div className="brand-tagline">School Management System</div>
          </div>
        </div>

        <div className="side-content">
          <div className="side-headline">
            Manage your school
            <br />
            smarter, not harder.
          </div>
          <p className="side-sub">
            One unified platform for students, teachers, and administrators to
            collaborate seamlessly.
          </p>

          <div className="stats">
            <div className="stat">
              <div className="stat-num">12K+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat">
              <div className="stat-num">480</div>
              <div className="stat-label">Teachers</div>
            </div>
            <div className="stat">
              <div className="stat-num">98%</div>
              <div className="stat-label">Attendance</div>
            </div>
            <div className="stat">
              <div className="stat-num">56</div>
              <div className="stat-label">classNamees</div>
            </div>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-dot fd-1">📊</div>
              Real-time analytics and grade tracking
            </div>
            <div className="feature">
              <div className="feature-dot fd-2">📅</div>
              Automated timetables and scheduling
            </div>
            <div className="feature">
              <div className="feature-dot fd-3">💬</div>
              Parent-teacher communication hub
            </div>
          </div>
        </div>

        <div className="side-footer">
          <div className="avatar-stack">
            <div className="av av-1">KR</div>
            <div className="av av-2">PS</div>
            <div className="av av-3">MT</div>
            <div className="av av-4">JD</div>
          </div>
          <div className="side-footer-text">
            Trusted by 400+ schools
            <br />
            across Tamil Nadu
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLeftPanel;
