import React, { useState } from "react";
import { ResumeData } from "../types/resume";
import { AIService } from "../services/ai";
import { ResumeTemplates } from "./ResumeTemplates";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  BookOpen,
  HelpCircle,
  Check,
  Download,
  Copy,
  ChevronRight,
  Clipboard,
  Briefcase,
  Upload,
  Globe,
  FileDown,
  Layers,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import * as pdfjsLib from "pdfjs-dist";

interface OptimizationCenterProps {
  currentResume: ResumeData;
  onApplyOptimized: (optimized: ResumeData) => void;
  selectedModel: "gemini" | "openai" | "mock";
  apiKey: string;
  primaryColor: string;
  isCV: boolean;
  templateId: string;
  initialActiveTab?: "jd" | "role" | "hybrid";
}

type TabType = "jd" | "role" | "hybrid";

const TARGET_ROLES = [
  "Software Engineer",
  "AI Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Analyst",
  "Business Analyst",
  "Product Manager",
  "UI/UX Designer",
  "Cybersecurity Analyst",
];

// Circular SVG Progress Component
const CircularProgress: React.FC<{ percentage: number; label: string; colorClass?: string }> = ({
  percentage,
  label,
  colorClass = "text-violet-500",
}) => {
  const radius = 32;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl shrink-0">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          <circle
            className="text-zinc-850"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={colorClass}
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span className="absolute text-[11px] font-mono font-extrabold text-zinc-100">
          {percentage}%
        </span>
      </div>
      <span className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider mt-2 text-center w-20 truncate">
        {label}
      </span>
    </div>
  );
};

