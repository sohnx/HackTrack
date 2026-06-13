// frontend/app/(dashboard)/milestones/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Flag, Trash2, Circle, CircleDot, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import Modal from "@/components/shared/Modal";
import { useHackathons } from "@/hooks/useHackathons";
import { useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from "@/hooks/useMilestones";
import { Milestone, MilestoneStatus } from "@/types/milestone";
import { formatDate, deadlineLabel, isUrgent } from "@/utils/date";
import { cn } from "@/utils/cn";

const STATUS_ICON: Record<MilestoneStatus, typeof Circle> = {
    todo: Circle,
    in_progress: CircleDot,
    done: CheckCircle2,
};

const STATUS_LABEL: Record<MilestoneStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
};

const ORDER: MilestoneStatus[] = ["in_progress", "todo", "done"];

function MilestoneRow({ m, onCycle, onDelete }: { m: Milestone; onCycle: () => void; onDelete: () => void }) {
    const Icon = STATUS_ICON[m.status];
    const urgent = !m.is_completed && isUrgent(m.due_date);

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition group">
            <button onClick={onCycle} className="text-white/30 hover:text-white transition shrink-0">
                <Icon size={16} className={m.status === "done" ? "text-emerald-400" : ""} />
            </button>
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm", m.is_completed ? "text-white/30 line-through" : "text-white")}>
                    {m.title}
                </p>
                {m.description && <p className="text-xs text-white/30 truncate">{m.description}</p>}
            </div>
            {m.due_date && (
                <span className={cn("text-xs shrink-0", urgent ? "text-red-400" : "text-white/30")}>
                    {urgent ? deadlineLabel(m.due_date) : formatDate(m.due_date)}
                </span>
            )}
            <button onClick={onDelete} className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition shrink-0">
                <Trash2 size={13} />
            </button>
        </div>
    );
}

export default function MilestonesPage() {
    const searchParams = useSearchParams();
    const { data: hackathons = [] } = useHackathons();
    const [hackathonId, setHackathonId] = useState(searchParams.get("hackathon") ?? "");
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");

    const { data: milestones = [], isLoading } = useMilestones(hackathonId);
    const { mutate: createMilestone, isPending: creating } = useCreateMilestone();
    const { mutate: updateMilestone } = useUpdateMilestone(hackathonId);
    const { mutate: deleteMilestone } = useDeleteMilestone(hackathonId);

    const grouped = ORDER.map((status) => ({
        status,
        items: milestones.filter((m) => m.status === status),
    }));

    const cycleStatus = (m: Milestone) => {
        const next: Record<MilestoneStatus, MilestoneStatus> = {
            todo: "in_progress", in_progress: "done", done: "todo",
        };
        const status = next[m.status];
        updateMilestone({ id: m.id, data: { status, is_completed: status === "done" } });
    };

    const handleCreate = () => {
        if (!title.trim() || !hackathonId) return;
        createMilestone(
            { hackathon_id: hackathonId, title: title.trim(), due_date: dueDate || undefined },
            { onSuccess: () => { setTitle(""); setDueDate(""); setShowCreate(false); } }
        );
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <PageHeader
                title="Milestones"
                subtitle="Track progress for your hackathons"
                action={
                    <button
                        onClick={() => setShowCreate(true)}
                        disabled={!hackathonId}
                        className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                    >
                        <Plus size={14} /> New Milestone
                    </button>
                }
            />

            {/* Hackathon selector */}
            <select
                value={hackathonId}
                onChange={(e) => setHackathonId(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mb-6 focus:outline-none focus:border-white/25"
            >
                <option value="">Select a hackathon...</option>
                {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                ))}
            </select>

            {!hackathonId ? (
                <EmptyState icon={Flag} title="Select a hackathon" description="Choose a hackathon above to view its milestones" />
            ) : isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : milestones.length === 0 ? (
                <EmptyState icon={Flag} title="No milestones yet" description="Add your first milestone to track progress" />
            ) : (
                <div className="space-y-6">
                    {grouped.map(({ status, items }) => items.length > 0 && (
                        <div key={status}>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">{STATUS_LABEL[status]}</h2>
                                <span className="text-xs text-white/20">{items.length}</span>
                            </div>
                            <div className="bg-[#111111] border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
                                {items.map((m) => (
                                    <MilestoneRow
                                        key={m.id}
                                        m={m}
                                        onCycle={() => cycleStatus(m)}
                                        onDelete={() => deleteMilestone(m.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <Modal title="New Milestone" onClose={() => setShowCreate(false)}>
                    <div className="space-y-3">
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Milestone title"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
                        />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!title.trim() || creating}
                            className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                        >
                            {creating ? "Creating..." : "Create"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}