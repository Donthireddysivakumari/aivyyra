"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Compass, 
  Sparkles, 
  Users, 
  Award, 
  BookOpen, 
  HelpCircle, 
  ArrowRight,
  Mic,
  Activity,
  Globe,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-primary selection:text-white">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Aivyra-Tutor
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#benefits" className="hover:text-primary transition-colors">Benefits</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Stories</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
            <Link href="/login" className="px-5 py-2 hover:text-primary transition-colors">Sign In</Link>
            <Link href="/register" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-200">
              Start Learning
            </Link>
          </nav>

          {/* Mobile Nav Button */}
          <button 
            className="md:hidden text-slate-700" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 flex flex-col gap-4 text-center text-slate-700 font-semibold shadow-lg">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2">Features</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="py-2">Benefits</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="py-2">Stories</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2">FAQ</a>
            <hr className="border-slate-100 my-2" />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 text-primary">Sign In</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="py-3 bg-primary text-white rounded-xl shadow-md">
              Start Learning
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/45">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              Bridging Rural Education Gaps
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              AI-Powered Personalized Learning for <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Rural Students</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Aivyra-Tutor analyzes student performance, identifies skill gaps, offers localized translation, and empowers teachers and parents with insights to boost learning outcomes in villages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/register" className="px-8 py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all duration-200">
                Register as Student <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 shadow-sm hover:scale-[1.02] transition-all duration-200">
                Dashboard Portal
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-4 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Multi-lingual Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Voice Assisted Learning</span>
              </div>
            </div>
          </div>

          {/* Visual Presentation */}
          <div className="relative flex justify-center animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-emerald-300 rounded-full blur-[100px] opacity-20 -z-10"></div>
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl w-full max-w-lg border border-slate-800">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Aivyra-Tutor-Core_v1.0</span>
              </div>

              {/* Dynamic Interface Demonstration */}
              <div className="py-6 space-y-6">
                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Audio Lesson Player</h4>
                    <p className="text-xs text-slate-400">Press microphone to listen in Hindi or Telugu</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Algebraic Concepts Mastery</span>
                    <span className="text-emerald-400 font-semibold">85% Complete</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
                  <div className="text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Skill Gap Alert
                  </div>
                  <p className="italic">"We noticed a minor slowdown in Fraction division. Practice module 'Fractions Quiz 2' is recommended to secure 95%."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-primary">Advanced Features</h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Tailored Specifically for Rural Classrooms
            </h2>
            <p className="text-slate-600">
              Designed to combat low bandwidth, language boundaries, and support parent tracking with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Skill-Gap Engine</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Aggregates quiz results and assessment benchmarks using Scikit-Learn predictions to pin-point specific educational roadblocks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Voice-Assisted Support</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Enables students to speak requests and read aloud educational lessons, lowering technical barriers for younger kids.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Regional Languages</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Access full textbooks, vocabulary logs, and interactive AI tips translated cleanly into local languages (Hindi, Telugu, Tamil).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-secondary">Why Aivyra?</h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Impact for Students, Parents & Teachers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3">
              <Users className="w-8 h-8 text-primary mx-auto" />
              <h4 className="font-bold text-slate-900">Students</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Receive personalized learning suggestions and build micro-skills step-by-step.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3">
              <Users className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900">Parents</h4>
              <p className="text-xs text-slate-500 leading-relaxed">View attendance and simple color-coded improvement graphs translated into speech.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3">
              <Users className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="font-bold text-slate-900">Teachers</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Monitor large classes, generate report sheets, and auto-grade daily assignments.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3">
              <Award className="w-8 h-8 text-indigo-500 mx-auto" />
              <h4 className="font-bold text-slate-900">Villages</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Identify community literacy strengths and configure local study groups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-primary">Testimonials</h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Real Success Stories</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 relative">
              <p className="italic text-slate-600 text-sm leading-relaxed mb-6">
                "As a teacher in Rampur government school, tracking progress of 45 kids was tough. Aivyra-Tutor groups students into learning circles based on concept mastery. The recommendations saved me hours of lesson-planning."
              </p>
              <div className="font-bold text-slate-900 text-sm">Saraswati Devi</div>
              <div className="text-xs text-slate-500">Mathematics Teacher, Rampur Govt School</div>
            </div>

            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 relative">
              <p className="italic text-slate-600 text-sm leading-relaxed mb-6">
                "I don't know English well, but with Aivyra parent panel I get audio alerts in Hindi summarizing my daughter's quiz improvements. It helps me stay closely connected with her study."
              </p>
              <div className="font-bold text-slate-900 text-sm">Vijay Kumar</div>
              <div className="text-xs text-slate-500">Parent, Farmer</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <HelpCircle className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">How does voice-assisted learning help students?</h4>
              <p className="text-slate-600 text-sm">
                Students can click the microphone button to dictate questions or have complex lessons read out loud. This helps kids who are struggle with reading small screen texts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Does the platform require fast internet connection?</h4>
              <p className="text-slate-600 text-sm">
                No. The dashboard loads extremely lightweight static JSON models, and the AI models run on local inference requests. This optimizes loading speeds on low-bandwidth rural connections.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-905 mb-2">How can a parent monitor progress if they are illiterate?</h4>
              <p className="text-slate-600 text-sm">
                The Parent Panel has direct speech synthesis buttons. Clicking the button reads the student's progress and teacher feedback in their chosen regional language.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white">Aivyra-Tutor</span>
          </div>
          <div>
            &copy; 2026 Aivyra-Tutor. Empowering Rural India with AI Education.
          </div>
        </div>
      </footer>
    </div>
  );
}
