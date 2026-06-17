"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService, aiService } from "@/services/api";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Volume2,
  VolumeX,
  Brain,
} from "lucide-react";

export default function ParentRecommendations() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const userProfile = useAuthStore((state) => state.userProfile);
  const initialize = useAuthStore((state) => state.initialize);

  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [aiRecs, setAiRecs] = useState<any>(null);
  const [aiGaps, setAiGaps] = useState<any>(null);
  const [aiPred, setAiPred] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
        const [stud, recs, gaps, pred] = await Promise.all([
          userService.getStudentById(studentId),
          aiService.getRecommendations(studentId),
          aiService.getSkillGap(studentId),
          aiService.getPerformancePrediction(studentId),
        ]);
        setStudentDetails(stud);
        setAiRecs(recs);
        setAiGaps(gaps);
        setAiPred(pred);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakGuidance = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const name = studentDetails?.user?.name || "your child";
    const plan = aiRecs?.improvement_plan || "No recommendations yet.";
    const pred = aiPred?.predicted_future_score || 0;
    const risk = aiPred?.risk_level || "Medium";
    const text = `Hello parent. Here is the AI guidance report for ${name}. ${plan}. The AI predicts a final term score of ${pred} percent, with a ${risk} risk level. Please review the suggested action steps with your child.`;
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
            <h2 className="text-2xl font-black text-slate-900">AI Guidance for Your Child</h2>
            <p className="text-sm text-slate-500">
              AI-powered recommendations to help support your child&apos;s learning journey.
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Voice readout */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
              Audio AI Report
            </span>
            <h3 className="font-extrabold text-xl">Listen to AI Guidance</h3>
            <p className="text-xs text-slate-300">
              Get a full spoken AI progress and guidance report for {studentDetails?.user?.name || "your child"}.
            </p>
          </div>
          <button
            onClick={speakGuidance}
            className={`px-6 py-4 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-all duration-300 hover:scale-[1.03] ${
              speaking ? "bg-rose-500 text-white animate-pulse" : "bg-white text-slate-900"
            }`}
          >
            {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
            <span>{speaking ? "Stop" : "Read Aloud"}</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
            <Brain className="w-14 h-14 text-primary mx-auto animate-pulse" />
            <p className="text-slate-500 font-semibold">Fetching AI guidance data...</p>
          </div>
        ) : (
          <>
            {/* Skill gaps */}
            {aiGaps && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Subjects Needing Help
                  </h3>
                  {aiGaps.weak_subjects?.length > 0 ? (
                    <div className="space-y-2">
                      {aiGaps.weak_subjects.map((s: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-xl border border-rose-100">
                          <div className="w-2 h-2 bg-rose-400 rounded-full" />
                          <span className="text-sm font-semibold text-rose-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-rose-600 text-sm">No weak subjects detected.</p>
                  )}
                  <p className="text-xs text-rose-500 font-semibold border-t border-rose-100 pt-3">
                    Skill gap: {aiGaps.skill_gap_percentage}%
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Strong Subject Areas
                  </h3>
                  {aiGaps.strong_subjects?.length > 0 ? (
                    <div className="space-y-2">
                      {aiGaps.strong_subjects.map((s: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-xl border border-emerald-100">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <span className="text-sm font-semibold text-emerald-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-600 text-sm">Complete assessments to identify strengths.</p>
                  )}
                </div>
              </div>
            )}

            {/* AI Learning Plan */}
            {aiRecs && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Sparkles className="w-5 h-5 text-primary" /> AI Suggested Learning Plan
                </h3>
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    &quot;{aiRecs.improvement_plan}&quot;
                  </p>
                </div>

                {aiRecs.recommended_courses?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Recommended Courses for Your Child
                    </h4>
                    <div className="grid gap-3">
                      {aiRecs.recommended_courses.map((c: any) => (
                        <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-primary rounded-xl flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{c.title}</p>
                            <p className="text-xs text-slate-400">{c.category} · {c.level}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Performance prediction */}
            {aiPred && (
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Graduation Forecast</p>
                    <h3 className="text-4xl font-black text-emerald-400 mt-1">{aiPred.predicted_future_score}%</h3>
                    <p className="text-xs text-slate-400">Predicted Final Term Score</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    aiPred.risk_level === "Low"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : aiPred.risk_level === "Medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {aiPred.risk_level} Risk
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Parental Action Steps</p>
                  <ul className="space-y-2">
                    {aiPred.suggested_actions?.map((act: string, i: number) => (
                      <li key={i} className="flex gap-2.5 items-start text-sm text-slate-300">
                        <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    )) || (
                      <>
                        <li className="flex gap-2 text-sm text-slate-300"><TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Ask if they completed their daily lessons.</li>
                        <li className="flex gap-2 text-sm text-slate-300"><TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Reserve 20 minutes of study time after school.</li>
                        <li className="flex gap-2 text-sm text-slate-300"><TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Encourage reading lessons aloud to improve retention.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
