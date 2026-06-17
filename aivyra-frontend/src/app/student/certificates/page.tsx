"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { courseService } from "@/services/api";
import { GraduationCap, Award, Calendar, CheckCircle2, RefreshCw } from "lucide-react";

export default function StudentCertificates() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const userName = useAuthStore((state) => state.userName);
  const initialize = useAuthStore((state) => state.initialize);

  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCertificates();
    } else {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const list = await courseService.getMyCertificates();
      setCertificates(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">My Graduation Certificates</h2>
            <p className="text-sm text-slate-500">View and showcase your earned achievements and course completions.</p>
          </div>
          <button 
            onClick={loadCertificates}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-xs italic">Loading certificates...</p>
        ) : certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                className="bg-white border-8 border-double border-slate-200 p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between space-y-8 min-h-[320px] text-center"
              >
                {/* Background Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                  <GraduationCap className="w-64 h-64 text-slate-900" />
                </div>

                <div className="space-y-4">
                  <Award className="w-14 h-14 text-amber-500 mx-auto" />
                  <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block">Certificate of Achievement</span>
                  <p className="text-xs text-slate-400">This is proudly presented to</p>
                  <h3 className="font-extrabold text-2xl text-slate-900 border-b-2 border-slate-100 pb-3 max-w-xs mx-auto">{userName}</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    for successfully completing all lesson units, assessments, and quizzes for the course:
                  </p>
                  <h4 className="font-black text-primary text-base pt-1">{cert.course?.title || "Course Unit"}</h4>
                </div>

                <div className="flex justify-between items-end border-t border-slate-150 pt-4 text-[10px] text-slate-400">
                  <div className="text-left flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: {new Date(cert.issued_date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Graduate</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl text-center space-y-4 max-w-xl mx-auto border border-slate-100 shadow-sm">
            <GraduationCap className="w-16 h-16 text-slate-350 mx-auto" />
            <h3 className="font-black text-slate-800 text-lg">No Certificates Earned Yet</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Unlock certificates by enrolling in the catalog and marking course lessons as 100% completed.
            </p>
            <button 
              onClick={() => router.push("/student/courses")}
              className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all text-xs"
            >
              Browse Course Catalog
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
