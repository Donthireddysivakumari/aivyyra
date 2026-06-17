"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";
import { Compass, User, Mail, Lock, Sparkles, BookOpen, MapPin, Search, ChevronRight, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");

  // Student specific
  const [classLevel, setClassLevel] = useState("Class 8");
  const [language, setLanguage] = useState("English");
  const [village, setVillage] = useState("");

  // Teacher specific
  const [specialization, setSpecialization] = useState("");

  // Parent specific
  const [studentEmail, setStudentEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      name,
      email,
      password,
      role,
    };

    if (role === "STUDENT") {
      payload.class_level = classLevel;
      payload.language = language;
      payload.village = village;
    } else if (role === "TEACHER") {
      payload.specialization = specialization;
    } else if (role === "PARENT") {
      payload.student_email = studentEmail;
    }

    try {
      await authService.register(payload);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to register. Please check details or ensure student email exists if registering as parent."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-[100px] opacity-15"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-[100px] opacity-15"></div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative z-10 space-y-8 animate-slide-up">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-900">Create a New Account</h2>
          <p className="text-sm text-slate-500">Join the Aivyra rural education learning community</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-6 rounded-2xl text-center space-y-3">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="font-bold text-lg">Registration Successful!</h3>
            <p className="text-sm text-slate-500">Redirecting to Sign In portal...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Role Type</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-850 text-sm outline-none transition-all h-[46px]"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="PARENT">PARENT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    placeholder="e.g. student@aivyra.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* STUDENT ROLE FIELDS */}
              {role === "STUDENT" && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Student Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Class Level</label>
                      <select
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none"
                      >
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Learning Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Tamil">Tamil</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Village Name</label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Rampur"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TEACHER ROLE FIELDS */}
              {role === "TEACHER" && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" /> Teacher Details
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Specialization Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics, Physical Science"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-850 text-sm outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* PARENT ROLE FIELDS */}
              {role === "PARENT" && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-amber-500" /> Track Child Details
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Student&apos;s Email Address</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
                      <input
                        type="email"
                        placeholder="e.g. student@aivyra.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-850 text-sm outline-none"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Please enter the exact email used by your child to register first.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Now</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
