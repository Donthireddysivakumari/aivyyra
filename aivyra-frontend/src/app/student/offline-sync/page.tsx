"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { ShieldCheck, HardDrive, Download, RefreshCw, CheckCircle2, Trash2 } from "lucide-react";

export default function StudentOfflineSync() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [syncing, setSyncing] = useState(false);
  const [offlineCourses, setOfflineCourses] = useState([
    { id: 1, title: "Basic Mathematics & Algebra", size: "1.2 MB", downloaded: true, lessonsCount: 2 },
    { id: 2, title: "General Science & Physics", size: "2.4 MB", downloaded: true, lessonsCount: 1 },
    { id: 3, title: "English Grammar & Vocab", size: "3.1 MB", downloaded: false, lessonsCount: 0 }
  ]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const handleDownload = (id: number) => {
    setOfflineCourses(offlineCourses.map(c => {
      if (c.id === id) {
        return { ...c, downloaded: true, size: "3.1 MB", lessonsCount: 3 };
      }
      return c;
    }));
    alert("Downloaded course assets (lessons content, audio translations) for offline use!");
  };

  const handleDelete = (id: number) => {
    setOfflineCourses(offlineCourses.map(c => {
      if (c.id === id) {
        return { ...c, downloaded: false, size: "0 KB", lessonsCount: 0 };
      }
      return c;
    }));
  };

  const handleSyncProgress = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("All offline study progress, quiz scores, and voice records synced successfully with Aivyra-Tutor servers!");
    }, 1500);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-600" /> Offline Synchronization
            </h2>
            <p className="text-sm text-slate-500">Download lessons and sync study progress for weak connectivity areas.</p>
          </div>
          <button 
            onClick={handleSyncProgress}
            disabled={syncing}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/10 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Progress"}</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Storage overview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 self-start">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-500" /> Local Storage Usage
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-xs text-slate-500 font-bold">
                <span>Used Space</span>
                <span className="text-slate-900">3.6 MB / 100 MB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[3.6%] rounded-full"></div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-[11px] font-semibold text-slate-600 leading-relaxed">
                When downloaded, lesson pages and voice assistants can be used without active mobile internet connection.
              </div>
            </div>
          </div>

          {/* Courses download cards */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Downloadable Education Modules</h3>

            <div className="grid gap-3">
              {offlineCourses.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center transition-all">
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm">{c.title}</h4>
                    <p className="text-[10px] text-slate-450 font-bold mt-0.5">
                      {c.downloaded ? `Downloaded • ${c.lessonsCount} lessons ready` : "Not downloaded"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {c.downloaded ? (
                      <>
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[8px] font-black uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Offline Ready
                        </span>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          title="Remove offline copy"
                          className="p-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-450 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleDownload(c.id)}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] transition-all flex items-center gap-1.5 active:scale-[0.98]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ({c.id === 3 ? "3.1 MB" : "1.5 MB"})</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
