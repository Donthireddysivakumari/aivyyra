"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { quizService } from "@/services/api";
import { Award, CheckCircle2, ChevronRight, PlusCircle, RefreshCw } from "lucide-react";

export default function StudentAssessments() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const initialize = useAuthStore((state) => state.initialize);

  const [assessments, setAssessments] = useState<any[]>([]);
  const [skillName, setSkillName] = useState("Mathematics");
  const [score, setScore] = useState(70);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAssessments();
    } else {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const list = await quizService.getMyAssessments();
      setAssessments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await quizService.submitAssessment(skillName, score);
      setScore(70);
      loadAssessments();
      alert("Assessment score submitted successfully! Overall Skill score recalculated.");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-905">Skill & Practice Assessments</h2>
            <p className="text-sm text-slate-500">Record score cards to align AI path recommendations.</p>
          </div>
          <button 
            onClick={loadAssessments}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Submit panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5 text-primary" /> Log New Test Score
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600">Select Subject Category</label>
                <select
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-slate-800 outline-none text-xs"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="General Science">General Science</option>
                  <option value="English Grammar">English Grammar</option>
                  <option value="Social Studies">Social Studies</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-650">
                  <span>Score Achieved</span>
                  <span className="text-primary font-extrabold">{score}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{submitting ? "Saving score..." : "Submit Record"}</span>
              </button>
            </form>
          </div>

          {/* History list */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Completed Assessment History</h3>
            
            {loading ? (
              <p className="text-slate-400 text-xs italic">Loading assessments history...</p>
            ) : assessments.length > 0 ? (
              <div className="grid gap-3">
                {assessments.map((a) => (
                  <div key={a.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{a.skill_name}</div>
                      <div className="text-[10px] text-slate-400">Assessed on: {new Date(a.assessed_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{a.score}%</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                No assessments registered yet. Submit a test score to initialize.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
