"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { courseService, quizService } from "@/services/api";
import { RefreshCw, TrendingUp, BookOpen, CheckCircle2, Award, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function StudentProgress() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [progress, setProgress] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [progList, attemptList, courseList] = await Promise.all([
        courseService.getStudentProgress(),
        quizService.getMyAttempts(),
        courseService.list(),
      ]);
      setProgress(progList);
      setAttempts(attemptList);
      setCourses(courseList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build course progress data merged with course titles
  const progressChartData = courses.map((c: any) => {
    const rec = progress.find((p: any) => p.course_id === c.id);
    return {
      name: c.title.split(" ").slice(0, 2).join(" "),
      Completion: rec ? Math.round(rec.completion_percentage) : 0,
    };
  });

  // Quiz score trend
  const quizTrendData = attempts.map((a: any, idx: number) => ({
    name: `Q${idx + 1}`,
    Score: a.score,
  }));

  const completedCourses = progress.filter((p: any) => p.completion_percentage >= 100).length;
  const avgCompletion =
    progress.length > 0
      ? Math.round(progress.reduce((s: number, p: any) => s + p.completion_percentage, 0) / progress.length)
      : 0;
  const avgQuizScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((s: number, a: any) => s + a.score, 0) / attempts.length)
      : 0;

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">My Learning Progress</h2>
            <p className="text-sm text-slate-500">Track your course completions and quiz performance trends.</p>
          </div>
          <button
            onClick={loadData}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Courses Enrolled", value: courses.length, icon: BookOpen, color: "blue" },
            { label: "Courses Completed", value: completedCourses, icon: CheckCircle2, color: "emerald" },
            { label: "Avg. Completion", value: `${avgCompletion}%`, icon: Activity, color: "purple" },
            { label: "Avg. Quiz Score", value: `${avgQuizScore}%`, icon: Award, color: "amber" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-black text-slate-950">{s.value}</h2>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    s.color === "blue" ? "bg-blue-50 text-blue-600" :
                    s.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                    s.color === "purple" ? "bg-purple-50 text-purple-600" :
                    s.color === "amber" ? "bg-amber-50 text-amber-600" :
                    "bg-slate-50 text-slate-600"
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course progress bars */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900">Course Completion Progress</h3>
          {loading ? (
            <p className="text-slate-400 text-xs italic">Loading progress data...</p>
          ) : courses.length === 0 ? (
            <p className="text-slate-400 text-xs italic">No courses enrolled yet.</p>
          ) : (
            <div className="space-y-5">
              {courses.map((course: any, i: number) => {
                const rec = progress.find((p: any) => p.course_id === course.id);
                const pct = rec ? Math.round(rec.completion_percentage) : 0;
                const isDone = pct >= 100;
                return (
                  <div key={course.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-800">{course.title}</span>
                      <span className={`font-extrabold text-xs ${isDone ? "text-emerald-600" : "text-primary"}`}>
                        {isDone ? "✓ Completed" : `${pct}%`}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isDone ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {course.category} · {course.level}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Charts */}
        {isMounted && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Course Completion by Subject</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="Completion" radius={[8, 8, 0, 0]}>
                      {progressChartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Quiz Score History</h3>
              {quizTrendData.length === 0 ? (
                <p className="text-slate-400 text-xs italic pt-4">No quiz attempts yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quizTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="Score"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quiz attempt history table */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900">Quiz Attempt History</h3>
          {loading ? (
            <p className="text-slate-400 text-xs italic">Loading...</p>
          ) : attempts.length === 0 ? (
            <p className="text-slate-400 text-xs italic">No quiz attempts recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {attempts.map((a: any, i: number) => (
                <div key={a.id} className="flex justify-between items-center py-3 px-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      Quiz #{a.quiz_id} — Attempt {i + 1}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(a.attempted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-extrabold text-sm ${
                        a.score >= 75 ? "text-emerald-600" : a.score >= 50 ? "text-amber-600" : "text-rose-600"
                      }`}
                    >
                      {a.score}%
                    </span>
                    <TrendingUp className="w-4 h-4 text-slate-300" />
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
