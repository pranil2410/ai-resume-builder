import React, { useState } from "react";
import { ResumeData } from "../types/resume";
import { AIService } from "../services/ai";
import { X, Sparkles, FileText, Mail, Linkedin, Copy, Check, Download } from "lucide-react";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose?: () => void;
  resumeData: ResumeData;
  initialJd?: string;
  selectedModel: "gemini" | "openai" | "mock";
  apiKey: string;
  isInline?: boolean;
}

type TabType = "letter" | "email" | "linkedin";

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  initialJd = "",
  selectedModel,
  apiKey,
  isInline = false,
}) => {
  const [jobDescription, setJobDescription] = useState(initialJd);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<TabType>("letter");
  
  const [outreach, setOutreach] = useState<{
    coverLetter: string;
    recruiterEmail: string;
    linkedinIntro: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  if (!isOpen && !isInline) return null;

  // Generate outreach materials
  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await AIService.generateCoverLetter(resumeData, jobDescription, {
        apiKey,
        provider: selectedModel,
      });
      setOutreach(generated);
    } catch (err) {
      console.error(err);
      alert("Outreach generation failed. Please verify API configurations.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download plain text helper
  const handleDownload = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const innerContent = (
    <div className={`w-full ${isInline ? "h-full flex-1" : "max-w-4xl h-[85vh]"} bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl`}>
      {/* Header */}
      <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-violet-600/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">AI Cover Letter & Outreach Generator</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Craft tailored pitches and recruiter emails using your profile details.</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Inner Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - JD paste */}
        <div className="w-1/3 border-r border-zinc-850 p-4 flex flex-col gap-4 bg-zinc-900/10">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400">Target Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 h-full resize-none font-sans"
              placeholder="Paste the details of the job you want to target..."
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescription.trim()}
            className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white disabled:opacity-40 rounded-lg text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-white" />
            {isGenerating ? "Generating Pitches..." : "Generate Outreach"}
          </button>
        </div>

        {/* Right panel - Generated outputs */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {outreach ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex bg-zinc-900/40 border-b border-zinc-850">
                <button
                  onClick={() => setActiveSubTab("letter")}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                    activeSubTab === "letter"
                      ? "border-violet-500 text-violet-400 bg-zinc-900/20"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Cover Letter
                </button>
                <button
                  onClick={() => setActiveSubTab("email")}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                    activeSubTab === "email"
                      ? "border-violet-500 text-violet-400 bg-zinc-900/20"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Recruiter Email
                </button>
                <button
                  onClick={() => setActiveSubTab("linkedin")}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                    activeSubTab === "linkedin"
                      ? "border-violet-500 text-violet-400 bg-zinc-900/20"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn Intro
                </button>
              </div>

              {/* Editor/viewer */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                <div className="flex justify-end gap-2 bg-zinc-900/30 p-2 rounded-lg border border-zinc-900">
                  <button
                    onClick={() =>
                      handleCopy(
                        activeSubTab === "letter"
                          ? outreach.coverLetter
                          : activeSubTab === "email"
                          ? outreach.recruiterEmail
                          : outreach.linkedinIntro
                      )
                    }
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-semibold flex items-center gap-1 hover:text-zinc-100"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Clipboard"}
                  </button>
                  <button
                    onClick={() => {
                      const content =
                        activeSubTab === "letter"
                          ? outreach.coverLetter
                          : activeSubTab === "email"
                          ? outreach.recruiterEmail
                          : outreach.linkedinIntro;
                      const suffix = activeSubTab === "letter" ? "cover_letter" : activeSubTab === "email" ? "recruiter_email" : "linkedin_intro";
                      handleDownload(content, `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_${suffix}.txt`);
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-semibold flex items-center gap-1 hover:text-zinc-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save Plain Text
                  </button>
                </div>

                <textarea
                  readOnly
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-350 leading-relaxed font-sans focus:outline-none resize-none min-h-[250px]"
                  value={
                    activeSubTab === "letter"
                      ? outreach.coverLetter
                      : activeSubTab === "email"
                      ? outreach.recruiterEmail
                      : outreach.linkedinIntro
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <Sparkles className="w-10 h-10 text-zinc-700 mb-2 animate-pulse" />
              <p className="text-sm font-semibold text-zinc-400">Generate Your Pitches</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Paste the target Job Description on the left and click "Generate Outreach" to write customized messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return innerContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {innerContent}
    </div>
  );
};
