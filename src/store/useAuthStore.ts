import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  userData: any | null; // Teacher or Student document
  role: 'teacher' | 'student' | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserData: (data: any | null) => void;
  setRole: (role: 'teacher' | 'student' | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  role: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserData: (data) => set({ userData: data }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
}));
