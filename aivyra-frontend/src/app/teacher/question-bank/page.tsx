"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { Database, Search, Trash2, Tag } from "lucide-react";

export default function TeacherQuestionBank() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [questions, setQuestions] = useState([
    { id: 1, subject: "Mathematics", question: "If 2x + 5 = 15, what is x?", correct: "B", options: ["3","5","7","10"], difficulty: "Easy" },
    { id: 2, subject: "Mathematics", question: "What is a letter representing an unknown number?", correct: "B", options: ["Constant","Variable","Coefficient","Operator"], difficulty: "Easy" },
    { id: 3, subject: "Mathematics", question: "What is 25% as a fraction?", correct: "C", options: ["1/2","1/3","1/4","2/5"], difficulty: "Medium" },
    { id: 4, subject: "Science", question: "What is the speed of light in vacuum?", correct: "A", options: ["3×10⁸ m/s","3×10⁶ m/s","3×10⁴ m/s","3×10² m/s"], difficulty: "Medium" },
    { id: 5, subject: "English", question: "Which word is a synonym for 'happy'?", correct: "C", options: ["Sad","Angry","Joyful","Tired"], difficulty: "Easy" },
  ]);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const filtered = questions.filter(q =>
    (filter === "All" || q.subject === filter) &&
    (search === "" || q.question.toLowerCase().includes(search.toLowerCase()))
  );

  const diffColor = (d: string) => d === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : d === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-rose-50 text-rose-700 border-rose-100";

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Database className="w-7 h-7 text-indigo-600" /> Question Bank</h2>
          <p className="text-sm text-slate-500">Repository of all MCQ questions across subjects. Reuse or delete questions.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-150 gap-3 flex-1 min-w-[200px]">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..." className="bg-transparent text-xs outline-none w-full" />
            </div>
            {["All","Mathematics","Science","English"].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${filter === s ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}>{s}</button>
            ))}
          </div>
          <div className="grid gap-3">
            {filtered.map(q => (
              <div key={q.id} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm font-bold text-slate-900 flex-1">{q.question}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                    <span className="px-2 py-0.5 rounded border border-indigo-100 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{q.subject}</span>
                    <button onClick={() => setQuestions(questions.filter(x => x.id !== q.id))} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold">
                  {q.options.map((opt, i) => {
                    const letter = ["A","B","C","D"][i];
                    const isCorrect = letter === q.correct;
                    return <span key={i} className={`px-2 py-1.5 rounded-lg border ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold" : "bg-white border-slate-200 text-slate-600"}`}>{letter}. {opt}</span>;
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-xs text-slate-400 italic py-8 text-center">No questions match your search.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
