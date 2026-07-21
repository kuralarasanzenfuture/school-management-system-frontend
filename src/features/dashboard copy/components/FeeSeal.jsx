import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { feeSummary } from "../data/dashboardData.js";

const COLORS = ["#3e6b4c", "#8e2f3b"];

export default function FeeSeal() {
    const data = [
        { name: "Collected", value: feeSummary.collectedPct },
        { name: "Pending", value: feeSummary.pendingPct },
    ];

    return (
        <div className="db-panel">
            <div className="db-panel-head">
                <div>
                    <h3 className="db-panel-title">Fee Collection</h3>
                    <p className="db-panel-subtitle">Current academic year</p>
                </div>
            </div>

            <div className="db-seal-wrap">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={68}
                            outerRadius={92}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="#fffdf8"
                            strokeWidth={2}
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="db-seal-center">
                    <span className="db-seal-pct">{feeSummary.collectedPct}%</span>
                    <span className="db-seal-label">Collected</span>
                </div>
            </div>

            <div className="db-seal-legend">
                <div className="db-seal-legend-row">
                    <span>
                        <span
                            className="db-legend-dot"
                            style={{ background: COLORS[0] }}
                        />
                        Collected · {feeSummary.collectedPct}%
                    </span>
                    <span className="db-seal-legend-amount">
                        {feeSummary.collectedAmount}
                    </span>
                </div>
                <div className="db-seal-legend-row">
                    <span>
                        <span
                            className="db-legend-dot"
                            style={{ background: COLORS[1] }}
                        />
                        Pending · {feeSummary.pendingPct}%
                    </span>
                    <span className="db-seal-legend-amount">
                        {feeSummary.pendingAmount}
                    </span>
                </div>
            </div>
        </div>
    );
}