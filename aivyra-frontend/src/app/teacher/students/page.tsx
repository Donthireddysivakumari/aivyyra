"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService, aiService } from "@/services/api";
import {
  Users,
  Search,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  MapPin,
  Globe,
} from "lucide-react";

export default function TeacherStudents() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studPred, setStudPred] = useState<any>(null);
  const [studGap, setStudGap] = useState<any>(null);
  const [studRecs, setStudRecs] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isMounted, router]);

  const loadStudents = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await userService.getStudentsList();
      setStudents(list);
      if (list.length > 0) handleSelectStudent(list[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadStudents();
  }, [isAuthenticated]);

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    setStudPred(null);
    setStudGap(null);
    setStudRecs(null);
    try {
      const [pred, gap, recs] = await Promise.all([
        aiService.getPerformancePrediction(student.id),
        aiService.getSkillGap(student.id),
        aiService.getRecommendations(student.id),
      ]);
      setStudPred(pred);
      setStudGap(gap);
      setStudRecs(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const classLevels = ["All", ...Array.from(new Set(students.map((s) => s.class_level)))];

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.village?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchClass = filterClass === "All" || s.class_level === filterClass;
    return matchSearch && matchClass;
  });

  if (!isAuthenticated || !role || role.toUpperCase() !== "TEACHER") return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Student Monitoring</h2>
            <p className="text-sm text-slate-500">
              Deep-dive into individual student profiles with AI diagnostics.
            </p>
          </div>
          <button
            onClick={loadStudents}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Overview bar */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Total Students", value: students.length, color: "blue" },
            {
              label: "At-Risk Students",
              value: students.filter((s) => s.skill_score < 60).length,
              color: "rose",
            },
            {
              label: "High Performers",
              value: students.filter((s) => s.skill_score >= 80).length,
              color: "emerald",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  s.color === "blue" ? "bg-blue-50 text-blue-600" :
                  s.color === "rose" ? "bg-rose-50 text-rose-600" :
                  s.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  "bg-slate-50 text-slate-600"
                }`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Student List */}
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by name or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-xs outline-none"
                />
              </div>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-xs outline-none"
              >
                {classLevels.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[520px] pr-1">
              {loading ? (
                <p className="text-slate-400 text-xs py-6 text-center italic">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-slate-400 text-xs py-6 text-center">No students found.</p>
              ) : (
                filteredStudents.map((stud) => (
                  <div
                    key={stud.id}
                    onClick={() => handleSelectStudent(stud)}
                    className={`flex justify-between items-center py-4 px-3 rounded-2xl cursor-pointer transition-all ${
                      selectedStudent?.id === stud.id
                        ? "bg-blue-50/70 border-l-4 border-primary"
                        : "hover:bg-slate-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                        {stud.user?.name?.[0] || "S"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{stud.user?.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {stud.village}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Globe className="w-3 h-3" /> {stud.language}
                          </span>
                          <span>·</span>
                          <span>{stud.class_level}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`font-extrabold text-sm ${
                            stud.skill_score >= 80
                              ? "text-emerald-600"
                              : stud.skill_score >= 60
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {Math.round(stud.skill_score)}%
                        </p>
                        <p className="text-[10px] text-slate-400">Skill</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Detail Panel */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" /> AI Diagnostics
            </h3>

            {selectedStudent ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-extrabold text-slate-600">
                    {selectedStudent.user?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{selectedStudent.user?.name}</p>
                    <p className="text-xs text-slate-400">
                      ST-{selectedStudent.id} · {selectedStudent.village} · {selectedStudent.class_level}
                    </p>
                  </div>
                </div>

                {detailLoading ? (
                  <div className="text-center py-8 space-y-2">
                    <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" />
                    <p className="text-slate-400 text-xs">Running AI models...</p>
                  </div>
                ) : (
                  <>
                    {studPred && (
                      <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Predicted Score</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              studPred.risk_level === "Low"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {studPred.risk_level} Risk
                          </span>
                        </div>
                        <p className="text-3xl font-black text-blue-400">{studPred.predicted_future_score}%</p>
                        <p className="text-[10px] text-slate-400">Final term AI forecast</p>
                      </div>
                    )}

                    {studGap && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase">Skill Gap Analysis</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                            <span className="text-[10px] font-extrabold text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Weak
                            </span>
                            <p className="text-[11px] text-slate-600 mt-1">
                              {studGap.weak_subjects?.join(", ") || "None"}
                            </p>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                            <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Strong
                            </span>
                            <p className="text-[11px] text-slate-600 mt-1">
                              {studGap.strong_subjects?.join(", ") || "None"}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Info className="w-3 h-3" /> Gap factor: {studGap.skill_gap_percentage}%
                        </p>
                      </div>
                    )}

                    {studRecs && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase">AI Recommendation</p>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-[11px] text-slate-700 leading-relaxed italic">
                            &quot;{studRecs.improvement_plan}&quot;
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">Select a student to view AI diagnostics.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
