"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import { MessageSquare, ThumbsUp, Send, RefreshCw, AlertCircle } from "lucide-react";

export default function StudentForum() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Priya Patel",
      title: "How to simplify fractions inside equations?",
      content: "I am having trouble with equations like 2x + 1/2 = 3/4. Do I multiply the whole equation by 4 first? Any tricks?",
      replies: [
        { author: "Saraswati Devi (Teacher)", text: "Yes Priya! Multiplying both sides by the Lowest Common Multiple (which is 4) is the best way. It gets rid of all denominators instantly!" }
      ],
      likes: 4,
      liked: false
    },
    {
      id: 2,
      author: "Amit Sharma",
      title: "What is the focal length of a flat mirror?",
      content: "For mirrors that are completely flat (plane mirrors), is the focal length zero or infinity? Need help clarifying for tomorrow's quiz.",
      replies: [],
      likes: 2,
      liked: false
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  const handleLike = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        };
      }
      return p;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newPost = {
        id: posts.length + 1,
        author: "Ramesh Kumar (You)",
        title: newTitle,
        content: newContent,
        replies: [],
        likes: 0,
        liked: false
      };
      setPosts([newPost, ...posts]);
      setNewTitle("");
      setNewContent("");
      setSubmitting(false);
      alert("Post submitted to the village discussion board!");
    }, 400);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="STUDENT" />

      <main className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-primary" /> Village Learning Forum
            </h2>
            <p className="text-sm text-slate-500">Ask questions and collaborate with class peers & teachers.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Create post form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 self-start">
            <h3 className="font-extrabold text-slate-900 text-sm">Ask a New Doubt</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-600">Question Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Help with algebra equation" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600">Explain your doubt</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Explain what problem you are solving..." 
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
                <span>{submitting ? "Posting..." : "Post Doubt"}</span>
              </button>
            </form>
          </div>

          {/* Posts feed */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Recent Questions</h3>
            
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-900">{post.author}</span>
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-extrabold transition-all active:scale-95 ${
                      post.liked 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.likes} Likes</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-slate-950 text-base">{post.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
                </div>

                {/* Answers / Replies section */}
                {post.replies.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responses</h5>
                    {post.replies.map((rep, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs">
                        <div className="font-extrabold text-indigo-700 text-[10px] mb-1">{rep.author}</div>
                        <p className="text-slate-750 font-semibold leading-relaxed">{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
