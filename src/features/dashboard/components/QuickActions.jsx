import {
  HiOutlineUserAdd,
  HiOutlineAcademicCap,
  HiOutlineDocumentReport,
  HiOutlineBell,
} from "react-icons/hi";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Student",
      icon: HiOutlineUserAdd,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Add Teacher",
      icon: HiOutlineAcademicCap,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Generate Report",
      icon: HiOutlineDocumentReport,
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      title: "Send Notification",
      icon: HiOutlineBell,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>

        <p className="mt-1 text-sm text-slate-500">Frequently used shortcuts</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <button
              key={index}
              className={`
                ${action.color}
                flex flex-col items-center justify-center
                rounded-2xl
                h-20
                text-white
                transition-all
                duration-300
                hover:shadow-lg
                hover:-translate-y-1
                active:scale-95
              `}
            >
              <Icon className="text-3xl mb-2" />

              <span className="text-sm font-semibold">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
