// frontend/app/(dashboard)/hackathons/[id]/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Calendar, MapPin, Trophy, Users, ExternalLink,
    Bookmark, BookmarkCheck, Trash2, Flag, FolderOpen, ChevronRight, ChevronDown
} from "lucide-react";
import { useHackathon, useSaveHackathon, useDeleteHackathon, useUpdateHackathon } from "@/hooks/useHackathons";
import { useMilestones } from "@/hooks/useMilestones";
import Badge from "@/components/shared/Badge";
import { formatDate, deadlineLabel, isUrgent } from "@/utils/date";
import { cn } from "@/utils/cn";

const STATUSES = ["upcoming", "ongoing", "completed"] as const;
type Status = typeof STATUSES[number];

const statusVariant: Record<string, "default" | "green" | "yellow" | "blue"> = {
    upcoming: "blue",
    ongoing: "green",
    completed: "default",
    saved: "yellow",
};

const statusColors: Record<Status, string> = {
    upcoming: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    ongoing:  "text-green-400 border-green-500/30 bg-green-500/10",
    completed: "text-white/40 border-white/10 bg-white/5",
};

export default function HackathonDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef<HTMLDivElement>(null);

    const { data: h, isLoading } = useHackathon(id);
    const { mutate: save } = useSaveHackathon();
    const { mutate: remove } = useDeleteHackathon();
    const { mutate: update } = useUpdateHackathon(id);
    const { data: milestones = [] } = useMilestones(id);

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
                setStatusOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
        );
    }

    if (!h) return null;

    const urgent = isUrgent(h.deadline);
    const doneMilestones = milestones.filter((m) => m.is_completed).length;

    const handleDelete = () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        remove(h.id, { onSuccess: () => router.push("/my-hackathons") });
    };

    const handleStatusChange = (status: Status) => {
        update({ status });
        setStatusOpen(false);
    };

    const currentStatus = (STATUSES.includes(h.status as Status) ? h.status : "upcoming") as Status;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition mb-6"
            >
                <ArrowLeft size={13} /> Back
            </button>

            {/* Header */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-semibold text-white/60 shrink-0">
                            {h.title[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold text-white truncate">{h.title}</h1>
                            <p className="text-xs text-white/30 capitalize mt-0.5">{h.source}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => save({ id: h.id, is_saved: !h.is_saved })}
                            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition"
                        >
                            {h.is_saved
                                ? <BookmarkCheck size={14} className="text-yellow-400" />
                                : <Bookmark size={14} />}
                        </button>
                        {h.url && (
                            <a
                                href={h.url} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition"
                            >
                                <ExternalLink size={14} />
                            </a>
                        )}
                        <button
                            onClick={handleDelete}
                            className={cn(
                                "h-8 px-3 rounded-lg border flex items-center gap-1.5 text-xs transition",
                                confirmDelete
                                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                                    : "border-white/10 text-white/40 hover:text-white"
                            )}
                        >
                            <Trash2 size={13} />
                            {confirmDelete && "Confirm"}
                        </button>
                    </div>
                </div>

                {h.description && (
                    <p className="text-sm text-white/50 leading-relaxed mb-4">{h.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-4">
                    {/* Status dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            onClick={() => setStatusOpen((o) => !o)}
                            className={cn(
                                "flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-xs font-medium transition",
                                statusColors[currentStatus]
                            )}
                        >
                            {currentStatus}
                            <ChevronDown size={11} className={cn("transition", statusOpen && "rotate-180")} />
                        </button>

                        {statusOpen && (
                            <div className="absolute top-8 left-0 z-50 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden shadow-xl min-w-[130px]">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition hover:bg-white/5",
                                            s === currentStatus ? "text-white" : "text-white/50"
                                        )}
                                    >
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            s === "upcoming"  && "bg-blue-400",
                                            s === "ongoing"   && "bg-green-400",
                                            s === "completed" && "bg-white/30",
                                        )} />
                                        {s}
                                        {s === currentStatus && <span className="ml-auto text-white/30">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {h.tags?.map((t) => (
                        <span key={t} className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-white/40 pt-4 border-t border-white/5">
                    {h.deadline && (
                        <div className={cn("flex items-center gap-1.5", urgent && "text-red-400")}>
                            <Calendar size={12} />
                            <span>{urgent ? deadlineLabel(h.deadline) : formatDate(h.deadline)}</span>
                        </div>
                    )}
                    {h.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin size={12} />
                            <span className="truncate">{h.is_online ? "Online" : h.location}</span>
                        </div>
                    )}
                    {h.prize_pool && (
                        <div className="flex items-center gap-1.5 text-yellow-400/70">
                            <Trophy size={12} />
                            <span>{h.prize_pool}</span>
                        </div>
                    )}
                    {h.team_size && (
                        <div className="flex items-center gap-1.5">
                            <Users size={12} />
                            <span>{h.team_size}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Section links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => router.push(`/milestones?hackathon=${h.id}`)}
                    className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                            <Flag size={15} className="text-white/50" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-white">Milestones</p>
                            <p className="text-xs text-white/30">{doneMilestones}/{milestones.length} completed</p>
                        </div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition" />
                </button>

                <button
                    onClick={() => router.push(`/teams?hackathon=${h.id}`)}
                    className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                            <Users size={15} className="text-white/50" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-white">Team</p>
                            <p className="text-xs text-white/30">Manage members</p>
                        </div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition" />
                </button>

                <button
                    onClick={() => router.push(`/resources?hackathon=${h.id}`)}
                    className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition group sm:col-span-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                            <FolderOpen size={15} className="text-white/50" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-white">Resources</p>
                            <p className="text-xs text-white/30">Links, files & notes</p>
                        </div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition" />
                </button>
            </div>
        </div>
    );
}
