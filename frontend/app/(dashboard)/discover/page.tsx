// frontend/app/(dashboard)/discover/page.tsx
"use client";

import { useState, useMemo } from "react";
import {
    Search, SlidersHorizontal, X, RefreshCw, Bookmark, BookmarkCheck,
    Calendar, MapPin, Trophy, ExternalLink
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useDiscovered, useSaveDiscovered } from "@/hooks/useDiscover";
import { useHackathons } from "@/hooks/useHackathons";
import { DiscoveredHackathon, HackathonSource } from "@/types/hackathon";
import { cn } from "@/utils/cn";
import { formatDate, isUrgent, deadlineLabel } from "@/utils/date";
import api from "@/lib/api";

const SOURCES: HackathonSource[] = [
    "devfolio", "devpost", "unstop", "hack2skill", "ethglobal", "mlh", "hackerearth", "kaggle", "reskilll",
];

const sourceColors: Record<string, string> = {
    devfolio: "text-indigo-400", devpost: "text-blue-400", unstop: "text-orange-400",
    ethglobal: "text-purple-400", mlh: "text-red-400", hackerearth: "text-green-400",
    kaggle: "text-cyan-400", hack2skill: "text-yellow-400", reskilll: "text-pink-400",
};

export default function DiscoverPage() {
    const { data: discovered = [], isLoading, refetch } = useDiscovered();
    const { data: myHackathons = [] } = useHackathons();
    const { mutate: saveDiscovered, isPending: isSaving } = useSaveDiscovered();

    const [query, setQuery] = useState("");
    const [source, setSource] = useState<HackathonSource | "all">("all");
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    // IDs already saved to personal list
    const alreadySavedUrls = useMemo(
        () => new Set(myHackathons.map((h) => h.url).filter(Boolean)),
        [myHackathons]
    );

    const filtered = useMemo(() => {
        return discovered.filter((h) => {
            if (query && !h.title.toLowerCase().includes(query.toLowerCase())) return false;
            if (source !== "all" && h.source !== source) return false;
            if (onlineOnly && !h.is_online) return false;
            return true;
        });
    }, [discovered, query, source, onlineOnly]);

    const activeFilters = [source !== "all" && source, onlineOnly && "online only"].filter(Boolean).length;
    const clearFilters = () => { setSource("all"); setOnlineOnly(false); };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post("/sync/run");
            await refetch();
        } finally {
            setSyncing(false);
        }
    };

    const handleSave = (h: DiscoveredHackathon) => {
        setSavedIds((prev) => new Set(prev).add(h.id));
        saveDiscovered(h);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <PageHeader
                title="Discover"
                subtitle="Browse and save hackathons from all platforms"
                action={
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg transition disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync now"}
                    </button>
                }
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
                    {activeFilters > 0 && <span className="bg-black/20 text-xs px-1.5 py-0.5 rounded-full">{activeFilters}</span>}
                </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 uppercase tracking-wider">Source</label>
                            <div className="flex flex-wrap gap-1.5">
                                {(["all", ...SOURCES] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSource(s)}
                                        className={cn(
                                            "text-xs px-2.5 py-1 rounded-full border transition capitalize",
                                            source === s ? "bg-white text-black border-white" : "border-white/10 text-white/50 hover:text-white"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 uppercase tracking-wider">Mode</label>
                            <button
                                onClick={() => setOnlineOnly(!onlineOnly)}
                                className={cn(
                                    "text-xs px-2.5 py-1 rounded-full border transition",
                                    onlineOnly ? "bg-white text-black border-white" : "border-white/10 text-white/50 hover:text-white"
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

            <p className="text-xs text-white/30 mb-4">
                {isLoading ? "Loading..." : `${filtered.length} hackathon${filtered.length !== 1 ? "s" : ""}`}
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title={discovered.length === 0 ? "No hackathons synced yet" : "No hackathons found"}
                    description={discovered.length === 0 ? "Click \"Sync now\" to fetch hackathons from all platforms" : "Try adjusting your filters"}
                    action={
                        discovered.length === 0
                            ? <button onClick={handleSync} disabled={syncing} className="text-xs text-white/60 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition">{syncing ? "Syncing..." : "Sync now"}</button>
                            : activeFilters > 0 ? <button onClick={clearFilters} className="text-xs text-white/60 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition">Clear filters</button> : undefined
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((h) => {
                        const alreadySaved = alreadySavedUrls.has(h.url) || savedIds.has(h.id);
                        const urgent = isUrgent(h.deadline);
                        return (
                            <div key={h.id} className="bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col gap-4 hover:border-white/20 transition">
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-sm font-semibold text-white/60 shrink-0">
                                            {h.title[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{h.title}</p>
                                            <p className={cn("text-xs capitalize", sourceColors[h.source] ?? "text-white/30")}>{h.source}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {h.url && (
                                            <a href={h.url} target="_blank" rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-white/20 hover:text-white/60 transition">
                                                <ExternalLink size={13} />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => !alreadySaved && handleSave(h)}
                                            disabled={alreadySaved || isSaving}
                                            className="text-white/20 hover:text-white/60 transition disabled:cursor-default"
                                            title={alreadySaved ? "Already in My Hackathons" : "Save to My Hackathons"}
                                        >
                                            {alreadySaved
                                                ? <BookmarkCheck size={15} className="text-yellow-400" />
                                                : <Bookmark size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                {h.description && (
                                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{h.description}</p>
                                )}

                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
                                    {h.deadline && (
                                        <div className={cn("flex items-center gap-1.5", urgent && "text-red-400")}>
                                            <Calendar size={11} />
                                            <span>{urgent ? deadlineLabel(h.deadline) : formatDate(h.deadline)}</span>
                                        </div>
                                    )}
                                    {h.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={11} />
                                            <span className="truncate">{h.is_online ? "Online" : h.location}</span>
                                        </div>
                                    )}
                                    {h.prize_pool && (
                                        <div className="flex items-center gap-1.5 text-yellow-400/70">
                                            <Trophy size={11} />
                                            <span>{h.prize_pool}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                {h.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap pt-1 border-t border-white/5">
                                        {h.tags.slice(0, 3).map((t) => (
                                            <span key={t} className="text-xs text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}