💼 Career Companion AI

Career Companion AI is a modern AI-powered SaaS platform built using the MERN stack that helps users ace interviews, improve resumes, practice coding, and explore curated learning resources — all in one place.

It uses Gemini API for intelligent responses, Tailwind CSS + Framer Motion for sleek UI, and JWT-based authentication for secure access.

🚀 Features
1️⃣ AI-Powered Interview Preparation

Create interview sessions with inputs:

Target role (required)

Years of experience (required)

Topics to focus on (required)

Description & Resume (optional)

AI generates 10 role-specific questions with answers.

Features:

<<<<<<< HEAD
Pin/unpin questions
=======
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
>>>>>>> bb3183ade60e1cf69ff7314d100f20380700bab6

“Learn More” option with detailed explanation box (copyable)

Load more questions (10 at a time)

Activity trackers: total sessions, active sessions, pinned questions, success streak

Session management: search, filter (new → old, old → new, A–Z), delete, mark as completed

Session cards displaying role, YOE, pinned count, date, and status

2️⃣ AI-Powered ATS Score Checker

Upload resume (required) with optional target role, YOE, and job description.

AI generates:

ATS score & section-wise breakdown

Keyword analysis (present & missing)

Actionable recommendations

Layout: Resume preview (left) + ATS report (right)

Options:

Save report

View saved reports (cards showing ATS score, file name, date, download & delete)

3️⃣ AI-Powered Coding Questions

Create coding practice sessions with inputs:

Topics to focus on (required)

Years of experience (required)

Difficulty level (easy / medium / hard)

Features:

5 coding questions per session

Each question includes a problem statement, constraints, examples, and AI-generated solutions in C, C++, Java, and Python

Includes explanation & complexity analysis

Add more questions (+5 at a time)

Mark session as completed

Activity trackers: total sessions, active sessions, pinned questions, success streak

Search, filter, delete, and view session cards

4️⃣ AI-Powered Template Generator

Generate professional email templates for real-world job communication scenarios.

Template Types:

Cold Mail to Recruiter

Ask for Referral

Follow Up

Thank You Note

Inputs:

Target Role (required)

Years of Experience (required)

Job Description (optional)

Resume Upload (required for Cold Mail and Referral)

Features:

AI generates formal, human-like templates that don’t sound AI-written

Download, Copy, and Save generated templates

Templates can be saved to “My Library” for reuse

Activity Trackers:

Total Generated Templates

Saved Templates

State Persistence:

Form data preserved on page refresh

Activity stats persist across sessions

Navigation away resets only the form, not stats

Responsive, modern dark UI using Inter font, white text, and shining gray borders

🛠️ Tech Stack

Frontend: React, Tailwind CSS, Framer Motion

Backend: Node.js, Express.js, MongoDB

Authentication: JWT (JSON Web Tokens)

File Handling: Multer (for resume upload)

AI Integration: Gemini API

State Management: React Context API

Other Tools:

bcrypt (password hashing)

dotenv (environment variables)

cors (cross-origin support)