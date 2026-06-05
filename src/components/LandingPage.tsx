import React from "react";
import { Footer } from "./Footer";
import {
  Sparkles,
  Upload,
  Layers,
  Briefcase,
  Gauge,
  Bot,
  FileText,
  Globe,
  HelpCircle,
  Download,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (
    tab: "editor" | "tailor" | "history" | "parse" | "optimization",
    options?: {
      isCV?: boolean;
      showCoverLetter?: boolean;
      showPortfolio?: boolean;
      optimizationTab?: "jd" | "role" | "hybrid";
    }
  ) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#070709] text-zinc-300 overflow-y-auto scrollbar-thin select-none">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-850/80 px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-violet-950/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-white text-sm sm:text-base tracking-wide flex items-center gap-1.5">
              AI RESUME & CV BUILDER
            </h1>
            <p className="text-[9px] text-violet-400 font-mono tracking-widest uppercase font-bold">Powered by AI</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("editor")}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md"
        >
          Launch Editor
          <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
        </button>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Colorful blur backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 fill-violet-400/20" />
            Next-Generation Resume Tailoring
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-6xl font-extrabold font-display text-white tracking-tight leading-tight max-w-3xl">
            Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 drop-shadow-sm">ATS-Optimized</span> Resumes with AI
          </h2>

          {/* Subheading */}
          <p className="text-sm sm:text-lg text-zinc-400 mt-6 max-w-2xl font-normal leading-relaxed">
            Create, analyze, optimize, and tailor resumes for any job in seconds. Stand out to recruiters and bypass automated filters with direct Gemini AI tailoring.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center">
            <button
              onClick={() => onNavigate("editor")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white font-bold rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-violet-950/20 hover:scale-[1.02] flex items-center justify-center gap-2 glow-pulse"
            >
              Build Resume
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate("optimization")}
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-200 font-semibold rounded-2xl text-sm transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md"
            >
              Try Resume Optimizer
              <Gauge className="w-4 h-4 text-violet-400" />
            </button>
          </div>
        </div>

        {/* Floating Animated UI Card */}
        <div className="mt-16 w-full max-w-4xl mx-auto p-1 bg-gradient-to-tr from-violet-500/20 to-indigo-500/5 rounded-2xl border border-zinc-800/60 shadow-2xl relative group">
          <div className="bg-[#0b0b0e] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                ATS Check Complete
              </div>
              <h3 className="text-xl font-bold text-white font-display">Optimization Audit Report</h3>
              <p className="text-xs text-zinc-500 max-w-md">
                We've evaluated your experience bullet points against target tech keywords. The layout has been formatted with recruiting standards.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold">Matched: Kubernetes</span>
                <span className="text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold">Matched: React</span>
                <span className="text-[10px] px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded font-semibold">Tailored: AWS Cloud</span>
              </div>
            </div>

            {/* Circular score gauge */}
            <div className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-violet-500"
                    strokeWidth="3.2"
                    strokeDasharray="94, 100"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-extrabold text-white leading-none">94%</span>
                  <span className="text-[8px] text-zinc-500 font-semibold mt-0.5">ATS</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-white text-sm font-display">Hiring Potential</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Excellent Alignment
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-20 px-6 bg-zinc-950/40 border-t border-zinc-900 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-xs uppercase font-extrabold text-violet-400 tracking-widest font-mono">Features</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-display">Everything you need to land your next role</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-4 leading-relaxed">
              Equipped with vector compilers, direct LLM optimizations, and ATS metric audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">1. AI Resume Builder</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Interactive real-time form editing with embedded AI assists for writing impact-driven bullet points.
                </p>
              </div>
              <button onClick={() => onNavigate("editor")} className="mt-6 text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 w-fit group/btn">
                Launch Builder
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">2. Resume Parser</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Upload an existing PDF or plain text resume; our parser parses and restructures it into custom data structures.
                </p>
              </div>
              <button onClick={() => onNavigate("parse")} className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit group/btn">
                Parse Resume
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-fuchsia-600/10 text-fuchsia-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">3. ATS Score Analyzer</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Audit formatting, grammar, and key technical phrases to see a dashboard of score metrics instantly.
                </p>
              </div>
              <button onClick={() => onNavigate("optimization", { optimizationTab: "jd" })} className="mt-6 text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1 w-fit group/btn">
                Analyze ATS
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">4. Job Description Optimizer</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Paste job descriptions to compare keywords and experience lines, getting list reviews of missing skills.
                </p>
              </div>
              <button onClick={() => onNavigate("optimization", { optimizationTab: "jd" })} className="mt-6 text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 w-fit group/btn">
                Optimize for JD
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Gauge className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">5. Career Role Optimizer</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Select key career tracks to construct customized roadmap steps, projects, and interview preparation lists.
                </p>
              </div>
              <button onClick={() => onNavigate("optimization", { optimizationTab: "role" })} className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit group/btn">
                Optimize Role
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 6 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-fuchsia-600/10 text-fuchsia-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">6. Hybrid AI Optimizer</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Combine career profiles with JD data to analyze hiring potentials, learning tasks, and packages.
                </p>
              </div>
              <button onClick={() => onNavigate("optimization", { optimizationTab: "hybrid" })} className="mt-6 text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1 w-fit group/btn">
                Launch Hybrid
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 7 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">7. Cover Letter Generator</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Generate hyper-personalized cover letters and recruiter email drafts based on your tailored details.
                </p>
              </div>
              <button onClick={() => onNavigate("editor", { showCoverLetter: true })} className="mt-6 text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 w-fit group/btn">
                Draft Letter
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 8 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">8. Resume to CV Converter</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Toggle fields for patents, publications, teaching, research, and conferences for academic portfolios.
                </p>
              </div>
              <button onClick={() => onNavigate("editor", { isCV: true })} className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit group/btn">
                Convert to CV
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 9 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-fuchsia-600/10 text-fuchsia-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">9. Interview Preparation</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Generate customizable interview checksheets and prep questions tailored to target tech stacks.
                </p>
              </div>
              <button onClick={() => onNavigate("optimization", { optimizationTab: "role" })} className="mt-6 text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1 w-fit group/btn">
                Start Prep
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature 10 */}
            <div className="bg-zinc-950/40 border border-zinc-850/80 hover:border-violet-500/30 hover:bg-zinc-900/30 p-6 rounded-2xl transition-all duration-300 shadow-md group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-5 font-display">10. PDF & DOCX Export</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  Generate vector-perfect PDFs directly from the browser print dialog and structured DOCX files.
                </p>
              </div>
              <button onClick={() => onNavigate("editor")} className="mt-6 text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 w-fit group/btn">
                Export Options
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-xs uppercase font-extrabold text-violet-400 tracking-widest font-mono">Workflow</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-display">Four steps to absolute optimization</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-zinc-900/30 border border-zinc-850/50 p-6 rounded-2xl flex flex-col gap-2 relative">
              <div className="text-3xl font-extrabold text-violet-500/20 font-mono absolute top-3 right-4">01</div>
              <h4 className="text-sm font-bold text-zinc-400 font-mono">Step 1</h4>
              <h3 className="text-md font-extrabold text-white mt-2 font-display">Upload Resume</h3>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                Upload your existing PDF/TXT resume or enter details using the editor.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/30 border border-zinc-850/50 p-6 rounded-2xl flex flex-col gap-2 relative">
              <div className="text-3xl font-extrabold text-violet-500/20 font-mono absolute top-3 right-4">02</div>
              <h4 className="text-sm font-bold text-zinc-400 font-mono">Step 2</h4>
              <h3 className="text-md font-extrabold text-white mt-2 font-display">Select Target</h3>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                Pick a target career role or paste the exact job description guidelines.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-900/30 border border-zinc-850/50 p-6 rounded-2xl flex flex-col gap-2 relative">
              <div className="text-3xl font-extrabold text-violet-500/20 font-mono absolute top-3 right-4">03</div>
              <h4 className="text-sm font-bold text-zinc-400 font-mono">Step 3</h4>
              <h3 className="text-md font-extrabold text-white mt-2 font-display">AI Analysis</h3>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                The AI conducts keyword comparison, audits scores, and suggests improvements.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-zinc-900/30 border border-zinc-850/50 p-6 rounded-2xl flex flex-col gap-2 relative">
              <div className="text-3xl font-extrabold text-violet-500/20 font-mono absolute top-3 right-4">04</div>
              <h4 className="text-sm font-bold text-zinc-400 font-mono">Step 4</h4>
              <h3 className="text-md font-extrabold text-white mt-2 font-display">Download Resume</h3>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                Download a clean, structured, light-themed tailored resume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section className="py-20 px-6 bg-zinc-950/40 border-t border-zinc-900 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-xs uppercase font-extrabold text-violet-400 tracking-widest font-mono">Benefits</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-display">Engineered for Success</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Benefit 1 */}
            <div className="bg-[#0b0b0e] border border-zinc-850 p-5 rounded-2xl flex flex-col gap-3 shadow-md items-center text-center justify-between">
              <div className="p-2.5 bg-violet-600/10 text-violet-400 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">ATS Friendly</h4>
                <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                  Standard structural rules prevent indexing parser errors.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#0b0b0e] border border-zinc-850 p-5 rounded-2xl flex flex-col gap-3 shadow-md items-center text-center justify-between">
              <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">Pro Templates</h4>
                <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                  A4 structures optimized for readability.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#0b0b0e] border border-zinc-850 p-5 rounded-2xl flex flex-col gap-3 shadow-md items-center text-center justify-between">
              <div className="p-2.5 bg-fuchsia-600/10 text-fuchsia-400 rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">AI Optimization</h4>
                <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                  Factual, high-impact edits via Gemini.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-[#0b0b0e] border border-zinc-850 p-5 rounded-2xl flex flex-col gap-3 shadow-md items-center text-center justify-between">
              <div className="p-2.5 bg-violet-600/10 text-violet-400 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">Career Guidance</h4>
                <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                  Custom roadmaps and Q&As to upskill.
                </p>
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="bg-[#0b0b0e] border border-zinc-850 p-5 rounded-2xl flex flex-col gap-3 shadow-md items-center text-center justify-between">
              <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-lg">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">Fast Export</h4>
                <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                  Clean vector PDF printouts and DOCX files.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LANDING FOOTER */}
      <Footer />
    </div>
  );
};
