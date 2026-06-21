"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { Award, Star, Zap, Shield, Flame, BookOpen, Trophy, Heart } from "lucide-react";

const ALL_BADGES = [
  { id: 1, name: "First Quiz", desc: "Completed your very first quiz", icon: Star, earned: true, color: "amber" },
  { id: 2, name: "Course Finisher", desc: "Completed a full course and earned a certificate", icon: Award, earned: true, color: "indigo" },
  { id: 3, name: "Speed Learner", desc: "Finished 2 lessons in a single day", icon: Zap, earned: true, color: "emerald" },
  { id: 4, name: "Offline Hero", desc: "Completed a lesson in offline mode", icon: Shield, earned: false, color: "blue" },
  { id: 5, name: "Score Flame", desc: "Scored above 90% in any quiz", icon: Flame, earned: false, color: "rose" },
  { id: 6, name: "Bookworm", desc: "Read all lessons in the Mathematics course", icon: BookOpen, earned: false, color: "purple" },
  { id: 7, name: "Top of Village", desc: "Ranked #1 in village leaderboard", icon: Trophy, earned: false, color: "amber" },
  { id: 8, name: "Community Helper", desc: "Answered 3 questions in the class forum", icon: Heart, earned: false, color: "pink" },
];

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  rose: "bg-rose-50 border-rose-200 text-rose-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  pink: "bg-pink-50 border-pink-200 text-pink-700"
};

export default function StudentBadges() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const earned = ALL_BADGES.filter(b => b.earned);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Trophy className="w-7 h-7 text-amber-500" /> Achievement Badges</h2>
            <p className="text-sm text-slate-500">Collect badges by completing learning milestones and goals.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900">{earned.length}/{ALL_BADGES.length}</p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Badges Earned</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            <Star className="w-4 h-4 text-amber-500" /> Earned Badges
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_BADGES.filter(b => b.earned).map(badge => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} className={`p-5 rounded-2xl border text-center space-y-3 shadow-sm ${COLOR_MAP[badge.color]}`}>
                  <div className="flex items-center justify-center">
                    <Icon className="w-9 h-9" />
                  </div>
                  <div>
                    <p className="font-black text-sm">{badge.name}</p>
                    <p className="text-[10px] font-semibold mt-0.5 opacity-75">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-6">
            <Shield className="w-4 h-4 text-slate-400" /> Locked Badges
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_BADGES.filter(b => !b.earned).map(badge => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-3 opacity-50">
                  <div className="flex items-center justify-center grayscale">
                    <Icon className="w-9 h-9 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-500">{badge.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
