"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/api";
import { Compass, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check current auth state
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && role) {
      redirectUser(role);
    }
  }, [isAuthenticated, role]);

  const redirectUser = (userRole: string) => {
    switch (userRole.toUpperCase()) {
      case "STUDENT":
        router.push("/student/dashboard");
        break;
      case "TEACHER":
        router.push("/teacher/dashboard");
        break;
      case "PARENT":
        router.push("/parent/dashboard");
        break;
      case "ADMIN":
        router.push("/admin/dashboard");
        break;
      default:
        setError("Unknown user role profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credentials");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await authService.login({ email, password });
      login(data.access_token, data.role, data.name, data.user_id);
      
      // Fetch full profile info and set
      const profile = await authService.getCurrentUser();
      useAuthStore.getState().setProfile(profile);

      redirectUser(data.role);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Incorrect credentials. Try 'student@aivyra.com' / 'student123'"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-[100px] opacity-15"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-[100px] opacity-15"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 relative z-10 space-y-8 animate-slide-up">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-900">Sign In to Your Account</h2>
          <p className="text-sm text-slate-500">Access personalized AI-driven learning tools</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                placeholder="e.g. student@aivyra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none transition-all duration-200"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl text-slate-800 text-sm outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Register Here
          </Link>
        </div>

        {/* Demo Credentials Alert Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 space-y-1">
          <div className="font-bold uppercase tracking-wider text-[10px]">Demo credentials:</div>
          <p><strong>Student:</strong> student@aivyra.com / student123</p>
          <p><strong>Teacher:</strong> teacher@aivyra.com / teacher123</p>
          <p><strong>Parent:</strong> parent@aivyra.com / parent123</p>
          <p><strong>Admin:</strong> admin@aivyra.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
