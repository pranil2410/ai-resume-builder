import React from "react";
import { ResumeData } from "../types/resume";

interface TemplateProps {
  data: ResumeData;
  primaryColor: string; // Tailwind color class prefix (e.g., 'violet', 'indigo', 'emerald')
  isCV: boolean;
}

// Color mapper helper - Unifies color system to purple accent color
const getColorHex = (color: string) => "rgb(139, 92, 246)";
const getTextColor = (color: string) => "text-violet-600";
const getBgColor = (color: string) => "bg-violet-600";
const getBorderColor = (color: string) => "border-violet-500";

export const ResumeTemplates: React.FC<TemplateProps & { templateId: string }> = ({
  data,
  primaryColor,
  isCV,
  templateId,
}) => {
  const currentData = data || {
    personalInfo: { fullName: "", email: "", phone: "", website: "", linkedin: "", location: "", title: "", summary: "" },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: []
  };

  switch (templateId) {
    case "modern":
      return <ModernTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
    case "professional":
      return <ProfessionalTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
    case "ats-friendly":
      return <AtsTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
    case "minimal":
      return <MinimalTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
    case "executive":
      return <ExecutiveTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
    case "software-engineer":
      return <SoftwareEngineerTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
    case "designer":
      return <DesignerTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
    default:
      return <ModernTemplate data={currentData} primaryColor={primaryColor} isCV={isCV} />;
  }
};

