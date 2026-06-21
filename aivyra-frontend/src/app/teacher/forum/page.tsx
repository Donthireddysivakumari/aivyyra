"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function TeacherForum() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);
  const [posts, setPosts] = useState([
    { id: 1, author: "Priya Patel", question: "How to simplify fractions inside equations?", content: "I am having trouble with 2x + 1/2 = 3/4. Do I multiply by 4 first?", reply: "Yes Priya! Multiply both sides by the LCM (4) to eliminate denominators instantly.", replied: true },
    { id: 2, author: "Amit Sharma", question: "Focal length of a flat mirror?", content: "For plane mirrors is focal length zero or infinity? Need help for tomorrow's quiz.", reply: "", replied: false }
  ]);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const handleReply = (id: number) => {
    const text = replyTexts[id];
    if (!text?.trim()) return;
    setPosts(posts.map(p => p.id === id ? { ...p, reply: text, replied: true } : p));
    setReplyTexts({ ...replyTexts, [id]: "" });
    alert("Reply posted to student forum!");
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><MessageSquare className="w-7 h-7 text-primary" /> Student Forum Moderation</h2>
          <p className="text-sm text-slate-500">Answer student doubts and moderate classroom discussion posts.</p>
        </div>
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{post.author}</span>
                  <h3 className="font-black text-slate-950 text-base mt-0.5">{post.question}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{post.content}</p>
                </div>
                {post.replied && <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0"><CheckCircle2 className="w-3 h-3" /> Answered</span>}
              </div>
              {post.reply && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs">
                  <div className="font-extrabold text-indigo-700 text-[10px] mb-1">Your Reply:</div>
                  <p className="text-slate-800 font-semibold">{post.reply}</p>
                </div>
              )}
              {!post.replied && (
                <div className="flex gap-3">
                  <input value={replyTexts[post.id] || ""} onChange={e => setReplyTexts({ ...replyTexts, [post.id]: e.target.value })} placeholder="Type your answer for the student..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none text-xs font-semibold" />
                  <button onClick={() => handleReply(post.id)} className="px-5 py-3 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-primary-dark"><Send className="w-4 h-4" /> Reply</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
