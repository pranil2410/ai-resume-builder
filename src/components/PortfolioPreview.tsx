import React, { useState } from "react";
import { ResumeData } from "../types/resume";
import { X, Globe, Download, Copy, Check, Terminal, ExternalLink, Sparkles, Send } from "lucide-react";
import confetti from "canvas-confetti";

interface PortfolioPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  isOpen,
  onClose,
  resumeData,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!isOpen) return null;

  const { personalInfo, education, experience, projects, skills } = resumeData;

  // Generate self-contained single file portfolio website HTML code
  const generatePortfolioHTML = (): string => {
    const name = personalInfo.fullName || "Jane Doe";
    const title = personalInfo.title || "Full Stack Developer";
    const summary = personalInfo.summary || "Creative engineer building responsive web layouts.";
    const email = personalInfo.email || "hello@example.com";
    const phone = personalInfo.phone || "";
    const location = personalInfo.location || "";
    const linkedin = personalInfo.linkedin || "";
    const website = personalInfo.website || "";

    const skillsGrouped = Array.from(new Set(skills.map(s => s.category || "General")));

    const projectsHtml = projects.map(p => `
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-violet-500/40 transition-all duration-300 group">
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-lg text-white group-hover:text-violet-400 transition-colors">${p.name}</h3>
            <div class="flex gap-2">
              ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="text-zinc-400 hover:text-white"><i class="fab fa-github"></i></a>` : ""}
              ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="text-zinc-400 hover:text-white"><i class="fas fa-external-link-alt"></i></a>` : ""}
            </div>
          </div>
          <p class="text-zinc-400 text-sm mt-3 leading-relaxed">${p.description}</p>
          <div class="flex flex-wrap gap-1.5 mt-4">
            ${p.technologies ? p.technologies.map(t => `<span class="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 font-semibold rounded">${t}</span>`).join("") : ""}
          </div>
        </div>
    `).join("");

    const experienceHtml = experience.map(exp => `
        <div class="relative pl-6 border-l border-zinc-800 py-2">
          <div class="absolute -left-[5px] top-4 w-2.5 h-2.5 bg-violet-500 rounded-full"></div>
          <div class="flex flex-wrap justify-between items-baseline gap-2">
            <h3 class="font-bold text-white text-base">${exp.position}</h3>
            <span class="text-xs text-zinc-500 font-mono">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
          </div>
          <p class="text-sm font-semibold text-violet-400 mt-1">${exp.company} <span class="text-zinc-500 font-normal">• ${exp.location}</span></p>
          <ul class="list-disc pl-4 space-y-1.5 text-xs text-zinc-400 mt-3 leading-relaxed">
            ${exp.description ? exp.description.split("\n").map(b => `<li>${b.replace(/^[-*•\s]+/, "")}</li>`).join("") : ""}
          </ul>
        </div>
    `).join("");

    const skillsHtml = skillsGrouped.map(cat => `
        <div class="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl">
          <h3 class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">${cat}</h3>
          <div class="flex flex-wrap gap-2">
            ${skills.filter(s => (s.category || "General") === cat).map(s => `
              <span class="px-3 py-1 bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white hover:border-violet-500/20 rounded-lg text-xs font-medium transition-colors">
                ${s.name}
              </span>
            `).join("")}
          </div>
        </div>
    `).join("");

    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #070709;
      font-family: 'Inter', sans-serif;
    }
    .font-display {
      font-family: 'Outfit', sans-serif;
    }
  </style>
