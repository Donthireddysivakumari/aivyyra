"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { HelpCircle, Plus, Trash2, Send } from "lucide-react";

export default function TeacherQuizCreator() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [quizTitle, setQuizTitle] = useState("");
  const [lessonId, setLessonId] = useState("1");
  const [questions, setQuestions] = useState([{ question: "", optA: "", optB: "", optC: "", optD: "", correct: "A" }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const addQuestion = () => setQuestions([...questions, { question: "", optA: "", optB: "", optC: "", optD: "", correct: "A" }]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQ = (i: number, field: string, val: string) => setQuestions(questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setQuizTitle(""); setQuestions([{ question: "", optA: "", optB: "", optC: "", optD: "", correct: "A" }]); alert("Quiz created and published successfully!"); }, 500);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><HelpCircle className="w-7 h-7 text-indigo-600" /> Quiz Creator</h2>
          <p className="text-sm text-slate-500">Build custom MCQ quizzes and link them to lesson units.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1.5"><label className="text-slate-600 font-bold">Quiz Title</label>
                <input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. Fractions & Percentages Quiz" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none" required />
              </div>
              <div className="space-y-1.5"><label className="text-slate-600 font-bold">Attach to Lesson</label>
                <select value={lessonId} onChange={e => setLessonId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none">
                  <option value="1">Lesson 1 — Introduction to Algebraic Variables</option>
                  <option value="2">Lesson 2 — Working with Fractions & Percentages</option>
                  <option value="3">Lesson 3 — Introduction to Light & Reflection</option>
                </select>
              </div>
            </div>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-800">Question {i + 1}</span>
                {questions.length > 1 && <button type="button" onClick={() => removeQuestion(i)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>}
              </div>
              <div className="space-y-1.5"><label className="text-slate-600">Question Text</label>
                <input value={q.question} onChange={e => updateQ(i, "question", e.target.value)} placeholder="Type your question here..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["A", "B", "C", "D"].map(opt => (
                  <div key={opt} className="space-y-1"><label className="text-slate-500">Option {opt}</label>
                    <input value={(q as any)[`opt${opt}`]} onChange={e => updateQ(i, `opt${opt}`, e.target.value)} placeholder={`Option ${opt}`} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none" required />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5"><label className="text-slate-600">Correct Answer</label>
                <select value={q.correct} onChange={e => updateQ(i, "correct", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none">
                  {["A", "B", "C", "D"].map(o => <option key={o} value={o}>Option {o}</option>)}
                </select>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button type="button" onClick={addQuestion} className="flex-1 py-3.5 border border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-indigo-50">
              <Plus className="w-4 h-4" /> Add Question
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all">
              <Send className="w-4 h-4" />{submitting ? "Publishing..." : "Publish Quiz"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
