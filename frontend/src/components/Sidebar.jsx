import { NavLink } from "react-router-dom";
import { LayoutDashboard, Code2, CheckSquare, Briefcase, GraduationCap } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Code Practice", path: "/practice", icon: Code2 },
  { name: "Aptitude Engine", path: "/aptitude", icon: CheckSquare },
  { name: "Placement Drives", path: "/drives", icon: Briefcase },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <GraduationCap className="w-8 h-8 text-indigo-400" />
        <div>
          <h1 className="font-bold text-lg tracking-wide">LAKSHYA</h1>
          <p className="text-xs text-slate-400">Placement Portal</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}