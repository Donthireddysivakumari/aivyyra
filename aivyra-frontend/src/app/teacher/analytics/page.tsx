"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService, courseService } from "@/services/api";
import { RefreshCw, TrendingUp, Users, Award, BookOpen } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function TeacherAnalytics() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isMounted, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studs, courseList] = await Promise.all([
        userService.getStudentsList(),
        courseService.list(),
      ]);
      setStudents(studs);
      setCourses(courseList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  // --- Chart data ---
  const skillDistribution = [
    { name: "At Risk (<60)", value: students.filter((s) => s.skill_score < 60).length },
    { name: "Progressing (60-80)", value: students.filter((s) => s.skill_score >= 60 && s.skill_score <= 80).length },
    { name: "Exceeding (>80)", value: students.filter((s) => s.skill_score > 80).length },
  ];
  const COLORS = ["#F43F5E", "#F59E0B", "#10B981"];

  const villageData = (() => {
    const map: Record<string, number> = {};
    students.forEach((s) => { map[s.village] = (map[s.village] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  })();

  const classData = (() => {
    const map: Record<string, { count: number; avgScore: number }> = {};
    students.forEach((s) => {
      if (!map[s.class_level]) map[s.class_level] = { count: 0, avgScore: 0 };
      map[s.class_level].count++;
      map[s.class_level].avgScore += s.skill_score;
    });
    return Object.entries(map).map(([name, d]) => ({
      name,
      Students: d.count,
      AvgScore: Math.round(d.avgScore / d.count),
    }));
  })();

  const avgSkill =
    students.length > 0
      ? Math.round(students.reduce((s, st) => s + st.skill_score, 0) / students.length)
      : 0;

  if (!isAuthenticated || !role || role.toUpperCase() !== "TEACHER") return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Reports &amp; Analytics</h2>
            <p className="text-sm text-slate-500">
              Classroom performance breakdowns, demographics, and skill distribution analysis.
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Students", value: students.length, icon: Users, color: "blue" },
            { label: "Total Courses", value: courses.length, icon: BookOpen, color: "emerald" },
            { label: "Class Avg. Score", value: `${avgSkill}%`, icon: TrendingUp, color: "purple" },
            {
              label: "High Performers",
              value: students.filter((s) => s.skill_score > 80).length,
              icon: Award,
              color: "amber",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-black text-slate-950">{s.value}</h2>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  s.color === "blue" ? "bg-blue-50 text-blue-600" :
                  s.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  s.color === "purple" ? "bg-purple-50 text-purple-600" :
                  s.color === "amber" ? "bg-amber-50 text-amber-600" :
                  "bg-slate-50 text-slate-600"
                }`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {isMounted && (
          <>
            {/* Row 1: Pie + Bar */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Skill Mastery Clusters</h3>
                <div className="h-56 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={skillDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {skillDistribution.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  {skillDistribution.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-slate-500">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Students by Village</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={villageData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Class-level breakdown */}
            {classData.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Class-Level Student Count &amp; Average Score
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Students" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="AvgScore" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* Student score table */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900">All Students Score Summary</h3>
          {loading ? (
            <p className="text-slate-400 text-xs italic">Loading...</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                      {s.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{s.user?.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {s.class_level} · {s.village}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.skill_score >= 80
                            ? "bg-emerald-500"
                            : s.skill_score >= 60
                            ? "bg-amber-400"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${s.skill_score}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-extrabold ${
                        s.skill_score >= 80
                          ? "text-emerald-600"
                          : s.skill_score >= 60
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {Math.round(s.skill_score)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
