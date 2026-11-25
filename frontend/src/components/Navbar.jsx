export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-800">Student Assessment Workspace</h2>
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
          Readiness: 82%
        </span>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">Student Portal</p>
          <p className="text-xs text-slate-500">5th Sem • ISE</p>
        </div>
      </div>
    </header>
  );
}