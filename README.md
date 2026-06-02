# AI Resume & CV Builder

A modern, SaaS-style AI-powered Resume & CV Builder web application built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

🚀 **Live Link (Vercel Deployment)**: [https://ai-resume-builder-zeta-five.vercel.app](https://ai-resume-builder-zeta-five.vercel.app)

---

## 🌟 Key Features

### 1. Resume & CV Creator
* Interactive tabbed form editor (Personal Info, Education, Experience, Projects, Skills, Certifications, Achievements).
* Dynamic **Academic CV Mode** conversion to instantly expand resumes into academic curricula, adding publications, patents, teaching, research, and conferences.
* **AI Bullet-Point Optimizer**: One-click professional rewriting, action verb injection, and automatic business metrics quantification.

### 2. AI Resume Optimization Center
* **Job Description Optimizer**: Paste any job description to get ATS compatibility, keyword gaps, missing certifications, and tailored experiences.
* **Career Role Optimizer**: Targets 9 specific tech roles (Data Analyst, Software Engineer, Data Scientist, Product Manager, etc.) to analyze role readiness and suggest learning pathways and interview cheat sheets.
* **Hybrid AI Optimizer**: Evaluates your profile against both career standards and JD specifications, outputting a complete text outreach download package.

### 3. Seven Custom Tailwind Templates
Fit-for-purpose print-optimized layouts:
* **Modern** (Indigo accents)
* **Professional** (Serif font layout)
* **ATS-Scannable** (Pure machine scannability)
* **Minimal** (Spacious single column)
* **Executive** (Stone colors)
* **Software Engineer** (Monospace badges)
* **Designer** (Dark background metrics)

### 4. Interactive Live Portfolio
* Instantly packages your resume details into a single-page scrolling portfolio website.
* **HTML Exporter**: Download a standalone HTML file using Tailwind and FontAwesome ready for deployment anywhere.

### 5. Outreach & Cover Letter Drafts
* Generates customized cover letters, recruiter email templates, and LinkedIn connection messages.

### 6. Exports & Parsers
* Multi-format downloads: **PDF (Vector Print)**, **DOCX (Word Document)**, and **TXT**.
* Local client-side parser using `pdfjs-dist` text extraction and AI schema structuring.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
* **AI Engine**: Google Gemini AI (`gemini-1.5-flash` SDK), OpenAI (`gpt-4o-mini` API), High-Fidelity Mock AI fallback.
* **Libraries**: `pdfjs-dist` (client-side text extraction), `docx` (DOCX compilation).
* **Hosting**: Vercel.

---

## ⚙️ Setup & Execution

### Prerequisites
* Node.js v18+
* npm

### Running Locally
1. Clone this repository to your system.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to [http://localhost:3000](http://localhost:3000).

### API Key Configurations
Settings can be adjusted directly in the application UI (Gear icon):
* Google Gemini API Key
* OpenAI API Key
* mock/live engine provider toggle