</head>
<body class="text-zinc-350 min-h-screen">
  <!-- Navbar -->
  <nav class="sticky top-0 z-50 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-900">
    <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#" class="font-display font-extrabold text-white text-lg tracking-tight hover:text-violet-400 transition-colors">${name.toUpperCase()}</a>
      <div class="flex items-center gap-6 text-sm font-semibold">
        <a href="#about" class="hover:text-white transition-colors">About</a>
        <a href="#skills" class="hover:text-white transition-colors">Skills</a>
        <a href="#projects" class="hover:text-white transition-colors">Projects</a>
        <a href="#experience" class="hover:text-white transition-colors">Experience</a>
        <a href="#contact" class="px-4 py-1.5 bg-violet-600 hover:bg-violet-750 text-white rounded-lg transition-all">Contact</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section id="about" class="py-20 max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
    <div class="md:col-span-2 space-y-6">
      <span class="px-3 py-1 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-bold uppercase tracking-wider">Available for Opportunities</span>
      <h1 class="text-5xl md:text-6xl font-extrabold text-white font-display leading-tight">Hi, I'm <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">${name}</span></h1>
      <p class="text-lg font-medium text-violet-400/80 font-display">${title}</p>
      <p class="text-zinc-400 leading-relaxed max-w-xl">${summary}</p>
      
      <div class="flex gap-4 pt-4">
        <a href="#contact" class="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-violet-950/20">Get In Touch</a>
        <a href="#projects" class="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-200 rounded-lg font-semibold text-sm transition-all">View Projects</a>
      </div>
    </div>
    <div class="md:col-span-1 flex justify-center">
      <div class="w-64 h-64 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-1 shadow-2xl relative overflow-hidden group">
        <div class="w-full h-full bg-zinc-950 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
          <i class="fas fa-laptop-code text-5xl text-violet-400 mb-4"></i>
          <h2 class="font-display font-bold text-white text-lg">${name}</h2>
          <p class="text-xs text-zinc-500 mt-1">${location}</p>
          <div class="flex gap-3 mt-4 text-zinc-400 text-sm">
            ${linkedin ? `<a href="https://${linkedin}" target="_blank" class="hover:text-white"><i class="fab fa-linkedin"></i></a>` : ""}
            ${website ? `<a href="${website}" target="_blank" class="hover:text-white"><i class="fas fa-globe"></i></a>` : ""}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Skills Section -->
  <section id="skills" class="py-20 border-t border-zinc-900">
    <div class="max-w-5xl mx-auto px-6">
      <h2 class="text-xs uppercase font-extrabold tracking-widest text-violet-400 mb-2">Capabilities</h2>
      <h3 class="text-3xl font-extrabold text-white font-display mb-10">Technical Skillset</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${skillsHtml}
      </div>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="py-20 border-t border-zinc-900">
    <div class="max-w-5xl mx-auto px-6">
      <h2 class="text-xs uppercase font-extrabold tracking-widest text-violet-400 mb-2">Showcase</h2>
      <h3 class="text-3xl font-extrabold text-white font-display mb-10">Recent Projects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${projectsHtml}
      </div>
    </div>
  </section>

  <!-- Experience Section -->
  <section id="experience" class="py-20 border-t border-zinc-900">
    <div class="max-w-5xl mx-auto px-6">
      <h2 class="text-xs uppercase font-extrabold tracking-widest text-violet-400 mb-2">History</h2>
      <h3 class="text-3xl font-extrabold text-white font-display mb-10">Work Experience</h3>
      <div class="space-y-8 max-w-3xl">
        ${experienceHtml}
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="py-20 border-t border-zinc-900 bg-zinc-950/30">
    <div class="max-w-5xl mx-auto px-6">
      <h2 class="text-xs uppercase font-extrabold tracking-widest text-violet-400 mb-2">Connect</h2>
      <h3 class="text-3xl font-extrabold text-white font-display mb-10">Start a Conversation</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="space-y-6">
          <p class="text-zinc-400 leading-relaxed">
            Interested in collaborating or discussing an upcoming project? Feel free to reach out via the contact form or using the details below.
          </p>
          <div class="space-y-3 font-medium">
            <div class="flex items-center gap-3"><i class="fas fa-envelope text-violet-400 w-5"></i> <span class="text-sm">${email}</span></div>
            ${phone ? `<div class="flex items-center gap-3"><i class="fas fa-phone text-violet-400 w-5"></i> <span class="text-sm">${phone}</span></div>` : ""}
            ${location ? `<div class="flex items-center gap-3"><i class="fas fa-map-marker-alt text-violet-400 w-5"></i> <span class="text-sm">${location}</span></div>` : ""}
          </div>
        </div>
        
        <form class="space-y-4" onsubmit="event.preventDefault(); alert('Message sent successfully!'); this.reset();">
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Your Name</label>
            <input type="text" required class="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500">
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Your Email</label>
            <input type="email" required class="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500">
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Message</label>
            <textarea required rows="4" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 resize-none"></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg text-sm font-semibold transition-all">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 border-t border-zinc-900 bg-zinc-950 text-center text-xs text-zinc-500">
    <p>&copy; 2026 ${name}. All rights reserved. Created with AI Resume & Portfolio Builder.</p>
  </footer>
