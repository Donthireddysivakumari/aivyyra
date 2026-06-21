"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { courseService } from "@/services/api";
import { BookOpen, ChevronRight, Award, CheckCircle2, Play, RefreshCw } from "lucide-react";

export default function StudentCourses() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const initialize = useAuthStore((state) => state.initialize);

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCourses();
    } else {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = await courseService.list();
      setCourses(list);

      // Load progress
      const progList = await courseService.getStudentProgress();
      const progMap: any = {};
      progList.forEach((p: any) => {
        progMap[p.course_id] = p.completion_percentage;
      });
      setProgress(progMap);

      if (list.length > 0) {
        loadCourseDetails(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async (courseId: number) => {
    try {
      const details = await courseService.getDetails(courseId);
      setSelectedCourse(details);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkCompleted = async (courseId: number) => {
    try {
      // Toggle progress to 100% completion for demonstration
      await courseService.updateProgress(courseId, 100.0);
      setProgress({
        ...progress,
        [courseId]: 100.0
      });
      alert("Congratulations! You completed the course and earned a certificate. Check the Certificates page!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Learning Catalog</h2>
            <p className="text-sm text-slate-500">Access video transcripts, written courses and lessons.</p>
          </div>
          <button 
            onClick={loadCourses}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Courses list */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Available Courses</h3>
            {loading ? (
              <p className="text-slate-400 text-xs italic">Loading course catalog...</p>
            ) : (
              <div className="grid gap-3">
                {courses.map((course) => {
                  const compPct = progress[course.id] || 0;
                  const isDone = compPct >= 100;
                  return (
                    <div
                      key={course.id}
                      onClick={() => loadCourseDetails(course.id)}
                      className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                        selectedCourse?.id === course.id 
                          ? "bg-white border-primary shadow-md" 
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <h4 className="font-bold text-slate-950 text-sm">{course.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{course.category} &bull; {course.level}</p>
                      
                      <div className="mt-4 flex justify-between items-center text-xs">
                        <span className={`font-semibold ${isDone ? "text-emerald-500" : "text-primary"}`}>
                          {isDone ? "Completed" : `${compPct}% Done`}
                        </span>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Course details */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            {selectedCourse ? (
              <>
                <div className="border-b border-slate-100 pb-5 space-y-2">
                  <h3 className="font-black text-slate-900 text-xl">{selectedCourse.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedCourse.description}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Lesson Units</h4>
                  {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                    <div className="grid gap-4">
                      {selectedCourse.lessons.map((lesson: any, index: number) => (
                        <div key={lesson.id} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold text-xs">{index + 1}</span>
                            <h5 className="font-bold text-slate-900 text-sm">{lesson.title}</h5>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pl-9">{lesson.content}</p>
                          {lesson.quizzes && lesson.quizzes.length > 0 && (
                            <div className="pl-9 pt-2 flex flex-wrap gap-2">
                              {lesson.quizzes.map((quiz: any) => (
                                <button
                                  key={quiz.id}
                                  onClick={() => router.push(`/student/courses/quiz/${quiz.id}`)}
                                  className="px-4 py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] transition-all flex items-center gap-1.5 active:scale-[0.98]"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>Take Quiz: {quiz.title}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Complete Course trigger */}
                      {progress[selectedCourse.id] < 100.0 && (
                        <button
                          onClick={() => handleMarkCompleted(selectedCourse.id)}
                          className="mt-4 w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all text-sm"
                        >
                          <Award className="w-5 h-5" />
                          <span>Complete Course & Earn Certificate</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">No lessons published for this course yet.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-xs italic">Select a course to view details.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
