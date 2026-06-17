"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService } from "@/services/api";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react";

// Mock weekly attendance data per week for the last 4 weeks
const generateAttendanceLog = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  return weeks.map((week) => ({
    week,
    days: days.map((day) => ({
      day,
      present: Math.random() > 0.15, // 85% attendance rate
    })),
  }));
};

export default function ParentAttendance() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const userProfile = useAuthStore((state) => state.userProfile);
  const initialize = useAuthStore((state) => state.initialize);

  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [attendanceLogs] = useState(generateAttendanceLog());

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isMounted, router]);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const fullProfile = await userService.getCurrentUser();
      useAuthStore.getState().setProfile(fullProfile);
      const studentId = fullProfile.profile?.student_id;
      if (studentId) {
        const stud = await userService.getStudentById(studentId);
        setStudentDetails(stud);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalDays = attendanceLogs.flatMap((w) => w.days).length;
  const presentDays = attendanceLogs.flatMap((w) => w.days).filter((d) => d.present).length;
  const attendancePct = Math.round((presentDays / totalDays) * 100);

  const speakReport = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const name = studentDetails?.user?.name || "your child";
    const text = `Hello. Here is the attendance report for ${name}. Over the past 4 school weeks, ${name} was present on ${presentDays} out of ${totalDays} school days. This gives an overall attendance rate of ${attendancePct} percent. ${
      attendancePct >= 90
        ? "Excellent attendance. Keep it up!"
        : attendancePct >= 75
        ? "Attendance is satisfactory. Please ensure regular attendance."
        : "Attendance is below average. Please encourage your child to attend regularly."
    }`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!isAuthenticated || !role || role.toUpperCase() !== "PARENT") return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="PARENT" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Attendance Log</h2>
            <p className="text-sm text-slate-500">
              Track your child&apos;s school attendance over the past weeks.
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Voice Readout */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
              Audio Attendance Report
            </span>
            <h3 className="font-extrabold text-xl">Listen to Attendance Summary</h3>
            <p className="text-xs text-slate-300">
              Click to hear a full spoken summary of your child&apos;s school attendance.
            </p>
          </div>
          <button
            onClick={speakReport}
            className={`px-6 py-4 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-all duration-300 hover:scale-[1.03] ${
              speaking
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-white text-slate-900"
            }`}
          >
            {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
            <span>{speaking ? "Stop" : "Read Aloud"}</span>
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Days Present", value: presentDays, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Days Absent", value: totalDays - presentDays, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "Attendance Rate", value: `${attendancePct}%`, icon: TrendingUp, color: "text-primary", bg: "bg-blue-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className={`text-3xl font-black ${s.color}`}>{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance progress bar */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900">Overall Attendance Rate</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{presentDays} / {totalDays} school days</span>
              <span className={`font-extrabold ${attendancePct >= 90 ? "text-emerald-600" : attendancePct >= 75 ? "text-amber-600" : "text-rose-600"}`}>
                {attendancePct}%
              </span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  attendancePct >= 90 ? "bg-emerald-500" : attendancePct >= 75 ? "bg-amber-400" : "bg-rose-500"
                }`}
                style={{ width: `${attendancePct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {attendancePct >= 90
                ? "✓ Excellent attendance — your child is on track."
                : attendancePct >= 75
                ? "⚠ Satisfactory — encourage more consistent attendance."
                : "✗ Below average — please ensure your child attends regularly."}
            </p>
          </div>
        </div>

        {/* Week-by-week calendar */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Weekly Attendance Calendar
          </h3>
          <div className="space-y-6">
            {attendanceLogs.map((week) => (
              <div key={week.week} className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{week.week}</p>
                <div className="grid grid-cols-5 gap-3">
                  {week.days.map((d) => (
                    <div
                      key={d.day}
                      className={`rounded-2xl p-3 flex flex-col items-center gap-1 border ${
                        d.present
                          ? "bg-emerald-50 border-emerald-100"
                          : "bg-rose-50 border-rose-100"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{d.day}</span>
                      {d.present ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <span className={`text-[9px] font-bold ${d.present ? "text-emerald-600" : "text-rose-500"}`}>
                        {d.present ? "Present" : "Absent"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-500">Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-slate-500">Absent</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
