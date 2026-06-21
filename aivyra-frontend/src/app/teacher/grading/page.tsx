"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";

export default function TeacherGrading() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [entries, setEntries] = useState([
    { id: 1, student: "Ramesh Kumar", subject: "Mathematics", score: 75, feedback: "", graded: false },
    { id: 2, student: "Priya Patel", subject: "Mathematics", score: 92, feedback: "", graded: false },
    { id: 3, student: "Amit Sharma", subject: "Science", score: 68, feedback: "", graded: false },
    { id: 4, student: "Sunita Reddy", subject: "English Grammar", score: 55, feedback: "", graded: false },
  ]);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const updateFeedback = (id: number, text: string) => setEntries(entries.map(e => e.id === id ? { ...e, feedback: text } : e));
  const markGraded = (id: number) => {
    setEntries(entries.map(e => e.id === id ? { ...e, graded: true } : e));
    alert("Grade & feedback submitted to student profile!");
  };

  const scoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><ClipboardCheck className="w-7 h-7 text-indigo-600" /> Grading Panel</h2>
          <p className="text-sm text-slate-500">Review quiz scores and provide personal feedback to students.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between text-xs font-extrabold text-slate-400 uppercase tracking-widest px-2">
            <span>Student / Subject</span><span>Score</span>
          </div>
          {entries.map(e => (
            <div key={e.id} className={`p-5 rounded-2xl border space-y-4 transition-all ${e.graded ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">{e.student}</p>
                  <p className="text-[10px] text-slate-450 font-bold">{e.subject}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-black ${scoreColor(e.score)}`}>{e.score}%</span>
                  {e.graded ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-slate-300" />}
                </div>
              </div>
              {!e.graded && (
                <div className="flex gap-3">
                  <input value={e.feedback} onChange={ev => updateFeedback(e.id, ev.target.value)} placeholder="Write personalized teacher feedback..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none text-xs font-semibold" />
                  <button onClick={() => markGraded(e.id)} className="px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Submit</button>
                </div>
              )}
              {e.graded && e.feedback && <p className="text-xs italic text-slate-500 font-semibold">Feedback: "{e.feedback}"</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