/* ========================================================================= */
/* 1. MODERN TEMPLATE                                                       */
/* ========================================================================= */
const ModernTemplate: React.FC<TemplateProps> = ({ data, primaryColor, isCV }) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  const colorHex = getColorHex(primaryColor);
  const textCol = getTextColor(primaryColor);
  const bgCol = getBgColor(primaryColor);
  const borderCol = getBorderColor(primaryColor);

  return (
    <div className="resume-print-container p-8 sm:p-12 bg-white text-gray-800 font-sans shadow-md border border-gray-100 rounded-lg min-h-[297mm]">
      {/* Header */}
      <div className="border-b-4 pb-6 mb-6" style={{ borderColor: colorHex }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 font-display">{personalInfo.fullName || "Your Name"}</h1>
            <p className="text-lg font-medium mt-1 font-display" style={{ color: colorHex }}>{personalInfo.title || "Target Job Title"}</p>
          </div>
          <div className="text-sm text-gray-600 sm:text-right space-y-1">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
            <div className="flex flex-wrap sm:justify-end gap-3 mt-1 text-xs font-semibold text-gray-500">
              {personalInfo.website && <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.website.replace(/^https?:\/\//, "")}</a>}
              {personalInfo.linkedin && <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
            </div>
          </div>
        </div>
        {personalInfo.summary && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-4xl italic">
            {personalInfo.summary}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (Skills, Certs, etc) */}
        <div className="md:col-span-1 space-y-6">
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-3 font-display uppercase tracking-wider" style={{ color: colorHex, borderColor: colorHex }}>Skills</h2>
              <div className="space-y-3">
                {/* Group by category */}
                {Array.from(new Set(skills.map(s => s.category || "General"))).map(cat => (
                  <div key={cat}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase">{cat}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {skills.filter(s => (s.category || "General") === cat).map(s => (
                        <span key={s.id} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                          {s.name} {s.level && <span className="text-[10px] text-gray-400 font-normal">({s.level})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-3 font-display uppercase tracking-wider" style={{ color: colorHex, borderColor: colorHex }}>Certifications</h2>
              <div className="space-y-3">
                {certifications.map(c => (
                  <div key={c.id} className="text-xs">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <p className="text-gray-500">{c.issuer} • {c.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {achievements && achievements.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-3 font-display uppercase tracking-wider" style={{ color: colorHex, borderColor: colorHex }}>Achievements</h2>
              <div className="space-y-3">
                {achievements.map(a => (
                  <div key={a.id} className="text-xs">
                    <p className="font-bold text-gray-800">{a.title}</p>
                    <p className="text-gray-600 mt-0.5">{a.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Render CV Specific Awards */}
          {isCV && data.awards && data.awards.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-3 font-display uppercase tracking-wider" style={{ color: colorHex, borderColor: colorHex }}>Awards & Honors</h2>
              <div className="space-y-3">
                {data.awards.map(a => (
                  <div key={a.id} className="text-xs">
                    <p className="font-bold text-gray-800">{a.title}</p>
                    <p className="text-gray-600 mt-0.5">{a.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Experience, Education) */}
        <div className="md:col-span-2 space-y-6">
          {experience && experience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Experience
              </h2>
              <div className="space-y-5">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline flex-wrap">
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <span className="text-xs font-semibold text-gray-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline flex-wrap text-sm text-gray-600 mb-2">
                      <span className="font-semibold">{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.description && (
                      <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600 leading-relaxed">
                        {exp.description.split("\n").filter(l => l.trim().length > 0).map((bullet, idx) => (
                          <li key={idx}>{bullet.replace(/^[-*•\s]+/, "")}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Publications */}
          {isCV && data.publications && data.publications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Publications
              </h2>
              <div className="space-y-4">
                {data.publications.map(pub => (
                  <div key={pub.id} className="text-xs">
                    <p className="font-bold text-gray-900">"{pub.title}"</p>
                    <p className="text-gray-600 font-medium mt-0.5">{pub.authors}</p>
                    <p className="text-gray-500 italic">{pub.journalOrPublisher} ({pub.date})</p>
                    {pub.description && <p className="text-gray-600 mt-1">{pub.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Research */}
          {isCV && data.research && data.research.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Research Experience
              </h2>
              <div className="space-y-4">
                {data.research.map(res => (
                  <div key={res.id}>
                    <div className="flex justify-between items-baseline flex-wrap">
                      <h3 className="font-bold text-gray-900">{res.role}</h3>
                      <span className="text-xs text-gray-500">{res.startDate} – {res.current ? "Present" : res.endDate}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">{res.institution} — {res.title}</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600">
                      {res.description.split("\n").map((b, i) => <li key={i}>{b.replace(/^[-*•\s]+/, "")}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Projects
              </h2>
              <div className="space-y-4">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-gray-900">{proj.name}</h3>
                      <div className="flex gap-2 text-[10px] text-gray-500 font-semibold">
                        {proj.githubUrl && <span className="hover:underline">GitHub</span>}
                        {proj.liveUrl && <span className="hover:underline">Live</span>}
                      </div>
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Tech: {proj.technologies.join(", ")}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Education
              </h2>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-gray-900">{edu.school}</h3>
                      <span className="text-xs font-semibold text-gray-500">{edu.startDate} – {edu.endDate}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{edu.degree} in {edu.fieldOfStudy}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                    {edu.description && <p className="text-xs text-gray-500 mt-1">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Teaching */}
          {isCV && data.teaching && data.teaching.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Teaching Experience
              </h2>
              <div className="space-y-4">
                {data.teaching.map(t => (
                  <div key={t.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-gray-900">{t.role} - {t.course}</h4>
                      <span className="text-gray-500">{t.startDate} – {t.endDate}</span>
                    </div>
                    <p className="text-gray-600 font-medium italic mt-0.5">{t.institution}</p>
                    <p className="text-gray-600 mt-1 leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Patents */}
          {isCV && data.patents && data.patents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Patents
              </h2>
              <div className="space-y-3">
                {data.patents.map(pat => (
                  <div key={pat.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-gray-900">{pat.title}</h4>
                      <span className="text-gray-500 font-semibold">{pat.date}</span>
                    </div>
                    <p className="text-gray-500 font-mono">Number: {pat.number}</p>
                    {pat.description && <p className="text-gray-600 mt-1">{pat.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Conferences */}
          {isCV && data.conferences && data.conferences.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 font-display uppercase tracking-wider flex items-center gap-2" style={{ color: colorHex, borderColor: colorHex }}>
                <span className="w-1.5 h-6 inline-block" style={{ backgroundColor: colorHex }}></span>
                Conferences & Workshops
              </h2>
              <div className="space-y-3">
                {data.conferences.map(c => (
                  <div key={c.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-gray-900">{c.name}</h4>
                      <span className="text-gray-500">{c.date}</span>
                    </div>
                    <p className="text-gray-600 font-medium">Role: {c.role}</p>
                    {c.description && <p className="text-gray-500 mt-1">{c.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 2. PROFESSIONAL TEMPLATE                                                 */
/* ========================================================================= */
const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, primaryColor, isCV }) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  const colorHex = getColorHex(primaryColor);

  return (
    <div className="resume-print-container p-12 bg-white text-slate-800 font-serif shadow-md border border-gray-100 rounded-lg min-h-[297mm]">
      {/* Header Centered */}
      <div className="text-center pb-6 border-b mb-6" style={{ borderColor: colorHex }}>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-900 font-display">{personalInfo.fullName || "Your Name"}</h1>
        <p className="text-sm font-medium tracking-widest uppercase mt-1.5 text-gray-500">{personalInfo.title || "Target Position"}</p>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 font-sans">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.website && <span>• <a href={personalInfo.website} target="_blank" rel="noreferrer" className="underline">{personalInfo.website.replace(/^https?:\/\//, "")}</a></span>}
          {personalInfo.linkedin && <span>• <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="underline">LinkedIn</a></span>}
        </div>
      </div>

      {personalInfo.summary && (
        <div className="mb-6 font-sans">
          <p className="text-xs text-slate-600 leading-relaxed text-center max-w-3xl mx-auto italic">
            "{personalInfo.summary}"
          </p>
        </div>
      )}

      {/* Main Flow (Single column for professional look) */}
      <div className="space-y-6 text-sm font-sans">
        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Professional Experience</h2>
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-serif">
                    <span className="font-bold text-slate-900">{exp.position}</span>
                    <span className="text-xs font-sans text-gray-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-slate-600 italic mt-0.5">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  {exp.description && (
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 leading-relaxed mt-2">
                      {exp.description.split("\n").filter(l => l.trim().length > 0).map((bullet, idx) => (
                        <li key={idx}>{bullet.replace(/^[-*•\s]+/, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Publications */}
        {isCV && data.publications && data.publications.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Publications</h2>
            <div className="space-y-3">
              {data.publications.map(pub => (
                <div key={pub.id} className="text-xs leading-relaxed">
                  <span className="font-bold">{pub.authors}</span>. "{pub.title}." <span className="italic">{pub.journalOrPublisher}</span>, {pub.date}. 
                  {pub.url && <a href={pub.url} className="text-slate-500 underline ml-1">Link</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Research */}
        {isCV && data.research && data.research.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Research Experience</h2>
            <div className="space-y-4">
              {data.research.map(res => (
                <div key={res.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{res.role}</span>
                    <span className="text-xs text-gray-500">{res.startDate} – {res.current ? "Present" : res.endDate}</span>
                  </div>
                  <div className="text-xs text-slate-600 italic">{res.institution} — {res.title}</div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 mt-1">
                    {res.description.split("\n").map((b, i) => <li key={i}>{b.replace(/^[-*•\s]+/, "")}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Key Projects</h2>
            <div className="space-y-3">
              {projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-800">{proj.name}</span>
                    {proj.technologies && (
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">[{proj.technologies.join(", ")}]</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Education</h2>
            <div className="space-y-3">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-serif">
                    <span className="font-bold text-slate-950">{edu.school}</span>
                    <span className="text-xs font-sans text-gray-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-0.5 font-sans">
                    <span>{edu.degree} in {edu.fieldOfStudy} {edu.location ? `— ${edu.location}` : ""}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Teaching */}
        {isCV && data.teaching && data.teaching.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Teaching Experience</h2>
            <div className="space-y-3">
              {data.teaching.map(t => (
                <div key={t.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{t.role} — {t.course}</span>
                    <span className="text-xs text-gray-500">{t.startDate} – {t.endDate}</span>
                  </div>
                  <p className="text-xs text-slate-500 italic">{t.institution}</p>
                  <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Patents */}
        {isCV && data.patents && data.patents.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Patents</h2>
            <div className="space-y-2">
              {data.patents.map(p => (
                <div key={p.id} className="text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{p.title}</span>
                    <span className="text-gray-500">{p.date}</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[10px]">Pat. No: {p.number}</p>
                  {p.description && <p className="text-slate-600 mt-1">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Skills Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700">
              {Array.from(new Set(skills.map(s => s.category || "General"))).map(cat => (
                <div key={cat} className="flex">
                  <span className="font-bold uppercase w-28 text-[10px] text-gray-500 mt-0.5">{cat}:</span>
                  <span className="flex-1">
                    {skills.filter(s => (s.category || "General") === cat).map(s => s.name).join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: colorHex, borderColor: colorHex }}>Certifications</h2>
              <ul className="space-y-1 text-xs text-slate-600">
                {certifications.map(c => (
                  <li key={c.id}>
                    <span className="font-bold text-slate-700">{c.name}</span> — {c.issuer} ({c.date})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {achievements && achievements.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: colorHex, borderColor: colorHex }}>Achievements</h2>
              <ul className="space-y-1 text-xs text-slate-600">
                {achievements.map(a => (
                  <li key={a.id}>
                    <span className="font-bold text-slate-700">{a.title}</span>: {a.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 3. ATS-FRIENDLY TEMPLATE                                                 */
/* ========================================================================= */
const AtsTemplate: React.FC<TemplateProps> = ({ data, primaryColor, isCV }) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  const colorHex = getColorHex(primaryColor);
  return (
    <div className="resume-print-container p-8 bg-white text-zinc-800 font-sans shadow-md border border-gray-100 rounded-lg min-h-[297mm] leading-relaxed">
      {/* Name and Basic Details */}
      <div className="text-center pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
        <p className="text-xs text-gray-800 mt-1 font-mono">
          {personalInfo.location ? `${personalInfo.location} | ` : ""}
          {personalInfo.phone ? `${personalInfo.phone} | ` : ""}
          {personalInfo.email ? `${personalInfo.email}` : ""}
        </p>
        <p className="text-xs text-gray-800 font-mono mt-0.5">
          {personalInfo.website ? `${personalInfo.website.replace(/^https?:\/\//, "")} | ` : ""}
          {personalInfo.linkedin ? `${personalInfo.linkedin}` : ""}
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Professional Summary</h2>
            <p className="text-gray-900">{personalInfo.summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Technical Skills</h2>
            <div className="space-y-1">
              {Array.from(new Set(skills.map(s => s.category || "General"))).map(cat => (
                <p key={cat}>
                  <strong className="font-semibold">{cat}:</strong>{" "}
                  {skills.filter(s => (s.category || "General") === cat).map(s => s.name).join(", ")}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Professional Experience</h2>
            <div className="space-y-3">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between font-bold">
                    <span>{exp.company}</span>
                    <span>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <div className="flex justify-between italic text-gray-800">
                    <span>{exp.position}</span>
                    <span>{exp.location}</span>
                  </div>
                  {exp.description && (
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-900">
                      {exp.description.split("\n").filter(l => l.trim().length > 0).map((bullet, idx) => (
                        <li key={idx}>{bullet.replace(/^[-*•\s]+/, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Publications */}
        {isCV && data.publications && data.publications.length > 0 && (
          <div>
            <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Publications</h2>
            <div className="space-y-1.5">
              {data.publications.map(pub => (
                <p key={pub.id} className="text-gray-950">
                  {pub.authors}. "{pub.title}." <span className="italic">{pub.journalOrPublisher}</span>, {pub.date}.
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Projects</h2>
            <div className="space-y-2">
              {projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between font-bold">
                    <span>{proj.name}</span>
                    <span className="font-normal font-mono text-[10px] text-gray-600">[{proj.technologies.join(", ")}]</span>
                  </div>
                  <p className="text-gray-900 mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Education</h2>
            <div className="space-y-2">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between font-bold">
                    <span>{edu.school}</span>
                    <span>{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between italic text-gray-800">
                    <span>{edu.degree} in {edu.fieldOfStudy} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</span>
                    <span>{edu.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CV specific sections for ATS CV */}
        {isCV && data.teaching && data.teaching.length > 0 && (
          <div>
            <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Teaching Experience</h2>
            <div className="space-y-2">
              {data.teaching.map(t => (
                <div key={t.id}>
                  <div className="flex justify-between font-bold">
                    <span>{t.institution} — {t.role}</span>
                    <span>{t.startDate} – {t.endDate}</span>
                  </div>
                  <p className="italic text-gray-800">{t.course}</p>
                  <p className="text-gray-900">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Certifications</h2>
              <ul className="list-disc pl-4 space-y-0.5 text-gray-900">
                {certifications.map(c => (
                  <li key={c.id}>
                    {c.name} - {c.issuer} ({c.date})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {achievements && achievements.length > 0 && (
            <div>
              <h2 className="font-bold uppercase border-b text-sm pb-0.5 mb-1" style={{ color: colorHex, borderColor: colorHex }}>Awards & Achievements</h2>
              <ul className="list-disc pl-4 space-y-0.5 text-gray-900">
                {achievements.map(a => (
                  <li key={a.id}>
                    <strong>{a.title}</strong>: {a.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4. MINIMAL TEMPLATE                                                      */
/* ========================================================================= */
const MinimalTemplate: React.FC<TemplateProps> = ({ data, primaryColor, isCV }) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  const colorHex = getColorHex(primaryColor);
  const textCol = getTextColor(primaryColor);

  return (
    <div className="resume-print-container p-8 sm:p-12 bg-white text-zinc-800 font-sans shadow-md border border-gray-100 rounded-lg min-h-[297mm]">
      {/* Minimal Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-wide text-zinc-900 font-display">{personalInfo.fullName || "Your Name"}</h1>
        <p className="text-xs uppercase tracking-widest mt-1 font-semibold" style={{ color: colorHex }}>{personalInfo.title || "Target Position"}</p>
        
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500 mt-4 font-mono">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <a href={personalInfo.website} className="hover:underline">{personalInfo.website}</a>}
        </div>
      </div>

      <div className="space-y-8 text-xs">
        {personalInfo.summary && (
          <p className="text-zinc-600 leading-relaxed font-light text-sm max-w-3xl border-l-2 pl-4" style={{ borderColor: colorHex }}>
            {personalInfo.summary}
          </p>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colorHex }}>Experience</h2>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-1 text-zinc-400 font-mono">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </div>
                  <div className="md:col-span-3">
                    <h3 className="font-bold text-zinc-900">{exp.position}</h3>
                    <p className="text-zinc-500 font-medium">{exp.company} — {exp.location}</p>
                    {exp.description && (
                      <ul className="list-disc pl-4 space-y-1 text-zinc-600 mt-2 leading-relaxed">
                        {exp.description.split("\n").map((b, i) => <li key={i}>{b.replace(/^[-*•\s]+/, "")}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications */}
        {isCV && data.publications && data.publications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colorHex }}>Publications</h2>
            <div className="space-y-4">
              {data.publications.map(pub => (
                <div key={pub.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-1 text-zinc-400 font-mono">{pub.date}</div>
                  <div className="md:col-span-3">
                    <p className="font-bold text-zinc-900">"{pub.title}"</p>
                    <p className="text-zinc-500 mt-0.5">{pub.authors} — <span className="italic">{pub.journalOrPublisher}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colorHex }}>Projects</h2>
            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-1 text-zinc-400 font-mono">
                    {proj.technologies ? proj.technologies.slice(0, 3).join(", ") : ""}
                  </div>
                  <div className="md:col-span-3">
                    <h3 className="font-bold text-zinc-900">{proj.name}</h3>
                    <p className="text-zinc-600 mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colorHex }}>Education</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-1 text-zinc-400 font-mono">
                    {edu.startDate} – {edu.endDate}
                  </div>
                  <div className="md:col-span-3">
                    <h3 className="font-bold text-zinc-900">{edu.school}</h3>
                    <p className="text-zinc-600">{edu.degree} in {edu.fieldOfStudy} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: colorHex }}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s.id} className="px-2.5 py-1 border text-zinc-700 rounded text-xs font-medium" style={{ borderColor: colorHex }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 5. EXECUTIVE TEMPLATE                                                    */
/* ========================================================================= */
const ExecutiveTemplate: React.FC<TemplateProps> = ({ data, primaryColor, isCV }) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  const colorHex = getColorHex(primaryColor);
  const textCol = getTextColor(primaryColor);

  return (
    <div className="resume-print-container p-12 bg-white text-stone-800 font-serif shadow-md border border-gray-100 rounded-lg min-h-[297mm]">
      {/* Executive Header Banner */}
      <div className="border-b pb-6 mb-6" style={{ borderColor: colorHex }}>
        <h1 className="text-3xl font-extrabold text-stone-900 font-display tracking-tight text-center sm:text-left">{personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2">
          <p className="text-md italic font-sans" style={{ color: colorHex }}>{personalInfo.title || "Executive Target"}</p>
          <div className="text-xs font-sans text-stone-500 text-center sm:text-right space-y-0.5">
            <p>{personalInfo.location} • {personalInfo.phone} • {personalInfo.email}</p>
            <p className="flex justify-center sm:justify-end gap-3 text-[10px] font-semibold">
              {personalInfo.website && <a href={personalInfo.website} className="hover:underline">{personalInfo.website}</a>}
              {personalInfo.linkedin && <a href={`https://${personalInfo.linkedin}`} className="hover:underline">LinkedIn</a>}
            </p>
          </div>
        </div>
      </div>

      {personalInfo.summary && (
        <div className="mb-6 font-sans">
          <h2 className="text-xs uppercase font-bold tracking-wider mb-2" style={{ color: colorHex }}>Executive Summary</h2>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            {personalInfo.summary}
          </p>
        </div>
      )}

      <div className="space-y-6 text-xs font-sans">
        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Professional Leadership</h2>
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-serif">
                    <span className="font-bold text-stone-900 text-sm">{exp.position}</span>
                    <span className="text-xs font-sans text-stone-500 font-semibold">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600 italic font-sans mb-1.5">
                    <span>{exp.company} — {exp.location}</span>
                  </div>
                  {exp.description && (
                    <ul className="list-disc pl-4 space-y-1 text-stone-600 leading-relaxed">
                      {exp.description.split("\n").map((b, i) => <li key={i}>{b.replace(/^[-*•\s]+/, "")}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications */}
        {isCV && data.publications && data.publications.length > 0 && (
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Intellectual Contributions</h2>
            <div className="space-y-3">
              {data.publications.map(pub => (
                <div key={pub.id} className="text-xs leading-relaxed">
                  <strong>{pub.authors}</strong>, "{pub.title}", <span className="italic">{pub.journalOrPublisher}</span>, {pub.date}.
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Education & Credentials</h2>
            <div className="space-y-3">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-serif">
                    <span className="font-bold text-stone-900">{edu.school}</span>
                    <span className="text-xs font-sans text-stone-500 font-semibold">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 font-sans">{edu.degree} in {edu.fieldOfStudy} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Competencies (Skills) */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider border-b pb-1 mb-3" style={{ color: colorHex, borderColor: colorHex }}>Core Competencies</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s.id} className="px-2.5 py-1 bg-stone-100 text-stone-800 rounded font-medium text-[10px]">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 6. SOFTWARE ENGINEER TEMPLATE                                            */
/* ========================================================================= */
const SoftwareEngineerTemplate: React.FC<TemplateProps> = ({ data, primaryColor, isCV }) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  const colorHex = getColorHex(primaryColor);
  const textCol = getTextColor(primaryColor);

  return (
    <div className="resume-print-container p-8 bg-white text-slate-800 font-mono shadow-md border border-gray-100 rounded-lg min-h-[297mm] text-xs">
      {/* Header Styled like a code block */}
      <div className="border-2 p-4 mb-6 bg-slate-50" style={{ borderColor: colorHex }}>
        <h1 className="text-2xl font-bold text-slate-900 font-sans">{`const developer = { name: "${personalInfo.fullName || "Your Name"}" };`}</h1>
        <p className="text-xs mt-1.5 font-sans" style={{ color: colorHex }}>{`// ${personalInfo.title || "Software Engineer"}`}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mt-3 text-[11px] text-slate-600">
          <div>email: "{personalInfo.email}"</div>
          <div>phone: "{personalInfo.phone}"</div>
          <div>location: "{personalInfo.location}"</div>
          {personalInfo.linkedin && <div>linkedin: "{personalInfo.linkedin}"</div>}
          {personalInfo.website && <div>website: "{personalInfo.website.replace(/^https?:\/\//, "")}"</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column (Skills, Tech stack) */}
        <div className="md:col-span-1 space-y-6">
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold border-b-2 pb-1 mb-2 uppercase" style={{ color: colorHex, borderColor: colorHex }}># Technical Skills</h2>
              <div className="space-y-3">
                {Array.from(new Set(skills.map(s => s.category || "General"))).map(cat => (
                  <div key={cat}>
                    <p className="font-bold text-slate-600 text-[10px] uppercase">&gt; {cat}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skills.filter(s => (s.category || "General") === cat).map(s => (
                        <span key={s.id} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold border-b-2 pb-1 mb-2 uppercase" style={{ color: colorHex, borderColor: colorHex }}># Certifications</h2>
              <ul className="space-y-1.5 text-[10px]">
                {certifications.map(c => (
                  <li key={c.id}>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-slate-500">{c.issuer} ({c.date})</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column (Work, Projects, Edu) */}
        <div className="md:col-span-2 space-y-6">
          {experience && experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold border-b-2 pb-1 mb-3 uppercase" style={{ color: colorHex, borderColor: colorHex }}># Professional_Experience</h2>
              <div className="space-y-4">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.position}</span>
                      <span className="text-[10px] text-slate-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-slate-600 font-semibold text-[11px] mb-1">{exp.company} [{exp.location}]</p>
                    {exp.description && (
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-normal">
                        {exp.description.split("\n").map((b, i) => <li key={i}>{b.replace(/^[-*•\s]+/, "")}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold border-b-2 pb-1 mb-3 uppercase" style={{ color: colorHex, borderColor: colorHex }}># Key_Projects</h2>
              <div className="space-y-3">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <p className="font-bold text-slate-900">&gt; {proj.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">[{proj.technologies.join(", ")}]</p>
                    <p className="text-slate-600 mt-1 leading-normal">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold border-b-2 pb-1 mb-2 uppercase" style={{ color: colorHex, borderColor: colorHex }}># Education</h2>
              <div className="space-y-2">
                {education.map(edu => (
                  <div key={edu.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{edu.school}</span>
                      <span>{edu.startDate} - {edu.endDate}</span>
                    </div>
                    <p className="text-slate-600">{edu.degree} in {edu.fieldOfStudy} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 7. DESIGNER TEMPLATE                                                     */
/* ========================================================================= */
const DesignerTemplate: React.FC<TemplateProps> = ({ data, primaryColor, isCV }) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  const colorHex = getColorHex(primaryColor);
  const textCol = getTextColor(primaryColor);
  const borderCol = getBorderColor(primaryColor);

  return (
    <div className="resume-print-container p-8 sm:p-12 bg-white text-zinc-800 font-sans shadow-md border border-gray-100 rounded-lg min-h-[297mm]">
      {/* Creative Header */}
      <div className="relative border-l-8 pl-6 mb-8 py-2" style={{ borderColor: colorHex }}>
        <h1 className="text-4xl font-extrabold text-zinc-900 font-display tracking-tight uppercase leading-none">{personalInfo.fullName || "Your Name"}</h1>
        <p className="text-sm font-semibold tracking-wider uppercase mt-2 font-display" style={{ color: colorHex }}>{personalInfo.title || "Creative Designer"}</p>
        
        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mt-4">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <a href={personalInfo.website} className="hover:text-zinc-900 transition-colors">{personalInfo.website}</a>}
          {personalInfo.linkedin && <a href={`https://${personalInfo.linkedin}`} className="hover:text-zinc-900 transition-colors">LinkedIn</a>}
        </div>
      </div>

      {personalInfo.summary && (
        <p className="text-xs text-zinc-600 leading-relaxed font-light mb-8 max-w-4xl border-b border-gray-200 pb-6">
          {personalInfo.summary}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Side (Experience, Projects) */}
        <div className="md:col-span-2 space-y-8">
          {experience && experience.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: colorHex, borderColor: colorHex }}>Experience</h2>
              <div className="space-y-6">
                {experience.map(exp => (
                  <div key={exp.id} className="relative pl-4 border-l border-gray-200">
                    {/* Circle marker */}
                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: colorHex }}></span>
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <h3 className="font-bold text-zinc-900 text-xs">{exp.position}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{exp.company} • {exp.location}</p>
                    {exp.description && (
                      <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600 leading-relaxed mt-2">
                        {exp.description.split("\n").map((b, i) => <li key={i}>{b.replace(/^[-*•\s]+/, "")}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: colorHex, borderColor: colorHex }}>Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map(proj => (
                  <div key={proj.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <h3 className="font-bold text-zinc-900 text-xs flex justify-between">
                      {proj.name}
                    </h3>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {proj.technologies && proj.technologies.slice(0, 3).map((t, i) => (
                        <span key={i} className="text-[9px] px-1 bg-gray-250 text-zinc-600 font-semibold rounded">{t}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side (Skills, Education) */}
        <div className="md:col-span-1 space-y-8">
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: colorHex, borderColor: colorHex }}>Skills</h2>
              <div className="space-y-4">
                {Array.from(new Set(skills.map(s => s.category || "General"))).map(cat => (
                  <div key={cat}>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{cat}</p>
                    <div className="space-y-1.5">
                      {skills.filter(s => (s.category || "General") === cat).map(s => (
                        <div key={s.id} className="text-xs">
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="font-semibold text-zinc-700">{s.name}</span>
                            <span className="text-zinc-500 font-mono text-[9px]">{s.level || "Intermediate"}</span>
                          </div>
                          {/* Visual skill progress bar */}
                          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                backgroundColor: colorHex,
                                width: s.level === "Expert" ? "95%" : s.level === "Advanced" ? "80%" : s.level === "Intermediate" ? "65%" : "45%" 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: colorHex, borderColor: colorHex }}>Education</h2>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id} className="text-xs">
                    <h3 className="font-bold text-zinc-900">{edu.school}</h3>
                    <p className="text-zinc-600 mt-0.5">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
