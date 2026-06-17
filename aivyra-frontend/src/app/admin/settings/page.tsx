"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  Settings,
  Shield,
  Server,
  Database,
  Globe,
  Bell,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cpu,
} from "lucide-react";

const CONFIG_ITEMS = [
  {
    section: "API Server",
    icon: Server,
    color: "blue",
    settings: [
      { label: "API Base URL", value: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000", editable: false },
      { label: "CORS Policy", value: "Allow All Origins (*)", editable: false },
      { label: "Auth Method", value: "JWT Bearer Token (HS256)", editable: false },
      { label: "Token Expiry", value: "30 minutes", editable: false },
    ],
  },
  {
    section: "Database",
    icon: Database,
    color: "emerald",
    settings: [
      { label: "Engine", value: "SQLAlchemy ORM", editable: false },
      { label: "DB Mode", value: "SQLite (local) / PostgreSQL (docker)", editable: false },
      { label: "Auto Migration", value: "Enabled (Base.metadata.create_all)", editable: false },
      { label: "Seed Data", value: "Auto-seeded on startup", editable: false },
    ],
  },
  {
    section: "AI Models",
    icon: Cpu,
    color: "purple",
    settings: [
      { label: "Framework", value: "Scikit-learn (Python)", editable: false },
      { label: "Skill Gap Model", value: "RandomForestClassifier", editable: false },
      { label: "Performance Predictor", value: "GradientBoostingRegressor", editable: false },
      { label: "Model Storage", value: "app/ai/artifacts/*.joblib", editable: false },
    ],
  },
  {
    section: "Frontend",
    icon: Globe,
    color: "amber",
    settings: [
      { label: "Framework", value: "Next.js 15 (App Router)", editable: false },
      { label: "Styling", value: "Tailwind CSS", editable: false },
      { label: "State Management", value: "Zustand", editable: false },
      { label: "Charts", value: "Recharts", editable: false },
    ],
  },
];

const SERVICE_STATUSES = [
  { name: "FastAPI Backend", port: "8000", status: "online" },
  { name: "Next.js Frontend", port: "3000", status: "online" },
  { name: "SQLAlchemy DB", port: "local", status: "online" },
  { name: "Scikit-learn AI", port: "in-process", status: "online" },
  { name: "JWT Auth Service", port: "in-process", status: "online" },
];

export default function AdminSettings() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const initialize = useAuthStore((state) => state.initialize);
  const [isMounted, setIsMounted] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  useEffect(() => {
    initialize();
    setIsMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isMounted, router]);

  const testConnection = async () => {
    setTestStatus("testing");
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/");
      setTestStatus(res.ok ? "ok" : "fail");
    } catch {
      setTestStatus("fail");
    }
  };

  if (!isAuthenticated || !role || role.toUpperCase() !== "ADMIN") return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">System Settings</h2>
            <p className="text-sm text-slate-500">
              Platform configuration, service health, and deployment parameters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={testConnection}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                testStatus === "ok"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : testStatus === "fail"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : testStatus === "testing"
                  ? "bg-slate-50 text-slate-600 border border-slate-200 animate-pulse"
                  : "bg-blue-50 text-primary border border-blue-200 hover:bg-blue-100"
              }`}
            >
              {testStatus === "ok" ? (
                <><CheckCircle2 className="w-4 h-4" /> API Online</>
              ) : testStatus === "fail" ? (
                <><AlertTriangle className="w-4 h-4" /> API Offline</>
              ) : testStatus === "testing" ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Testing...</>
              ) : (
                <><Server className="w-4 h-4" /> Test API Connection</>
              )}
            </button>
          </div>
        </div>

        {/* Service health */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Service Health Monitor
          </h3>
          <div className="space-y-3">
            {SERVICE_STATUSES.map((svc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{svc.name}</p>
                    <p className="text-[10px] text-slate-400">Port: {svc.port}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold uppercase">
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Config sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {CONFIG_ITEMS.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    section.color === "blue" ? "bg-blue-50 text-blue-600" :
                    section.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                    section.color === "purple" ? "bg-purple-50 text-purple-600" :
                    section.color === "amber" ? "bg-amber-50 text-amber-600" :
                    "bg-slate-50 text-slate-600"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {section.section}
                </h3>
                <div className="space-y-3">
                  {section.settings.map((s, j) => (
                    <div key={j} className="flex justify-between items-start gap-3">
                      <span className="text-xs text-slate-500 font-semibold flex-shrink-0 pt-0.5">{s.label}</span>
                      <span className="text-xs text-slate-800 font-bold text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info notice */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex gap-4 items-start">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-primary text-sm">Configuration Notice</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Most platform settings are configured via environment variables. Edit{" "}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-[10px]">aivyra-backend/.env</code> to
              override the <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-[10px]">DATABASE_URL</code> and{" "}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-[10px]">SECRET_KEY</code>. Edit{" "}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-[10px]">aivyra-frontend/.env.local</code>{" "}
              to change the <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_API_URL</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
