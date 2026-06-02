import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeData, JobMatchReport, PersonalInfo } from "../types/resume";

// Utility function to clean LLM response and extract JSON
function parseJSONFromText(text: string): any {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse JSON from AI response, text was:", text, err);
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (nestedErr) {
        throw new Error("Could not parse structured output from AI response.");
      }
    }
    throw err;
  }
}

// System prompts for core tasks
const REWRITE_SYSTEM = "You are a professional resume writer and career coach. Your task is to rewrite the given bullet point or description into a high-impact, professional resume bullet point. Use action verbs (e.g., Architected, Designed, Spearheaded), clarify the technical context, and automatically inject a realistic, quantified business outcome or metric (e.g., 'improving response times by 32%' or 'boosting user conversion rates by 15%'). Keep it concise (1-2 sentences).";

const PARSE_SYSTEM = `You are an expert resume parser. You will be given raw text extracted from a resume. Your goal is to parse and extract the information into the following structured JSON format:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "website": "", "linkedin": "", "location": "", "title": "", "summary": "" },
  "education": [ { "id": "1", "school": "", "degree": "", "fieldOfStudy": "", "location": "", "startDate": "", "endDate": "", "gpa": "", "description": "" } ],
  "experience": [ { "id": "1", "company": "", "position": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "Bullet points separated by newlines" } ],
  "projects": [ { "id": "1", "name": "", "description": "", "technologies": [] } ],
  "skills": [ { "id": "1", "name": "", "level": "Advanced", "category": "Languages" } ],
  "certifications": [ { "id": "1", "name": "", "issuer": "", "date": "" } ],
  "achievements": [ { "id": "1", "title": "", "description": "" } ]
}
Make sure to generate unique string IDs for entries. Infer categories for skills (e.g., Frontend, Backend, Tools). Output ONLY valid JSON, no other text.`;

const MATCH_SYSTEM = `You are an ATS (Applicant Tracking System) optimizer. Compare the provided resume data with the job description. Analyze the keywords, formatting, grammar, and alignment.
Output your analysis in this exact JSON format:
{
  "score": 75,
  "atsScore": 75,
  "grammarScore": 90,
  "keywordScore": 68,
  "formattingScore": 85,
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestions": [
    "Add a project demonstrating experience with Docker",
    "List TypeScript explicitly in the skills section"
  ],
  "grammarAlerts": []
}
Output ONLY valid JSON.`;

const TAILOR_SYSTEM = `You are an elite career strategist. You will tailer the resume to match the Job Description.
Specifically:
1. Reorder skills categories and names to prioritize the ones requested in the Job Description.
2. Rewrite the experience bullet points to emphasize relevant projects and technologies, naturally injecting missing keywords.
3. Highlight project details that align with the job description duties.
Output a complete, modified ResumeData JSON object matching the original structure. Ensure no details are lost, only optimized. Output ONLY valid JSON.`;

const CV_CONVERT_SYSTEM = `You are an academic advisory AI. Convert the standard industry resume into a comprehensive Academic CV.
This means you must:
1. Retain the original personal, education, and experience information.
2. Expand the data structure by adding CV-specific sections: 'publications', 'research', 'conferences', 'teaching', 'awards', 'patents'.
3. Populate these sections with highly realistic, relevant academic items based on the user's background (e.g., if they are a Software Engineer, add publications on Distributed Systems, research assistantships, patents on algorithms, and computer science teaching assistantships).
Output the full expanded ResumeData JSON. Output ONLY valid JSON.`;

// OPTIMIZATION CENTER SYSTEM PROMPTS
const JD_OPTIMIZE_SYSTEM = `You are an AI Job Description Optimizer. Analyze the resume against the provided Job Description.
Output a JSON response in the following format:
{
  "atsScore": 78,
  "skillScore": 80,
  "experienceScore": 72,
  "keywordScore": 75,
  "matchedSkills": ["TypeScript", "React"],
  "missingSkills": ["AWS Lambda", "Docker"],
  "missingKeywords": ["Serverless", "CI/CD"],
  "missingCertifications": ["AWS Solutions Architect"],
  "weakExperienceAreas": ["Mentions general dev work but lacks serverless hosting details."],
  "recommendations": ["Rewrite your Lead Engineer points to focus on Serverless scaling."],
  "optimizedResume": {}, // Copy original ResumeData JSON but apply optimizations (rewritten experience points, reordered skills)
  "coverLetter": "Dear...",
  "recruiterEmail": "Subject:...",
  "linkedinSummary": "Experienced developer skilled in..."
}
Output ONLY valid JSON matching this schema.`;

