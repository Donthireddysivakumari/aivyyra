"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { Trophy, Medal, Star, ShieldAlert, Sparkles } from "lucide-react";

export default function StudentLeaderboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "Priya Patel", village: "Rampur", score: 92.5, completed: 5, active: true },
    { rank: 2, name: "Amit Sharma", village: "Rampur", score: 88.0, completed: 4, active: false },
    { rank: 3, name: "Ramesh Kumar", village: "Rampur", score: 85.0, completed: 4, isMe: true, active: true },
    { rank: 4, name: "Sunita Reddy", village: "Rampur", score: 79.5, completed: 3, active: true },
    { rank: 5, name: "Karan Singh", village: "Rampur", score: 74.0, completed: 2, active: false }
  ]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" /> Village Leaderboard
            </h2>
            <p className="text-sm text-slate-500">Compare scores and learning goals in Rampur.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Top 3 Rank Badge Eligible</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Rank highlight cards */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm">Active Standings</h3>

            <div className="space-y-3">
              {leaderboard.map((item) => (
                <div 
                  key={item.name}
                  className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                    item.isMe 
                      ? "bg-indigo-50/50 border-indigo-200 shadow-md" 
                      : "bg-slate-50/50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      item.rank === 1 
                        ? "bg-amber-100 text-amber-800" 
                        : item.rank === 2 
                        ? "bg-slate-200 text-slate-800" 
                        : item.rank === 3 
                        ? "bg-orange-100 text-orange-850" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {item.rank}
                    </span>

                    <div>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        {item.name} {item.isMe && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-black uppercase">You</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">{item.village} &bull; {item.completed} Courses Done</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-sm">{item.score}%</div>
                      <div className="text-[9px] text-slate-400 font-extrabold uppercase">Skill Score</div>
                    </div>
                    {item.rank <= 3 && <Medal className={`w-5 h-5 ${
                      item.rank === 1 ? "text-amber-500" : item.rank === 2 ? "text-slate-400" : "text-orange-500"
                    }`} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gamification summary panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm">Your Standing</h3>

            <div className="p-5 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl space-y-4 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Current Rank</span>
                <Medal className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">#3</span>
                <span className="text-xs text-indigo-200 font-bold">in Rampur Village</span>
              </div>

              <div className="pt-2 border-t border-indigo-800 flex justify-between text-xs text-indigo-100">
                <span>Next Rank Target:</span>
                <span className="font-black text-white">Amit (88.0%)</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-650">
              <h4 className="font-bold text-slate-800">How to level up?</h4>
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-primary font-black shrink-0 text-[10px]">1</div>
                <p>Attend quiz assessments and scoring above 85% to boost skill rates.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-primary font-black shrink-0 text-[10px]">2</div>
                <p>Complete lesson units to unlock bonus points and certificate scores.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
