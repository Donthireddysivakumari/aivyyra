import axios from "axios";

// Dynamically determine the default API endpoint based on environment
let defaultApiUrl = "http://127.0.0.1:8000";
if (typeof window !== "undefined" && (window as any).Capacitor) {
  // Use the Android emulator host loopback address when running inside Capacitor
  defaultApiUrl = "http://10.0.2.2:8000";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach authorization token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aivyra_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Global 401 interceptor — auto-logout when token expires or is invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401
    ) {
      // Clear all stored auth credentials
      localStorage.removeItem("aivyra_token");
      localStorage.removeItem("aivyra_role");
      localStorage.removeItem("aivyra_name");
      localStorage.removeItem("aivyra_userId");

      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const authService = {
  register: async (payload: any) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },
  login: async (payload: any) => {
    const res = await api.post("/auth/login-json", payload);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },
};

// Course endpoints
export const courseService = {
  list: async () => {
    const res = await api.get("/courses");
    return res.data;
  },
  getDetails: async (id: number) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
  updateProgress: async (id: number, completionPercentage: number) => {
    const res = await api.post(`/courses/${id}/progress`, {
      completion_percentage: completionPercentage,
    });
    return res.data;
  },
  getStudentProgress: async () => {
    const res = await api.get("/courses/progress/all");
    return res.data;
  },
  getMyCertificates: async () => {
    const res = await api.get("/courses/certificates/my");
    return res.data;
  },
};

// Quiz endpoints
export const quizService = {
  getQuiz: async (id: number) => {
    const res = await api.get(`/quizzes/${id}`);
    return res.data;
  },
  submitAttempt: async (id: number, score: number) => {
    const res = await api.post(`/quizzes/${id}/attempt`, { quiz_id: id, score });
    return res.data;
  },
  submitAssessment: async (skillName: string, score: number) => {
    const res = await api.post("/quizzes/assessments", {
      skill_name: skillName,
      score,
    });
    return res.data;
  },
  getMyAttempts: async () => {
    const res = await api.get("/quizzes/attempts/my");
    return res.data;
  },
  getMyAssessments: async () => {
    const res = await api.get("/quizzes/assessments/my");
    return res.data;
  },
};

// User/Profile dashboard stats
export const userService = {
  getCurrentUser: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },
  getStudentStats: async () => {
    const res = await api.get("/users/student-dashboard-stats");
    return res.data;
  },
  getStudentsList: async () => {
    const res = await api.get("/users/students");
    return res.data;
  },
  getStudentById: async (id: number) => {
    const res = await api.get(`/users/students/${id}`);
    return res.data;
  },
  getPlatformStats: async () => {
    const res = await api.get("/users/stats");
    return res.data;
  },
};

// AI analytics endpoints
export const aiService = {
  getSkillGap: async (studentId: number) => {
    const res = await api.post("/ai/skill-gap-analysis", { student_id: studentId });
    return res.data;
  },
  getRecommendations: async (studentId: number) => {
    const res = await api.post("/ai/recommendations", { student_id: studentId });
    return res.data;
  },
  getPerformancePrediction: async (studentId: number) => {
    const res = await api.post("/ai/performance-prediction", { student_id: studentId });
    return res.data;
  },
};