const ROLE_OPTIMIZE_SYSTEM = `You are an AI Career Role Optimizer. Analyze the resume for suitability in the specified target job role. Create an ideal industry candidate profile for the role and compare the resume against it.
Output a JSON response in the following format:
{
  "readinessScore": 65,
  "techSkillsScore": 70,
  "projectsScore": 60,
  "certsScore": 50,
  "missingSkills": ["Python", "Pandas", "Scikit-Learn"],
  "missingProjects": ["Machine learning model deployment"],
  "missingCertifications": ["TensorFlow Developer Certificate"],
  "recommendedLearningPath": ["Step 1: Python programming basics", "Step 2: Linear algebra & Statistics", "Step 3: Build an end-to-end regression model"],
  "suggestedProjects": [
    { "name": "E-Commerce Recommendation Engine", "description": "Build a collaborative filtering system.", "tech": ["Python", "Spark", "Redis"] }
  ],
  "suggestedCerts": ["Google Professional ML Engineer"],
  "optimizedResume": {}, // Copy original ResumeData JSON but apply optimizations targeting this specific role
  "interviewQuestions": [
    { "question": "Explain a time you optimized a model.", "responseTip": "Focus on metrics like F1-score and latency improvements." }
  ]
}
Output ONLY valid JSON matching this schema.`;

const HYBRID_OPTIMIZE_SYSTEM = `You are an AI Hybrid Resume Optimizer. Evaluate the resume against both the target career role standards and the pasted Job Description.
Output a JSON response in the following format:
{
  "roleReadinessScore": 70,
  "jdMatchScore": 75,
  "hiringPotentialScore": 72,
  "missingIndustrySkills": ["Docker", "Kubernetes"],
  "missingJdSkills": ["GraphQL", "Next.js Server Actions"],
  "missingCertifications": ["AWS DevOps Professional"],
  "missingProjects": ["Cloud native serverless deployment"],
  "recommendations": ["Restructure your skills sidebar to highlight Docker and GraphQL upfront."],
  "optimizedResume": {}, // Optimized ResumeData
  "atsResume": {}, // Copy of Optimized ResumeData optimized strictly for ATS filters
  "recruiterFriendlyResume": {}, // Copy of Optimized ResumeData highlighting lead achievements and metrics
  "executiveSummary": "Lead Full Stack Developer with 5 years experience scaling Next.js apps...",
  "coverLetter": "Dear...",
  "recruiterEmail": "Subject:...",
  "linkedinAbout": "Passionate software engineer building serverless products..."
}
Output ONLY valid JSON matching this schema.`;

async function callGemini(apiKey: string, prompt: string, systemInstruction: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callOpenAI(apiKey: string, prompt: string, systemInstruction: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "OpenAI API call failed");
  }

  const data = await response.json();
  return data.choices[0].message.content || "";
}

