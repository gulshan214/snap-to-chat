import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, name: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (email: string, _password: string) => {
        set({ isAuthenticated: true, user: { email, name: email.split('@')[0] } });
        return true;
      },
      signup: (email: string, name: string, _password: string) => {
        set({ isAuthenticated: true, user: { email, name } });
        return true;
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
    }),
    { name: 'snapchat-viewer-auth' }
  )
);
