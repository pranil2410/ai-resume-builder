"use client";

import React, { useState, useEffect } from "react";
import { ResumeData, ResumeVersion, AppSettings } from "../types/resume";
import { getMockResumeData, AIService } from "../services/ai";
import { ResumeForm } from "../components/ResumeForm";
import { ResumeTemplates } from "../components/ResumeTemplates";
import { TailorPanel } from "../components/TailorPanel";
import { CareerAssistant } from "../components/CareerAssistant";
import { VersionManager } from "../components/VersionManager";
import { CoverLetterModal } from "../components/CoverLetterModal";
import { PortfolioPreview } from "../components/PortfolioPreview";
import { OptimizationCenter } from "../components/OptimizationCenter";
import { LandingPage } from "../components/LandingPage";
import { Footer } from "../components/Footer";

// PDF.js import
import * as pdfjsLib from "pdfjs-dist";

// docx library import
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";

// Lucide icons
import {
  Sparkles,
  Settings,
  Download,
  Upload,
  Globe,
  FileText,
  Palette,
  Trash2,
  Import,
  Layers,
  Layout,
  Briefcase,
  Bot,
  HelpCircle,
  Linkedin,
  FileDown,
  Gauge,
  Home,
  BookOpen,
  ArrowRight
} from "lucide-react";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export default function Dashboard() {
  // 0. VIEW STATE
  const [currentView, setCurrentView] = useState<"landing" | "builder" | "parser" | "optimizer" | "cover-letter" | "portfolio">("landing");

  // 1. ACTIVE RESUME STATE
  const [resumeData, setResumeData] = useState<ResumeData>(getMockResumeData());
  const [activeVersionId, setActiveVersionId] = useState<string>("active");
  const [isCV, setIsCV] = useState(false);

  // 2. STYLING & ACCENTS
  const [activeTemplate, setActiveTemplate] = useState<string>("modern");
  const [primaryColor, setPrimaryColor] = useState<string>("violet");

  // 3. SETTINGS & AI KEYS
  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: "",
    openAiApiKey: "",
    selectedModel: "gemini",
  });
  const [showSettings, setShowSettings] = useState(false);

  // 4. VERSION MANAGEMENT
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "tailor" | "history" | "parse" | "optimization">("editor");

  // 5. PARSE UPLOADER
  const [isParsing, setIsParsing] = useState(false);
  const [rawTextImport, setRawTextImport] = useState("");

  // 6. MODALS
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isConvertingCV, setIsConvertingCV] = useState(false);
  const [optSubTab, setOptSubTab] = useState<"jd" | "role" | "hybrid">("jd");

  // LOAD LOCALS ON MOUNT
  useEffect(() => {
    // API Keys
    const savedGeminiKey = localStorage.getItem("gemini_key") || "";
    // If user provided a system environment key or a preconfigured key, use it as default
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const activeGeminiKey = savedGeminiKey || envKey;

    const savedOpenAIKey = localStorage.getItem("openai_key") || "";
    const savedModel = localStorage.getItem("selected_model") || (activeGeminiKey ? "gemini" : "mock");

    setSettings({
      geminiApiKey: activeGeminiKey,
      openAiApiKey: savedOpenAIKey,
      selectedModel: savedModel as any,
    });

    // Saved Resume Data
    const savedResume = localStorage.getItem("active_resume");
    if (savedResume) {
      try {
        setResumeData(JSON.parse(savedResume));
      } catch (e) {
        console.error(e);
      }
    }

    // Saved Versions
    const savedVersions = localStorage.getItem("resume_versions");
    if (savedVersions) {
      try {
        setVersions(JSON.parse(savedVersions));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // SAVE RESUME DATA TO LOCAL STORAGE ON STATE CHANGE
  const updateResumeData = (newData: ResumeData) => {
    setResumeData(newData);
    localStorage.setItem("active_resume", JSON.stringify(newData));
  };

  // VERSION CONTROLLER METHODS
  const handleSaveVersion = (name: string) => {
    const newVer: ResumeVersion = {
      id: `ver-${Date.now()}`,
      resumeId: "active-resume",
      versionName: name,
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(resumeData)),
    };
    const nextVersions = [newVer, ...versions];
    setVersions(nextVersions);
    localStorage.setItem("resume_versions", JSON.stringify(nextVersions));
  };

  const handleRestoreVersion = (version: ResumeVersion) => {
    updateResumeData(version.data);
    setActiveVersionId(version.id);
  };

  const handleDeleteVersion = (id: string) => {
    const nextVersions = versions.filter((v) => v.id !== id);
    setVersions(nextVersions);
    localStorage.setItem("resume_versions", JSON.stringify(nextVersions));
  };

  const handleAIConvertToCV = async () => {
    const apiKey = settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey;
    if (settings.selectedModel !== "mock" && !apiKey) {
      alert("Please configure your API key in the settings panel first.");
      setShowSettings(true);
      return;
    }
    setIsConvertingCV(true);
    try {
      const parsedCV = await AIService.convertToCV(resumeData, {
        apiKey,
        provider: settings.selectedModel,
      });
      updateResumeData(parsedCV);
      setIsCV(true);
      setActiveTab("editor");
      alert("Resume successfully converted to an Academic CV using AI! Publications, patents, teaching, research, and conferences sections have been populated.");
    } catch (err: any) {
      console.error(err);
      alert(`CV conversion failed: ${err.message || "Please check API configurations."}`);
    } finally {
      setIsConvertingCV(false);
    }
  };

  // PARSER CLIENT-SIDE (PDF parsing using pdf.js text contents)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
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
      } else if (file.type === "text/plain") {
        extractedText = await file.text();
      } else {
        alert("Unsupported format. Please upload a PDF or plain Text file.");
        setIsParsing(false);
        return;
      }

      if (!extractedText.trim()) {
        throw new Error("No text content could be extracted from this document.");
      }

      // Structure with AI
      const parsedData = await AIService.parseResume(extractedText, {
        apiKey: settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey,
        provider: settings.selectedModel,
      });

      // Update state
      if (parsedData.personalInfo) {
        updateResumeData(parsedData as ResumeData);
        setActiveTab("editor");
        alert("Resume parsed and loaded successfully!");
      } else {
        throw new Error("AI parser could not construct structural info.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Parsing failed: ${err.message || "Failed to process document content."}`);
    } finally {
      setIsParsing(false);
    }
  };

  // EXPORT ENGINE (DOCX File Generator)
  const handleExportDOCX = async () => {
    const { personalInfo, education, experience, projects, skills } = resumeData;
    
    // Construct paragraph lists
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: personalInfo.fullName || "Jane Doe",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${personalInfo.title || ""} | ${personalInfo.location || ""} | ${personalInfo.phone || ""} | ${personalInfo.email || ""}`,
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: "",
      }),
      new Paragraph({
        text: "PROFESSIONAL SUMMARY",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: personalInfo.summary || "",
      }),
      new Paragraph({
        text: "",
      }),
      new Paragraph({
        text: "WORK EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    experience.forEach((exp) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})`, bold: true }),
          ],
        })
      );
      exp.description.split("\n").forEach((bullet) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${bullet.replace(/^[-*•\s]+/, "")}`,
            indent: { left: 720 },
          })
        );
      });
      paragraphs.push(new Paragraph({ text: "" }));
    });

    paragraphs.push(
      new Paragraph({
        text: "TECHNICAL PROJECTS",
        heading: HeadingLevel.HEADING_2,
      })
    );

    projects.forEach((p) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${p.name} [Tech: ${p.technologies.join(", ")}]`, bold: true }),
          ],
        })
      );
      paragraphs.push(
        new Paragraph({
          text: p.description,
          indent: { left: 360 },
        })
      );
      paragraphs.push(new Paragraph({ text: "" }));
    });

    paragraphs.push(
      new Paragraph({
        text: "EDUCATION",
        heading: HeadingLevel.HEADING_2,
      })
    );

    education.forEach((edu) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree} in ${edu.fieldOfStudy} - ${edu.school} (${edu.startDate} - ${edu.endDate})`, bold: true }),
          ],
        })
      );
      if (edu.gpa) paragraphs.push(new Paragraph({ text: `GPA: ${edu.gpa}` }));
      paragraphs.push(new Paragraph({ text: "" }));
    });

    paragraphs.push(
      new Paragraph({
        text: "SKILLS",
        heading: HeadingLevel.HEADING_2,
      })
    );
    const skillsString = skills.map((s) => `${s.name} (${s.level || "Intermediate"})`).join(", ");
    paragraphs.push(new Paragraph({ text: skillsString }));

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `${personalInfo.fullName.replace(/\s+/g, "_")}_resume.docx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // EXPORT ENGINE (Plain Text file download)
  const handleExportTXT = () => {
    const { personalInfo, education, experience, projects, skills } = resumeData;
    let txt = `${personalInfo.fullName.toUpperCase()}\n`;
    txt += `${personalInfo.title}\n`;
    txt += `Email: ${personalInfo.email} | Phone: ${personalInfo.phone}\n`;
    txt += `Location: ${personalInfo.location} | Website: ${personalInfo.website}\n\n`;
    txt += `SUMMARY\n=======\n${personalInfo.summary}\n\n`;
    
    txt += `EXPERIENCE\n==========\n`;
    experience.forEach((exp) => {
      txt += `${exp.position} - ${exp.company} (${exp.startDate} to ${exp.current ? "Present" : exp.endDate})\n`;
      txt += `Location: ${exp.location}\n`;
      txt += `${exp.description}\n\n`;
    });

    txt += `PROJECTS\n========\n`;
    projects.forEach((p) => {
      txt += `${p.name} [${p.technologies.join(", ")}]\n`;
      txt += `${p.description}\n\n`;
    });

    txt += `EDUCATION\n=========\n`;
    education.forEach((edu) => {
      txt += `${edu.degree} in ${edu.fieldOfStudy} - ${edu.school} (${edu.startDate} to ${edu.endDate})\n`;
      if (edu.gpa) txt += `GPA: ${edu.gpa}\n`;
      txt += `Notes: ${edu.description}\n\n`;
    });

    txt += `SKILLS\n======\n`;
    const cats = Array.from(new Set(skills.map((s) => s.category || "General")));
    cats.forEach((cat) => {
      txt += `${cat}: ${skills.filter((s) => (s.category || "General") === cat).map((s) => s.name).join(", ")}\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([txt], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${personalInfo.fullName.replace(/\s+/g, "_")}_resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // SAVE SETTINGS MODAL
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem("gemini_key", newSettings.geminiApiKey);
    localStorage.setItem("openai_key", newSettings.openAiApiKey);
    localStorage.setItem("selected_model", newSettings.selectedModel);
    setShowSettings(false);
  };

  // RAW RESUME PARSE HANDLER
  const handleRawTextSubmit = async () => {
    if (!rawTextImport.trim()) return;
    setIsParsing(true);
    try {
      const parsedData = await AIService.parseResume(rawTextImport, {
        apiKey: settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey,
        provider: settings.selectedModel,
      });

      if (parsedData.personalInfo) {
        updateResumeData(parsedData as ResumeData);
        setRawTextImport("");
        setActiveTab("editor");
        alert("Parsed details imported successfully!");
      } else {
        throw new Error("Structuring parsing payload yielded empty keys.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Parsing failed: ${err.message || "Ensure key configuration checks out."}`);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300 font-sans flex flex-col antialiased">
      {currentView === "landing" && (
        <LandingPage
          onNavigate={(view, options) => {
            setCurrentView(view);
            if (view === "builder") {
              setActiveTab("editor");
              if (options?.isCV !== undefined) {
                setIsCV(options.isCV);
                if (options.isCV) {
                  updateResumeData({
                    ...resumeData,
                    publications: resumeData.publications || [],
                    research: resumeData.research || [],
                    teaching: resumeData.teaching || [],
                    patents: resumeData.patents || [],
                    awards: resumeData.awards || [],
                    conferences: resumeData.conferences || [],
                  });
                }
              }
            } else if (view === "optimizer") {
              if (options?.optimizationTab !== undefined) {
                setOptSubTab(options.optimizationTab);
              }
            }
          }}
        />
      )}

      {currentView === "parser" && (
        <>
          <header className="sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 h-16 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView("landing")}>
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white font-extrabold text-xs flex items-center justify-center">
                <Upload className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-white text-base tracking-wide uppercase">AI Resume Parser</h1>
                <p className="text-[9px] text-violet-400 font-mono tracking-widest uppercase font-bold">Extraction Suite</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView("landing")}
              className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              ← Back to Home
            </button>
          </header>

          <main className="flex-1 flex overflow-hidden p-6 gap-6">
            {/* Left panel: Upload options */}
            <div className="w-1/2 bg-[#0c0c0e] border border-zinc-800/85 rounded-2xl p-6 space-y-6 flex flex-col justify-between overflow-y-auto scrollbar-thin">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <Upload className="w-5 h-5 text-violet-400" />
                  <h3 className="font-display font-semibold text-sm text-zinc-200">UPLOAD DOCUMENT</h3>
                </div>

                {/* Uploader dropzone */}
                <div className="border-2 border-dashed border-zinc-800 bg-zinc-900/10 rounded-xl p-8 text-center hover:border-violet-500/40 transition-all relative">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-3 text-zinc-500">
                    <FileDown className="w-12 h-12 text-zinc-650" />
                    <p className="text-sm font-semibold text-zinc-300">Drag or Upload PDF / Text Resume</p>
                    <p className="text-xs text-zinc-500">AI parses contact data, experience details, and skill sets automatically</p>
                  </div>
                </div>

                {/* Plain text input alternative */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Import className="w-3.5 h-3.5 text-zinc-500" />
                    LinkedIn profile or plain text import
                  </label>
                  <textarea
                    value={rawTextImport}
                    onChange={(e) => setRawTextImport(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-850 rounded-xl p-3 text-xs text-zinc-200 h-32 resize-none font-sans focus:outline-none focus:border-violet-500"
                    placeholder="Paste parsed LinkedIn PDF text export or standard clipboard resume content..."
                  />
                  <button
                    onClick={async () => {
                      if (!rawTextImport.trim()) return;
                      setIsParsing(true);
                      try {
                        const parsedData = await AIService.parseResume(rawTextImport, {
                          apiKey: settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey,
                          provider: settings.selectedModel,
                        });
                        if (parsedData.personalInfo) {
                          updateResumeData(parsedData as ResumeData);
                          alert("Resume parsed successfully!");
                        } else {
                          throw new Error("AI parser failed to extract structure.");
                        }
                      } catch (err: any) {
                        alert(`Parsing failed: ${err.message || "Please check API configurations."}`);
                      } finally {
                        setIsParsing(false);
                      }
                    }}
                    disabled={isParsing || !rawTextImport.trim()}
                    className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-855 hover:text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    {isParsing ? "Extracting..." : "Parse Plain Text"}
                  </button>
                </div>
              </div>

              {/* API settings info */}
              <div className="p-3.5 bg-zinc-900/50 border border-zinc-850 rounded-xl text-[10px] text-zinc-500 leading-normal flex items-start gap-2 select-none">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-400 block mb-0.5">Gemini Extraction engine active</span>
                  Ensure you have a valid Gemini API Key configured in your settings if you are using AI mode instead of the offline mock data generator.
                </div>
              </div>
            </div>

            {/* Right panel: Live Preview of Parsed State */}
            <div className="w-1/2 bg-[#0c0c0e] border border-zinc-800/85 rounded-2xl p-6 flex flex-col justify-between overflow-y-auto scrollbar-thin">
              <div className="space-y-4 overflow-hidden flex flex-col flex-1">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    <h3 className="font-display font-semibold text-sm text-zinc-200">EXTRACTED PROFILE PREVIEW</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold select-none">
                    Ready to Load
                  </span>
                </div>

                {/* Parsed Fields Preview */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-xs">
                  {/* Contact info cards */}
                  <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-white text-xs tracking-wide border-b border-zinc-800 pb-1.5">Personal details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Full Name</span>
                        <span className="text-zinc-200 font-semibold">{resumeData.personalInfo.fullName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Title</span>
                        <span className="text-zinc-200 font-semibold">{resumeData.personalInfo.title || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Email</span>
                        <span className="text-zinc-300 font-mono">{resumeData.personalInfo.email || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Phone</span>
                        <span className="text-zinc-300">{resumeData.personalInfo.phone || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience highlights */}
                  <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-white text-xs tracking-wide border-b border-zinc-800 pb-1.5">Work Timeline</h4>
                    <div className="space-y-3">
                      {resumeData.experience && resumeData.experience.length > 0 ? (
                        resumeData.experience.map((exp) => (
                          <div key={exp.id} className="border-l border-zinc-800 pl-3 py-0.5 space-y-0.5">
                            <p className="font-bold text-zinc-200 text-xs">{exp.position}</p>
                            <p className="text-[10px] text-violet-400">{exp.company} • {exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 italic">No job history parsed yet</p>
                      )}
                    </div>
                  </div>

                  {/* Skills tags list */}
                  <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-white text-xs tracking-wide border-b border-zinc-800 pb-1.5">Key Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills && resumeData.skills.length > 0 ? (
                        resumeData.skills.map((s) => (
                          <span key={s.id} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-semibold text-[10px]">
                            {s.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-zinc-500 italic">No skills list parsed yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Launch Editor CTA */}
              <button
                onClick={() => setCurrentView("builder")}
                className="w-full py-4 mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2 glow-pulse shrink-0"
              >
                🚀 Load Data and Open in Resume Builder
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </main>
        </>
      )}

      {currentView === "cover-letter" && (
        <>
          <header className="sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 h-16 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView("landing")}>
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white font-extrabold text-xs flex items-center justify-center border border-violet-500/20 shadow-lg shadow-violet-950/25">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-white text-base tracking-wide uppercase">AI Cover Letter Suite</h1>
                <p className="text-[9px] text-violet-400 font-mono tracking-widest uppercase font-bold">Outreach Architect</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("builder")}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                Open Resume Editor
              </button>
              <button
                onClick={() => setCurrentView("landing")}
                className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-355 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                ← Back to Home
              </button>
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden p-6">
            <CoverLetterModal
              isOpen={true}
              isInline={true}
              resumeData={resumeData}
              selectedModel={settings.selectedModel}
              apiKey={settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey}
            />
          </main>
        </>
      )}

      {currentView === "optimizer" && (
        <>
          <header className="sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 h-16 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView("landing")}>
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white font-extrabold text-xs flex items-center justify-center border border-violet-500/20 shadow-lg shadow-violet-950/25">
                <Gauge className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-white text-base tracking-wide uppercase">AI Optimization Center</h1>
                <p className="text-[9px] text-violet-400 font-mono tracking-widest uppercase font-bold">ATS Audit Suite</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("builder")}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                Open Resume Editor
              </button>
              <button
                onClick={() => setCurrentView("landing")}
                className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-355 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                ← Back to Home
              </button>
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden p-6">
            <div className="flex-1 h-full">
              <OptimizationCenter
                currentResume={resumeData}
                onApplyOptimized={updateResumeData}
                selectedModel={settings.selectedModel}
                apiKey={settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey}
                primaryColor={primaryColor}
                isCV={isCV}
                templateId={activeTemplate}
                initialActiveTab={optSubTab}
              />
            </div>
          </main>
        </>
      )}

      {currentView === "portfolio" && (
        <>
          <header className="sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 h-16 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView("landing")}>
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white font-extrabold text-xs flex items-center justify-center border border-violet-500/20 shadow-lg shadow-violet-950/25">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-white text-base tracking-wide uppercase">AI Portfolio website</h1>
                <p className="text-[9px] text-violet-400 font-mono tracking-widest uppercase font-bold">Interactive Web Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("builder")}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                Open Resume Editor
              </button>
              <button
                onClick={() => setCurrentView("landing")}
                className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-355 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                ← Back to Home
              </button>
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden p-6">
            <PortfolioPreview
              isOpen={true}
              isInline={true}
              resumeData={resumeData}
            />
          </main>
        </>
      )}

      {currentView === "builder" && (
        <>
          {/* 1. TOP HEADER NAVIGATION BAR */}
          <header className="no-print sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 h-16 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView("landing")}>
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shadow-lg shadow-violet-950/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                  AI RESUME & CV BUILDER
                </h1>
                <p className="text-[9px] text-violet-400 font-mono tracking-widest uppercase font-bold">Powered by AI</p>
              </div>
            </div>

            {/* Global Controls */}
            <div className="flex items-center gap-3.5">
              {/* Color Palettes Accent selector */}
              <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-1.5">
                <Palette className="w-4 h-4 text-zinc-500" />
                <div className="flex gap-1">
                  {["violet", "indigo", "emerald", "rose", "amber", "sky"].map((col) => (
                    <button
                      key={col}
                      onClick={() => setPrimaryColor(col)}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        primaryColor === col ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{
                        backgroundColor:
                          col === "violet"
                            ? "rgb(139, 92, 246)"
                            : col === "indigo"
                            ? "rgb(99, 102, 241)"
                            : col === "emerald"
                            ? "rgb(16, 185, 129)"
                            : col === "rose"
                            ? "rgb(244, 63, 94)"
                            : col === "amber"
                            ? "rgb(245, 158, 11)"
                            : "rgb(14, 165, 233)",
                      }}
                      title={`Accent: ${col}`}
                    />
                  ))}
                </div>
              </div>

              {/* Model indicator status */}
              <div className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${settings.selectedModel === "mock" ? "bg-amber-400" : "bg-emerald-400"}`} />
                <span className="font-mono text-zinc-400 uppercase text-[10px] font-semibold">
                  Mode: {settings.selectedModel}
                </span>
              </div>

              {/* Settings button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Configure API Keys"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* 2. MAIN SPLIT SCREEN PANEL CONTENT */}
          <main className="flex-1 flex overflow-hidden">
            {/* Left Side: Editor Sidebar Navigation and Dashboard Form Panels */}
            <div className="no-print w-[46%] border-r border-zinc-800/80 flex bg-zinc-950/30 overflow-hidden">
              {/* Vertical Navigation Bar */}
              <div className="w-16 border-r border-zinc-900 flex flex-col items-center py-4 justify-between bg-zinc-950/60 shrink-0">
                <div className="space-y-4 flex flex-col items-center w-full">
                  <button
                    onClick={() => setCurrentView("landing")}
                    className="p-3 rounded-xl transition-all text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    title="Go to Home Page"
                  >
                    <Home className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveTab("editor")}
                    className={`p-3 rounded-xl transition-all ${
                      activeTab === "editor" ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    title="Editor Panels"
                  >
                    <Layout className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`p-3 rounded-xl transition-all ${
                      activeTab === "history" ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    title="Version Control"
                  >
                    <Layers className="w-5 h-5" />
                  </button>

                  <div className="h-[1px] w-8 bg-zinc-800 my-2 text-center" />

                  <button
                    onClick={() => setCurrentView("parser")}
                    className="p-3 rounded-xl transition-all text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    title="Open AI Resume Parser"
                  >
                    <Upload className="w-5 h-5 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => setCurrentView("optimizer")}
                    className="p-3 rounded-xl transition-all text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    title="Open AI Optimization Center"
                  >
                    <Gauge className="w-5 h-5 text-violet-400" />
                  </button>
                  <button
                    onClick={() => setCurrentView("cover-letter")}
                    className="p-3 rounded-xl transition-all text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    title="Open AI Cover Letter Suite"
                  >
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => setCurrentView("portfolio")}
                    className="p-3 rounded-xl transition-all text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    title="Open AI Developer Portfolio Builder"
                  >
                    <Globe className="w-5 h-5 text-sky-400" />
                  </button>
                </div>

                <div className="space-y-3 flex flex-col items-center">
                  {/* Empty spacer */}
                </div>
              </div>

          {/* Active Navigation Panel Drawer */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {activeTab === "editor" && (
              <ResumeForm
                data={resumeData}
                onChange={updateResumeData}
                isCV={isCV}
                setIsCV={setIsCV}
                selectedModel={settings.selectedModel}
                apiKey={settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey}
              />
            )}

            {activeTab === "tailor" && (
              <TailorPanel
                resumeData={resumeData}
                onApplyTailored={updateResumeData}
                selectedModel={settings.selectedModel}
                apiKey={settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey}
                primaryColor={primaryColor}
                isCV={isCV}
                templateId={activeTemplate}
              />
            )}

            {activeTab === "history" && (
              <VersionManager
                currentData={resumeData}
                versions={versions}
                onSaveVersion={handleSaveVersion}
                onRestoreVersion={handleRestoreVersion}
                onDeleteVersion={handleDeleteVersion}
                primaryColor={primaryColor}
                isCV={isCV}
                templateId={activeTemplate}
              />
            )}

            {activeTab === "optimization" && (
              <OptimizationCenter
                currentResume={resumeData}
                onApplyOptimized={updateResumeData}
                selectedModel={settings.selectedModel}
                apiKey={settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey}
                primaryColor={primaryColor}
                isCV={isCV}
                templateId={activeTemplate}
                initialActiveTab={optSubTab}
              />
            )}

            {activeTab === "parse" && (
              <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 space-y-5 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <Upload className="w-5 h-5 text-violet-400" />
                  <h3 className="font-display font-semibold text-sm text-zinc-200">AI RESUME PARSER</h3>
                </div>

                {/* Upload Section */}
                <div className="border-2 border-dashed border-zinc-800 bg-zinc-900/10 rounded-xl p-6 text-center hover:border-violet-550/40 transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <FileDown className="w-10 h-10 text-zinc-650" />
                    <p className="text-xs font-semibold text-zinc-300">Drag or Upload PDF / Plain Text resume</p>
                    <p className="text-[10px] text-zinc-500">AI extracts personal parameters & experience blocks automatically</p>
                  </div>
                </div>

                {/* Plain Text Paste Section */}
                <div className="space-y-2.5 pt-3">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Import className="w-3.5 h-3.5" />
                    LinkedIn Profile or Plain Text Import
                  </label>
                  <textarea
                    value={rawTextImport}
                    onChange={(e) => setRawTextImport(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 h-32 resize-none font-sans focus:outline-none focus:border-violet-500"
                    placeholder="Paste parsed LinkedIn PDF text export or standard clipboard resume content..."
                  />
                  <button
                    onClick={handleRawTextSubmit}
                    disabled={isParsing || !rawTextImport.trim()}
                    className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40 rounded-lg text-xs font-bold transition-all"
                  >
                    {isParsing ? "Rebuilding JSON Schema..." : "Parse Text Resume"}
                  </button>
                </div>

                {/* Loading indicator */}
                {isParsing && (
                  <div className="bg-zinc-900/50 border border-zinc-850 p-4 rounded-xl flex items-center gap-3">
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-t-violet-400 border-r-transparent rounded-full" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-300">Document Processing In Progress...</p>
                      <p className="text-[10px] text-zinc-500">Consulting AI LLM endpoints for structural parameter mappings.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Template Preview Area */}
        <div className="flex-1 bg-zinc-900/10 flex flex-col overflow-hidden relative">
          {/* Preview Panel Top Toolbar */}
          <div className="no-print bg-[#070709]/60 border-b border-zinc-800/80 p-3 px-6 flex items-center justify-between shrink-0">
            {/* Template Selector dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-semibold font-display">Template:</span>
              <select
                value={activeTemplate}
                onChange={(e) => setActiveTemplate(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-violet-500"
              >
                <option value="modern">Modern Layout</option>
                <option value="professional">Professional (Serif)</option>
                <option value="ats-friendly">ATS-Scannable</option>
                <option value="minimal">Minimal Single Column</option>
                <option value="executive">Executive Classic</option>
                <option value="software-engineer">Software Engineer (Monospace)</option>
                <option value="designer">Designer Premium (Light)</option>
              </select>
            </div>

            {/* Export options */}
            <div className="flex items-center gap-2">
              {/* Cover Letter Option */}
              <button
                onClick={() => setCurrentView("cover-letter")}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Generate Cover Letter"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Cover Letter
              </button>

              {/* Convert to CV Option */}
              <button
                onClick={handleAIConvertToCV}
                disabled={isConvertingCV}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40"
                title="Convert to Academic CV using AI"
              >
                {isConvertingCV ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-t-violet-400 border-r-transparent rounded-full" />
                    Converting...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                    Convert to CV (AI)
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-zinc-850 mx-1" />

              {/* Export PDF via standard Window Print dialog */}
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                title="Print PDF File"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>

              {/* Export DOCX */}
              <button
                onClick={handleExportDOCX}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Download DOCX File"
              >
                <FileText className="w-3.5 h-3.5" />
                DOCX
              </button>

              {/* Export TXT */}
              <button
                onClick={handleExportTXT}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Download TXT file"
              >
                <FileDown className="w-3.5 h-3.5" />
                TXT
              </button>
            </div>
          </div>

          {/* Actual Scrollable Sheet Display Frame */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-zinc-900/20 scrollbar-thin">
            <div className="w-full max-w-[210mm] shadow-2xl rounded-xl h-fit">
              <ResumeTemplates
                data={resumeData}
                primaryColor={primaryColor}
                isCV={isCV}
                templateId={activeTemplate}
              />
            </div>
          </div>
        </div>
      </main>
        </>
      )}

      {/* 3. SETTINGS MODAL OVERLAY */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-zinc-900 border-b border-zinc-850 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-white">AI Engine Configuration Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold p-1 hover:bg-zinc-800 rounded"
              >
                Close
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Select Active AI Provider</label>
                <select
                  value={settings.selectedModel}
                  onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="gemini">Google Gemini AI (Bypass Environment Key)</option>
                  <option value="openai">OpenAI GPT-4o-mini</option>
                  <option value="mock">Local High-Fidelity Mock Engine (Free)</option>
                </select>
              </div>

              {settings.selectedModel === "gemini" && (
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-medium">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={settings.geminiApiKey}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
                    placeholder="AIzaSy..."
                  />
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Entered key is cached in browser LocalStorage. Get a free key at{" "}
                    <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">
                      Google AI Studio
                    </a>.
                  </p>
                </div>
              )}

              {settings.selectedModel === "openai" && (
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-medium">OpenAI API Key</label>
                  <input
                    type="password"
                    value={settings.openAiApiKey}
                    onChange={(e) => setSettings({ ...settings, openAiApiKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
                    placeholder="sk-proj-..."
                  />
                </div>
              )}

              <button
                onClick={() => handleSaveSettings(settings)}
                className="w-full py-2.5 bg-violet-650 hover:bg-violet-755 text-white font-bold rounded-lg transition-colors shadow-md"
              >
                Save Configurations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CAREER ASSISTANT PANEL DRAWERS */}
      <CareerAssistant
        resumeData={resumeData}
        selectedModel={settings.selectedModel}
        apiKey={settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey}
      />

      {/* 5. COVER LETTER MODAL */}
      <CoverLetterModal
        isOpen={showCoverLetter}
        onClose={() => setShowCoverLetter(false)}
        resumeData={resumeData}
        selectedModel={settings.selectedModel}
        apiKey={settings.selectedModel === "gemini" ? settings.geminiApiKey : settings.openAiApiKey}
      />

      {/* 6. PORTFOLIO MODAL */}
      <PortfolioPreview
        isOpen={showPortfolio}
        onClose={() => setShowPortfolio(false)}
        resumeData={resumeData}
      />

      {/* 7. GLOBAL FOOTER */}
      {currentView !== "landing" && <Footer />}
    </div>
  );
}