// Interface Wrapper
export const AIService = {
  // 1. REWRITE BULLET POINT
  async rewriteBulletPoint(
    bullet: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<string> {
    if (!bullet.trim()) return "";

    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 800));
      const mockVerbs = ["Spearheaded", "Architected", "Engineered", "Optimized", "Designed", "Formulated", "Redesigned"];
      const verb = mockVerbs[Math.floor(Math.random() * mockVerbs.length)];
      const mockMetrics = [
        "boosting user engagement by 28%",
        "decreasing page response latency by 42%",
        "optimizing runtime efficiency by 30%",
        "increasing operational throughput by 15%",
        "reducing application cloud-hosting costs by $12k annually",
        "minimizing production bugs by 35% through robust regression testing suites"
      ];
      const metric = mockMetrics[Math.floor(Math.random() * mockMetrics.length)];
      
      const cleanBullet = bullet.replace(/^[-*•\s]+/, "");
      return `${verb} the implementation of ${cleanBullet.charAt(0).toLowerCase() + cleanBullet.slice(1)}, successfully ${metric}.`;
    }

    const prompt = `Rewrite this resume point: "${bullet}"`;
    try {
      if (config.provider === "gemini") {
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(`${REWRITE_SYSTEM}\n\nPoint: "${bullet}"`);
        return result.response.text().trim();
      } else {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: REWRITE_SYSTEM },
              { role: "user", content: `Rewrite: "${bullet}"` }
            ],
            max_tokens: 150,
          }),
        });
        const data = await response.json();
        return data.choices[0].message.content.trim() || bullet;
      }
    } catch (err) {
      console.error("AI rewrite failed, using mock fallback:", err);
      return `Optimized: ${bullet} (AI model failed to respond, fallback applied)`;
    }
  },

  // 2. PARSE RESUME TEXT
  async parseResume(
    text: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<Partial<ResumeData>> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 1500));
      return getMockResumeData();
    }

    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, `Parse this text:\n\n${text}`, PARSE_SYSTEM);
      } else {
        rawResponse = await callOpenAI(config.apiKey, `Parse this text:\n\n${text}`, PARSE_SYSTEM);
      }
      return parseJSONFromText(rawResponse);
    } catch (err: any) {
      console.error("Parsing failed, returning mock resume data", err);
      throw new Error(`AI parser failed to structure the document: ${err?.message || "Please try again or use manual creation."}`);
    }
  },

  // 3. JOB DESCRIPTION MATCH & ATS ANALYSIS
  async analyzeJobMatch(
    resume: ResumeData,
    jd: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<JobMatchReport> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 1200));
      const resumeText = JSON.stringify(resume).toLowerCase();
      const jdWords = jd.toLowerCase().split(/\W+/).filter(w => w.length > 4);
      const uniqueJdWords = Array.from(new Set(jdWords));
      const matches = uniqueJdWords.filter(w => resumeText.includes(w));
      const scorePercent = Math.min(Math.max(Math.floor((matches.length / uniqueJdWords.length) * 100) || 45, 55), 92);
      
      const potentialKeywords = ["TypeScript", "Next.js", "Docker", "AWS", "Python", "GraphQL", "CI/CD", "Kubernetes", "Tailwind CSS", "Unit Testing", "Microservices"];
      const missing = potentialKeywords.filter(kw => !resumeText.includes(kw.toLowerCase())).slice(0, 4);

      return {
        score: scorePercent,
        atsScore: scorePercent,
        grammarScore: 92,
        keywordScore: Math.floor(scorePercent * 0.9),
        formattingScore: 88,
        missingKeywords: missing.length ? missing : ["REST APIs", "Git Workflow"],
        suggestions: [
          "Incorporate metrics to your projects demonstrating measurable impact.",
          `Explicitly mention experience with ${missing.length ? missing.join(", ") : "Cloud Architecture"} in your experience or skills list.`,
          "Structure the layout utilizing standard column tables for optimal machine scannability."
        ],
        grammarAlerts: ["Found minor passive voice usage in education description."]
      };
    }

    const prompt = `RESUME JSON:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n${jd}`;
    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, prompt, MATCH_SYSTEM);
      } else {
        rawResponse = await callOpenAI(config.apiKey, prompt, MATCH_SYSTEM);
      }
      const data = parseJSONFromText(rawResponse);
      return {
        score: data.atsScore || data.score || 70,
        atsScore: data.atsScore || data.score || 70,
        grammarScore: data.grammarScore || 85,
        keywordScore: data.keywordScore || 70,
        formattingScore: data.formattingScore || 80,
        missingKeywords: data.missingKeywords || [],
        suggestions: data.suggestions || [],
        grammarAlerts: data.grammarAlerts || []
      };
    } catch (err) {
      console.error("Match analysis failed", err);
      throw new Error("Unable to analyze ATS compatibility at this time.");
    }
  },

  // 4. ONE-CLICK TAILORING
  async tailorResume(
    resume: ResumeData,
    jd: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<ResumeData> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 2000));
      const tailored = JSON.parse(JSON.stringify(resume)) as ResumeData;
      
      if (tailored.skills.length > 0) {
        tailored.skills.sort((a, b) => b.name.localeCompare(a.name));
        tailored.skills.unshift({
          id: "tailor-skill",
          name: "Cloud Deployment (AWS/Vercel)",
          level: "Expert",
          category: "Infrastructure"
        });
      }

      tailored.experience = tailored.experience.map(exp => {
        if (exp.description) {
          const lines = exp.description.split("\n");
          if (lines.length > 0) {
            lines[0] = lines[0] + " leveraging enterprise cloud solutions to assure scalable deployments.";
          }
          exp.description = lines.join("\n");
        }
        return exp;
      });

      return tailored;
    }

    const prompt = `RESUME JSON:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n${jd}`;
    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, prompt, TAILOR_SYSTEM);
      } else {
        rawResponse = await callOpenAI(config.apiKey, prompt, TAILOR_SYSTEM);
      }
      return parseJSONFromText(rawResponse);
    } catch (err) {
      console.error("Tailoring failed, returning original", err);
      throw new Error("AI optimization failed. Please verify your API keys and try again.");
    }
  },

  // 5. RESUME TO CV CONVERSION
  async convertToCV(
    resume: ResumeData,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<ResumeData> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 2000));
      const cvData: ResumeData = {
        ...JSON.parse(JSON.stringify(resume)),
        publications: [
          {
            id: "pub-1",
            title: "Scalable Client-Side Architecture for Real-Time Web Applications",
            authors: `${resume.personalInfo.fullName || "John Doe"}, A. Smith, R. Johnson`,
            journalOrPublisher: "Journal of Systems and Software Engineering",
            date: "2024-05",
            url: "https://example.org/publication",
            description: "Presented a novel virtual DOM optimization yielding 40% performance gains."
          },
          {
            id: "pub-2",
            title: "Security and Latency Analysis of Modern SSR Web Frameworks",
            authors: `M. Davis, ${resume.personalInfo.fullName || "John Doe"}`,
            journalOrPublisher: "IEEE Cloud Computing Workshop",
            date: "2023-11",
            description: "Evaluated caching behavior in Next.js Server Components and Hydration cycles."
          }
        ],
        research: [
          {
            id: "res-1",
            title: "Distributed Systems & Cloud Caching Optimization",
            institution: "Tech Research Institute",
            role: "Principal Investigator",
            startDate: "2023-01",
            endDate: "2024-04",
            current: false,
            description: "Engineered high-performance CDN middleware to cache serverless actions.\nSynthesized experimental data across 2,000 requests per second."
          }
        ],
        conferences: [
          {
            id: "conf-1",
            name: "International Conference on Software Engineering (ICSE 2025)",
            role: "Presenter",
            date: "2025-05",
            description: "Presented research on 'Hydration Optimization in Modern React Components'."
          },
          {
            id: "conf-2",
            name: "JSConf Global",
            role: "Attendee & Panelist",
            date: "2024-09"
          }
        ],
        teaching: [
          {
            id: "teach-1",
            course: "CS 102: Introduction to Web Architectures",
            institution: "State University",
            role: "Adjunct Lecturer",
            startDate: "2023-09",
            endDate: "2023-12",
            description: "Lectured classroom of 80 undergraduates on React, HTML5, CSS Grid, and Async APIs.\nManaged 3 teaching assistants and oversaw student final project portfolios."
          }
        ],
        patents: [
          {
            id: "pat-1",
            title: "Dynamic Hydration Cache and Client Rendering Optimizations",
            number: "US-12048572-B2",
            date: "2024-08",
            description: "Patented a serverless cache invalidate mechanism designed to rehydrate client elements on-demand."
          }
        ],
        awards: [
          {
            id: "aw-1",
            title: "Outstanding Graduate Engineering Award",
            description: "Awarded by State University for exceptional contribution to web accessibility standards."
          },
          {
            id: "aw-2",
            title: "First Place - National Hackathon",
            description: "Led team of 4 to design an automated emergency routing web portal using WebSocket."
          }
        ]
      };
      return cvData;
    }

    const prompt = `Convert this standard resume into a complete Academic CV (add publications, research, teaching, patents, awards). RESUME DATA:\n${JSON.stringify(resume)}`;
    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, prompt, CV_CONVERT_SYSTEM);
      } else {
        rawResponse = await callOpenAI(config.apiKey, prompt, CV_CONVERT_SYSTEM);
      }
      return parseJSONFromText(rawResponse);
    } catch (err) {
      console.error("CV conversion failed", err);
      throw new Error("Academic CV expansion failed. Check connection parameters.");
    }
  },

  // 6. GENERATE COVER LETTER & OUTREACH MESSAGES
  async generateCoverLetter(
    resume: ResumeData,
    jd: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<{ coverLetter: string; recruiterEmail: string; linkedinIntro: string }> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 1500));
      const name = resume.personalInfo.fullName || "John Doe";
      const title = resume.personalInfo.title || "Software Engineer";
      
      const coverLetter = `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the open position matching my skillset. With my background as a ${title}, I am confident in my capacity to bring valuable technical solutions to your organization.

Throughout my career, I have focused on building robust, high-performance web applications. For example, my experience at my previous positions enabled me to design scalable software architectures, resulting in improved system efficiencies. I excel at converting complex system requirements into clean, manageable codebases.

Your company's emphasis on engineering excellence and developer productivity aligns perfectly with my professional goals. I am eager to apply my expertise in React, Next.js, and modern APIs to help drive your project success.

Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications align with your engineering needs.

Sincerely,
${name}`;

      const recruiterEmail = `Subject: Application for Open Position - ${name} (${title})

Dear Recruiting Team,

I hope this email finds you well.

I recently saw your job posting for a candidate with skills matching my profile. I have attached my resume for your review. As a ${title} with experience in building high-performance modern web apps, I am excited about the potential to join your team.

Key highlights of my background include:
- Designing responsive client interfaces.
- Collaborating in fast-paced agile development groups.
- Integrating APIs to boost system capabilities.

I look forward to discussing my application further. 

Best regards,

${name}
${resume.personalInfo.phone || ""}
${resume.personalInfo.email || ""}`;

      const linkedinIntro = `Hi [Recruiter Name], I noticed you are hiring for the open role at your firm. As a ${title} focused on building responsive, high-performance applications, I'd love to connect. I recently applied and wanted to express my strong interest. Looking forward to connecting! - ${name}`;

      return { coverLetter, recruiterEmail, linkedinIntro };
    }

    const systemPrompt = "You are a professional copywriter. Generate a personalized Cover Letter, a direct Recruiter Email Draft, and a LinkedIn connection intro message. Return a JSON structure exactly like: { \"coverLetter\": \"...\", \"recruiterEmail\": \"...\", \"linkedinIntro\": \"...\" }";
    const prompt = `RESUME:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n${jd}`;
    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, prompt, systemPrompt);
      } else {
        rawResponse = await callOpenAI(config.apiKey, prompt, systemPrompt);
      }
      return parseJSONFromText(rawResponse);
    } catch (err) {
      console.error("Cover letter generation failed", err);
      throw new Error("Unable to generate outreach materials. Please check API configurations.");
    }
  },

  // 7. CAREER ASSISTANT CHATBOT
  async careerAssistantChat(
    resume: ResumeData,
    message: string,
    history: { role: "user" | "assistant"; content: string }[],
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<string> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 800));
      const msg = message.toLowerCase();
      if (msg.includes("improve")) {
        return "Based on your resume, you can improve by: \n1. Quantifying achievements with metrics (e.g., 'improved performance by 20%').\n2. Consolidating similar skill listings.\n3. Adding certifications related to cloud deployment (AWS/Azure).";
      } else if (msg.includes("skill")) {
        return "Given your background, I highly recommend learning:\n- **TypeScript** (industry standard for type safety)\n- **Docker & CI/CD Pipelines** (boosts your developer profile)\n- **Next.js App Router & Server Actions** (for cutting edge web applications)";
      } else if (msg.includes("suitable") || msg.includes("fit")) {
        return "You have a solid foundation! You are highly suitable for junior to mid-level roles in Software Engineering. To target senior positions, focus on leadership, systems design, and cloud deployments.";
      }
      return `Thank you for asking! As your career coach, I reviewed your resume for "${resume.personalInfo.title || "candidate"}". I recommend polishing your projects section and ensuring your experience highlights active achievements rather than passive task descriptions. Do you have any specific job description in mind?`;
    }

    const systemInstruction = `You are a supportive, expert AI Career Assistant and HR Recruiter. You are advising a candidate based on their resume. Answer their questions clearly and constructively. Give concrete action items.
RESUME OF THE CANDIDATE:
${JSON.stringify(resume)}`;

    try {
      if (config.provider === "gemini") {
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        let promptText = "History:\n";
        history.forEach(h => {
          promptText += `${h.role === "user" ? "Candidate" : "Assistant"}: ${h.content}\n`;
        });
        promptText += `\nCandidate's new question: ${message}\n\nAssistant:`;

        const result = await model.generateContent(`${systemInstruction}\n\n${promptText}`);
        return result.response.text().trim();
      } else {
        const messages = [
          { role: "system", content: systemInstruction },
          ...history.map(h => ({ role: h.role, content: h.content })),
          { role: "user", content: message }
        ] as any;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
          }),
        });

        const data = await response.json();
        return data.choices[0].message.content || "";
      }
    } catch (err) {
      console.error("Career chat failed, fallback to mock response", err);
      return "I'm having trouble connecting to the AI brain right now. Based on your profile, I suggest checking if your skills section lists your primary technologies first!";
    }
  },

  // ----------------------------------------------------
  // AI OPTIMIZATION CENTER METHODS
  // ----------------------------------------------------

  // TAB 1: JOB DESCRIPTION OPTIMIZER
  async optimizeForJD(
    resume: ResumeData,
    jd: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<any> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 2000));
      const mockResult = getMockJDOptimizerResult(resume, jd);
      return mockResult;
    }

    const prompt = `RESUME:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n${jd}`;
    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, prompt, JD_OPTIMIZE_SYSTEM);
      } else {
        rawResponse = await callOpenAI(config.apiKey, prompt, JD_OPTIMIZE_SYSTEM);
      }
      return parseJSONFromText(rawResponse);
    } catch (err) {
      console.error("JD Optimization failed, falling back to mock", err);
      return getMockJDOptimizerResult(resume, jd);
    }
  },

  // TAB 2: CAREER ROLE OPTIMIZER
  async optimizeForRole(
    resume: ResumeData,
    role: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<any> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 2000));
      return getMockRoleOptimizerResult(resume, role);
    }

    const prompt = `RESUME:\n${JSON.stringify(resume)}\n\nTARGET ROLE:\n${role}`;
    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, prompt, ROLE_OPTIMIZE_SYSTEM);
      } else {
        rawResponse = await callOpenAI(config.apiKey, prompt, ROLE_OPTIMIZE_SYSTEM);
      }
      return parseJSONFromText(rawResponse);
    } catch (err) {
      console.error("Role Optimization failed, falling back to mock", err);
      return getMockRoleOptimizerResult(resume, role);
    }
  },

  // TAB 3: HYBRID AI OPTIMIZER
  async optimizeHybrid(
    resume: ResumeData,
    role: string,
    jd: string,
    config: { apiKey: string; provider: "gemini" | "openai" | "mock" }
  ): Promise<any> {
    if (config.provider === "mock" || !config.apiKey) {
      await new Promise((res) => setTimeout(res, 2500));
      return getMockHybridResult(resume, role, jd);
    }

    const prompt = `RESUME:\n${JSON.stringify(resume)}\n\nTARGET ROLE:\n${role}\n\nJOB DESCRIPTION:\n${jd}`;
    try {
      let rawResponse = "";
      if (config.provider === "gemini") {
        rawResponse = await callGemini(config.apiKey, prompt, HYBRID_OPTIMIZE_SYSTEM);
      } else {
        rawResponse = await callOpenAI(config.apiKey, prompt, HYBRID_OPTIMIZE_SYSTEM);
      }
      return parseJSONFromText(rawResponse);
    } catch (err) {
      console.error("Hybrid Optimization failed, falling back to mock", err);
      return getMockHybridResult(resume, role, jd);
    }
  }
};

