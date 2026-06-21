"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { BookOpen, Send, CheckCircle2 } from "lucide-react";

export default function TeacherLessonCreator() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [course, setCourse] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState<string[]>([]);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setPublished([...published, title]);
      setTitle(""); setContent(""); setSubmitting(false);
      alert("Lesson published successfully to the course catalog!");
    }, 500);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><BookOpen className="w-7 h-7 text-primary" /> Lesson Creator</h2>
          <p className="text-sm text-slate-500">Write and publish new lesson content to your assigned course.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
              <div className="space-y-1.5"><label className="text-slate-600 font-bold">Assign to Course</label>
                <select value={course} onChange={e => setCourse(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none">
                  <option value="1">Basic Mathematics & Algebra</option>
                  <option value="2">General Science & Physics</option>
                  <option value="3">English Grammar & Vocab</option>
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-slate-600 font-bold">Lesson Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Quadratic Equations" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none" required />
              </div>
              <div className="space-y-1.5"><label className="text-slate-600 font-bold">Lesson Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write clear lesson content that students can read and understand. Use simple language and real-life rural examples..." className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none resize-none" required />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />{submitting ? "Publishing..." : "Publish Lesson"}
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 self-start">
            <h3 className="font-extrabold text-slate-900 text-sm">Recently Published</h3>
            {published.length > 0 ? published.map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />{p}
              </div>
            )) : <p className="text-xs text-slate-400 italic">No lessons published yet this session.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
