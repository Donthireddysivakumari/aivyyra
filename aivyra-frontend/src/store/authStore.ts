import { create } from "zustand";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profile?: any;
}

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  userName: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  
  login: (token: string, role: string, name: string, userId: number) => void;
  logout: () => void;
  setProfile: (profile: UserProfile) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  userId: null,
  userName: null,
  isAuthenticated: false,
  userProfile: null,

  login: (token, role, name, userId) => {
    localStorage.setItem("aivyra_token", token);
    localStorage.setItem("aivyra_role", role);
    localStorage.setItem("aivyra_name", name);
    localStorage.setItem("aivyra_userId", String(userId));
    
    set({
      token,
      role,
      userName: name,
      userId,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("aivyra_token");
    localStorage.removeItem("aivyra_role");
    localStorage.removeItem("aivyra_name");
    localStorage.removeItem("aivyra_userId");
    
    set({
      token: null,
      role: null,
      userName: null,
      userId: null,
      isAuthenticated: false,
      userProfile: null,
    });
  },

  setProfile: (profile) => {
    set({ userProfile: profile });
  },

  initialize: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("aivyra_token");
      const role = localStorage.getItem("aivyra_role");
      const name = localStorage.getItem("aivyra_name");
      const userId = localStorage.getItem("aivyra_userId");

      if (token && role && name && userId) {
        set({
          token,
          role,
          userName: name,
          userId: Number(userId),
          isAuthenticated: true,
        });
      }
    }
  },
}));