// MOCK DATA GENERATION FUNCTIONS
function getMockJDOptimizerResult(resume: ResumeData, jd: string): any {
  const tailoredResume = JSON.parse(JSON.stringify(resume)) as ResumeData;
  // Modify details slightly for demonstration
  if (tailoredResume.skills.length > 0) {
    tailoredResume.skills.unshift({
      id: "opt-jd-sk-1",
      name: "DevOps & CI/CD Pipelines",
      level: "Advanced",
      category: "Tools"
    });
  }
  tailoredResume.experience = tailoredResume.experience.map(exp => {
    if (exp.id === "exp-1") {
      exp.description = "Spearheaded scalable microservices migration, improving response times by 35%.\n" + exp.description;
    }
    return exp;
  });

  return {
    atsScore: 82,
    skillScore: 78,
    experienceScore: 80,
    keywordScore: 88,
    matchedSkills: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
    missingSkills: ["CI/CD pipelines", "AWS ECS / Lambda", "GraphQL API schemas"],
    missingKeywords: ["Serverless hosting", "Secure API Gateways", "E2E testing suites"],
    missingCertifications: ["AWS Certified Solutions Architect Associate"],
    weakExperienceAreas: [
      "Mentions general server architectures but misses quantitative serverless metrics.",
      "Lacks direct references to GraphQL schemas or security gateways."
    ],
    recommendations: [
      "Inject 'CI/CD pipeline configuration' directly into your AppGlow or Synthetix descriptions.",
      "State project details targeting serverless scaling parameters."
    ],
    optimizedResume: tailoredResume,
    coverLetter: `Dear Hiring Team,\n\nI am writing to express my enthusiastic interest in your open position. As a software engineer with significant experience scaling Next.js frameworks, I am excited to apply my skills to your team's scaling goals.\n\nAt Synthetix Labs, I migrated legacy systems to Serverless frameworks, increasing operational speeds by 45%. I look forward to bringing this expertise to your serverless products.\n\nSincerely,\n${resume.personalInfo.fullName}`,
    recruiterEmail: `Subject: Application: ${resume.personalInfo.fullName} - ${resume.personalInfo.title}\n\nDear Recruiting Team,\n\nI recently submitted my application for the engineer role. With my background optimizing Next.js architectures and managing cloud deployments, I am confident I would be a great fit.\n\nKey Highlights:\n- Migrated systems to Next.js App Router.\n- Optimized backend databases, speeding up response queries.\n\nBest regards,\n${resume.personalInfo.fullName}`,
    linkedinSummary: `Experienced Full Stack Software Architect specializing in TypeScript, Next.js Server Components, and AWS cloud hosting optimization. Proven track record boosting application latencies by up to 45%.`
  };
}

