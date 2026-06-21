"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { MessageCircle, Send, User } from "lucide-react";

export default function TeacherParentChat() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [selected, setSelected] = useState(0);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([
    { parent: "Vijay Kumar", student: "Ramesh Kumar", messages: [
      { from: "parent", text: "Hello Teacher, how is Ramesh performing in class this week?", time: "10:05 AM" },
      { from: "teacher", text: "Hello Vijay ji! Ramesh scored 75% on fractions quiz. He needs to practice more word problems.", time: "10:08 AM" },
      { from: "parent", text: "Thank you! I will make sure he practices at home every evening.", time: "10:10 AM" }
    ]},
    { parent: "Sunita Reddy's Parent", student: "Sunita Reddy", messages: [
      { from: "parent", text: "Ma'am, Sunita wants extra help on algebra. Can you share some practice sheets?", time: "09:30 AM" }
    ]}
  ]);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const updated = [...chats];
    updated[selected].messages.push({ from: "teacher", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    setChats(updated);
    setInput("");
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><MessageCircle className="w-7 h-7 text-primary" /> Parent Chat</h2>
          <p className="text-sm text-slate-500">Direct messaging with parents about student performance and attendance.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 h-[520px]">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-y-auto">
            {chats.map((chat, i) => (
              <button key={i} onClick={() => setSelected(i)} className={`w-full p-4 text-left flex gap-3 items-center border-b border-slate-100 transition-all ${selected === i ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-slate-50"}`}>
                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-bold text-sm text-slate-600"><User className="w-5 h-5" /></div>
                <div><p className="text-xs font-extrabold text-slate-900">{chat.parent}</p><p className="text-[10px] text-slate-400 font-semibold">{chat.student}</p></div>
              </button>
            ))}
          </div>
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <p className="font-extrabold text-sm text-slate-900">{chats[selected].parent}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Parent of {chats[selected].student}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {chats[selected].messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "teacher" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs font-semibold ${msg.from === "teacher" ? "bg-primary text-white" : "bg-slate-100 text-slate-800"}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.from === "teacher" ? "text-white/60" : "text-slate-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none text-xs font-semibold" />
              <button onClick={sendMessage} className="px-5 py-3 bg-primary text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary-dark"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
