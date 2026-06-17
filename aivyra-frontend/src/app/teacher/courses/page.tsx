"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { courseService } from "@/services/api";
import {
  BookOpen,
  Plus,
  RefreshCw,
  ChevronRight,
  BookMarked,
  FileText,
  Layers,
} from "lucide-react";

export default function TeacherCourses() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const list = await courseService.list();
      setCourses(list);
      if (list.length > 0) loadCourseDetails(list[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async (id: number) => {
    try {
      const details = await courseService.getDetails(id);
      setSelectedCourse(details);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadCourses();
  }, [isAuthenticated]);

  if (!isAuthenticated || !role || role.toUpperCase() !== "TEACHER") return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Course Management</h2>
            <p className="text-sm text-slate-500">
              View and review curriculum catalog for your classroom students.
            </p>
          </div>
          <button
            onClick={loadCourses}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Total Courses", value: courses.length, icon: BookOpen },
            {
              label: "Total Lessons",
              value: courses.reduce((acc: number, c: any) => acc + (c.lesson_count || 0), 0) || "—",
              icon: FileText,
            },
            {
              label: "Subject Categories",
              value: new Set(courses.map((c: any) => c.category)).size,
              icon: Layers,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Courses list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-primary" /> Course Catalog
            </h3>
            {loading ? (
              <p className="text-slate-400 text-xs italic">Loading courses...</p>
            ) : (
              <div className="space-y-3">
                {courses.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => loadCourseDetails(c.id)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                      selectedCourse?.id === c.id
                        ? "bg-white border-primary shadow-md"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-bold text-slate-900 text-sm">{c.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400">
                        {c.category} · {c.level}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course detail */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            {selectedCourse ? (
              <>
                <div className="border-b border-slate-100 pb-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 text-xl">{selectedCourse.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedCourse.category} · {selectedCourse.level}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-primary rounded-full text-xs font-bold">
                      Course #{selectedCourse.id}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{selectedCourse.description}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">
                    Lesson Units ({selectedCourse.lessons?.length || 0})
                  </h4>
                  {selectedCourse.lessons?.length > 0 ? (
                    <div className="grid gap-4">
                      {selectedCourse.lessons.map((lesson: any, idx: number) => (
                        <div
                          key={lesson.id}
                          className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <h5 className="font-bold text-slate-900 text-sm">{lesson.title}</h5>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed pl-9 line-clamp-2">
                            {lesson.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-400 text-xs">
                      No lessons found for this course.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs italic">
                Select a course to view details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