function getMockRoleOptimizerResult(resume: ResumeData, role: string): any {
  const tailoredResume = JSON.parse(JSON.stringify(resume)) as ResumeData;
  tailoredResume.personalInfo.title = role;
  
  return {
    readinessScore: 71,
    techSkillsScore: 68,
    projectsScore: 75,
    certsScore: 40,
    missingSkills: getRoleMissingSkills(role),
    missingProjects: [
      `Deploy a custom production-ready ${role} application portfolio.`,
      "System load balancer and orchestration pipeline configuration."
    ],
    missingCertifications: getRoleCerts(role),
    recommendedLearningPath: [
      `Step 1: Mastery of role fundamentals (${role} core standards).`,
      "Step 2: Setup cloud containerization (Docker, AWS ECS / GCP).",
      "Step 3: Host a live application parsing real-time analytics data."
    ],
    suggestedProjects: [
      {
        name: `Distributed ${role} Dashboard`,
        description: "Develop a real-time event pipeline streaming analytical logs.",
        tech: ["Node.js", "Docker", "Apache Kafka", "React"]
      }
    ],
    suggestedCerts: getRoleCerts(role).slice(0, 2),
    optimizedResume: tailoredResume,
    interviewQuestions: [
      {
        question: `What are the core technical constraints in a ${role} workflow?`,
        responseTip: "Outline data scaling, latency control, and modular codebase structure."
      },
      {
        question: "How do you optimize system capacity under spike loads?",
        responseTip: "Mention serverless scaling, CDN query caching, and connection pooling protocols."
      }
    ]
  };
}

