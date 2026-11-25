import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { apiService } from "../api/mockApi";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiService.getStudentDashboard().then(setData);
  }, []);

  if (!data) return <div className="p-6 text-slate-500">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Placement Readiness Score</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{data.student.readinessScore}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Current CGPA</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{data.student.cgpa}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Problems Solved</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">48</p>
        </div>
      </div>

      {/* Skill Proficiency Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Topic-Wise Skill Proficiency</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.skillMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Code Submissions</h3>
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="pb-3">Problem</th>
              <th className="pb-3">Language</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.recentSubmissions.map((sub) => (
              <tr key={sub.id}>
                <td className="py-3 font-medium text-slate-800">{sub.problem}</td>
                <td className="py-3 text-slate-600">{sub.language}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      sub.status === "Accepted"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="py-3 text-slate-500">{sub.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}