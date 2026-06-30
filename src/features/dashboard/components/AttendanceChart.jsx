import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", value: 90 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 94 },
  { day: "Thu", value: 91 },
  { day: "Fri", value: 97 },
  { day: "Sat", value: 95 },
];

export default function AttendanceChart() {
  return (
    <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3>Attendance</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="day" />
          <Tooltip />
          <Line dataKey="value" stroke="#4F46E5" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
