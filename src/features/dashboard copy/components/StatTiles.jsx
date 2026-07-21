// import React from "react";
// import { statsData } from "../data/dashboardData.js";

// export default function StatTiles() {
//     return (
//         <div className="db-tiles">
//             {statsData.map((stat, i) => (
//                 <div
//                     key={stat.id}
//                     className="db-tile"
//                     style={{ animationDelay: `${i * 60}ms` }}
//                 >
//                     <span className={`db-tile-tab tone-${stat.tone}`}>{stat.tab}</span>
//                     <p className="db-tile-value">{stat.value}</p>
//                     <p className="db-tile-sub">{stat.label}</p>
//                     <div className={`db-tile-delta ${stat.direction}`}>
//                         <span>{stat.direction === "up" ? "▲" : "▼"}</span>
//                         <span>{stat.delta}</span>
//                         <span style={{ color: "var(--db-ink-500)", fontWeight: 400 }}>
//                             · {stat.sub}
//                         </span>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }

import React from "react";
import { Users, UserCheck, IndianRupee, ClipboardCheck } from "lucide-react";
import { statsData } from "../data/dashboardData.js";

const ICONS = {
    students: Users,
    teachers: UserCheck,
    fees: IndianRupee,
    attendance: ClipboardCheck,
};

// Maps the old ledger "tone" values to badge tones that exist in app.css
const TONE_MAP = {
    ink: "primary",
    moss: "success",
    brass: "warning",
    redink: "info",
};

export default function StatTiles() {
    return (
        <div className="db-tiles">
            {statsData.map((stat) => {
                const Icon = ICONS[stat.id];
                const tone = TONE_MAP[stat.tone] || "primary";
                return (
                    <div key={stat.id} className="db-tile">
                        <div className="db-tile-top">
                            <div className={`db-tile-icon tone-${tone}`}>
                                <Icon size={19} />
                            </div>
                            <span className={`db-tile-trend ${stat.direction}`}>
                                {stat.direction === "up" ? "↑" : "↓"} {stat.delta}
                            </span>
                        </div>
                        <p className="db-tile-value">{stat.value}</p>
                        <p className="db-tile-label">{stat.label}</p>
                        <p className="db-tile-sub">{stat.sub}</p>
                    </div>
                );
            })}
        </div>
    );
}
