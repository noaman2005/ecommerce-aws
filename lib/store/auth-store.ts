import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { ADMIN_EMAIL } from '@/lib/constants';
import * as cognito from '@/lib/auth/cognito';

interface AuthStore extends AuthState {
  emailToVerify: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setEmailToVerify: (email: string | null) => void;
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
      emailToVerify: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setEmailToVerify: (email) => set({ emailToVerify: email }),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { session, attributes } = await cognito.signIn(email, password);
          const token = session.getIdToken().getJwtToken();

          const derivedRole: 'admin' | 'customer' = (attributes.email === ADMIN_EMAIL) ? 'admin' : 'customer';
          const user: User = {
            id: attributes.sub,
            email: attributes.email,
            name: attributes.name,
            role: derivedRole,
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
          // Log error for easier debugging in the browser console
          console.error('[auth-store] login error', error);
          set({ isLoading: false });
          throw cognito.mapCognitoError(error);
        }
      },

      signup: async (email: string, password: string, name: string, role = 'customer') => {
        try {
          set({ isLoading: true });
          await cognito.signUp(email, password, name, role);
          // Persist email so the verify page can read it after navigation/refresh
          set({ isLoading: false, emailToVerify: email });
        } catch (error) {
          // Log error for easier debugging in the browser console
          console.error('[auth-store] signup error', error);
          set({ isLoading: false });
          throw cognito.mapCognitoError(error);
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
          const { session, attributes } = await cognito.getSessionAndAttributes();
          const token = session.getIdToken().getJwtToken();

          const derivedRole: 'admin' | 'customer' = (attributes.email === ADMIN_EMAIL) ? 'admin' : 'customer';
          const user: User = {
            id: attributes.sub,
            email: attributes.email,
            name: attributes.name,
            role: derivedRole,
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
          // Log error to help identify why checkAuth failed
          console.error('[auth-store] checkAuth error', error);
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
        emailToVerify: state.emailToVerify,
      }),
    }
  )
);
