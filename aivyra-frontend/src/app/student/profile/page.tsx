"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { userService } from "@/services/api";
import { User, Mail, MapPin, BookOpen, Globe, Award, Calendar, RefreshCw } from "lucide-react";

export default function StudentProfile() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userName = useAuthStore((state) => state.userName);
  const initialize = useAuthStore((state) => state.initialize);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getCurrentUser();
      setProfile(data);
      useAuthStore.getState().setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initial = userName ? userName[0].toUpperCase() : "S";

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">My Profile</h2>
            <p className="text-sm text-slate-500">Your account information and learning identity.</p>
          </div>
          <button
            onClick={loadProfile}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-slate-400 text-sm italic">Loading profile...</p>
          </div>
        ) : profile ? (
          <>
            {/* Avatar Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur border-2 border-white/20 rounded-2xl flex items-center justify-center font-black text-3xl">
                {initial}
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-2xl">{profile.name}</h3>
                <p className="text-blue-200 text-sm">{profile.email}</p>
                <span className="inline-block px-3 py-1 bg-primary/30 text-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Account Details
                </h3>
                {[
                  { icon: User, label: "Full Name", value: profile.name },
                  { icon: Mail, label: "Email Address", value: profile.email },
                  {
                    icon: Calendar,
                    label: "Member Since",
                    value: profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Student Profile
                </h3>
                {profile.profile ? (
                  <>
                    {[
                      { icon: BookOpen, label: "Class Level", value: profile.profile.class_level },
                      { icon: Globe, label: "Learning Language", value: profile.profile.language },
                      { icon: MapPin, label: "Village", value: profile.profile.village },
                      {
                        icon: Award,
                        label: "Overall Skill Score",
                        value: `${Math.round(profile.profile.skill_score || 0)}%`,
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-slate-400 text-xs italic">No student profile data found.</p>
                )}
              </div>
            </div>

            {/* Skill Score Visual */}
            {profile.profile && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900">Skill Score Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Overall Mastery Level</span>
                    <span className="font-extrabold text-primary">
                      {Math.round(profile.profile.skill_score || 0)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(profile.profile.skill_score || 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Calculated from quiz attempts and skill assessment scores.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-slate-400 text-sm">Could not load profile. Please refresh.</p>
          </div>
        )}
      </main>
    </div>
  );
}