export const OptimizationCenter: React.FC<OptimizationCenterProps> = ({
  currentResume,
  onApplyOptimized,
  selectedModel,
  apiKey,
  primaryColor,
  isCV,
  templateId,
  initialActiveTab,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialActiveTab || "jd");
  const [isLoading, setIsLoading] = useState(false);

  // Resume Data used for optimization (either editor state or uploaded)
  const [workingResume, setWorkingResume] = useState<ResumeData>(currentResume);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Input states
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState("Software Engineer");

  // Output states
  const [jdResult, setJdResult] = useState<any>(null);
  const [roleResult, setRoleResult] = useState<any>(null);
  const [hybridResult, setHybridResult] = useState<any>(null);
  
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonTarget, setComparisonTarget] = useState<ResumeData | null>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  // PDF Parser for optimization center uploader
  const handleOptimizationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setUploadedFileName(file.name);
    try {
      let extractedText = "";
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          extractedText += pageText + "\n";
        }
      } else {
        extractedText = await file.text();
      }

      const parsedData = await AIService.parseResume(extractedText, {
        apiKey,
        provider: selectedModel,
      });

      if (parsedData.personalInfo) {
        setWorkingResume(parsedData as ResumeData);
        alert("Upload parsed successfully into optimization work-state!");
      }
    } catch (err: any) {
      console.error(err);
      alert("Parsing failed. Check API key configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run Optimization Callbacks
  const runJdOptimizer = async () => {
    if (!jobDescription.trim()) return;
    setIsLoading(true);
    try {
      const res = await AIService.optimizeForJD(workingResume, jobDescription, { apiKey, provider: selectedModel });
      setJdResult(res);
      if (res.atsScore >= 80) triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runRoleOptimizer = async () => {
    setIsLoading(true);
    try {
      const res = await AIService.optimizeForRole(workingResume, selectedRole, { apiKey, provider: selectedModel });
      setRoleResult(res);
      if (res.readinessScore >= 70) triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runHybridOptimizer = async () => {
    if (!jobDescription.trim()) return;
    setIsLoading(true);
    try {
      const res = await AIService.optimizeHybrid(workingResume, selectedRole, jobDescription, { apiKey, provider: selectedModel });
      setHybridResult(res);
      if (res.hiringPotentialScore >= 75) triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 }
    });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const downloadTextFile = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadPackageFile = (result: any) => {
    let pkg = `==================================================\n`;
    pkg += `HYBRID OPTIMIZER DOWNLOAD PACKAGE\n`;
    pkg += `==================================================\n\n`;
    pkg += `EXECUTIVE SUMMARY\n-----------------\n${result.executiveSummary}\n\n`;
    pkg += `COVER LETTER\n------------\n${result.coverLetter}\n\n`;
    pkg += `RECRUITER EMAIL DRAFT\n---------------------\n${result.recruiterEmail}\n\n`;
    pkg += `LINKEDIN ABOUT SECTION\n----------------------\n${result.linkedinAbout}\n`;

    downloadTextFile(pkg, "optimization_package.txt");
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 bg-zinc-950 border-b border-zinc-800/80">
        <Zap className="w-5 h-5 text-violet-400" />
        <span className="font-display font-semibold text-sm tracking-wide text-zinc-200">
          AI RESUME OPTIMIZATION CENTER
        </span>
      </div>

      {/* Tabs selector */}
      <div className="grid grid-cols-3 bg-zinc-900/60 border-b border-zinc-800/80 text-center">
        <button
          onClick={() => setActiveTab("jd")}
          className={`py-3 text-xs font-semibold tracking-wider border-b-2 flex items-center justify-center gap-1 transition-all ${
            activeTab === "jd"
              ? "border-violet-500 text-violet-400 bg-zinc-900/30"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Target className="w-3.5 h-3.5" /> JD Match
        </button>
        <button
          onClick={() => setActiveTab("role")}
          className={`py-3 text-xs font-semibold tracking-wider border-b-2 flex items-center justify-center gap-1 transition-all ${
            activeTab === "role"
              ? "border-violet-500 text-violet-400 bg-zinc-900/30"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> Career Role
        </button>
        <button
          onClick={() => setActiveTab("hybrid")}
          className={`py-3 text-xs font-semibold tracking-wider border-b-2 flex items-center justify-center gap-1 transition-all ${
            activeTab === "hybrid"
              ? "border-violet-500 text-violet-400 bg-zinc-900/30"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Hybrid AI
        </button>
      </div>

      {/* Primary Scrollable View */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
        {/* Core Inputs Section (Shared across tab layout) */}
        <div className="bg-zinc-900/25 border border-zinc-850 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Configure Optimization Inputs</span>
            {uploadedFileName && (
              <span className="text-[10px] text-zinc-500 font-mono">Loaded: {uploadedFileName}</span>
            )}
          </div>

          <div className="flex gap-2">
            {/* Direct Parser Uploader */}
            <div className="relative flex-1">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleOptimizationUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 rounded-lg text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5">
                <Upload className="w-4 h-4 text-zinc-500" />
                Upload Target Resume
              </button>
            </div>
            
            <button
              onClick={() => {
                setWorkingResume(currentResume);
                setUploadedFileName("Editor State");
              }}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-semibold text-zinc-300"
            >
              Use Current Resume
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* TAB 1: JOB DESCRIPTION OPTIMIZER                */}
        {/* ================================================= */}
        {activeTab === "jd" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium">Paste target Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 h-24 resize-none font-sans"
                placeholder="Paste key responsibilities, requirements, and skillset demands..."
              />
            </div>

            <button
              onClick={runJdOptimizer}
              disabled={isLoading || !jobDescription.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg text-xs font-bold shadow-lg shadow-violet-950/20 disabled:opacity-40"
            >
              {isLoading ? "Running JD Analytics..." : "Analyze & Optimize Resume"}
            </button>

            {jdResult && (
              <div className="space-y-4 pt-3 border-t border-zinc-850">
                {/* SVG Progress charts */}
                <div className="grid grid-cols-4 gap-2">
                  <CircularProgress percentage={jdResult.atsScore} label="ATS Score" colorClass="text-violet-500" />
                  <CircularProgress percentage={jdResult.skillScore} label="Skills Match" colorClass="text-emerald-500" />
                  <CircularProgress percentage={jdResult.experienceScore} label="Experience" colorClass="text-sky-500" />
                  <CircularProgress percentage={jdResult.keywordScore} label="Keywords" colorClass="text-amber-500" />
                </div>

                {/* Score breakdown tabs */}
                <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3 text-xs">
                  {/* Skills lists */}
                  <div className="space-y-2">
                    <p className="font-semibold text-zinc-300">Skills Alignment Matrix</p>
                    <div className="flex flex-wrap gap-1.5">
                      {jdResult.matchedSkills.map((sk: string) => (
                        <span key={sk} className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> {sk}
                        </span>
                      ))}
                      {jdResult.missingSkills.map((sk: string) => (
                        <span key={sk} className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords & Certs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <p className="font-semibold text-zinc-400 text-[10px] uppercase">Missing JD Keywords</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jdResult.missingKeywords.map((kw: string) => (
                          <span key={kw} className="text-[9px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-400 text-[10px] uppercase">Missing Certifications</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jdResult.missingCertifications.map((cert: string) => (
                          <span key={cert} className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">{cert}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Weak areas & suggestions */}
                  <div className="space-y-2 border-t border-zinc-850 pt-3">
                    <p className="font-semibold text-zinc-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Weak Experience Areas & Recommendations:
                    </p>
                    <ul className="text-[11px] text-zinc-400 space-y-1.5 pl-1">
                      {jdResult.weakExperienceAreas.map((weak: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Outreach materials tabs */}
                <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl overflow-hidden p-3.5 space-y-3">
                  <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">AI Generated Outreach Assets</p>
                  
                  {/* Cover letter copy */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 font-bold uppercase">Cover Letter Draft</span>
                      <button
                        onClick={() => copyToClipboard(jdResult.coverLetter, "cov")}
                        className="text-violet-400 hover:underline flex items-center gap-1"
                      >
                        {copiedText === "cov" ? "Copied!" : "Copy Text"}
                      </button>
                    </div>
                    <textarea readOnly className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px] text-zinc-400 h-20 resize-none font-mono" value={jdResult.coverLetter} />
                  </div>

                  {/* Recruiter Email copy */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 font-bold uppercase">Recruiter Email Draft</span>
                      <button
                        onClick={() => copyToClipboard(jdResult.recruiterEmail, "eml")}
                        className="text-violet-400 hover:underline flex items-center gap-1"
                      >
                        {copiedText === "eml" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <textarea readOnly className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px] text-zinc-400 h-20 resize-none font-mono" value={jdResult.recruiterEmail} />
                  </div>
                </div>

                {/* Review optimized Resume layout */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setComparisonTarget(jdResult.optimizedResume);
                      setShowComparison(true);
                    }}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-4 h-4" /> Compare Optimized Version
                  </button>
                  <button
                    onClick={() => {
                      onApplyOptimized(jdResult.optimizedResume);
                      alert("Optimized Resume applied to editor state!");
                      triggerConfetti();
                    }}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-lg shadow"
                  >
                    Apply optimized
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* TAB 2: CAREER ROLE OPTIMIZER                     */}
        {/* ================================================= */}
        {activeTab === "role" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium">Select target career role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <button
              onClick={runRoleOptimizer}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg text-xs font-bold shadow-lg shadow-violet-950/20 disabled:opacity-40"
            >
              {isLoading ? "Formulating Role Profile..." : "Analyze Role Readiness"}
            </button>

            {roleResult && (
              <div className="space-y-4 pt-3 border-t border-zinc-850">
                {/* Circular progress scores */}
                <div className="grid grid-cols-4 gap-2">
                  <CircularProgress percentage={roleResult.readinessScore} label="Readiness" colorClass="text-violet-500" />
                  <CircularProgress percentage={roleResult.techSkillsScore} label="Tech Skills" colorClass="text-emerald-500" />
                  <CircularProgress percentage={roleResult.projectsScore} label="Projects" colorClass="text-sky-500" />
                  <CircularProgress percentage={roleResult.certsScore} label="Certifications" colorClass="text-amber-500" />
                </div>

                {/* Gap analyses */}
                <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-4 text-xs">
                  <div className="space-y-2">
                    <p className="font-semibold text-zinc-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Identified Career Gaps for {selectedRole}
                    </p>
                    
                    {/* Gaps badges */}
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Missing Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {roleResult.missingSkills.map((sk: string) => (
                          <span key={sk} className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-550/20 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Learning Path */}
                  <div className="border-t border-zinc-850 pt-3 space-y-2">
                    <p className="font-semibold text-zinc-300 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                      Recommended Learning Roadmap
                    </p>
                    <div className="space-y-2 pl-2">
                      {roleResult.recommendedLearningPath.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-400">
                          <span className="w-4.5 h-4.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] flex items-center justify-center shrink-0 font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="mt-0.5">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Projects Suggestion */}
                  <div className="border-t border-zinc-850 pt-3 space-y-2">
                    <p className="font-semibold text-zinc-300 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      Suggested Portfolio Projects
                    </p>
                    {roleResult.suggestedProjects.map((proj: any, idx: number) => (
                      <div key={idx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                        <p className="font-bold text-zinc-200 text-xs">{proj.name}</p>
                        <p className="text-[10px] text-zinc-400 leading-normal">{proj.description}</p>
                        <div className="flex gap-1 flex-wrap">
                          {proj.tech.map((t: string) => (
                            <span key={t} className="text-[8px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded font-semibold">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interview Preparation */}
                  <div className="border-t border-zinc-850 pt-3 space-y-2">
                    <p className="font-semibold text-zinc-300 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                      Interview Q&A Cheat Sheet
                    </p>
                    {roleResult.interviewQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="space-y-1 bg-zinc-900/30 p-2.5 rounded border border-zinc-900">
                        <p className="font-bold text-zinc-200 text-[11px]">&gt; Q: {q.question}</p>
                        <p className="text-[10px] text-violet-400/80 italic">Tip: {q.responseTip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setComparisonTarget(roleResult.optimizedResume);
                      setShowComparison(true);
                    }}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Compare Role-Specific Version
                  </button>
                  <button
                    onClick={() => {
                      onApplyOptimized(roleResult.optimizedResume);
                      alert(`Optimized Resume for ${selectedRole} applied to editor!`);
                      triggerConfetti();
                    }}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-lg shadow"
                  >
                    Apply Optimized
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* TAB 3: HYBRID AI OPTIMIZER                       */}
        {/* ================================================= */}
        {activeTab === "hybrid" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Target Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Job Posting</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none h-10 resize-none font-sans"
                  placeholder="Paste details here..."
                />
              </div>
            </div>

            <button
              onClick={runHybridOptimizer}
              disabled={isLoading || !jobDescription.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg text-xs font-bold shadow-lg shadow-violet-950/20 disabled:opacity-40"
            >
              {isLoading ? "Executing Hybrid Diagnostics..." : "Perform Deep Hybrid Optimization"}
            </button>

            {hybridResult && (
              <div className="space-y-4 pt-3 border-t border-zinc-850">
                {/* SVG Progress meters */}
                <div className="grid grid-cols-3 gap-2">
                  <CircularProgress percentage={hybridResult.roleReadinessScore} label="Readiness" colorClass="text-sky-500" />
                  <CircularProgress percentage={hybridResult.jdMatchScore} label="JD Match" colorClass="text-emerald-500" />
                  <CircularProgress percentage={hybridResult.hiringPotentialScore} label="Potential Score" colorClass="text-violet-500" />
                </div>

                {/* Gap analyses */}
                <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3.5 text-xs">
                  <p className="font-semibold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Layers className="w-4 h-4 text-violet-400" /> Unified Improvement Report
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] text-zinc-550 uppercase font-bold">Missing Industry Standards</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hybridResult.missingIndustrySkills.map((sk: string) => (
                          <span key={sk} className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-rose-350 rounded">{sk}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-555 uppercase font-bold">Missing JD Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hybridResult.missingJdSkills.map((sk: string) => (
                          <span key={sk} className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-rose-350 rounded">{sk}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-zinc-850 pt-3">
                    <p className="font-semibold text-zinc-300">Recruiter recommendations</p>
                    <ul className="text-[10px] text-zinc-400 space-y-1">
                      {hybridResult.recommendations.map((r: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Text boxes / Executive summary package details */}
                <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-zinc-500 font-bold uppercase">Executive Summary Summary</span>
                      <button
                        onClick={() => copyToClipboard(hybridResult.executiveSummary, "sum")}
                        className="text-violet-400 hover:underline"
                      >
                        {copiedText === "sum" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] text-zinc-400 leading-relaxed font-sans">{hybridResult.executiveSummary}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadPackageFile(hybridResult)}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                    >
                      <Download className="w-4 h-4" /> Download Text Package
                    </button>
                    <button
                      onClick={() => {
                        onApplyOptimized(hybridResult.optimizedResume);
                        alert("Applied overall hybrid optimized version to active resume!");
                        triggerConfetti();
                      }}
                      className="px-4 py-2 bg-violet-650 hover:bg-violet-755 text-white text-xs font-bold rounded-lg"
                    >
                      Apply Resume
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPARISON MODAL DIALOG DISPLAY */}
      {showComparison && comparisonTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-zinc-900 border-b border-zinc-850 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white">Visual Optimization Comparison</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Compare working draft (Left) vs AI optimized model (Right)</p>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-zinc-450 hover:text-zinc-200 p-1 bg-zinc-800 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden divide-x divide-zinc-850">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-2.5 bg-zinc-950 text-center text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-850">Working resume state</div>
                <div className="flex-1 overflow-y-auto p-6 scale-90 origin-top">
                  <ResumeTemplates data={workingResume} primaryColor={primaryColor} isCV={isCV} templateId={templateId} />
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-2.5 bg-violet-950/20 text-center text-[10px] font-bold text-violet-400 uppercase border-b border-zinc-850">AI Optimized Layout</div>
                <div className="flex-1 overflow-y-auto p-6 scale-90 origin-top">
                  <ResumeTemplates data={comparisonTarget} primaryColor={primaryColor} isCV={isCV} templateId={templateId} />
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-850 flex justify-end gap-2">
              <button onClick={() => setShowComparison(false)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs font-semibold">Close Comparison</button>
              <button
                onClick={() => {
                  onApplyOptimized(comparisonTarget);
                  setShowComparison(false);
                  alert("Applied optimized layout!");
                  triggerConfetti();
                }}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-lg text-xs font-bold"
              >
                Apply Optimization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