function getMockHybridResult(resume: ResumeData, role: string, jd: string): any {
  const tailoredResume = JSON.parse(JSON.stringify(resume)) as ResumeData;
  tailoredResume.personalInfo.title = role;
  if (tailoredResume.skills.length > 0) {
    tailoredResume.skills.push({
      id: "opt-hyb-sk-1",
      name: "Docker Containerization",
      level: "Intermediate",
      category: "Tools"
    });
  }

  return {
    roleReadinessScore: 74,
    jdMatchScore: 82,
    hiringPotentialScore: 78,
    missingIndustrySkills: getRoleMissingSkills(role).slice(0, 2),
    missingJdSkills: ["GraphQL gateway structures", "Micro-frontend components"],
    missingCertifications: getRoleCerts(role).slice(0, 1),
    missingProjects: ["Scalable event-driven message brokers pipeline"],
    recommendations: [
      "Incorporate system latency metrics explicitly in your lead engineer summary.",
      "Add a dedicated Docker badge to your skills listing."
    ],
    optimizedResume: tailoredResume,
    atsResume: tailoredResume,
    recruiterFriendlyResume: {
      ...tailoredResume,
      personalInfo: {
        ...tailoredResume.personalInfo,
        summary: `Result-driven ${role} with a proven track record of boosting user engagement by 22% and application query latency by 45%. Specialized in modern scalable tech-stacks.`
      }
    },
    executiveSummary: `Lead ${role} with over 5 years of experience deploying highly scalable client-server applications. Expert in TypeScript, containerization, and modern database indexes.`,
    coverLetter: `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${role} position. With my background in software scaling and cloud optimizations, I can add immediate value to your engineering department.\n\nLooking forward to speaking soon.\n\nSincerely,\n${resume.personalInfo.fullName}`,
    recruiterEmail: `Subject: Qualified candidate: ${resume.personalInfo.fullName} - ${role}\n\nHello, I recently applied for your open ${role} position. I possess the target skills required and would love to schedule a brief call.\n\nBest,\n${resume.personalInfo.fullName}`,
    linkedinAbout: `Passionate ${role} | Building secure, cloud-native web architectures | Tech: TypeScript, React, Next.js, Node.js, Docker.`
  };
}

