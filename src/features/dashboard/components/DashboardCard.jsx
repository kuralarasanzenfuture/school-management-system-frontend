// export default function DashboardCard({ title, value, icon, color }) {
//   return (
//     <div className="dashboard-card">
//       <div className="dashboard-icon" style={{ background: color }}>
//         {icon}
//       </div>

//       <div>
//         <h5>{title}</h5>

//         <h2>{value}</h2>
//       </div>
//     </div>
//   );
// }

const DashboardCard = ({ card }) => {
  // console.log(card);
  if (!card) {
    return null;
  }
  const Icon = card.icon;
  const TrendIcon = card.trendIcon; 
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg duration-300">
      <div className="flex items-center justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}
        >
          <Icon className={`${card.iconColor} text-2xl`} />
        </div>

        <div
          className={`flex items-center gap-1 text-sm font-semibold ${card.trendColor}`}
        >
          <TrendIcon />

          <span>{card.trend}</span>
        </div>
      </div>

      <h2 className="mt-3 text-2xl font-bold text-gray-900">{card.value}</h2>

      <p className="mt-2 text-gray-700 font-semibold">{card.title}</p>

      <p className="mt-1 text-sm text-gray-400">{card.subtitle}</p>
    </div>
  );
};

export default DashboardCard;
