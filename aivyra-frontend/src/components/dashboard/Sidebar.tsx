"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  GraduationCap, 
  Compass, 
  LineChart, 
  User, 
  Users, 
  FileText, 
  LogOut, 
  Activity, 
  Sparkles,
  BookMarked,
  Settings
} from "lucide-react";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const userName = useAuthStore((state) => state.userName);

  const getLinks = () => {
    switch (role.toUpperCase()) {
      case "STUDENT":
        return [
          { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { name: "My Courses", href: "/student/courses", icon: BookOpen },
          { name: "Assessments", href: "/student/assessments", icon: Award },
          { name: "Progress", href: "/student/progress", icon: LineChart },
          { name: "AI Recommendations", href: "/student/recommendations", icon: Sparkles },
          { name: "Certificates", href: "/student/certificates", icon: GraduationCap },
          { name: "Profile", href: "/student/profile", icon: User },
        ];
      case "TEACHER":
        return [
          { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
          { name: "Student Monitoring", href: "/teacher/students", icon: Users },
          { name: "Course Management", href: "/teacher/courses", icon: BookMarked },
          { name: "Reports & Analytics", href: "/teacher/analytics", icon: FileText },
        ];
      case "PARENT":
        return [
          { name: "Child Progress", href: "/parent/dashboard", icon: LineChart },
          { name: "Attendance Log", href: "/parent/attendance", icon: Activity },
          { name: "AI Guidance", href: "/parent/recommendations", icon: Sparkles },
        ];
      case "ADMIN":
        return [
          { name: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "User Management", href: "/admin/users", icon: Users },
          { name: "Course Setup", href: "/admin/courses", icon: BookOpen },
          { name: "System Settings", href: "/admin/settings", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between border-r border-slate-800 shadow-xl transition-all duration-300">
      <div>
        {/* Logo Branding */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/45">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Aivyra-Tutor
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Rural AI Ed</p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-bold text-sm text-slate-200">
            {userName ? userName[0].toUpperCase() : "U"}
          </div>
          <div className="truncate">
            <p className="text-xs text-slate-400">Welcome,</p>
            <p className="text-sm font-semibold text-slate-200 truncate">{userName || "User"}</p>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/30 font-semibold" 
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/35 hover:text-rose-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
