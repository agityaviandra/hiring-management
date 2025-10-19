import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'applicant';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

// Hardcoded demo users
const DEMO_USERS: User[] = [
    {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
    },
    {
        id: '2',
        email: 'applicant@example.com',
        name: 'Applicant User',
        role: 'applicant',
    },
];

const DEMO_PASSWORDS: Record<string, string> = {
    'admin@example.com': 'admin123',
    'applicant@example.com': 'applicant123',
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                const user = DEMO_USERS.find(u => u.email === email);
                const expectedPassword = DEMO_PASSWORDS[email];

                if (user && expectedPassword === password) {
                    set({ user, isAuthenticated: true });
                    return true;
                }

                return false;
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
