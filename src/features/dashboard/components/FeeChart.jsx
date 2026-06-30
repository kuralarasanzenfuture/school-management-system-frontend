import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const data = [
  {
    name: "Collected",
    value: 82,
    amount: "₹18.4L",
  },
  {
    name: "Pending",
    value: 18,
    amount: "₹2.6L",
  },
];

const COLORS = ["#10B981", "#EF4444"];

export default function FeeChart() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 h-full">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Fee Collection
          </h2>

          <p className="text-sm text-slate-500">Current academic year</p>
        </div>

        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          82%
        </span>
      </div>

      {/* Chart */}

      <div className="relative h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-3xl font-bold text-slate-800">82%</h1>

          <p className="text-sm text-slate-500">Collected</p>
        </div>
      </div>

      {/* Legend */}

      <div className="">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  background: COLORS[index],
                }}
              />

              <div>
                <p className="text-sm font-medium text-slate-700">
                  {item.name}
                </p>

                <p className="text-xs text-slate-500">{item.value}% of total</p>
              </div>
            </div>

            <span className="font-semibold text-slate-800">{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
