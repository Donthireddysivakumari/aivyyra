"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { Bell, MailOpen } from "lucide-react";

export default function ParentInbox() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Saraswati Devi (Teacher)", subject: "Ramesh's Quiz Results", body: "Your son Ramesh scored 75% on the Fractions quiz. He needs more practice on word problems.", date: "2026-06-19", read: false },
    { id: 2, sender: "System Admin", subject: "Monthly Progress Report Ready", body: "Ramesh Kumar's June 2026 learning report is now available. View the AI Recommendations page.", date: "2026-06-15", read: true }
  ]);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const toggleRead = (id: number) => setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="PARENT" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">Parent Inbox</h2>
          <p className="text-sm text-slate-500">Messages from teachers and school administrators.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          {messages.map(msg => (
            <div key={msg.id} onClick={() => toggleRead(msg.id)} className={`p-5 rounded-2xl border cursor-pointer transition-all flex gap-4 items-start ${msg.read ? "bg-slate-50 border-slate-100 opacity-70" : "bg-white border-blue-100 shadow-sm"}`}>
              <div className={`p-3 rounded-xl ${msg.read ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600"}`}>
                {msg.read ? <MailOpen className="w-5 h-5" /> : <Bell className="w-5 h-5 animate-pulse" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs"><span className="font-extrabold text-slate-900">{msg.sender}</span><span className="text-slate-400 font-bold">{msg.date}</span></div>
                <h4 className="font-bold text-slate-950 text-sm mt-0.5">{msg.subject}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{msg.body}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
