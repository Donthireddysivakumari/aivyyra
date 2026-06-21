"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { Mic, MicOff, Play, Trash2, Calendar, FileText } from "lucide-react";

export default function StudentVoiceDiary() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diaries, setDiaries] = useState([
    {
      id: 1,
      date: "2026-06-19",
      duration: "0:45",
      transcript: "Today I completed the Light and Reflection lesson. The concept of focal length in flat mirrors makes sense now, since flat surfaces have no curvature so focal length goes to infinity. Saraswati Devi verified my solution in class.",
      audioUrl: "#"
    },
    {
      id: 2,
      date: "2026-06-15",
      duration: "1:12",
      transcript: "I reviewed algebraic variables today. Adding and subtracting variables like 2x + 3x is just adding the coefficients, which results in 5x. It was helpful to practice fractions trade calculations as well.",
      audioUrl: "#"
    }
  ]);

  const [transcriptPreview, setTranscriptPreview] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscriptPreview("Listening to audio...");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setLoading(true);
    setTimeout(() => {
      const mockTranscripts = [
        "In English grammar, prepositions specify direction, location, or time. I need to practice the difference between 'in' and 'at' next week.",
        "Social studies covers rural history and local agriculture trade developments. The pre-colonial trade route passed near our Rampur village.",
        "Science lesson notes about forces: gravity pulls objects down towards the earth center with acceleration 9.8 meters per second squared."
      ];
      const randomText = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      
      const newEntry = {
        id: diaries.length + 1,
        date: new Date().toISOString().split("T")[0],
        duration: "0:30",
        transcript: randomText,
        audioUrl: "#"
      };
      
      setDiaries([newEntry, ...diaries]);
      setTranscriptPreview("");
      setLoading(false);
      alert("Voice study note successfully transcribed and saved!");
    }, 1500);
  };

  const handleDelete = (id: number) => {
    setDiaries(diaries.filter(d => d.id !== id));
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Mic className="w-7 h-7 text-indigo-650" /> Voice Study Diary
            </h2>
            <p className="text-sm text-slate-500">Record oral notes and automatically convert them to written transcripts.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Audio Recorder Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-center self-start">
            <h3 className="font-extrabold text-slate-900 text-sm text-left">Record Study Note</h3>

            <div className="py-8 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-2xl border border-slate-150">
              <div className="relative">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
                    isRecording 
                      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200 animate-pulse" 
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                  }`}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
              </div>

              <span className="text-xs font-bold text-slate-500">
                {isRecording ? "Recording... Click to Stop" : "Click to Start Recording"}
              </span>
            </div>

            {loading && (
              <p className="text-xs font-bold text-indigo-600 animate-pulse">Running speech-to-text AI model...</p>
            )}

            {transcriptPreview && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 font-bold italic text-left">
                {transcriptPreview}
              </div>
            )}
          </div>

          {/* Diaries List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Transcribed Diary Notes</h3>
            
            {diaries.length > 0 ? (
              <div className="grid gap-3">
                {diaries.map((diary) => (
                  <div key={diary.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-slate-450 font-bold">
                        <Calendar className="w-4 h-4" />
                        <span>{diary.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-extrabold rounded text-[9px]">{diary.duration}</span>
                        <button 
                          onClick={() => handleDelete(diary.id)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">{diary.transcript}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs italic bg-white rounded-3xl border border-slate-100">
                No voice logs recorded yet. Start recording above!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
