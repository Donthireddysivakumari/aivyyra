"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentPlanner() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [tasks, setTasks] = useState([
    { id: 1, day: "Monday", time: "09:00 AM", subject: "Mathematics", topic: "Algebra Variables Practice", done: false },
    { id: 2, day: "Wednesday", time: "10:00 AM", subject: "Science", topic: "Light & Reflection Revision", done: false },
    { id: 3, day: "Friday", time: "03:00 PM", subject: "English Grammar", topic: "Vocabulary Builder Quiz", done: true }
  ]);
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("09:00 AM");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setTasks([...tasks, { id: tasks.length + 1, day, time, subject, topic, done: false }]);
    setTopic("");
    alert("Study task added to planner!");
  };

  const toggleDone = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: number) => setTasks(tasks.filter(t => t.id !== id));

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Calendar className="w-7 h-7 text-primary" /> Weekly Study Planner</h2>
            <p className="text-sm text-slate-500">Organize and schedule your daily study tasks.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 self-start">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add Study Task</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5"><label className="text-slate-600">Day</label>
                <select value={day} onChange={e => setDay(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none">
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-slate-600">Time</label>
                <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 10:00 AM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none" />
              </div>
              <div className="space-y-1.5"><label className="text-slate-600">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none">
                  <option>Mathematics</option><option>Science</option><option>English Grammar</option><option>Social Studies</option>
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-slate-600">Topic</label>
                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Revision: Fractions" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none" required />
              </div>
              <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Task</button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-6">
            {DAYS.map(d => {
              const dayTasks = tasks.filter(t => t.day === d);
              if (!dayTasks.length) return null;
              return (
                <div key={d} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">{d}</h4>
                  {dayTasks.map(task => (
                    <div key={task.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${task.done ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200"}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={task.done} onChange={() => toggleDone(task.id)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
                        <div>
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />{task.time}
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-black uppercase">{task.subject}</span>
                          </div>
                          <p className={`text-xs font-semibold mt-0.5 ${task.done ? "line-through text-slate-400" : "text-slate-750"}`}>{task.topic}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-500 text-slate-350 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              );
            })}
            {tasks.length === 0 && <div className="py-12 text-center text-slate-400 text-xs italic bg-white rounded-3xl border border-slate-100">No tasks planned yet. Add your first study task!</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
