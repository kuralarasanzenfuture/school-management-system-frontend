import React from "react";

const students = [
  {
    id: 1,
    initials: "AK",
    name: "Aryan Kapoor",
    email: "aryan.k@school.in",
    class: "X-A",
    roll: "1042",
    attendance: "94%",
    grade: "A+",
    status: "Active",
  },
  {
    id: 2,
    initials: "SM",
    name: "Sneha Mehta",
    email: "sneha.m@school.in",
    class: "IX-B",
    roll: "0987",
    attendance: "88%",
    grade: "B+",
    status: "Active",
  },
  {
    id: 3,
    initials: "RN",
    name: "Rohan Nair",
    email: "rohan.n@school.in",
    class: "XI-C",
    roll: "1158",
    attendance: "76%",
    grade: "C",
    status: "Warning",
  },
  {
    id: 4,
    initials: "PJ",
    name: "Pooja Joshi",
    email: "pooja.j@school.in",
    class: "VIII-A",
    roll: "0834",
    attendance: "97%",
    grade: "A+",
    status: "Active",
  },
  {
    id: 5,
    initials: "KS",
    name: "Karan Singh",
    email: "karan.s@school.in",
    class: "XII-B",
    roll: "1301",
    attendance: "63%",
    grade: "D",
    status: "At Risk",
  },
  {
    id: 6,
    initials: "DA",
    name: "Divya Anand",
    email: "divya.a@school.in",
    class: "X-B",
    roll: "1067",
    attendance: "91%",
    grade: "B+",
    status: "Active",
  },
];

const statusColor = {
  Active: "bg-green-100 text-green-700",
  Warning: "bg-yellow-100 text-yellow-700",
  "At Risk": "bg-red-100 text-red-700",
};

export default function RecentStudents() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Students
          </h2>
          <p className="text-sm text-slate-500">Newly admitted students</p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-left text-slate-500">
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-4 py-4 font-medium">Class</th>
              <th className="px-4 py-4 font-medium">Roll</th>
              <th className="px-4 py-4 font-medium">Attendance</th>
              <th className="px-4 py-4 font-medium">Grade</th>
              <th className="px-4 py-4 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-t border-slate-100 hover:bg-slate-50 transition"
              >
                {/* Student */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                      {student.initials}
                    </div>

                    <div>
                      <h4 className="text-sm text-slate-800">{student.name}</h4>

                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 font-medium text-slate-700">
                  {student.class}
                </td>

                <td className="px-4 py-4 text-slate-600">{student.roll}</td>

                <td className="px-4 py-4">
                  <span className="font-medium text-slate-700">
                    {student.attendance}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="font-semibold text-indigo-600">
                    {student.grade}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[student.status]}`}
                  >
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
