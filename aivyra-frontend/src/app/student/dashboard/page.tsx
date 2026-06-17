"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService, aiService, courseService, quizService } from "@/services/api";
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  Activity, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from "recharts";

export default function StudentDashboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const userProfile = useAuthStore((state) => state.userProfile);
  const initialize = useAuthStore((state) => state.initialize);

  // Stats and state
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [aiRecs, setAiRecs] = useState<any>(null);
  const [aiPred, setAiPred] = useState<any>(null);
  const [aiGaps, setAiGaps] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client side check for SSR charts
  const [isMounted, setIsMounted] = useState(false);

  // Voice States
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  // Redirect if not logged in
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isMounted, router]);

  // Load profile dashboard data
  const loadDashboardData = async () => {
    if (!token || !userId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Get student profile & dashboard metrics
      const profileData = await userService.getStudentStats();
      setStats(profileData);

      // Fetch full profile info if not loaded yet
      let studentId = userProfile?.profile?.id;
      if (!studentId) {
        const profile = await userService.getStudentById(userId); // wait, userProfile holds student_profile
        const fullProf = await userService.getCurrentUser();
        useAuthStore.getState().setProfile(fullProf);
        studentId = fullProf.profile?.id;
      }

      if (studentId) {
        // 2. Fetch Courses
        const courseList = await courseService.list();
        setCourses(courseList);

        // 3. Fetch attempts for charts
        const attemptList = await quizService.getMyAttempts();
        setAttempts(attemptList);

        // 4. Fetch AI Gaps, Recommendations, and predictions
        const gaps = await aiService.getSkillGap(studentId);
        setAiGaps(gaps);

        const recs = await aiService.getRecommendations(studentId);
        setAiRecs(recs);

        const preds = await aiService.getPerformancePrediction(studentId);
        setAiPred(preds);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data. Ensure backend server run.py is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Voice synthesis & recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setVoiceSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-IN"; // English with Indian accent preset for rural student accessibility

        rec.onresult = (e: any) => {
          const result = e.results[0][0].transcript;
          setSpokenText(result);
          handleVoiceCommand(result);
        };

        rec.onend = () => {
          setListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleVoiceCommand = (text: string) => {
    const cmd = text.toLowerCase();
    let reply = "I heard you say: " + text + ". ";
    
    if (cmd.includes("recommend") || cmd.includes("learn")) {
      reply += aiRecs ? aiRecs.improvement_plan : "We recommend checking your math course.";
    } else if (cmd.includes("progress") || cmd.includes("score")) {
      reply += `Your current skill score is ${stats?.skill_score || 0} percent, with a progress percentage of ${stats?.progress_percentage || 0} percent.`;
    } else if (cmd.includes("hello") || cmd.includes("hi")) {
      reply += "Hello Ramesh! I am your AI learning assistant. Ask me: 'recommend a course' or 'what is my score'.";
    } else {
      reply += "For voice options, you can say: 'recommend a course' or 'tell me my score'.";
    }
    speakText(reply);
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // cancel existing speaking
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      setSpokenText("Listening for command...");
      recognitionRef.current.start();
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
  };

  // Chart data configurations
  const getProgressChartData = () => {
    if (!attempts || attempts.length === 0) {
      return [
        { name: "Quiz 1", Score: 50 },
        { name: "Quiz 2", Score: 75 },
      ];
    }
    return attempts.map((a, idx) => ({
      name: a.quiz?.title ? a.quiz.title.split(" ")[0] + ` ${idx+1}` : `Quiz ${idx+1}`,
      Score: a.score
    }));
  };

  const getSubjectChartData = () => {
    if (!aiGaps || !aiGaps.strong_subjects) {
      return [
        { Subject: "Mathematics", Mastery: 55 },
        { Subject: "English", Mastery: 72 },
        { Subject: "Science", Mastery: 80 }
      ];
    }
    return [
      ...aiGaps.strong_subjects.map((s: string) => ({ Subject: s, Mastery: 85 })),
      ...aiGaps.weak_subjects.map((s: string) => ({ Subject: s, Mastery: 45 }))
    ];
  };

  if (!isAuthenticated || !role || role.toUpperCase() !== "STUDENT") {
    return null;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      {/* Main dashboard body */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Student Dashboard</h2>
            <p className="text-sm text-slate-500">Welcome back! Keep up your learning streak.</p>
          </div>
          <button 
            onClick={loadDashboardData}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
            title="Refresh statistics"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-3xl flex gap-3 items-center">
            <AlertCircle className="w-6 h-6 text-rose-600" />
            <div>
              <p className="font-bold">Dashboard offline warning</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* VOICE SUPPORT BAR (Wow Component) */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent -z-10"></div>
          
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4.5 h-4.5 text-blue-400" /> Voice-Assisted Tutor Active
            </div>
            <h3 className="font-extrabold text-xl">Speak to Aivyra Helper</h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              No typing needed. Click microphone and say <strong>&quot;recommend a course&quot;</strong> or <strong>&quot;tell me my score&quot;</strong> to get instant translated audio updates.
            </p>
            {spokenText && (
              <p className="text-xs text-blue-300 font-mono mt-2 bg-black/30 px-3 py-1.5 rounded-lg inline-block">
                Query: {spokenText}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={toggleListening}
              className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all duration-300 hover:scale-[1.03] ${
                listening 
                  ? "bg-rose-500 text-white shadow-rose-500/25 animate-pulse" 
                  : "bg-white text-slate-900 shadow-white/10"
              }`}
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-primary" />}
              <span>{listening ? "Listening..." : "Tap to Speak"}</span>
            </button>

            {speaking && (
              <button
                onClick={stopSpeaking}
                className="p-4 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
              >
                <VolumeX className="w-5 h-5 text-rose-400" />
                <span>Mute</span>
              </button>
            )}
          </div>
        </div>

        {/* Widgets section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Courses</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-950">{stats?.total_courses || 0}</h2>
              <div className="w-8 h-8 bg-blue-50 text-primary rounded-xl flex items-center justify-center"><BookOpen className="w-4.5 h-4.5" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Progress</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-950">{stats?.progress_percentage || 0}%</h2>
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Activity className="w-4.5 h-4.5" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Skill Score</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-950">{stats?.skill_score || 0}%</h2>
              <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Award className="w-4.5 h-4.5" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Learning Streak</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-slate-950">{stats?.learning_streak || 0} Days</h2>
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">🔥</div>
            </div>
          </div>
        </div>

        {/* AI INSIGHTS CARD */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* AI Recommendations panel */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                <Sparkles className="w-5.5 h-5.5 text-primary" /> Personalized AI Recommendations
              </h3>
              {aiRecs && (
                <button
                  onClick={() => speakText(aiRecs.improvement_plan)}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100/80 rounded-xl text-primary font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Volume2 className="w-4 h-4" /> Listen Plan
                </button>
              )}
            </div>

            {aiRecs ? (
              <div className="space-y-6">
                <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl text-slate-700 text-sm italic leading-relaxed">
                  &quot;{aiRecs.improvement_plan}&quot;
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Suggested Courses for You</h4>
                  <div className="grid gap-3">
                    {aiRecs.recommended_courses?.map((course: any) => (
                      <div 
                        key={course.id} 
                        className="p-4 bg-white border border-slate-200 hover:border-primary rounded-2xl flex justify-between items-center group cursor-pointer transition-all"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm">{course.title}</div>
                          <div className="text-xs text-slate-400">{course.category} &bull; {course.level}</div>
                        </div>
                        <Play className="w-4.5 h-4.5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No recommendations generated yet. Complete quizzes to prompt model predictions.</p>
            )}
          </div>

          {/* AI Performance predictor widget */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6 border border-slate-800">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Performance Prediction</h3>
              
              <div className="text-center py-4 space-y-1">
                <p className="text-xs text-slate-400">Predicted Final Term Score</p>
                <h2 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  {aiPred ? `${aiPred.predicted_future_score}%` : "Calculating..."}
                </h2>
                <div className="pt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    aiPred?.risk_level === "Low" 
                      ? "bg-emerald-500/20 text-emerald-355" 
                      : aiPred?.risk_level === "Medium"
                      ? "bg-amber-500/20 text-amber-350"
                      : "bg-rose-500/20 text-rose-350"
                  }`}>
                    {aiPred?.risk_level || "Medium"} Risk Level
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400">Suggested Action Steps:</p>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {aiPred?.suggested_actions?.map((act: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-primary-light font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  )) || <li>No suggestions generated. Finish assessment.</li>}
                </ul>
              </div>
            </div>

            <button 
              onClick={() => router.push("/student/courses")}
              className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all text-xs"
            >
              Attempt Practice Quizzes
            </button>
          </div>
        </div>

        {/* Charts section */}
        {isMounted && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chart 1: Quiz History Line Graph */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Quiz Performance Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getProgressChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Score" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Subject Mastery Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Subject-wise Score Mastery</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getSubjectChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="Subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="Mastery" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