// Helpers for role generation
function getRoleMissingSkills(role: string): string[] {
  switch (role) {
    case "Data Analyst": return ["SQL (Advanced Queries)", "Tableau / PowerBI", "Python Pandas", "Excel Pivots"];
    case "Software Engineer": return ["System Design Patterns", "Redis / Memcached caching", "Kubernetes", "GraphQL APIs"];
    case "Data Scientist": return ["PyTorch / TensorFlow", "Scikit-Learn models", "Machine Learning pipelines", "A/B Testing statistical analytics"];
    case "Product Manager": return ["Product Roadmap wireframing", "Aria / Jira tickets", "Agile scrum methodologies", "User interview analysis"];
    case "UI/UX Designer": return ["Figma layouts", "Interactive prototyping", "Design Systems tokenization", "User testing journeys"];
    case "DevOps Engineer": return ["Terraform IaC", "CI/CD (GitHub Actions / Jenkins)", "Docker / Kubernetes orchestration", "Prometheus monitoring logs"];
    case "AI Engineer": return ["LLM Fine-Tuning & RAG", "Vector Databases (Pinecone/Chroma)", "Prompt Engineering", "OpenAI / HuggingFace SDKs"];
    default: return ["Cloud Scalability", "System Integrity Protocols", "Unit Testing configurations"];
  }
}

