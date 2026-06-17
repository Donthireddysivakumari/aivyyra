"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService } from "@/services/api";
import { 
  Users, 
  BookOpen, 
  Award, 
  GraduationCap, 
  RefreshCw, 
  Settings,
  ShieldAlert,
  Server
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  AreaChart,
  Area
} from "recharts";

export default function AdminDashboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isMounted, router]);

  const loadAdminStats = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getPlatformStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load platform stats. Verify the backend uvicorn server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminStats();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !role || role.toUpperCase() !== "ADMIN") {
    return null;
  }

  const getUserGrowthData = () => {
    if (!stats || !stats.user_growth) {
      return [
        { month: "Jan", users: 10 },
        { month: "Feb", users: 20 },
        { month: "Mar", users: 35 },
        { month: "Apr", users: 60 },
        { month: "May", users: 110 },
        { month: "Jun", users: 150 },
      ];
    }
    return stats.user_growth;
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="ADMIN" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">System Admin Portal</h2>
            <p className="text-sm text-slate-500">Monitor cluster deployments, active registrations, databases, and AI configurations.</p>
          </div>
          <button 
            onClick={loadAdminStats}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-3xl flex gap-3 items-center">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <div>
              <p className="font-bold">Database Connection Offline</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Users</span>
              <h2 className="text-3xl font-black text-slate-905 mt-1">{stats?.total_users || 4}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rural Students</span>
              <h2 className="text-3xl font-black text-slate-905 mt-1">{stats?.total_students || 1}</h2>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specialist Teachers</span>
              <h2 className="text-3xl font-black text-slate-905 mt-1">{stats?.total_teachers || 1}</h2>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Courses</span>
              <h2 className="text-3xl font-black text-slate-950 mt-1">{stats?.total_courses || 3}</h2>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Admin Panels Split */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main User logs chart */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Active User Growth Curve</h3>
            {isMounted && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getUserGrowthData()}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* System Services details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-905 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> Service Health Log
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-slate-800">FastAPI API Server</div>
                  <div className="text-[10px] text-slate-450">Active on port 8000</div>
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-slate-850">SQLAlchemy Database</div>
                  <div className="text-[10px] text-slate-450">SQLite / PostgreSQL Engine</div>
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-slate-850">Scikit-learn Model Server</div>
                  <div className="text-[10px] text-slate-450">Active Joblib Predictors</div>
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-2">
              <button 
                onClick={loadAdminStats}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reload System
              </button>
              <button 
                className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl"
                title="Config settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
