import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { apiService } from "../api/mockApi";

export default function PlacementDrives() {
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    apiService.getPlacementDrives().then(setDrives);
  }, []);

  const handleApply = (id) => {
    setDrives((prev) => prev.map((d) => (d.id === id ? { ...d, applied: true } : d)));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Active Campus Placement Drives</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drives.map((drive) => (
          <div key={drive.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{drive.company}</h3>
                  <p className="text-sm text-slate-600">{drive.role}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 font-semibold text-xs rounded-full">
                  {drive.ctc}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {drive.requiredSkills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 flex items-start gap-2 text-xs">
                {drive.isEligible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className={drive.isEligible ? "text-emerald-800" : "text-rose-700"}>
                  {drive.eligibilityReason}
                </span>
              </div>
            </div>

            <button
              disabled={!drive.isEligible || drive.applied}
              onClick={() => handleApply(drive.id)}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition ${
                drive.applied
                  ? "bg-emerald-600 text-white cursor-default"
                  : drive.isEligible
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              {drive.applied ? "Application Submitted" : drive.isEligible ? "Apply Now" : "Not Eligible"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}