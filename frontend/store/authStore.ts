// frontend/store/authStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
}

function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                localStorage.setItem("ht_token", token);
                setCookie("ht_token", token);
                set({ user, token });
            },
            clearAuth: () => {
                localStorage.removeItem("ht_token");
                deleteCookie("ht_token");
                set({ user: null, token: null });
            },
            isAuthenticated: () => !!get().token,
        }),
        { name: "ht_auth", partialize: (s) => ({ user: s.user, token: s.token }) }
    )
);
