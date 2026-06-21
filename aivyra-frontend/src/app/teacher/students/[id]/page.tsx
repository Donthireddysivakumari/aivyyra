"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService, aiService } from "@/services/api";
import { User, BarChart2, ArrowLeft } from "lucide-react";

export default function TeacherStudentDetail() {
  const router = useRouter();
  const params = useParams();
  const studentId = Number(params.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [student, setStudent] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => {
    if (isAuthenticated && studentId) {
      Promise.all([userService.getStudentById(studentId), aiService.getSkillGap(studentId)])
        .then(([s, ai]) => { setStudent(s); setAiData(ai); })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (!isAuthenticated) { router.push("/login"); }
  }, [isAuthenticated, studentId]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
          <div className="bg-white flex-1 p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><User className="w-7 h-7 text-primary" /> Student Profile Detail</h2>
            <p className="text-sm text-slate-500">Deep performance analysis for an individual student.</p>
          </div>
        </div>
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400 text-sm font-bold">Loading student data...</div>
        ) : student ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-900 text-sm">Student Info</h3>
              {[
                ["Full Name", student.user?.name],
                ["Email", student.user?.email],
                ["Class Level", student.class_level],
                ["Village", student.village],
                ["Language", student.language],
                ["Overall Skill Score", `${student.skill_score?.toFixed(1)}%`]
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs font-semibold border-b border-slate-50 pb-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-extrabold text-slate-900">{val}</span>
                </div>
              ))}
            </div>
            {aiData && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-600" /> AI Skill Analysis</h3>
                <div><p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Weak Subjects</p>
                  <div className="flex flex-wrap gap-2">{aiData.weak_subjects?.map((s: string) => <span key={s} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold">{s}</span>)}</div>
                </div>
                <div><p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Strong Subjects</p>
                  <div className="flex flex-wrap gap-2">{aiData.strong_subjects?.map((s: string) => <span key={s} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold">{s}</span>)}</div>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-800">
                  Skill Gap: <span className="font-black text-indigo-950">{aiData.skill_gap_percentage?.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400 text-sm font-bold">Student not found.</div>
        )}
      </main>
    </div>
  );
}
