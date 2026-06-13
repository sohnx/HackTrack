// frontend/components/sidebar/Sidebar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard, Compass, BookMarked, Flag,
    Calendar, Users, FolderOpen, BarChart2,
    Bell, Search, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { clsx } from "clsx";
import NavItem from "./NavItem";
import { useAuthStore } from "@/store/authStore";

const NAV = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/my-hackathons", label: "My Hackathons", icon: BookMarked },
    { href: "/milestones", label: "Milestones", icon: Flag },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/resources", label: "Resources", icon: FolderOpen },
    { href: "/statistics", label: "Statistics", icon: BarChart2 },
];

const BOTTOM_NAV = [
    { href: "/search", label: "Search", icon: Search },
    { href: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push("/login");
    };

    return (
        <aside
            className={clsx(
                "relative flex flex-col h-screen bg-[#111111] border-r border-white/10 transition-all duration-200 shrink-0",
                collapsed ? "w-[56px]" : "w-[220px]"
            )}
        >
            {/* Logo */}
            <div className={clsx("flex items-center h-14 px-4 border-b border-white/10 shrink-0",
                collapsed ? "justify-center" : "gap-2")}>
                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shrink-0">
                    <span className="text-black text-xs font-bold">H</span>
                </div>
                {!collapsed && <span className="font-semibold text-sm text-white">HackTrack</span>}
            </div>

            {/* Main nav */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {NAV.map((item) => (
                    <NavItem key={item.href} {...item} collapsed={collapsed} />
                ))}
            </nav>

            {/* Bottom nav */}
            <div className="p-2 space-y-0.5 border-t border-white/10">
                {BOTTOM_NAV.map((item) => (
                    <NavItem key={item.href} {...item} collapsed={collapsed} />
                ))}
            </div>

            {/* User + logout */}
            <div className={clsx(
                "p-3 border-t border-white/10 flex items-center gap-2",
                collapsed && "justify-center"
            )}>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs text-white font-medium uppercase">
                    {user?.username?.[0] ?? "?"}
                </div>
                {!collapsed && (
                    <>
                        <span className="text-xs text-white/60 truncate flex-1">{user?.username}</span>
                        <button onClick={handleLogout} className="text-white/30 hover:text-white transition">
                            <LogOut size={14} />
                        </button>
                    </>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-[52px] w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition z-10"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </aside>
    );
}