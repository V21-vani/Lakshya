
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Code2,
  ClipboardList,
  BriefcaseBusiness,
  FileCheck,
  ChartNoAxesCombined,
  Settings,
  GraduationCap,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "mentor";
}

const adminLinks = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Problems", path: "/admin/problems", icon: Code2 },
  { name: "Quizzes", path: "/admin/quizzes", icon: ClipboardList },
  { name: "Placement Drives", path: "/admin/drives", icon: BriefcaseBusiness },
  { name: "Submissions", path: "/admin/submissions", icon: FileCheck },
  { name: "Reports", path: "/admin/reports", icon: ChartNoAxesCombined },
];

const mentorLinks = [
  { name: "Dashboard", path: "/mentor", icon: LayoutDashboard },
  { name: "My Students", path: "/mentor/students", icon: Users },
  { name: "Coding Problems", path: "/mentor/problems", icon: Code2 },
  { name: "Quizzes", path: "/mentor/quizzes", icon: ClipboardList },
  { name: "Submissions", path: "/mentor/submissions", icon: FileCheck },
];

export default function Sidebar({ role }: SidebarProps) {
  const links = role === "admin" ? adminLinks : mentorLinks;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-[#00293B] px-5 py-6 text-white">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9A5C5]">
          <GraduationCap size={25} className="text-[#00293B]" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide">Lakshya</h1>
          <p className="text-[10px] tracking-[2px] text-[#A2C5FF]">
            PLACEMENT PORTAL
          </p>
        </div>
      </div>

      {/* Role label */}
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-[#8CA8B5]">
        {role} menu
      </p>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#00293B] font-semibold shadow-sm"
                    : "text-[#D0E0E7] hover:bg-[#164558] hover:text-white"
                }`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="space-y-2 border-t border-[#315565] pt-5">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#D0E0E7] transition hover:bg-[#164558]">
          <Settings size={19} />
          Settings
        </button>

        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#E9A5C5] transition hover:bg-[#164558]">
          <LogOut size={19} />
          Log out
        </button>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[10px] text-[#8CA8B5]">
        Lakshya © 2026
      </p>
    </aside>
  );
}
