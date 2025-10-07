// backend/utils/prompts.js
// CommonJS module for backend prompt builders (no ESM exports)

"use strict";

// Shared helper
const sanitize = (s) =>
  String(s || "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Interview Q&A prompt
 */
const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => `
    You are an AI trained to generate technical interview questions and answers.
    
    Task:
    - Role: ${role}
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - Write ${numberOfQuestions} interview questions.
    - For each question, generate a detailed but beginner-friendly answer.
    - If the answer needs a code example, add a small code block inside.
    - Keep formatting very clean.
    - Return a pure JSON array like:
    [
        {
            "question": "Question here?",
            "answer": "Answer here."
        },
        ...
    ]
    Important: Do NOT add any extra text. Only return valid JSON.
`;

/**
 * Concept explanation prompt
 */
const conceptExplainPrompt = (question) => `
    You are an AI trained to generate explanations for a given interview question.
    
    Task:
    - Explain the following interview question and its concept in depth as if you're teaching a beginner developer.
    - Question: "${question}"
    - After the explanation, provide a short and clear title that summarizes the concept for the article or page header.
    - If the explanation includes a code example, provide a small code block.
    - keep the formatting very clean and clear.
    - Return the result as a valid JSON object in the following format:
    
    {
        "title": "Short title here?",
        "explanation": "Explanation here."
    }
        
    Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.
`;

/**
 * ATS scoring prompt (India 2025, strict JSON-only, resume-only or resume+context)
 */
const atsScorePrompt = ({ resumeText, role, experience, jobDescription }) => `
You are an expert ATS (Applicant Tracking System) evaluator focused on India's 2025 job market.
Return ONLY a valid JSON object in the exact structure specified below. No markdown fences, no extra text, no trailing commas.

Operate in two modes:
- Mode A (Resume-only): If Target ${role} and ${jobDescription} are "N/A" or empty, score against India-2025 market demand for the resume’s apparent domain and ${experience} level.
- Mode B (Resume+Context): If Target ${role} and/or ${jobDescription} are present, score and recommend primarily by ${jobDescription}-critical alignment for that role in India.

Strict output contract:
- Output must be EXACTLY this JSON structure, with integers (0–100) for all scores:
{
  "overallScore": 87,
  "sectionScores": {
    "Experience": 85,
    "Skills": 78,
    "Education": 90,
    "Projects": 70,
    "Formatting": 80
  },
  "summary": "One paragraph summary of strengths and weaknesses.",
  "keywordAnalysis": {
    "present": ["React", "Node.js", "MongoDB"],
    "missing": ["AWS", "Docker", "Kubernetes"]
  },
  "recommendations": [
    {
      "issue": "No quantified achievements",
      "exampleFix": "Led a team of 3 developers and increased application performance by 40%"
    },
    {
      "issue": "Missing cloud technologies",
      "exampleFix": "Deployed applications using AWS EC2 and managed CI/CD pipelines"
    }
  ]
}

Scoring rules (integers 0–100):
- If ${experience} (YoE) <= 1 (fresher):
  Weights: Experience 20, Skills 30, Education 15, Projects 25, Formatting 10
- Else (experienced):
  Weights: Experience 30, Skills 30, Education 10, Projects 15, Formatting 15
- overallScore = weighted sum of sectionScores, rounded to nearest integer.
- Penalize: vague bullets (no numbers/outcomes), missing dates/titles, non-standard headings, tables/columns/graphics, keyword stuffing, inconsistent tense, dense formatting.
- Reward: quantified impact (%, time/cost, scale), recent/relevant projects, clear role scope, standard headings, single-column, simple bullets.

India-2025 weighting (apply in Mode A and Mode B when relevant to role/JD):
- Upweight demand clusters: Cloud (AWS/Azure/GCP), Kubernetes/Docker, CI/CD (GitHub Actions/GitLab/Jenkins), Linux, Microservices, System Design, Security (OWASP/SAST/DAST), DSA/Algorithms.
- For data/AI roles: Python, SQL, ML/DS, Spark, data modeling, MLOps.
- For frontend: React/Next.js, TypeScript, state mgmt, accessibility, testing.
- For backend: Java/Spring, Node.js/NestJS, databases (PostgreSQL/MySQL/MongoDB), caching, messaging.
- For mobile: Kotlin/Jetpack or Swift/SwiftUI, CI/CD, store releases.
- For DevOps/SRE: IaC (Terraform), observability (Prometheus/Grafana), reliability practices.
- For security: IAM, secrets mgmt, threat modeling, compliance basics.

Keyword intelligence:
- Normalize synonyms/near-matches (some examples): 
  React.js ≈ React; EC2 ≈ AWS compute; K8s ≈ Kubernetes; GKE/EKS/AKS ≈ Managed Kubernetes; 
  Pipelines ≈ CI/CD; Microservice ≈ Microservices; Docker images/containers ≈ Docker;
  Postgres ≈ PostgreSQL; TF ≈ Terraform; PyTorch/TensorFlow ≈ Deep Learning frameworks.
- keywordAnalysis.present: normalized, deduped key terms present (≤ 25).
- keywordAnalysis.missing: the most JD-critical or India-2025 critical gaps (≤ 20), prioritized by impact for the role/YoE.

Recommendations (high-utility, paste-ready):
- Provide 5–8 prioritized items max, each with:
  "issue": short, role/JD-aware gap (e.g., "No CI/CD evidence", "Missing Kubernetes for microservices role").
  "exampleFix": a single, concrete, quantified one-liner suitable for resume bullets (e.g., "Containerized 4 services with Docker and deployed to EKS, reducing release time 30%").
- If formatting hurts ATS parsing, include an explicit formatting fix (e.g., "Use single-column, standard headings: Experience, Skills, Education, Projects; simple • bullets; avoid tables/graphics").
- Prefer India-relevant, JD-aware fixes; if JD is absent (Mode A), prioritize India-2025 demand clusters for the inferred role domain and YoE.

Constraints and guardrails:
- Output EXACT JSON structure (no added/removed fields). All scores are integers 0–100.
- "summary": 3–5 crisp sentences covering strengths, key gaps vs JD/market, and top next steps (India-2025 aware).
- Do not invent employers, dates, or credentials. If unknown, score conservatively and capture the gap in recommendations.
- Use only the provided Resume Content and Context; think step-by-step internally but output only JSON.

Context (use as provided; treat "N/A"/empty as absent):
- Target Role: ${role || "N/A"}
- Years of Experience: ${experience || "N/A"}
- Job Description: ${jobDescription || "N/A"}

Resume Content:
${resumeText}
`;

/**
 * Coding problems prompt
 */
const generateCodingQue = ({ topics, experience, difficulty, count }) => `
You are a coding interview generator. Generate ${count} unique ${difficulty} coding interview problems focusing on these topics: ${topics}, suitable for a candidate with ${experience} years of experience.

Each problem MUST be returned as valid JSON with these keys only:
- statement: detailed problem description
- constraints: array of constraint strings (keep short)
- examples: array of {input, output, explanation} (2-3 examples max)
- solutionExplanation: brief explanation of approach
- difficulty: one of "Easy", "Medium", "Hard"
- solutions: object with short code snippets for {python, cpp, c, java}
- inputFormat: "single_line", "multi_line", "array", or "matrix"
- outputFormat: "single_value", "array", or "matrix"
- dataTypes: {input: ["type1"], output: "outputType"}

Keep examples simple and solutions concise. Focus on algorithmic thinking rather than implementation details.

Return ONLY a pure JSON array of problems. Do not add markdown fences, commentary, or extra text.
`;

/**
 * Add more coding problems prompt (avoid duplicates)
 */
const addMoreCoding = ({ topics, experience, difficulty, count, existingStatements = [] }) => `
You are a coding interview generator. Generate exactly ${count} coding interview problems focusing on these topics: ${topics.join(", ")} with ${difficulty} difficulty for someone with ${experience} years of experience. 

CRITICAL RULES:
- Generate EXACTLY ${count} problems, no more, no less.
- Output MUST be a pure JSON array of exactly ${count} objects.
- Do NOT include markdown, backticks, or any text outside the JSON.
- Do not generate any problems that have a statement matching any of the following statements: ${existingStatements
  .map((s) => `"${String(s).substring(0, 60)}..."`)
  .join(", ")}

Each question object MUST include:
- statement: detailed problem description
- constraints: array of constraint strings
- examples: array of {input, output, explanation} (2–3 examples)
- solutionExplanation: brief explanation
- difficulty: one of "Easy", "Medium", "Hard"
- solutions: object with working code for each language {python, cpp, c, java}
- inputFormat: "single_line", "multi_line", "array", or "matrix"
- outputFormat: "single_value", "array", or "matrix"
- dataTypes: {input: ["type1"], output: "outputType"}

INPUT/OUTPUT FORMAT RULES:
1. ALL inputs must use space-separated format, NOT JSON arrays
2. For arrays: use "1 2 3 4 5" NOT "[1, 2, 3, 4, 5]"
3. For multiple lines: use "\\n" to separate lines
4. For empty arrays: use "" as input, "0" or appropriate default as output
5. For null results: use "null" (string) as expectedOutput
6. All inputs must be parseable by standard stdin reading (input(), scanf, cin, etc.)

VALID INPUT FORMATS:
- "5"
- "1 2 3 4 5"
- "5\\n1 2 3 4 5"
- "hello world"
- ""

INVALID INPUT FORMATS:
- "[1, 2, 3]"
- "{"key": "value"}"
- "1,2,3,4,5"
`;

/**
 * Get solution prompt for coding problem
 */
const getSolution = ({ language, question }) => `
Generate a complete, production-ready solution for this coding problem in ${language}:

Problem: ${question.statement}

Constraints: ${question.constraints?.join(", ") || "None"}

Examples: ${
  question.examples?.map((ex) => `Input: ${ex.input}\nOutput: ${ex.output}`).join("\n") || "None"
}

CRITICAL REQUIREMENTS:
1. The code MUST read input dynamically from stdin (not hardcoded values)
2. The code MUST handle the exact input format from test cases
3. The code MUST produce output that matches expected output exactly
4. The solution MUST pass ALL 10 test cases when executed
5. Test the solution logic thoroughly before providing it
6. Include proper input parsing for the language
7. Provide a detailed explanation in this format(Problem description, Algorithm(if the solution has), Code implementation, Time and Space Complexity)- you should follow same pattern for all the questions and for all the programming languages. Use HTML <strong> tags for main headings and a single bullet point symbol '•' for list items. The structure should be: <strong>Heading 1</strong><br>• Point 1<br>• Point 2<br><strong>Heading 2</strong>... (Mandatory)
8. Use single bullet points (•) for explanation points
9. Include accurate time and space complexity analysis

Language-specific input handling:
- Python: Use input() or sys.stdin.read() to read from stdin, handle multiple lines properly.
- Java: Use Scanner(System.in) or BufferedReader to read from stdin  
- C++: Use cin or getline to read from stdin
- C: Use scanf/fgets to read from stdin

IMPORTANT: The generated solution must be tested against the provided test cases to ensure 100% correctness.

Return as JSON with keys: code, explanation, timeComplexity, spaceComplexity

The explanation should use HTML formatting with <strong> tags for headings and • for bullet points.
`;

// backend/utils/prompts.js

const baseConstraints = `
- Produce an email that feels human and personable while remaining concise and professional.
- Use an authentic voice (avoid AI clichés like "as an AI" or "I'm excited to apply for the role at your esteemed organization").
- Prefer specific, concrete phrasing over generic fluff; include 1–2 tailored, high-impact lines derived from context.
- Keep paragraphs short (2–3 lines) and scannable; avoid walls of text.
- Provide one alternate subject line variant on the next line prefixed by "Alt:" for A/B testing.
- Do not insert placeholders the user didn't provide; infer naturally from available details.
- Use Indian English conventions where suitable (optional).
`.trim();

const formatFields = ({ targetRole, yoe, jd, resumeHighlights }) => `
Context:
- Target Role: ${sanitize(targetRole)}
- Years of Experience (YOE): ${sanitize(yoe)}
- JD Details (key points): ${sanitize(jd)}
- Resume Highlights (key points): ${sanitize(resumeHighlights)}
`.trim();

const coldMailPrompt = (fields) => `
Write a persuasive cold email to a recruiter for the role "${sanitize(
  fields.targetRole
)}", highlighting ${sanitize(fields.yoe)} years of experience and briefly aligning with the JD and relevant achievements.

${formatFields(fields)}

${baseConstraints}

Output format:
Subject: <compelling subject line>
Email:
<short, confident body with a concrete value hook, 1–2 specific ties to JD, and a clear next step>
`.trim();

const referralPrompt = (fields) => `
Write a polite referral request for the role "${sanitize(
  fields.targetRole
)}", mentioning ${sanitize(fields.yoe)} years of experience and 1–2 reasons of fit tied to JD or accomplishments. Keep it respectful and low-friction to respond.

${formatFields(fields)}

${baseConstraints}

Output format:
Subject: <clear subject line for referral ask>
Email:
<brief body that respects their time, adds credibility, and includes an easy call-to-action>
`.trim();

const followUpPrompt = (fields) => `
Write a concise follow-up email regarding the role "${sanitize(
  fields.targetRole
)}" for a candidate with ${sanitize(
  fields.yoe
)} years of experience. Be polite, reaffirm fit with one concrete point, and suggest a next step.

${formatFields({
  ...fields,
  jd: "",
  resumeHighlights: "",
})}

${baseConstraints}

Output format:
Subject: <polite follow-up subject>

Email:
<short, appreciative body that nudges a decision without pressure>
`.trim();

/**
 * Build template prompt by type.
 * type: "cold" | "referral" | "followup"
 * fields: { targetRole, yoe, jd, resumeHighlights }
 */
const buildTemplatePrompt = (type, fields) => {
  switch (String(type || "cold").toLowerCase()) {
    case "cold":
      return coldMailPrompt(fields);
    case "referral":
      return referralPrompt(fields);
    case "followup":
      return followUpPrompt(fields);
    default:
      return coldMailPrompt(fields);
  }
};






module.exports = {
  // Interview/Explanation/ATS
  questionAnswerPrompt,
  conceptExplainPrompt,
  atsScorePrompt,
  // Coding
  generateCodingQue,
  addMoreCoding,
  getSolution,
  // Templates
  buildTemplatePrompt,
};
