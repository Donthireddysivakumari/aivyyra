"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService } from "@/services/api";
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  GraduationCap,
  BookOpen,
  User,
  AlertCircle,
  Filter,
} from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-50 text-red-700 border-red-100",
  TEACHER: "bg-emerald-50 text-emerald-700 border-emerald-100",
  STUDENT: "bg-blue-50 text-blue-700 border-blue-100",
  PARENT: "bg-amber-50 text-amber-700 border-amber-100",
};

const ROLE_ICONS: Record<string, any> = {
  ADMIN: Shield,
  TEACHER: BookOpen,
  STUDENT: GraduationCap,
  PARENT: User,
};

export default function AdminUsers() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isMounted, router]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [studentList, platformStats] = await Promise.all([
        userService.getStudentsList(),
        userService.getPlatformStats(),
      ]);
      setStudents(studentList);
      setStats(platformStats);
    } catch (err) {
      console.error(err);
      setError("Failed to load user data. Ensure the backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const filteredStudents = students.filter((s) =>
    s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.village?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated || !role || role.toUpperCase() !== "ADMIN") return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500">
              View and monitor all registered platform users across all roles.
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-3xl flex gap-3 items-center">
            <AlertCircle className="w-6 h-6 text-rose-600" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Role summary cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Admins", value: 1, role: "ADMIN" },
              { label: "Teachers", value: stats.total_teachers, role: "TEACHER" },
              { label: "Students", value: stats.total_students, role: "STUDENT" },
              { label: "Parents", value: stats.total_parents, role: "PARENT" },
            ].map((s, i) => {
              const Icon = ROLE_ICONS[s.role];
              return (
                <div
                  key={i}
                  onClick={() => setFilterRole(filterRole === s.role ? "ALL" : s.role)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                    filterRole === s.role
                      ? `${ROLE_COLORS[s.role]} shadow-md scale-[1.02]`
                      : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5" />
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${ROLE_COLORS[s.role]}`}>
                      {s.role}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
                  <p className="text-xs text-slate-500 mt-1">{s.label} registered</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search by name, email, or village..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-xs outline-none"
              />
            </div>
            {filterRole !== "ALL" && (
              <button
                onClick={() => setFilterRole("ALL")}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Filter className="w-3.5 h-3.5" /> Clear Filter
              </button>
            )}
          </div>

          {/* Student table (main user list we can query) */}
          <div className="space-y-1">
            <div className="grid grid-cols-5 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="col-span-2">Name / Email</span>
              <span>Class / Village</span>
              <span>Language</span>
              <span>Skill Score</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {loading ? (
                <p className="text-slate-400 text-xs italic text-center py-8">Loading users...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-slate-400 text-xs italic text-center py-8">No users found.</p>
              ) : (
                filteredStudents.map((s: any) => (
                  <div key={s.id} className="grid grid-cols-5 px-4 py-3.5 items-center hover:bg-slate-50 rounded-xl transition-all">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-primary rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {s.user?.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{s.user?.name}</p>
                        <p className="text-[10px] text-slate-400">{s.user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-700 font-medium">{s.class_level}</p>
                      <p className="text-[10px] text-slate-400">{s.village}</p>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-blue-50 text-primary rounded-full text-[10px] font-bold">
                        {s.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.skill_score >= 80 ? "bg-emerald-500" : s.skill_score >= 60 ? "bg-amber-400" : "bg-rose-500"
                          }`}
                          style={{ width: `${s.skill_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">{Math.round(s.skill_score)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-slate-100 pt-3">
            Showing {filteredStudents.length} of {students.length} registered students.
            {stats && ` Total platform users: ${stats.total_users}.`}
          </div>
        </div>
      </main>
    </div>
  );
}
