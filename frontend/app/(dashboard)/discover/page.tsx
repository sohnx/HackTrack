// frontend/app/(dashboard)/discover/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import HackathonCard from "@/components/shared/HackathonCard";
import EmptyState from "@/components/shared/EmptyState";
import { useHackathons, useSaveHackathon } from "@/hooks/useHackathons";
import { Hackathon, HackathonStatus, HackathonSource } from "@/types/hackathon";
import { cn } from "@/utils/cn";

const SOURCES: HackathonSource[] = [
    "devfolio", "devpost", "unstop", "hack2skill", "ethglobal", "mlh", "hackerearth", "kaggle", "reskilll", "manual"
];
const STATUSES: HackathonStatus[] = ["upcoming", "ongoing", "completed", "saved"];

export default function DiscoverPage() {
    const { data: hackathons = [], isLoading } = useHackathons();
    const { mutate: saveHackathon } = useSaveHackathon();
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<HackathonStatus | "all">("all");
    const [source, setSource] = useState<HackathonSource | "all">("all");
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const filtered = useMemo(() => {
        return hackathons.filter((h) => {
            if (query && !h.title.toLowerCase().includes(query.toLowerCase())) return false;
            if (status !== "all" && h.status !== status) return false;
            if (source !== "all" && h.source !== source) return false;
            if (onlineOnly && !h.is_online) return false;
            return true;
        });
    }, [hackathons, query, status, source, onlineOnly]);

    const activeFilters = [
        status !== "all" && status,
        source !== "all" && source,
        onlineOnly && "online only",
    ].filter(Boolean).length;

    const clearFilters = () => {
        setStatus("all"); setSource("all"); setOnlineOnly(false);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <PageHeader
                title="Discover"
                subtitle="Browse and save hackathons from all platforms"
            />

            {/* Search + filter bar */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search hackathons..."
                        className="w-full bg-[#111111] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                            <X size={13} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition",
                        showFilters || activeFilters > 0
                            ? "bg-white text-black border-white"
                            : "bg-[#111111] border-white/10 text-white/60 hover:text-white"
                    )}
                >
                    <SlidersHorizontal size={14} />
                    Filters
                    {activeFilters > 0 && (
                        <span className="bg-black/20 text-xs px-1.5 py-0.5 rounded-full">{activeFilters}</span>
                    )}
                </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 uppercase tracking-wider">Status</label>
                            <div className="flex flex-wrap gap-1.5">
                                {(["all", ...STATUSES] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        className={cn(
                                            "text-xs px-2.5 py-1 rounded-full border transition capitalize",
                                            status === s
                                                ? "bg-white text-black border-white"
                                                : "border-white/10 text-white/50 hover:text-white"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Source */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 uppercase tracking-wider">Source</label>
                            <div className="flex flex-wrap gap-1.5">
                                {(["all", ...SOURCES] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSource(s)}
                                        className={cn(
                                            "text-xs px-2.5 py-1 rounded-full border transition capitalize",
                                            source === s
                                                ? "bg-white text-black border-white"
                                                : "border-white/10 text-white/50 hover:text-white"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Online toggle */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 uppercase tracking-wider">Mode</label>
                            <button
                                onClick={() => setOnlineOnly(!onlineOnly)}
                                className={cn(
                                    "text-xs px-2.5 py-1 rounded-full border transition",
                                    onlineOnly
                                        ? "bg-white text-black border-white"
                                        : "border-white/10 text-white/50 hover:text-white"
                                )}
                            >
                                Online only
                            </button>
                        </div>
                    </div>

                    {activeFilters > 0 && (
                        <button onClick={clearFilters} className="text-xs text-white/30 hover:text-white transition flex items-center gap-1">
                            <X size={11} /> Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* Results count */}
            <p className="text-xs text-white/30 mb-4">
                {isLoading ? "Loading..." : `${filtered.length} hackathon${filtered.length !== 1 ? "s" : ""}`}
            </p>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No hackathons found"
                    description="Try adjusting your filters or search query"
                    action={
                        activeFilters > 0
                            ? <button onClick={clearFilters} className="text-xs text-white/60 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition">Clear filters</button>
                            : undefined
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((h) => (
                        <HackathonCard
                            key={h.id}
                            hackathon={h}
                            onSave={(id, is_saved) => saveHackathon({ id, is_saved })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}