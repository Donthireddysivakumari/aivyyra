"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { HelpCircle, Send, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export default function StudentSupport() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [category, setCategory] = useState("Course Content");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([
    {
      id: 1,
      category: "Voice Assistant",
      description: "My microphone does not start when clicking 'Listen Question' in the algebra quiz on my phone.",
      status: "Pending",
      reply: ""
    },
    {
      id: 2,
      category: "Course Content",
      description: "The english grammar lesson unit 2 has a broken link in the vocabulary list.",
      status: "Resolved",
      reply: "We have updated the vocabulary list link in lesson unit 2. Thank you for notifying us!"
    }
  ]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newTicket = {
        id: tickets.length + 1,
        category,
        description,
        status: "Pending",
        reply: ""
      };
      setTickets([newTicket, ...tickets]);
      setDescription("");
      setSubmitting(false);
      alert("Support request submitted successfully. The school administrator will review it.");
    }, 400);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-7 h-7 text-indigo-650" /> Help & Support
            </h2>
            <p className="text-sm text-slate-500">Contact administrators or teachers regarding queries.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Raise query card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 self-start">
            <h3 className="font-extrabold text-slate-900 text-sm">Raise Help Ticket</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-600">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-slate-800 outline-none"
                >
                  <option value="Course Content">Course Content</option>
                  <option value="Voice Assistant">Voice Assistant</option>
                  <option value="Offline Sync Issue">Offline Sync Issue</option>
                  <option value="Account Login">Account Login</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600">Explain the issue</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly what problem you are facing..." 
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Sending..." : "Submit Ticket"}</span>
              </button>
            </form>
          </div>

          {/* Tickets list */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Your Support History</h3>
            
            {tickets.length > 0 ? (
              <div className="grid gap-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">{ticket.category}</span>
                      <div className="flex items-center gap-1.5">
                        {ticket.status === "Resolved" ? (
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                            <AlertCircle className="w-3 h-3 animate-pulse" /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-650 leading-relaxed font-semibold">{ticket.description}</p>

                    {ticket.reply && (
                      <div className="border-t border-slate-100 pt-3 flex gap-2 items-start bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="text-xs font-semibold">
                          <div className="text-emerald-700 font-extrabold text-[10px] mb-0.5">Admin Response:</div>
                          <p className="text-slate-650 leading-relaxed">{ticket.reply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs italic bg-white rounded-3xl border border-slate-100">
                No support queries filed.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