function getRoleCerts(role: string): string[] {
  switch (role) {
    case "Data Analyst": return ["Google Data Analytics Professional Certificate", "Microsoft Power BI Certified Data Analyst"];
    case "Software Engineer": return ["AWS Certified Developer Associate", "Oracle Certified Professional Java Developer"];
    case "Data Scientist": return ["Google Professional Data Engineer", "IBM Data Science Professional Certificate"];
    case "DevOps Engineer": return ["AWS Certified DevOps Engineer Professional", "Certified Kubernetes Administrator (CKA)"];
    case "AI Engineer": return ["Google Professional ML Engineer", "NVIDIA Deep Learning Institute Certificate"];
    default: return ["PMP (Product Management Professional)", "AWS Certified Solutions Architect Associate"];
  }
}

// Helper mock data to populate initial state or parsed text imports
export function getMockResumeData(): ResumeData {
  return {
    personalInfo: {
      fullName: "Alex Rivera",
      email: "alex.rivera@devmail.com",
      phone: "+1 (555) 019-2834",
      website: "https://alexrivera.dev",
      linkedin: "linkedin.com/in/alexriveradevs",
      location: "San Francisco, CA",
      title: "Senior Full Stack Engineer",
      summary: "Dynamic Software Engineer with over 5 years of experience building scalable, high-performance web applications. Specialized in TypeScript, React, Next.js, and serverless node environments with a passion for designing premium user experiences."
    },
    education: [
      {
        id: "edu-1",
        school: "University of California, Berkeley",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        location: "Berkeley, CA",
        startDate: "2016-09",
        endDate: "2020-05",
        gpa: "3.82",
        description: "Graduated with Honors. Coursework focused on Distributed Systems, Algorithms, and Software Engineering."
      }
    ],
    experience: [
      {
        id: "exp-1",
        company: "Synthetix Labs",
        position: "Lead Software Architect",
        location: "San Francisco, CA",
        startDate: "2022-08",
        endDate: "Present",
        current: true,
        description: "Spearheaded migration from legacy monolithic systems to Next.js App Router, enhancing page metrics by 45%.\nCollaborated in an agile setting of 12 engineers to ship secure API gateways, servicing 10,000+ daily actions.\nMentored 4 junior developers and initiated strict TypeScript typing standards across code repositories."
      },
      {
        id: "exp-2",
        company: "AppGlow Corp",
        position: "Full Stack Engineer",
        location: "Oakland, CA",
        startDate: "2020-06",
        endDate: "2022-07",
        current: false,
        description: "Engineered responsive dashboard modules using React and Tailwind CSS, increasing user time-on-page by 22%.\nIntegrated Stripe payment webhooks, decreasing invoice reconciliation time by 12 hours weekly.\nConstructed unit tests using Jest, raising overall application test coverage from 60% to 85%."
      }
    ],
    projects: [
      {
        id: "proj-1",
        name: "DevSphere Collaboration Hub",
        description: "Real-time developer workspaces using WebSockets, allowing editing, video calling, and code sandbox execution in-browser.",
        technologies: ["React", "Node.js", "Socket.io", "Tailwind CSS", "Redis"],
        githubUrl: "https://github.com/alexriveradevs/devsphere",
        liveUrl: "https://devsphere.alexrivera.dev"
      },
      {
        id: "proj-2",
        name: "EcoTrack API Service",
        description: "Serverless analytics pipeline measuring carbon footprints for corporate supply chains.",
        technologies: ["Next.js", "PostgreSQL", "AWS Lambda", "Docker"],
        githubUrl: "https://github.com/alexriveradevs/ecotrack"
      }
    ],
    skills: [
      { id: "sk-1", name: "TypeScript", level: "Expert", category: "Languages" },
      { id: "sk-2", name: "JavaScript", level: "Expert", category: "Languages" },
      { id: "sk-3", name: "Python", level: "Advanced", category: "Languages" },
      { id: "sk-4", name: "React / Next.js", level: "Expert", category: "Frontend" },
      { id: "sk-5", name: "Tailwind CSS", level: "Expert", category: "Frontend" },
      { id: "sk-6", name: "Node.js / Express", level: "Expert", category: "Backend" },
      { id: "sk-7", name: "PostgreSQL", level: "Advanced", category: "Backend" },
      { id: "sk-8", name: "AWS", level: "Intermediate", category: "Infrastructure" },
      { id: "sk-9", name: "Docker", level: "Advanced", category: "Infrastructure" },
      { id: "sk-10", name: "Git", level: "Expert", category: "Tools" }
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023-04"
      }
    ],
    achievements: [
      {
        id: "ach-1",
        title: "Hackathon Winner - Berkeley Tech Fair",
        description: "Earned 1st place among 50 competing groups for building an AI emergency supply dispatcher app."
      }
    ]
  };
}
