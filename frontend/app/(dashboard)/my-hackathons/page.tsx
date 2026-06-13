// frontend/app/(dashboard)/my-hackathons/page.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookMarked } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import HackathonCard from "@/components/shared/HackathonCard";
import EmptyState from "@/components/shared/EmptyState";
import { useHackathons, useSaveHackathon } from "@/hooks/useHackathons";
import { Hackathon, HackathonStatus } from "@/types/hackathon";

const GROUPS: { key: HackathonStatus; label: string }[] = [
    { key: "ongoing", label: "Ongoing" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
];

export default function MyHackathonsPage() {
    const { data: hackathons = [], isLoading } = useHackathons();
    const { mutate: saveHackathon } = useSaveHackathon();
    const router = useRouter();

    const grouped = useMemo(() => {
        const map: Record<HackathonStatus, Hackathon[]> = {
            upcoming: [], ongoing: [], completed: [], saved: [],
        };
        hackathons.forEach((h) => map[h.status]?.push(h));
        return map;
    }, [hackathons]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <PageHeader
                title="My Hackathons"
                subtitle="Hackathons you're tracking, grouped by status"
                action={
                    <button
                        onClick={() => router.push("/discover")}
                        className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition"
                    >
                        <Plus size={14} /> Add Hackathon
                    </button>
                }
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : hackathons.length === 0 ? (
                <EmptyState
                    icon={BookMarked}
                    title="No hackathons yet"
                    description="Discover hackathons and save them to track here"
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
                <div className="space-y-8">
                    {GROUPS.map(({ key, label }) => {
                        const items = grouped[key];
                        if (items.length === 0) return null;
                        return (
                            <div key={key}>
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm font-medium text-white">{label}</h2>
                                    <span className="text-xs text-white/30">{items.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {items.map((h) => (
                                        <HackathonCard
                                            key={h.id}
                                            hackathon={h}
                                            onSave={(id, is_saved) => saveHackathon({ id, is_saved })}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}