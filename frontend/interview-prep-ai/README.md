# 🎯 Interview Prep AI

An AI-powered platform designed to **supercharge your interview preparation**.  
With tailored interview sessions, ATS resume scoring, coding practice questions, and curated learning resources — all in one place.  

---

## ✨ Features

### 🔐 Landing Page + Auth
- **Landing Page** that highlights the platform’s benefits.  
- **Login/Signup** system to manage personalized sessions and saved resources.  

---

### 1️⃣ AI-Powered Interview Preparation
- Create **custom interview prep sessions** tailored to your role, years of experience, focus topics, and resume.  
- **Q&A Generator**: Instantly get realistic interview questions with detailed AI-generated answers.  
- **Learn More**: Expand each question with a full explanation panel.  
- **Load More**: Generate additional questions dynamically.  
- **Pin Questions**: Mark important ones for quick reference.  
- **Session Management**: Create and delete any number of sessions.  
- **Activity Tracker**: Track total sessions, active sessions, and pinned questions.  

---

### 2️⃣ AI-Powered ATS Score Checker
- Upload your **resume (PDF/DOCX)** for an ATS evaluation.  
- Add role, years of experience, and job description for more accuracy.  
- Get a complete report:
  - ✅ ATS Score  
  - ✅ Keyword Suggestions  
  - ✅ Improvement Recommendations  
  - ✅ Experience Analysis (strengths & issues)  
  - ✅ Skills Analysis (strengths & issues)  

---

### 3️⃣ AI-Powered Coding Questions
- Generate **role-based coding questions** with constraints, inputs, and outputs.  
- Inputs:
  - **Topics to Focus** (e.g., strings, arrays, trees, etc.)  
  - **Years of Experience**  
  - **Difficulty Level** (Easy, Medium, Hard)  
- **Coding Sessions**:
  - Create multiple coding sessions.  
  - Activity tracker shows total questions, pinned, and session count.  
  - Add/Delete sessions anytime.  
- **Q&A Page**:
  - Load more coding questions on demand.  
  - View problem statements with detailed constraints.  
  - Select a programming language (**C, C++, Python, Java, JavaScript**).  
  - Show solution with **AI-powered explanation** (step-by-step breakdown).  

---

### 4️⃣ AI-Powered Learning Resources
- **Search Resources**:
  - Enter a topic to get **12–15 curated learning resources**.  
  - Categorized into **Theory, Docs, Videos, Practice**.  
  - Difficulty levels: Beginner, Intermediate, Advanced.  
  - Powered by **Gemini API** for structured, high-quality results.  
- **Save Resource**:
  - Add resources to your personal library.  
  - Duplicate check ensures the same resource isn’t saved twice.  
- **My Library (Filter & View)**:
  - View saved resources grouped by category.  
  - Filter by category, difficulty, or topic.  
- **Delete Resource**:
  - Remove saved resources anytime.  
  - Only the authenticated user can delete their own saved resources.  

---

## 🛠️ Tech Stack

**Frontend**
- React.js + Tailwind CSS  
- Authentication (Auth setup assumed from context)  
- Responsive UI design  

**Backend**
- Node.js + Express.js  
- MongoDB (Mongoose) for data persistence  
- Gemini API (`@google/generative-ai`) for AI-powered features  

**Other**
- REST APIs for communication  
- Multer (used for file uploads like resumes)  
- Secure environment config via `.env`  

