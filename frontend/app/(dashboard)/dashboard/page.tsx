// frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock, CheckCircle, Flame, Plus, ArrowRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { useHackathons } from "@/hooks/useHackathons";
import { useAuthStore } from "@/store/authStore";
import { formatDate, deadlineLabel, isUrgent } from "@/utils/date";
import { cn } from "@/utils/cn";
import { Hackathon } from "@/types/hackathon";

const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500/10 text-blue-400",
    ongoing: "bg-emerald-500/10 text-emerald-400",
    completed: "bg-white/10 text-white/40",
    saved: "bg-yellow-500/10 text-yellow-400",
};

function HackathonRow({ h }: { h: Hackathon }) {
    const router = useRouter();
    const urgent = isUrgent(h.deadline);
    return (
        <div
            onClick={() => router.push(`/hackathons/${h.id}`)}
            className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer transition group"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs text-white/50 font-medium shrink-0">
                    {h.title[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-white truncate">{h.title}</p>
                    <p className={cn("text-xs mt-0.5", urgent ? "text-red-400" : "text-white/30")}>
                        {deadlineLabel(h.deadline)}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[h.status])}>
                    {h.status}
                </span>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { data: hackathons = [], isLoading } = useHackathons();
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    const stats = useMemo(() => ({
        total: hackathons.length,
        ongoing: hackathons.filter((h) => h.status === "ongoing").length,
        completed: hackathons.filter((h) => h.status === "completed").length,
        urgent: hackathons.filter((h) => isUrgent(h.deadline)).length,
    }), [hackathons]);

    const recent = hackathons
        .filter((h) => h.status !== "completed")
        .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
        .slice(0, 6);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <PageHeader
                title={`Good ${getGreeting()}, ${user?.username} 👋`}
                subtitle="Here's what's happening with your hackathons"
                action={
                    <button
                        onClick={() => router.push("/my-hackathons")}
                        className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition"
                    >
                        <Plus size={14} /> Add Hackathon
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total" value={stats.total} icon={Trophy} color="default" />
                <StatCard label="Ongoing" value={stats.ongoing} icon={Flame} color="green" />
                <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="blue" />
                <StatCard label="Urgent" value={stats.urgent} icon={Clock} color="yellow" trend="≤3 days" />
            </div>

            {/* Recent hackathons */}
            <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-sm font-medium text-white">Active Hackathons</span>
                    <button
                        onClick={() => router.push("/my-hackathons")}
                        className="text-xs text-white/40 hover:text-white transition flex items-center gap-1"
                    >
                        View all <ArrowRight size={12} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="py-12 flex items-center justify-center">
                        <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                    </div>
                ) : recent.length === 0 ? (
                    <EmptyState
                        icon={Trophy}
                        title="No hackathons yet"
                        description="Add your first hackathon to get started"
                        action={
                            <button
                                onClick={() => router.push("/discover")}
                                className="text-xs text-white/60 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition"
                            >
                                Discover hackathons
                            </button>
                        }
                    />
                ) : (
                    <div className="divide-y divide-white/5">
                        {recent.map((h) => <HackathonRow key={h.id} h={h} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
}