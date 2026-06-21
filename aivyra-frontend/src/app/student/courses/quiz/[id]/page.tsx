"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { quizService } from "@/services/api";
import { Award, CheckCircle2, XCircle, Volume2, ArrowRight, ArrowLeft, RefreshCw, BookOpen } from "lucide-react";

export default function AttendAssessment() {
  const router = useRouter();
  const params = useParams();
  const quizId = Number(params.id);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Stores the option key selected (e.g. { 0: 'A', 1: 'B' })
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Results view trigger
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [attemptDetails, setAttemptDetails] = useState<any>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      if (quizId) {
        loadQuiz();
      }
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuiz(quizId);
      setQuiz(data);
    } catch (err) {
      console.error("Error loading quiz:", err);
      alert("Failed to load assessment. Please return to courses.");
      router.push("/student/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionLetter: string) => {
    setAnswers({
      ...answers,
      [currentIdx]: optionLetter
    });
  };

  const handleVoiceRead = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;
    const q = quiz.questions[currentIdx];
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const optionsText = `Option A: ${q.option_a}. Option B: ${q.option_b}. Option C: ${q.option_c}. Option D: ${q.option_d}.`;
      const text = `${q.question} ... ${optionsText}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Clearer pace
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate Score
    const questions = quiz.questions;
    let correctCount = 0;
    
    questions.forEach((q: any, idx: number) => {
      const selected = answers[idx];
      if (selected === q.correct_answer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    
    setSubmitting(true);
    try {
      const attempt = await quizService.submitAttempt(quizId, scorePercentage);
      setFinalScore(scorePercentage);
      setAttemptDetails(attempt);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting attempt:", err);
      alert("Failed to submit assessment results.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar role="STUDENT" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500">Loading interactive assessment...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar role="STUDENT" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-bold mb-4">No questions found in this assessment.</p>
            <button 
              onClick={() => router.push("/student/courses")}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-2xl text-xs hover:bg-primary-dark transition-all"
            >
              Back to Catalog
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const selectedOption = answers[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-8">
        {/* Quiz Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-slide-up">
          <div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-black rounded-lg text-[10px] uppercase tracking-wider">Assessment Portal</span>
            <h2 className="text-2xl font-black text-slate-905 mt-1">{quiz.title}</h2>
          </div>
          <button 
            onClick={handleVoiceRead}
            title="Read question aloud"
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all flex items-center gap-2 text-xs font-bold text-slate-700 active:scale-95"
          >
            <Volume2 className="w-5 h-5 text-indigo-650" />
            <span className="hidden sm:inline">Listen Question</span>
          </button>
        </div>

        {!showResults ? (
          /* Question Interface */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col min-h-[480px] animate-slide-up">
            {/* Progress indicator bar */}
            <div className="w-full bg-slate-100 h-2">
              <div 
                className="bg-indigo-600 h-2 transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
              {/* Question card */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-slate-400 font-bold">
                  <span>QUESTION {currentIdx + 1} OF {quiz.questions.length}</span>
                  <span className="text-indigo-650">{progressPercent}% Completed</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options list */}
              <div className="grid gap-3">
                {[
                  { key: "A", text: currentQuestion.option_a },
                  { key: "B", text: currentQuestion.option_b },
                  { key: "C", text: currentQuestion.option_c },
                  { key: "D", text: currentQuestion.option_d }
                ].map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 text-xs font-bold ${
                        isSelected 
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-sm" 
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                        isSelected 
                          ? "bg-indigo-600 text-white" 
                          : "bg-slate-100 text-slate-650"
                      }`}>
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-5 py-3 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 text-slate-600 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {currentIdx < quiz.questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!selectedOption}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
                  >
                    Next Question <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOption || submitting}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/10"
                  >
                    <Award className="w-4 h-4" />
                    <span>{submitting ? "Submitting..." : "Submit Assessment"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 space-y-8 animate-slide-up">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-emerald-50 rounded-3xl border border-emerald-100 mb-2">
                <Award className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Assessment Results Submitted!</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {finalScore >= 80 
                  ? "Outstanding job! You have fully mastered this lesson's concept."
                  : finalScore >= 50
                  ? "Good progress! Review the lesson material to strengthen your understanding."
                  : "Keep practicing! Re-read the course content and try the quiz again."
                }
              </p>
            </div>

            {/* Score Ring */}
            <div className="flex justify-center items-center py-4">
              <div className="relative flex items-center justify-center">
                {/* Simulated circular progress */}
                <div className="w-36 h-36 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                  <span className="text-3xl font-black text-slate-900">{finalScore}%</span>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Score</span>
                </div>
              </div>
            </div>

            {/* Details and review */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h4 className="font-extrabold text-slate-900 text-sm">Review Questions</h4>
              <div className="grid gap-3">
                {quiz.questions.map((q: any, idx: number) => {
                  const userAns = answers[idx];
                  const isCorrect = userAns === q.correct_answer;
                  const getOptionText = (key: string) => {
                    if (key === "A") return q.option_a;
                    if (key === "B") return q.option_b;
                    if (key === "C") return q.option_c;
                    if (key === "D") return q.option_d;
                    return "";
                  };

                  return (
                    <div key={q.id} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-2">
                          <span className="font-bold text-xs text-slate-400">{idx + 1}.</span>
                          <p className="font-bold text-xs text-slate-800 leading-relaxed">{q.question}</p>
                        </div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-[11px] pl-5 font-semibold">
                        <div className={`p-2.5 rounded-xl border ${
                          isCorrect 
                            ? "border-emerald-100 bg-emerald-50 text-emerald-950" 
                            : "border-rose-100 bg-rose-50 text-rose-950"
                        }`}>
                          <span className="font-extrabold mr-1">Your Answer:</span>
                          {userAns} &bull; {getOptionText(userAns)}
                        </div>
                        {!isCorrect && (
                          <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-950">
                            <span className="font-extrabold mr-1">Correct Answer:</span>
                            {q.correct_answer} &bull; {getOptionText(q.correct_answer)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentIdx(0);
                  setAnswers({});
                }}
                className="px-6 py-3 border border-slate-200 hover:bg-slate-50 font-bold rounded-2xl text-xs text-slate-600 transition-all active:scale-[0.98]"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => router.push("/student/courses")}
                className="px-8 py-3 bg-primary text-white font-bold rounded-2xl text-xs hover:bg-primary-dark shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
              >
                Back to Courses
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
