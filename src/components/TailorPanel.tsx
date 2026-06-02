import React, { useState } from "react";
import { ResumeData, JobMatchReport } from "../types/resume";
import { AIService } from "../services/ai";
import { ResumeTemplates } from "./ResumeTemplates";
import { Sparkles, Check, AlertTriangle, AlertCircle, ArrowLeftRight, X, ChevronRight, Download } from "lucide-react";
import confetti from "canvas-confetti";

interface TailorPanelProps {
  resumeData: ResumeData;
  onApplyTailored: (tailoredData: ResumeData) => void;
  selectedModel: "gemini" | "openai" | "mock";
  apiKey: string;
  primaryColor: string;
  isCV: boolean;
  templateId: string;
}

export const TailorPanel: React.FC<TailorPanelProps> = ({
  resumeData,
  onApplyTailored,
  selectedModel,
  apiKey,
  primaryColor,
  isCV,
  templateId,
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [report, setReport] = useState<JobMatchReport | null>(null);
  const [tailoredResume, setTailoredResume] = useState<ResumeData | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Analyze JD Match
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    try {
      const matchReport = await AIService.analyzeJobMatch(resumeData, jobDescription, {
        apiKey,
        provider: selectedModel,
      });
      setReport(matchReport);
      
      // Trigger confetti if score is high (e.g. > 80)
      if (matchReport.score >= 80) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (err) {
      console.error(err);
      alert("ATS match analysis failed. Please check your API configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Tailor Resume One-Click
  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    setIsTailoring(true);
    try {
      const tailored = await AIService.tailorResume(resumeData, jobDescription, {
        apiKey,
        provider: selectedModel,
      });
      setTailoredResume(tailored);
      setShowComparison(true);
    } catch (err) {
      console.error(err);
      alert("One-Click tailoring failed. Please check API keys.");
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
        <ArrowLeftRight className="w-5 h-5 text-violet-400" />
        <h3 className="font-display font-semibold text-sm text-zinc-200">JOB DESCRIPTION MATCHING</h3>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-medium">Paste the Target Job Description (JD)</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 h-28 resize-none font-sans"
          placeholder="Paste requirements, duties, and technology listings from the job posting..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !jobDescription.trim()}
          className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 rounded-lg text-xs font-bold transition-all"
        >
          {isAnalyzing ? "Analyzing ATS..." : "Analyze Match Score"}
        </button>

        <button
          onClick={handleTailor}
          disabled={isTailoring || !jobDescription.trim()}
          className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg text-xs font-bold shadow-lg shadow-violet-950/20 flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isTailoring ? "Tailoring..." : "One-Click Tailor"}
        </button>
      </div>

      {/* MATCH REPORT DASHBOARD */}
      {report && (
        <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">ATS Score Report</span>
            <span className="text-xs font-mono font-bold text-violet-400">{report.score}% Compatibility</span>
          </div>

          {/* Core Score Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-zinc-900/60 p-2 border border-zinc-850 rounded-lg">
              <p className="text-[10px] text-zinc-500 font-semibold">ATS</p>
              <p className="text-sm font-bold text-zinc-200 mt-0.5">{report.atsScore || report.score}%</p>
            </div>
            <div className="bg-zinc-900/60 p-2 border border-zinc-850 rounded-lg">
              <p className="text-[10px] text-zinc-500 font-semibold">Keywords</p>
              <p className="text-sm font-bold text-zinc-200 mt-0.5">{report.keywordScore || 65}%</p>
            </div>
            <div className="bg-zinc-900/60 p-2 border border-zinc-850 rounded-lg">
              <p className="text-[10px] text-zinc-500 font-semibold">Grammar</p>
              <p className="text-sm font-bold text-zinc-200 mt-0.5">{report.grammarScore || 90}%</p>
            </div>
            <div className="bg-zinc-900/60 p-2 border border-zinc-850 rounded-lg">
              <p className="text-[10px] text-zinc-500 font-semibold">Format</p>
              <p className="text-sm font-bold text-zinc-200 mt-0.5">{report.formattingScore || 85}%</p>
            </div>
          </div>

          {/* Missing Keywords */}
          {report.missingKeywords && report.missingKeywords.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Missing Core Keywords:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {report.missingKeywords.map((kw) => (
                  <span key={kw} className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ATS Improvement Suggestions */}
          {report.suggestions && report.suggestions.length > 0 && (
            <div className="space-y-2 border-t border-zinc-850 pt-3">
              <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                Suggested Adjustments:
              </p>
              <ul className="text-[11px] text-zinc-400 space-y-1.5">
                {report.suggestions.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      {showComparison && tailoredResume && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Side-by-Side Tailored Resume Review
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Compare the original document with the AI optimized model.</p>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Resumes */}
            <div className="flex-1 flex overflow-hidden divide-x divide-zinc-850 bg-zinc-900/20">
              {/* Original */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-zinc-950 border-b border-zinc-800 text-center font-display font-semibold text-xs tracking-wider text-zinc-400">
                  ORIGINAL DOCUMENT
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-900/30 scale-90 origin-top">
                  <ResumeTemplates
                    data={resumeData}
                    primaryColor={primaryColor}
                    isCV={isCV}
                    templateId={templateId}
                  />
                </div>
              </div>

              {/* Tailored */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-violet-950/20 border-b border-zinc-800 text-center font-display font-semibold text-xs tracking-wider text-violet-400">
                  AI OPTIMIZED FOR JOB DESCRIPTION
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-900/30 scale-90 origin-top">
                  <ResumeTemplates
                    data={tailoredResume}
                    primaryColor={primaryColor}
                    isCV={isCV}
                    templateId={templateId}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setShowComparison(false)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-semibold transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={() => {
                  onApplyTailored(tailoredResume);
                  setShowComparison(false);
                  confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                  });
                }}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg text-sm font-semibold shadow-lg shadow-violet-950/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Apply Tailored Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
