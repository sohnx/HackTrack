// frontend/app/(dashboard)/resources/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    Plus, FolderOpen, Trash2, Link2, FileText, StickyNote,
    Github, Figma, Globe, ExternalLink
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import Modal from "@/components/shared/Modal";
import { useHackathons } from "@/hooks/useHackathons";
import { useResources, useCreateResource, useDeleteResource } from "@/hooks/useResources";
import { ResourceType } from "@/types/resource";
import { cn } from "@/utils/cn";

const TYPE_ICON: Record<ResourceType, typeof Link2> = {
    link: Link2, file: FileText, note: StickyNote,
    github: Github, figma: Figma, notion: FileText, other: Globe,
};

const TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
    { value: "link", label: "Link" },
    { value: "github", label: "GitHub" },
    { value: "figma", label: "Figma" },
    { value: "notion", label: "Notion" },
    { value: "file", label: "File" },
    { value: "note", label: "Note" },
    { value: "other", label: "Other" },
];

export default function ResourcesPage() {
    const searchParams = useSearchParams();
    const { data: hackathons = [] } = useHackathons();
    const [hackathonId, setHackathonId] = useState(searchParams.get("hackathon") ?? "");
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<ResourceType>("link");

    const { data: resources = [], isLoading } = useResources(hackathonId);
    const { mutate: createResource, isPending: creating } = useCreateResource();
    const { mutate: deleteResource } = useDeleteResource(hackathonId);

    const reset = () => { setTitle(""); setUrl(""); setDescription(""); setType("link"); setShowCreate(false); };

    const handleCreate = () => {
        if (!title.trim() || !hackathonId) return;
        createResource(
            { hackathon_id: hackathonId, title: title.trim(), url: url.trim() || undefined, description: description.trim() || undefined, type },
            { onSuccess: reset }
        );
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <PageHeader
                title="Resources"
                subtitle="Links, files, and notes for your hackathons"
                action={
                    <button
                        onClick={() => setShowCreate(true)}
                        disabled={!hackathonId}
                        className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                    >
                        <Plus size={14} /> Add Resource
                    </button>
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
                <EmptyState icon={FolderOpen} title="Select a hackathon" description="Choose a hackathon above to view its resources" />
            ) : isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : resources.length === 0 ? (
                <EmptyState icon={FolderOpen} title="No resources yet" description="Add links, files, or notes to keep things organized" />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resources.map((r) => {
                        const Icon = TYPE_ICON[r.type];
                        return (
                            <div key={r.id} className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-start gap-3 group">
                                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Icon size={15} className="text-white/50" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-white truncate">{r.title}</p>
                                    {r.description && <p className="text-xs text-white/30 truncate">{r.description}</p>}
                                    {r.url && (
                                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400/70 hover:text-blue-400 transition flex items-center gap-1 mt-1">
                                            <ExternalLink size={10} /> Open
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteResource(r.id)}
                                    className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition shrink-0"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreate && (
                <Modal title="Add Resource" onClose={reset}>
                    <div className="space-y-3">
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
                        />
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="URL (optional)"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setType(opt.value)}
                                    className={cn(
                                        "text-xs px-2.5 py-1 rounded-full border transition",
                                        type === opt.value
                                            ? "bg-white text-black border-white"
                                            : "border-white/10 text-white/50 hover:text-white"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={!title.trim() || creating}
                            className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                        >
                            {creating ? "Adding..." : "Add"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}