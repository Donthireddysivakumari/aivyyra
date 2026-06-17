"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { courseService } from "@/services/api";
import {
  BookOpen,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function AdminCourses() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [courses, setCourses] = useState<any[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [courseDetails, setCourseDetails] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isMounted, router]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await courseService.list();
      setCourses(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = async (id: number) => {
    if (expandedCourse === id) {
      setExpandedCourse(null);
      return;
    }
    setExpandedCourse(id);
    if (!courseDetails[id]) {
      try {
        const details = await courseService.getDetails(id);
        setCourseDetails((prev) => ({ ...prev, [id]: details }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadCourses();
  }, [isAuthenticated]);

  const LEVEL_COLORS: Record<string, string> = {
    Basic: "bg-emerald-50 text-emerald-700",
    Intermediate: "bg-amber-50 text-amber-700",
    Advanced: "bg-rose-50 text-rose-700",
  };

  const CATEGORY_COLORS: Record<string, string> = {
    Mathematics: "bg-blue-50 text-blue-700",
    Science: "bg-purple-50 text-purple-700",
    "English Grammar": "bg-teal-50 text-teal-700",
  };

  if (!isAuthenticated || !role || role.toUpperCase() !== "ADMIN") return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Course Setup</h2>
            <p className="text-sm text-slate-500">
              Manage the full curriculum catalog — courses, lessons, and quizzes.
            </p>
          </div>
          <button
            onClick={loadCourses}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-3xl flex gap-3 items-center">
            <AlertCircle className="w-6 h-6 text-rose-600" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Total Courses", value: courses.length, icon: BookOpen, color: "blue" },
            {
              label: "Subject Categories",
              value: new Set(courses.map((c) => c.category)).size,
              icon: Layers,
              color: "purple",
            },
            {
              label: "Difficulty Levels",
              value: new Set(courses.map((c) => c.level)).size,
              icon: HelpCircle,
              color: "amber",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                s.color === "blue" ? "bg-blue-50 text-blue-600" :
                s.color === "purple" ? "bg-purple-50 text-purple-600" :
                s.color === "amber" ? "bg-amber-50 text-amber-600" :
                "bg-slate-50 text-slate-600"
              }`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Accordion course list */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <p className="text-slate-400 text-sm italic">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No courses found.</p>
            </div>
          ) : (
            courses.map((course: any) => {
              const isOpen = expandedCourse === course.id;
              const details = courseDetails[course.id];
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-blue-100 text-primary rounded-xl flex items-center justify-center font-black text-sm">
                        #{course.id}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[course.category] || "bg-slate-100 text-slate-600"}`}>
                            {course.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || "bg-slate-100 text-slate-600"}`}>
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 p-6 space-y-5 bg-slate-50/50">
                      <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>

                      {details ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                              Lessons ({details.lessons?.length || 0})
                            </h4>
                          </div>
                          {details.lessons?.length > 0 ? (
                            <div className="grid gap-3">
                              {details.lessons.map((lesson: any, idx: number) => (
                                <div
                                  key={lesson.id}
                                  className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-100 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                      {idx + 1}
                                    </span>
                                    <p className="font-bold text-slate-800 text-sm">{lesson.title}</p>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-relaxed pl-8 line-clamp-2">
                                    {lesson.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs italic">No lessons for this course.</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic">Loading lesson details...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
