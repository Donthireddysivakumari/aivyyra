"use client";

// AI Recommendations Page

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { aiService, userService } from "@/services/api";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  BookOpen,
  Target,
  TrendingUp,
  Brain,
} from "lucide-react";

export default function StudentRecommendations() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userProfile = useAuthStore((state) => state.userProfile);
  const initialize = useAuthStore((state) => state.initialize);

  const [aiGaps, setAiGaps] = useState<any>(null);
  const [aiRecs, setAiRecs] = useState<any>(null);
  const [aiPred, setAiPred] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRecommendations();
    } else {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      let studentId = userProfile?.profile?.id;
      if (!studentId) {
        const fullProf = await userService.getCurrentUser();
        useAuthStore.getState().setProfile(fullProf);
        studentId = fullProf.profile?.id;
      }

      if (studentId) {
        const [gaps, recs, pred] = await Promise.all([
          aiService.getSkillGap(studentId),
          aiService.getRecommendations(studentId),
          aiService.getPerformancePrediction(studentId),
        ]);
        setAiGaps(gaps);
        setAiRecs(recs);
        setAiPred(pred);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakPlan = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = aiRecs?.improvement_plan || "No recommendations available yet.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">AI Personalized Recommendations</h2>
            <p className="text-sm text-slate-500">
              Powered by scikit-learn models trained on your quiz scores, assessments, and course progress.
            </p>
          </div>
          <button
            onClick={loadRecommendations}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
            <Brain className="w-14 h-14 text-primary mx-auto animate-pulse" />
            <p className="text-slate-500 font-semibold">Analyzing your learning data...</p>
            <p className="text-xs text-slate-400">AI models are processing your quiz scores and assessments.</p>
          </div>
        ) : (
          <>
            {/* Skill Gap Analysis */}
            {aiGaps && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Areas Needing Attention
                  </h3>
                  {aiGaps.weak_subjects?.length > 0 ? (
                    <div className="space-y-2">
                      {aiGaps.weak_subjects.map((s: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-xl border border-rose-100"
                        >
                          <div className="w-2 h-2 bg-rose-400 rounded-full" />
                          <span className="text-sm font-semibold text-rose-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-rose-600 text-sm">No weak areas detected. Great job!</p>
                  )}
                  <div className="text-xs text-rose-500 font-semibold border-t border-rose-100 pt-3">
                    Skill gap factor: {aiGaps.skill_gap_percentage}%
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Your Strong Subjects
                  </h3>
                  {aiGaps.strong_subjects?.length > 0 ? (
                    <div className="space-y-2">
                      {aiGaps.strong_subjects.map((s: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-xl border border-emerald-100"
                        >
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

            {/* AI Improvement Plan */}
            {aiRecs && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" /> Your AI Learning Plan
                  </h3>
                  <button
                    onClick={speakPlan}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      speaking
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-blue-50 text-primary border border-blue-100 hover:bg-blue-100"
                    }`}
                  >
                    {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {speaking ? "Stop" : "Listen Aloud"}
                  </button>
                </div>

                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    &quot;{aiRecs.improvement_plan}&quot;
                  </p>
                </div>

                {/* Recommended Courses */}
                {aiRecs.recommended_courses?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Suggested Courses to Attempt
                    </h4>
                    <div className="grid gap-3">
                      {aiRecs.recommended_courses.map((c: any) => (
                        <div
                          key={c.id}
                          onClick={() => router.push("/student/courses")}
                          className="p-4 bg-slate-50 border border-slate-200 hover:border-primary hover:bg-white rounded-2xl flex justify-between items-center cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-primary rounded-xl flex items-center justify-center">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">
                                {c.title}
                              </p>
                              <p className="text-xs text-slate-400">
                                {c.category} · {c.level}
                              </p>
                            </div>
                          </div>
                          <Target className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Performance Prediction */}
            {aiPred && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 rounded-3xl shadow-xl border border-slate-800 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      AI Performance Forecast
                    </p>
                    <h3 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mt-2">
                      {aiPred.predicted_future_score}%
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Predicted Final Term Score</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      aiPred.risk_level === "Low"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : aiPred.risk_level === "Medium"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {aiPred.risk_level} Risk
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-5 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase">Suggested Action Steps</p>
                  <ul className="space-y-2">
                    {aiPred.suggested_actions?.map((act: string, i: number) => (
                      <li key={i} className="flex gap-2.5 items-start text-sm text-slate-300">
                        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!aiGaps && !aiRecs && !aiPred && (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
                <Sparkles className="w-14 h-14 text-slate-300 mx-auto" />
                <h3 className="font-black text-slate-800 text-lg">No AI Data Yet</h3>
                <p className="text-sm text-slate-500">
                  Complete some quiz attempts and skill assessments to generate personalized AI recommendations.
                </p>
                <button
                  onClick={() => router.push("/student/assessments")}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all text-xs"
                >
                  Take a Skill Assessment
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
