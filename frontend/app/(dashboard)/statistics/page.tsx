// frontend/app/(dashboard)/statistics/page.tsx
"use client";

import { useMemo } from "react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Trophy, Flame, CheckCircle, Bookmark } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { useHackathons } from "@/hooks/useHackathons";
import { BarChart3 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
    upcoming: "#60a5fa",
    ongoing: "#34d399",
    completed: "#71717a",
    saved: "#facc15",
};

const SOURCE_COLORS: Record<string, string> = {
    devfolio: "#818cf8", devpost: "#60a5fa", unstop: "#fb923c",
    hack2skill: "#f472b6", ethglobal: "#a78bfa", mlh: "#f87171",
    hackerearth: "#4ade80", kaggle: "#22d3ee", manual: "#a1a1aa",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function StatisticsPage() {
    const { data: hackathons = [], isLoading } = useHackathons();

    const stats = useMemo(() => {
        const total = hackathons.length;
        const ongoing = hackathons.filter((h) => h.status === "ongoing").length;
        const completed = hackathons.filter((h) => h.status === "completed").length;
        const saved = hackathons.filter((h) => h.is_saved).length;
        return { total, ongoing, completed, saved };
    }, [hackathons]);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        hackathons.forEach((h) => { counts[h.status] = (counts[h.status] ?? 0) + 1; });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [hackathons]);

    const sourceData = useMemo(() => {
        const counts: Record<string, number> = {};
        hackathons.forEach((h) => { counts[h.source] = (counts[h.source] ?? 0) + 1; });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [hackathons]);

    const monthlyData = useMemo(() => {
        const counts = new Array(12).fill(0);
        hackathons.forEach((h) => {
            const d = new Date(h.created_at);
            if (!isNaN(d.getTime())) counts[d.getMonth()]++;
        });
        return MONTHS.map((name, i) => ({ name, value: counts[i] }));
    }, [hackathons]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
        );
    }

    if (hackathons.length === 0) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <PageHeader title="Statistics" subtitle="Insights across all your hackathons" />
                <EmptyState icon={BarChart3} title="No data yet" description="Add hackathons to see your statistics" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <PageHeader title="Statistics" subtitle="Insights across all your hackathons" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total" value={stats.total} icon={Trophy} color="default" />
                <StatCard label="Ongoing" value={stats.ongoing} icon={Flame} color="green" />
                <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="blue" />
                <StatCard label="Saved" value={stats.saved} icon={Bookmark} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Status breakdown */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
                    <h2 className="text-sm font-medium text-white mb-4">By Status</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                {statusData.map((entry) => (
                                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#71717a"} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                        {statusData.map((s) => (
                            <div key={s.name} className="flex items-center gap-1.5 text-xs text-white/40 capitalize">
                                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.name] ?? "#71717a" }} />
                                {s.name} ({s.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* Source breakdown */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
                    <h2 className="text-sm font-medium text-white mb-4">By Source</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={sourceData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} className="capitalize" />
                            <Tooltip contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {sourceData.map((entry) => (
                                    <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] ?? "#71717a"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly activity */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
                <h2 className="text-sm font-medium text-white mb-4">Monthly Activity</h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="value" fill="#ffffff" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}