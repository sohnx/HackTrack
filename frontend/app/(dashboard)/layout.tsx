// frontend/app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/sidebar/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const hasHydrated = useAuthStore((s) => s.hasHydrated);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) router.replace("/login");
    }, [hasHydrated, isAuthenticated, router]);

    if (!hasHydrated || !isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}