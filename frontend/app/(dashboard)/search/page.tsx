// frontend/app/(dashboard)/search/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import HackathonCard from "@/components/shared/HackathonCard";
import EmptyState from "@/components/shared/EmptyState";
import { useHackathons, useSaveHackathon } from "@/hooks/useHackathons";

export default function SearchPage() {
    const { data: hackathons = [], isLoading } = useHackathons();
    const { mutate: saveHackathon } = useSaveHackathon();
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return hackathons.filter((h) =>
            h.title.toLowerCase().includes(q) ||
            h.description?.toLowerCase().includes(q) ||
            h.location?.toLowerCase().includes(q) ||
            h.source.toLowerCase().includes(q) ||
            h.tags?.some((t) => t.toLowerCase().includes(q))
        );
    }, [hackathons, query]);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <PageHeader title="Search" subtitle="Find hackathons by title, tag, source, or location" />

            <div className="relative mb-6">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search hackathons..."
                    className="w-full bg-[#111111] border border-white/10 rounded-lg pl-9 pr-9 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition"
                />
                {query && (
                    <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                        <X size={13} />
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : !query.trim() ? (
                <EmptyState icon={SearchIcon} title="Start typing to search" description="Search across all your hackathons" />
            ) : results.length === 0 ? (
                <EmptyState icon={SearchIcon} title="No results" description={`Nothing matches "${query}"`} />
            ) : (
                <>
                    <p className="text-xs text-white/30 mb-4">
                        {results.length} result{results.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {results.map((h) => (
                            <HackathonCard
                                key={h.id}
                                hackathon={h}
                                onSave={(id, is_saved) => saveHackathon({ id, is_saved })}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}