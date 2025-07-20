import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. User Type (updated based on response from API)
type User = {
  username: string;
  email: string;
  userid: string;
  imageurl: string;
  registerno: string;
  programminglang?: string[];
  technologiesknown?: string[];
  class10percentage?: string;
  class12percentage?: string;
  cgpa?: string;
  totalexperiences?: string;
  section?: string | null;
  currentdegree?: string | null;
  yearofstudy?: number | null;
  dob?: string | null;
  department?: string | null;
  remarks?: string | null;
  interests?: string | null;
  incollege?: string | null;
  backlog?: string | null;
  role?: 'student' ;
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
