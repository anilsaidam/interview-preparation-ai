# 💼 Career Companion AI

Career Companion AI is a **modern AI-powered SaaS platform** built using the **MERN stack** that helps users **ace interviews, improve resumes, practice coding, and explore curated learning resources** — all in one place.  

It uses **Gemini API** for intelligent responses, **Tailwind CSS + Framer Motion** for sleek UI, and **JWT-based authentication** for secure access.  

---

## 🚀 Features

### 1️⃣ AI-Powered Interview Preparation
- Create interview sessions with inputs:  
  - **Target role (required)**  
  - **Years of experience (required)**  
  - **Topics to focus on (required)**  
  - **Description & Resume (optional)**  
- AI generates **10 role-specific questions with answers**.  
- Features:  
  - **Pin/unpin questions**  
  - **"Learn More" option** with detailed explanation box (copyable)  
  - **Load more questions** (10 at a time)  
  - **Activity trackers**: total sessions, active sessions, pinned questions, success streak  
  - **Session management**: search, filter (new → old, old → new, A–Z), delete, mark as completed  
  - **Session cards** with target role, YOE, pinned questions, date, status  

---

### 2️⃣ AI-Powered ATS Score Checker
- Upload **resume (required)**, with optional **target role, YOE, and job description**.  
- AI generates:  
  - **ATS score & section-wise score**  
  - **Keyword analysis** (present & missing)  
  - **Actionable recommendations**  
- **Resume preview (left)** + **ATS report (right)** layout  
- Option to **save reports**  
- **Saved reports page** with cards showing ATS score, file name, date, download & delete  

---

### 3️⃣ AI-Powered Coding Questions
- Create sessions with:  
  - **Topics to focus on (required)**  
  - **Years of experience (required)**  
  - **Difficulty level (easy/medium/hard)**  
- Features:  
  - **5 coding questions per session**  
  - **Detailed problem statement** (constraints + examples)  
  - **AI-powered solutions** in multiple languages (**C, C++, Java, Python**) with explanation & complexity analysis  
  - **Add more questions** (+5 each time)  
  - **Mark session as completed**  
  - **Activity trackers**: total sessions, active sessions, pinned questions, success streak  
  - **Search, filter, delete, and session cards**  

---

### 4️⃣ AI-Powered Template Generator
- Generate professional emails for cold outreach, referrals, and follow-ups.
- Create an email template with inputs: **Target role**, **Years of experience**, **(Optional) Job description and resume file (required for some types)**
- Three template types:
  - Cold mail to the recruiter  
  - Ask for a referral
  - Follow up
- Features:  
  - **Download, copy, and save generated templates**  
  - **Persistent “Total Generated” and “Saved Templates” activity counters**  
  - **Responsive, modern UI with Inter font and accessibility-focused design**  
  - **All templates are saved in “My Library” for future reuse**  
- **My Library** page:  
  - View all saved resources by category  
  - Option to **delete saved resources**  

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion  
- **Backend:** Node.js, Express.js, MongoDB  
- **Authentication:** JWT (JSON Web Tokens)  
- **File Handling:** Multer (for resume upload)  
- **AI Integration:** Gemini API  
- **State Management:** React Context API  
- **Other Tools:**  
  - bcrypt (password hashing)  
  - dotenv (environment variables)  
  - cors (cross-origin support)  

---