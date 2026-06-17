"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService, aiService, courseService } from "@/services/api";
import { 
  Users, 
  BookOpen, 
  LineChart, 
  Sparkles, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function TeacherDashboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // AI predictions for the selected student
  const [studPred, setStudPred] = useState<any>(null);
  const [studGap, setStudGap] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isMounted, router]);

  const loadTeacherData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const studs = await userService.getStudentsList();
      setStudents(studs);

      const courseList = await courseService.list();
      setCourses(courseList);

      // Auto-select first student if available
      if (studs.length > 0) {
        handleSelectStudent(studs[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch classroom records. Ensure the backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTeacherData();
    }
  }, [isAuthenticated]);

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    setStudPred(null);
    setStudGap(null);
    try {
      const pred = await aiService.getPerformancePrediction(student.id);
      setStudPred(pred);
      const gap = await aiService.getSkillGap(student.id);
      setStudGap(gap);
    } catch (err) {
      console.error("Failed to load student AI metrics", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart Data: Village distribution
  const getVillageChartData = () => {
    const counts: { [key: string]: number } = {};
    students.forEach(s => {
      counts[s.village] = (counts[s.village] || 0) + 1;
    });
    return Object.keys(counts).map(v => ({ name: v, count: counts[v] }));
  };

  const getScoreDistributionData = () => {
    const scores = [0, 0, 0]; // Low (<60), Mid (60-80), High (>80)
    students.forEach(s => {
      if (s.skill_score < 60) scores[0]++;
      else if (s.skill_score <= 80) scores[1]++;
      else scores[2]++;
    });
    return [
      { name: "Need Support (<60)", value: scores[0] },
      { name: "Progressing (60-80)", value: scores[1] },
      { name: "Exceeding (>80)", value: scores[2] },
    ];
  };

  const COLORS = ["#F43F5E", "#F59E0B", "#10B981"];

  if (!isAuthenticated || !role || role.toUpperCase() !== "TEACHER") {
    return null;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Teacher Analytics Panel</h2>
            <p className="text-sm text-slate-500">Track and monitor rural classroom skill progress, risk scores, and AI recommendations.</p>
          </div>
          <button 
            onClick={loadTeacherData}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Class Students</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{students.length}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Subjects</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{courses.length}</h2>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Class Average Mastery</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                {students.length > 0 
                  ? `${Math.round(students.reduce((acc, curr) => acc + curr.skill_score, 0) / students.length)}%`
                  : "0%"
                }
              </h2>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Student Monitoring Split Screen */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* List panel */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900">Student Profiles Roster</h3>
              <div className="relative w-48">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search name/village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px] pr-2">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stud) => (
                  <div
                    key={stud.id}
                    onClick={() => handleSelectStudent(stud)}
                    className={`flex justify-between items-center py-4 px-3 rounded-2xl cursor-pointer transition-all ${
                      selectedStudent?.id === stud.id 
                        ? "bg-blue-50/70 border-l-4 border-primary shadow-sm" 
                        : "hover:bg-slate-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{stud.user?.name || "Student"}</div>
                      <div className="text-xs text-slate-400">{stud.class_level} &bull; {stud.village} &bull; Lang: {stud.language}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 text-sm">{Math.round(stud.skill_score)}%</div>
                        <div className="text-[10px] text-slate-400">Skill Score</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-6 text-center">No students found matching query.</p>
              )}
            </div>
          </div>

          {/* AI Metrics Detail Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" /> Student AI Diagnostics
            </h3>

            {selectedStudent ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Selected Student</h4>
                  <p className="font-black text-slate-900 text-lg">{selectedStudent.user?.name}</p>
                  <p className="text-xs text-slate-500">ID: ST-{selectedStudent.id} &bull; {selectedStudent.village}</p>
                </div>

                {detailLoading ? (
                  <p className="text-slate-400 text-xs italic">Crunching AI model outputs...</p>
                ) : (
                  <>
                    {/* Predict score */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Predicted Exam Score</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          studPred?.risk_level === "Low" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {studPred?.risk_level} Risk
                        </span>
                      </div>
                      <div className="text-3xl font-black text-blue-400">{studPred?.predicted_future_score}%</div>
                      <p className="text-[10px] text-slate-400">Based on quiz scores, course logs, and village parameters.</p>
                    </div>

                    {/* Skill Gaps */}
                    {studGap && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase">AI Detected Gaps</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                            <span className="font-extrabold text-rose-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Weak Areas</span>
                            <div className="text-[11px] text-slate-600 mt-1">
                              {studGap.weak_subjects?.join(", ") || "None"}
                            </div>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                            <span className="font-extrabold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Strengths</span>
                            <div className="text-[11px] text-slate-600 mt-1">
                              {studGap.strong_subjects?.join(", ") || "None"}
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Skill gap factor: {studGap.skill_gap_percentage}%</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">Select a student from roster to inspect AI metrics.</p>
            )}
          </div>
        </div>

        {/* Charts: Demographics and score categories */}
        {isMounted && students.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Classroom Village Demographics</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getVillageChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Skill Mastery Clusters</h3>
              <div className="h-56 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getScoreDistributionData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getScoreDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs">
                {getScoreDistributionData().map((d, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-slate-500">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
