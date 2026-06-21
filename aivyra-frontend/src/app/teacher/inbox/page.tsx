"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { Bell, MailOpen, Search, RefreshCw } from "lucide-react";

export default function TeacherInbox() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [messages, setMessages] = useState([
    { id: 1, sender: "System Administrator", subject: "New Student Registered", body: "A new student Priya Patel from Rampur village has been registered. They are assigned to Mathematics class.", date: "2026-06-19", read: false, tag: "System" },
    { id: 2, sender: "Vijay Kumar (Parent)", subject: "Question about Ramesh's homework", body: "Dear Teacher, My son Ramesh had difficulty understanding the fraction percentage lesson. Can you help clarify?", date: "2026-06-18", read: false, tag: "Parent" },
    { id: 3, sender: "System Alert", subject: "Quiz Completion Report Ready", body: "5 students have completed Algebraic Variables Quiz. Average class score: 72%. View detailed analytics.", date: "2026-06-17", read: true, tag: "Alert" }
  ]);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const toggleRead = (id: number) => setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Teacher Inbox</h2>
            <p className="text-sm text-slate-500">Messages from parents, students, and platform alerts.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 text-xs font-extrabold">
            <Bell className="w-4 h-4" /> {messages.filter(m => !m.read).length} Unread
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-150 max-w-md gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search messages..." className="bg-transparent text-xs text-slate-800 outline-none w-full" />
          </div>

          <div className="grid gap-3">
            {messages.map(msg => (
              <div key={msg.id} onClick={() => toggleRead(msg.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex gap-4 items-start ${msg.read ? "bg-slate-50/50 border-slate-100 opacity-75" : "bg-white border-blue-100 shadow-sm"}`}>
                <div className={`p-3 rounded-xl ${msg.read ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600"}`}>
                  {msg.read ? <MailOpen className="w-5 h-5" /> : <Bell className="w-5 h-5 animate-pulse" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-xs">{msg.sender}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold">{msg.date}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${msg.tag === "Parent" ? "bg-blue-50 text-blue-600 border border-blue-100" : msg.tag === "Alert" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{msg.tag}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-950 text-sm">{msg.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{msg.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
