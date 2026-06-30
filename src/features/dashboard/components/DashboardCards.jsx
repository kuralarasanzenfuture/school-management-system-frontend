import { statsData } from "../data/dashboardData.js";
import DashboardCard from "./DashboardCard.jsx";

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {statsData.map((card) => (
        <DashboardCard key={card.id} card={card} />
      ))}
    </div>
  );
};

export default DashboardCards;
