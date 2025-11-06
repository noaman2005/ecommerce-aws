import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import * as cognito from '@/lib/auth/cognito';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: 'customer' | 'host') => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  switchRole: (role: 'customer' | 'host' | 'admin') => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      token: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const session = await cognito.signIn(email, password);
          const token = session.getIdToken().getJwtToken();
          const attributes = await cognito.getUserAttributes();

          const user: User = {
            id: attributes.sub,
            email: attributes.email,
            name: attributes.name,
            role: (attributes['custom:role'] as 'customer' | 'host' | 'admin') || 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string, role = 'customer') => {
        try {
          set({ isLoading: true });
          await cognito.signUp(email, password, name, role);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        cognito.signOut();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const session = await cognito.getCurrentSession();
          const token = session.getIdToken().getJwtToken();
          const attributes = await cognito.getUserAttributes();

          const user: User = {
            id: attributes.sub,
            email: attributes.email,
            name: attributes.name,
            role: (attributes['custom:role'] as 'customer' | 'host' | 'admin') || 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      switchRole: (role: 'customer' | 'host' | 'admin') => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, role },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
