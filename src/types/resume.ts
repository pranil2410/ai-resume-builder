export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  location: string;
  title: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // Bullet points separated by newlines
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[]; // Tech badges
  githubUrl?: string;
  liveUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "";
  category: string; // e.g. Languages, Frontend, Backend, Tools
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

// Academic CV Fields
export interface Publication {
  id: string;
  title: string;
  authors: string;
  journalOrPublisher: string;
  date: string;
  url?: string;
  description?: string;
}

export interface ResearchExperience {
  id: string;
  title: string;
  institution: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Conference {
  id: string;
  name: string;
  role: string; // Presenter, Attendee, Organizer
  date: string;
  description?: string;
}

export interface TeachingExperience {
  id: string;
  course: string;
  institution: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Patent {
  id: string;
  title: string;
  number: string;
  date: string;
  url?: string;
  description?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  
  // Academic CV specific
  publications?: Publication[];
  research?: ResearchExperience[];
  conferences?: Conference[];
  teaching?: TeachingExperience[];
  awards?: Achievement[]; // reuse achievement model for simplicity
  patents?: Patent[];
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionName: string; // e.g. "Software Dev V1"
  timestamp: string;
  data: ResumeData;
}

export interface JobMatchReport {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
  grammarAlerts?: string[];
  formattingScore?: number;
  grammarScore?: number;
  keywordScore?: number;
  atsScore?: number;
}

export interface AppSettings {
  geminiApiKey: string;
  openAiApiKey: string;
  selectedModel: "gemini" | "openai" | "mock";
}
