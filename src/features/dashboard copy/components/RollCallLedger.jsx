import React from "react";
import { rollCallStudents } from "../data/dashboardData.js";

const STAMP = {
    active: { label: "Enrolled", tone: "moss" },
    warning: { label: "Watch", tone: "brass" },
    at_risk: { label: "At Risk", tone: "redink" },
};

export default function RollCallLedger() {
    return (
        <div className="db-panel">
            <div className="db-panel-head">
                <div>
                    <h3 className="db-panel-title">Roll Call Ledger</h3>
                    <p className="db-panel-subtitle">Newly admitted students</p>
                </div>
                <button className="db-panel-link">View all</button>
            </div>

            <div className="db-ledger">
                <div className="db-ledger-head-row">
                    <span>No.</span>
                    <span>Student</span>
                    <span>Class</span>
                    <span>Attend.</span>
                    <span>Grade</span>
                    <span>Status</span>
                </div>

                {rollCallStudents.map((student) => {
                    const stamp = STAMP[student.status];
                    return (
                        <div key={student.id} className="db-ledger-row">
                            <span className="db-ledger-roll">{student.roll}</span>

                            <div className="db-ledger-student">
                                <span className="db-ledger-avatar">{student.initials}</span>
                                <div style={{ minWidth: 0 }}>
                                    <p className="db-ledger-name">{student.name}</p>
                                    <p className="db-ledger-email">{student.email}</p>
                                </div>
                            </div>

                            <span className="db-ledger-class">{student.className}</span>
                            <span className="db-ledger-attendance">
                                {student.attendance}
                            </span>
                            <span className="db-ledger-grade">{student.grade}</span>

                            <span className={`db-stamp tone-${stamp.tone}`}>
                                {stamp.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}