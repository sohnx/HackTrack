// frontend/app/(dashboard)/teams/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Users, Copy, Check, Trash2, LogIn, Crown } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import Modal from "@/components/shared/Modal";
import { useHackathons } from "@/hooks/useHackathons";
import { useTeams, useCreateTeam, useDeleteTeam, useJoinTeam, useRemoveMember } from "@/hooks/useTeams";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/cn";

export default function TeamsPage() {
    const searchParams = useSearchParams();
    const { data: hackathons = [] } = useHackathons();
    const [hackathonId, setHackathonId] = useState(searchParams.get("hackathon") ?? "");
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [name, setName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const currentUser = useAuthStore((s) => s.user);
    const { data: teams = [], isLoading } = useTeams(hackathonId);
    const { mutate: createTeam, isPending: creating } = useCreateTeam();
    const { mutate: deleteTeam } = useDeleteTeam(hackathonId);
    const { mutate: joinTeam, isPending: joining, error: joinError } = useJoinTeam(hackathonId);
    const { mutate: removeMember } = useRemoveMember(hackathonId);

    const handleCreate = () => {
        if (!name.trim() || !hackathonId) return;
        createTeam(
            { hackathon_id: hackathonId, name: name.trim() },
            { onSuccess: () => { setName(""); setShowCreate(false); } }
        );
    };

    const handleJoin = () => {
        if (!inviteCode.trim()) return;
        joinTeam(inviteCode.trim(), { onSuccess: () => { setInviteCode(""); setShowJoin(false); } });
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <PageHeader
                title="Teams"
                subtitle="Form teams and manage members for your hackathons"
                action={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowJoin(true)}
                            className="flex items-center gap-1.5 border border-white/10 text-white/60 hover:text-white text-sm px-4 py-2 rounded-lg transition"
                        >
                            <LogIn size={14} /> Join
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            disabled={!hackathonId}
                            className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                        >
                            <Plus size={14} /> New Team
                        </button>
                    </div>
                }
            />

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
                <EmptyState icon={Users} title="Select a hackathon" description="Choose a hackathon above to view its teams" />
            ) : isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : teams.length === 0 ? (
                <EmptyState icon={Users} title="No team yet" description="Create a team to start collaborating" />
            ) : (
                <div className="space-y-4">
                    {teams.map((team) => (
                        <div key={team.id} className="bg-[#111111] border border-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-medium text-white">{team.name}</p>
                                    {team.description && <p className="text-xs text-white/30 mt-0.5">{team.description}</p>}
                                </div>
                                <button onClick={() => deleteTeam(team.id)} className="text-white/20 hover:text-red-400 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {team.invite_code && (
                                <button
                                    onClick={() => handleCopy(team.invite_code!)}
                                    className="flex items-center gap-2 text-xs bg-black/30 border border-white/10 rounded-lg px-3 py-2 mb-3 text-white/50 hover:text-white transition w-full"
                                >
                                    {copied === team.invite_code ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    Invite code: <span className="font-mono text-white">{team.invite_code}</span>
                                </button>
                            )}

                            <div className="space-y-1">
                                {team.members.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition">
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            {m.role === "owner" && <Crown size={12} className="text-yellow-400" />}
                                            <span className={cn(m.user_id === currentUser?.id && "text-white")}>
                                                {m.user_id === currentUser?.id ? "You" : m.user_id.slice(0, 8)}
                                            </span>
                                            <span className="text-xs text-white/30 capitalize">· {m.role}</span>
                                        </div>
                                        {m.role !== "owner" && (
                                            <button
                                                onClick={() => removeMember({ teamId: team.id, userId: m.user_id })}
                                                className="text-white/20 hover:text-red-400 transition"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <Modal title="New Team" onClose={() => setShowCreate(false)}>
                    <div className="space-y-3">
                        <input
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Team name"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!name.trim() || creating}
                            className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                        >
                            {creating ? "Creating..." : "Create"}
                        </button>
                    </div>
                </Modal>
            )}

            {showJoin && (
                <Modal title="Join Team" onClose={() => setShowJoin(false)}>
                    <div className="space-y-3">
                        <input
                            autoFocus
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Invite code"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-white/25"
                        />
                        {joinError && <p className="text-xs text-red-400">Invalid invite code</p>}
                        <button
                            onClick={handleJoin}
                            disabled={!inviteCode.trim() || joining}
                            className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                        >
                            {joining ? "Joining..." : "Join"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}