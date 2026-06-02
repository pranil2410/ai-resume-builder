import React, { useState } from "react";
import { ResumeData, Experience, Education, Project, Skill, Certification, Achievement, Publication, ResearchExperience, TeachingExperience, Patent } from "../types/resume";
import { AIService } from "../services/ai";
import { Sparkles, Plus, Trash2, ArrowRight, BookOpen, Briefcase, GraduationCap, Code, Award, CheckSquare, Layers, HelpCircle, FileText } from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  isCV: boolean;
  setIsCV: (cv: boolean) => void;
  selectedModel: "gemini" | "openai" | "mock";
  apiKey: string;
}

type TabType = "personal" | "experience" | "education" | "projects" | "skills" | "certifications" | "cv";

export const ResumeForm: React.FC<ResumeFormProps> = ({
  data,
  onChange,
  isCV,
  setIsCV,
  selectedModel,
  apiKey,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [rewritingId, setRewritingId] = useState<string | null>(null);

  // Helper updater for Personal Info
  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  // Helper generic list updaters
  const updateListField = <K extends keyof ResumeData>(
    listKey: K,
    id: string,
    field: string,
    value: any
  ) => {
    const list = (data[listKey] as any[]) || [];
    const updatedList = list.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, [listKey]: updatedList });
  };

  const addListItem = <K extends keyof ResumeData>(listKey: K, defaultItem: any) => {
    const list = (data[listKey] as any[]) || [];
    onChange({ ...data, [listKey]: [...list, { ...defaultItem, id: `${listKey}-${Date.now()}` }] });
  };

  const removeListItem = <K extends keyof ResumeData>(listKey: K, id: string) => {
    const list = (data[listKey] as any[]) || [];
    onChange({ ...data, [listKey]: list.filter((item) => item.id !== id) });
  };

  // AI Rewrite Handler
  const handleRewrite = async (expId: string, currentText: string, isExperience: boolean = true) => {
    if (!currentText.trim()) return;
    setRewritingId(expId);
    try {
      // If it's experience, optimize line by line or as a whole block
      const rewritten = await AIService.rewriteBulletPoint(currentText, {
        apiKey,
        provider: selectedModel,
      });
      if (isExperience) {
        updateListField("experience", expId, "description", rewritten);
      } else {
        updateListField("projects", expId, "description", rewritten);
      }
    } catch (err) {
      console.error(err);
      alert("AI rewrite failed. Please check your API key in the settings panel.");
    } finally {
      setRewritingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
      {/* CV Toggle header */}
      <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-400" />
          <span className="font-display font-semibold text-sm tracking-wide text-zinc-200">RESUME BUILDER EDITOR</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 font-medium">Academic CV Mode</label>
          <button
            onClick={() => {
              const nextVal = !isCV;
              setIsCV(nextVal);
              if (nextVal) {
                // Initialize academic fields if they don't exist
                onChange({
                  ...data,
                  publications: data.publications || [],
                  research: data.research || [],
                  teaching: data.teaching || [],
                  patents: data.patents || [],
                  awards: data.awards || [],
                  conferences: data.conferences || [],
                });
                setActiveTab("cv");
              } else {
                setActiveTab("personal");
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isCV ? "bg-violet-600" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isCV ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto bg-zinc-900/60 border-b border-zinc-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "personal"
              ? "border-violet-500 text-violet-400 bg-zinc-900/40"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Info
        </button>
        <button
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "experience"
              ? "border-violet-500 text-violet-400 bg-zinc-900/40"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> Experience
        </button>
        <button
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "education"
              ? "border-violet-500 text-violet-400 bg-zinc-900/40"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> Education
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "projects"
              ? "border-violet-500 text-violet-400 bg-zinc-900/40"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Projects
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "skills"
              ? "border-violet-500 text-violet-400 bg-zinc-900/40"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Skills
        </button>
        <button
          onClick={() => setActiveTab("certifications")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "certifications"
              ? "border-violet-500 text-violet-400 bg-zinc-900/40"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Certs & Awards
        </button>
        {isCV && (
          <button
            onClick={() => setActiveTab("cv")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap bg-violet-950/20 text-violet-300 transition-all ${
              activeTab === "cv"
                ? "border-violet-500 text-violet-400 bg-violet-950/40"
                : "border-transparent hover:text-violet-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Academic CV
          </button>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
        {/* PERSONAL INFO */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-300">Personal Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Target Professional Title</label>
                <input
                  type="text"
                  value={data.personalInfo.title}
                  onChange={(e) => updatePersonalInfo("title", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={data.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  placeholder="+1 (555) 019-2834"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Location (City, State/Country)</label>
                <input
                  type="text"
                  value={data.personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  placeholder="New York, NY"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Website URL</label>
                <input
                  type="text"
                  value={data.personalInfo.website}
                  onChange={(e) => updatePersonalInfo("website", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  placeholder="https://johndoe.dev"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">LinkedIn Profile Handle</label>
                <input
                  type="text"
                  value={data.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Professional Summary</label>
                <textarea
                  value={data.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 h-28 resize-none"
                  placeholder="Brief pitch highlighting key experiences, technical skills, and career goals..."
                />
              </div>
            </div>
          </div>
        )}

        {/* WORK EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-300 font-display">Work History</h3>
              <button
                onClick={() =>
                  addListItem("experience", {
                    company: "",
                    position: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    current: false,
                    description: "",
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {data.experience.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-6">No experience added yet. Click above to add.</p>
            ) : (
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3 relative group">
                    <button
                      onClick={() => removeListItem("experience", exp.id)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h4 className="text-xs font-bold text-violet-400">Position #{index + 1}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateListField("experience", exp.id, "company", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Google"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Job Title</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateListField("experience", exp.id, "position", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateListField("experience", exp.id, "location", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Mountain View, CA"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-0.5">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateListField("experience", exp.id, "startDate", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                            placeholder="2021-08"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-0.5">End Date</label>
                          <input
                            type="text"
                            disabled={exp.current}
                            value={exp.current ? "" : exp.endDate}
                            onChange={(e) => updateListField("experience", exp.id, "endDate", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 disabled:opacity-40"
                            placeholder="2024-05"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateListField("experience", exp.id, "current", e.target.checked)}
                          className="rounded border-zinc-800 bg-zinc-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-zinc-900"
                        />
                        <label htmlFor={`current-${exp.id}`} className="text-xs text-zinc-400">I currently work here</label>
                      </div>
                      <div className="sm:col-span-2 relative">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] text-zinc-400">Description (One bullet per line)</label>
                          <button
                            onClick={() => handleRewrite(exp.id, exp.description, true)}
                            disabled={rewritingId !== null || !exp.description}
                            className="flex items-center gap-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-40"
                          >
                            {rewritingId === exp.id ? (
                              <span className="flex items-center gap-1">
                                <span className="animate-spin inline-block w-2.5 h-2.5 border-t border-r border-violet-400 rounded-full" />
                                Rewriting...
                              </span>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
                                AI Professional Optimize
                              </>
                            )}
                          </button>
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateListField("experience", exp.id, "description", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 h-24 resize-none font-sans"
                          placeholder="- Developed high-performance code interface improving page speed by 25%&#10;- Led a team of four to launch server gateways"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDUCATION */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-300">Academic Background</h3>
              <button
                onClick={() =>
                  addListItem("education", {
                    school: "",
                    degree: "",
                    fieldOfStudy: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    gpa: "",
                    description: "",
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add School
              </button>
            </div>

            {data.education.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-6">No education entries added yet.</p>
            ) : (
              <div className="space-y-5">
                {data.education.map((edu, index) => (
                  <div key={edu.id} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3 relative">
                    <button
                      onClick={() => removeListItem("education", edu.id)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h4 className="text-xs font-bold text-violet-400">School #{index + 1}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">School Name</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateListField("education", edu.id, "school", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Stanford University"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateListField("education", edu.id, "degree", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateListField("education", edu.id, "fieldOfStudy", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-0.5">GPA</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateListField("education", edu.id, "gpa", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                            placeholder="3.8"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-0.5">Location</label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) => updateListField("education", edu.id, "location", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                            placeholder="Stanford, CA"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateListField("education", edu.id, "startDate", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="2017-09"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => updateListField("education", edu.id, "endDate", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="2021-06"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Academic Achievements / Notes</label>
                        <textarea
                          value={edu.description}
                          onChange={(e) => updateListField("education", edu.id, "description", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 h-16 resize-none"
                          placeholder="Honors list, thesis details, notable organizations..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-300">Technical Projects</h3>
              <button
                onClick={() =>
                  addListItem("projects", {
                    name: "",
                    description: "",
                    technologies: [],
                    githubUrl: "",
                    liveUrl: "",
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {data.projects.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-6">No projects added yet.</p>
            ) : (
              <div className="space-y-5">
                {data.projects.map((proj, index) => (
                  <div key={proj.id} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3 relative">
                    <button
                      onClick={() => removeListItem("projects", proj.id)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h4 className="text-xs font-bold text-violet-400">Project #{index + 1}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateListField("projects", proj.id, "name", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="DevSphere"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Technologies (comma separated)</label>
                        <input
                          type="text"
                          value={proj.technologies ? proj.technologies.join(", ") : ""}
                          onChange={(e) =>
                            updateListField(
                              "projects",
                              proj.id,
                              "technologies",
                              e.target.value.split(",").map((tech) => tech.trim()).filter(Boolean)
                            )
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="React, AWS, Node.js"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">GitHub Repository Link</label>
                        <input
                          type="text"
                          value={proj.githubUrl || ""}
                          onChange={(e) => updateListField("projects", proj.id, "githubUrl", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="https://github.com/user/project"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">Live Demo Link</label>
                        <input
                          type="text"
                          value={proj.liveUrl || ""}
                          onChange={(e) => updateListField("projects", proj.id, "liveUrl", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="https://project.com"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] text-zinc-400">Description</label>
                          <button
                            onClick={() => handleRewrite(proj.id, proj.description, false)}
                            disabled={rewritingId !== null || !proj.description}
                            className="flex items-center gap-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-40"
                          >
                            {rewritingId === proj.id ? "Rewriting..." : "AI Optimize Description"}
                          </button>
                        </div>
                        <textarea
                          value={proj.description}
                          onChange={(e) => updateListField("projects", proj.id, "description", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 h-20 resize-none"
                          placeholder="Provide details about the project scope, technical architectural stack and outcomes..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-300">Technical Expertise</h3>
              <button
                onClick={() =>
                  addListItem("skills", {
                    name: "",
                    level: "Advanced",
                    category: "General",
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            {data.skills.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-6">No skills added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex-1 space-y-1.5">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateListField("skills", skill.id, "name", e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Skill Name (e.g. React)"
                        />
                        <input
                          type="text"
                          value={skill.category}
                          onChange={(e) => updateListField("skills", skill.id, "category", e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="Category (e.g. Frontend)"
                        />
                      </div>
                      <select
                        value={skill.level}
                        onChange={(e) => updateListField("skills", skill.id, "level", e.target.value as any)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-[10px] text-zinc-300 w-full focus:outline-none focus:border-violet-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeListItem("skills", skill.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATIONS & ACHIEVEMENTS */}
        {activeTab === "certifications" && (
          <div className="space-y-6">
            {/* Certs */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold tracking-wide text-zinc-300">Certifications</h3>
                <button
                  onClick={() =>
                    addListItem("certifications", {
                      name: "",
                      issuer: "",
                      date: "",
                      url: "",
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Cert
                </button>
              </div>

              {data.certifications.length === 0 ? (
                <p className="text-xs text-zinc-500 italic text-center py-4">No certifications added yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.certifications.map((c) => (
                    <div key={c.id} className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 relative">
                      <button
                        onClick={() => removeListItem("certifications", c.id)}
                        className="absolute top-2 right-2 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] text-zinc-500">Name</label>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => updateListField("certifications", c.id, "name", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none"
                          placeholder="AWS Certified Solutions Architect"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-zinc-500">Issuer</label>
                        <input
                          type="text"
                          value={c.issuer}
                          onChange={(e) => updateListField("certifications", c.id, "issuer", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none"
                          placeholder="Amazon Web Services"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-zinc-500">Date Issued</label>
                        <input
                          type="text"
                          value={c.date}
                          onChange={(e) => updateListField("certifications", c.id, "date", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none"
                          placeholder="2023-04"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold tracking-wide text-zinc-300">Achievements</h3>
                <button
                  onClick={() =>
                    addListItem("achievements", {
                      title: "",
                      description: "",
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Achievement
                </button>
              </div>

              {data.achievements.length === 0 ? (
                <p className="text-xs text-zinc-500 italic text-center py-4">No achievements added yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.achievements.map((ach) => (
                    <div key={ach.id} className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl relative space-y-2">
                      <button
                        onClick={() => removeListItem("achievements", ach.id)}
                        className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <label className="block text-[9px] text-zinc-500">Title</label>
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => updateListField("achievements", ach.id, "title", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none"
                          placeholder="Hackathon Winner"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-zinc-500">Description</label>
                        <input
                          type="text"
                          value={ach.description}
                          onChange={(e) => updateListField("achievements", ach.id, "description", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-200 focus:outline-none"
                          placeholder="Won 1st place among 50 competing engineering groups..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACADEMIC CV SECTION */}
        {isCV && activeTab === "cv" && (
          <div className="space-y-6">
            {/* Publications */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Publications & Articles</h4>
                <button
                  onClick={() =>
                    addListItem("publications", {
                      title: "",
                      authors: "",
                      journalOrPublisher: "",
                      date: "",
                      url: "",
                      description: "",
                    })
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600/40 hover:bg-violet-600 text-white rounded text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Add Publication
                </button>
              </div>
              {data.publications && data.publications.map((pub) => (
                <div key={pub.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-lg space-y-2 relative">
                  <button
                    onClick={() => removeListItem("publications", pub.id)}
                    className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={pub.title}
                      onChange={(e) => updateListField("publications", pub.id, "title", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Authors (e.g. A. Smith, R. Johnson)"
                      value={pub.authors}
                      onChange={(e) => updateListField("publications", pub.id, "authors", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Journal / Conference Name"
                      value={pub.journalOrPublisher}
                      onChange={(e) => updateListField("publications", pub.id, "journalOrPublisher", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="Date (e.g. 2024-05)"
                        value={pub.date}
                        onChange={(e) => updateListField("publications", pub.id, "date", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        value={pub.url || ""}
                        onChange={(e) => updateListField("publications", pub.id, "url", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Research */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Research Experience</h4>
                <button
                  onClick={() =>
                    addListItem("research", {
                      title: "",
                      institution: "",
                      role: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      description: "",
                    })
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600/40 hover:bg-violet-600 text-white rounded text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Add Research
                </button>
              </div>
              {data.research && data.research.map((res) => (
                <div key={res.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-lg space-y-2 relative">
                  <button
                    onClick={() => removeListItem("research", res.id)}
                    className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Role (e.g. Research Assistant)"
                      value={res.role}
                      onChange={(e) => updateListField("research", res.id, "role", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={res.institution}
                      onChange={(e) => updateListField("research", res.id, "institution", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Research Topic / Lab Title"
                      value={res.title}
                      onChange={(e) => updateListField("research", res.id, "title", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={res.startDate}
                        onChange={(e) => updateListField("research", res.id, "startDate", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={res.endDate}
                        onChange={(e) => updateListField("research", res.id, "endDate", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <textarea
                        placeholder="Research outcomes, methodologies, publication linkages..."
                        value={res.description}
                        onChange={(e) => updateListField("research", res.id, "description", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 w-full h-16 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Teaching */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Teaching Experience</h4>
                <button
                  onClick={() =>
                    addListItem("teaching", {
                      course: "",
                      institution: "",
                      role: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                    })
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600/40 hover:bg-violet-600 text-white rounded text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Add Teaching
                </button>
              </div>
              {data.teaching && data.teaching.map((teach) => (
                <div key={teach.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-lg space-y-2 relative">
                  <button
                    onClick={() => removeListItem("teaching", teach.id)}
                    className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Course Name (e.g. CS 101)"
                      value={teach.course}
                      onChange={(e) => updateListField("teaching", teach.id, "course", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Teaching Assistant)"
                      value={teach.role}
                      onChange={(e) => updateListField("teaching", teach.id, "role", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={teach.institution}
                      onChange={(e) => updateListField("teaching", teach.id, "institution", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={teach.startDate}
                        onChange={(e) => updateListField("teaching", teach.id, "startDate", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={teach.endDate}
                        onChange={(e) => updateListField("teaching", teach.id, "endDate", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <textarea
                        placeholder="Responsibilities, course size, grades managed..."
                        value={teach.description}
                        onChange={(e) => updateListField("teaching", teach.id, "description", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 w-full h-16 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Patents */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Patents & Inventions</h4>
                <button
                  onClick={() =>
                    addListItem("patents", {
                      title: "",
                      number: "",
                      date: "",
                      url: "",
                      description: "",
                    })
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600/40 hover:bg-violet-600 text-white rounded text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Add Patent
                </button>
              </div>
              {data.patents && data.patents.map((pat) => (
                <div key={pat.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-lg space-y-2 relative">
                  <button
                    onClick={() => removeListItem("patents", pat.id)}
                    className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Patent Title"
                      value={pat.title}
                      onChange={(e) => updateListField("patents", pat.id, "title", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Patent Number (e.g. US-12345)"
                      value={pat.number}
                      onChange={(e) => updateListField("patents", pat.id, "number", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Date Filed / Approved"
                      value={pat.date}
                      onChange={(e) => updateListField("patents", pat.id, "date", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Patent URL"
                      value={pat.url || ""}
                      onChange={(e) => updateListField("patents", pat.id, "url", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                    />
                    <div className="sm:col-span-2">
                      <textarea
                        placeholder="Brief patent abstract details..."
                        value={pat.description}
                        onChange={(e) => updateListField("patents", pat.id, "description", e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 w-full h-16 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