</body>
</html>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatePortfolioHTML());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    const htmlContent = generatePortfolioHTML();
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${personalInfo.fullName.replace(/\s+/g, "_")}_portfolio.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-violet-600/10 flex items-center justify-center border border-violet-500/20">
              <Globe className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">AI Personal Portfolio Website Generator</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Converts your resume details instantly into an interactive web portal.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? "Copied HTML!" : "Copy Code"}
            </button>
            <button
              onClick={handleDownloadCode}
              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-950/20"
            >
              <Download className="w-3.5 h-3.5" />
              Download HTML Page
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-1.5 bg-zinc-800/80 rounded-lg ml-2"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Inner layout split - Preview / Code */}
        <div className="flex-1 flex overflow-hidden">
          {/* Live Preview Container (Simulating browser) */}
          <div className="flex-1 flex flex-col bg-[#070709] overflow-hidden relative">
            <div className="bg-zinc-900 border-b border-zinc-850 p-2.5 flex items-center gap-2 text-xs text-zinc-400">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-0.5 w-full max-w-md truncate mx-auto font-mono text-[10px] text-zinc-500 select-none">
                https://portfolio-preview.local/${personalInfo.fullName.toLowerCase().replace(/\s+/g, "-")}
              </div>
            </div>

            {/* Simulated Website Frame */}
            <div className="flex-1 overflow-y-auto font-sans relative bg-[#070709] text-zinc-350">
              {/* Navbar */}
              <div className="sticky top-0 bg-[#070709]/80 backdrop-blur-md border-b border-zinc-900/60 h-14 flex items-center justify-between px-6 z-10">
                <span className="font-display font-extrabold text-white text-sm tracking-tight">{personalInfo.fullName.toUpperCase() || "JANE DOE"}</span>
                <div className="flex gap-4 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  <a href="#sim-about" className="hover:text-white">About</a>
                  <a href="#sim-skills" className="hover:text-white">Skills</a>
                  <a href="#sim-projects" className="hover:text-white">Projects</a>
                  <a href="#sim-experience" className="hover:text-white">Experience</a>
                </div>
              </div>

              {/* Hero */}
              <div id="sim-about" className="py-14 px-6 max-w-3xl mx-auto space-y-4">
                <span className="px-2 py-0.5 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Active Portfolio</span>
                <h1 className="text-4xl font-extrabold text-white font-display">Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{personalInfo.fullName || "Jane Doe"}</span></h1>
                <p className="text-sm font-semibold text-violet-400 font-display">{personalInfo.title || "Full Stack Architect"}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{personalInfo.summary}</p>
              </div>

              {/* Skills */}
              <div id="sim-skills" className="py-10 px-6 max-w-3xl mx-auto border-t border-zinc-900">
                <h2 className="text-[10px] uppercase font-extrabold tracking-widest text-violet-400 mb-6">Expertise</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from(new Set(skills.map(s => s.category || "General"))).map(cat => (
                    <div key={cat} className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-3 border-b border-zinc-800 pb-1">{cat}</p>
                      <div className="flex flex-wrap gap-1">
                        {skills.filter(s => (s.category || "General") === cat).map(s => (
                          <span key={s.id} className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div id="sim-projects" className="py-10 px-6 max-w-3xl mx-auto border-t border-zinc-900">
                <h2 className="text-[10px] uppercase font-extrabold tracking-widest text-violet-400 mb-6">Recent Work</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                      <h3 className="font-bold text-white text-xs">{p.name}</h3>
                      <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.technologies && p.technologies.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 font-semibold rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div id="sim-experience" className="py-10 px-6 max-w-3xl mx-auto border-t border-zinc-900">
                <h2 className="text-[10px] uppercase font-extrabold tracking-widest text-violet-400 mb-6">Work Timeline</h2>
                <div className="space-y-6">
                  {experience.map(exp => (
                    <div key={exp.id} className="border-l border-zinc-850 pl-4 py-1 relative">
                      <span className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
                      <div className="flex justify-between items-baseline font-display">
                        <span className="font-bold text-white text-xs">{exp.position}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                      </div>
                      <p className="text-[10px] text-violet-400 mt-0.5">{exp.company}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="py-10 px-6 max-w-3xl mx-auto border-t border-zinc-900 bg-zinc-950/20">
                <h2 className="text-[10px] uppercase font-extrabold tracking-widest text-violet-400 mb-6">Get in Touch</h2>
                
                {contactSubmitted ? (
                  <div className="bg-violet-950/10 border border-violet-500/20 p-4 rounded-xl text-center space-y-1">
                    <p className="text-white text-xs font-bold flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      Message Dispatched!
                    </p>
                    <p className="text-[10px] text-zinc-500">Thank you for testing the interactive contact form.</p>
                    <button
                      onClick={() => setContactSubmitted(false)}
                      className="text-[10px] text-violet-400 hover:underline mt-2"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="text-zinc-500 text-[11px] space-y-2">
                      <p>Send a message using the simulated form to check the input parameters.</p>
                      <p className="font-semibold text-zinc-400 mt-4">Direct Contact:</p>
                      <p>{personalInfo.email}</p>
                      {personalInfo.phone && <p>{personalInfo.phone}</p>}
                    </div>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setContactSubmitted(true);
                        setContactName("");
                        setContactEmail("");
                        setContactMessage("");
                        confetti({
                          particleCount: 50,
                          angle: 60,
                          spread: 55,
                          origin: { x: 0 }
                        });
                        confetti({
                          particleCount: 50,
                          angle: 120,
                          spread: 55,
                          origin: { x: 1 }
                        });
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-200 focus:outline-none"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Your Email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-200 focus:outline-none"
                      />
                      <textarea
                        required
                        rows={3}
                        placeholder="Message"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-200 focus:outline-none resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-violet-600 hover:bg-violet-750 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Message
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar - Code Preview */}
          <div className="w-1/3 border-l border-zinc-850 p-4 flex flex-col gap-3 bg-zinc-900/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 border-b border-zinc-850 pb-2">
              <Terminal className="w-4 h-4 text-violet-400" />
              <span>HTML Source Code</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Below is the generated code structure featuring standard Tailwind grid layouts and FontAwesome icon injections. You can load this file directly in any browser context.
            </p>
            <textarea
              readOnly
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[10px] text-zinc-400 font-mono focus:outline-none resize-none"
              value={generatePortfolioHTML().substring(0, 1000) + "\n\n/* ... CODE CONTINUES ... */"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
