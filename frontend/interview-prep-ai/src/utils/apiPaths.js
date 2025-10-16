// src/utils/apiPaths.js
export const BASE_URL = import.meta.env.VITE_API_URL;

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },

  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions",
    GENERATE_EXPLANATIONS: "/api/ai/generate-explanation",
  },

  ATS: {
    SCORE: "/api/ats/score",
    REPORTS: "/api/ats/reports",
    REPORT: (id) => `/api/ats/reports/${id}`,
    DOWNLOAD: (id) => `/api/ats/reports/${id}/download`,
    DELETE: (id) => `/api/ats/reports/${id}`,
  },

  SESSION: {
    CREATE: "/api/sessions/create",
    GET_ALL: "/api/sessions/my-sessions",
    GET_ONE: (id) => `/api/sessions/${id}`,
    DELETE: (id) => `/api/sessions/${id}`,
  },

  QUESTION: {
    ADD_TO_SESSION: "/api/questions/add",
    PIN: (id) => `/api/questions/${id}/pin`,
    UPDATE_NOTE: (id) => `/api/questions/${id}/note`,
  },

  CODING: {
    GENERATE: "/api/coding/generate",
    LIST_SESSIONS: "/api/coding/sessions",
    STATS: "/api/coding/sessions/stats",
    ADD_MORE_QUESTIONS: (sessionId) => `/api/coding/sessions/${sessionId}/add-questions`,
    PIN: (sessionId, questionId) =>
      `/api/coding/sessions/${sessionId}/questions/${questionId}/pin`,
    GET_SOLUTION: (sessionId, questionId, language) =>
      `/api/coding/sessions/${sessionId}/questions/${questionId}/solution/${language}`,
    MARK_COMPLETED: (sessionId) => `/api/coding/sessions/${sessionId}/complete`,
    SESSION: {
      DELETE: (id) => `/api/coding/sessions/${id}`,
    },
  },

  TEMPLATES: {
    GENERATE: "/api/templates/generate",
    SAVE: "/api/templates/save",
    MY_LIBRARY: "/api/templates/mylibrary",
    DELETE: (templateId) => `/api/templates/${templateId}`,
  },
};
