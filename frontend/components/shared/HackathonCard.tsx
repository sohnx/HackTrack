// frontend/components/shared/HackathonCard.tsx

import { useRouter } from "next/navigation";
import { Calendar, MapPin, Trophy, Users, Bookmark, BookmarkCheck } from "lucide-react";
import { Hackathon } from "@/types/hackathon";
import { formatDate, deadlineLabel, isUrgent } from "@/utils/date";
import { cn } from "@/utils/cn";
import Badge from "./Badge";

interface Props {
    hackathon: Hackathon;
    onSave?: (id: string, saved: boolean) => void;
}

const statusVariant: Record<string, "default" | "green" | "yellow" | "blue"> = {
    upcoming: "blue",
    ongoing: "green",
    completed: "default",
    saved: "yellow",
};

const sourceColors: Record<string, string> = {
    devfolio: "text-indigo-400",
    devpost: "text-blue-400",
    unstop: "text-orange-400",
    ethglobal: "text-purple-400",
    mlh: "text-red-400",
    hackerearth: "text-green-400",
    kaggle: "text-cyan-400",
    manual: "text-white/40",
};

export default function HackathonCard({ hackathon: h, onSave }: Props) {
    const router = useRouter();
    const urgent = isUrgent(h.deadline);

    return (
        <div
            className="bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col gap-4 hover:border-white/20 transition cursor-pointer group"
            onClick={() => router.push(`/hackathons/${h.id}`)}
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-sm font-semibold text-white/60 shrink-0">
                        {h.title[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{h.title}</p>
                        <p className={cn("text-xs capitalize", sourceColors[h.source] ?? "text-white/30")}>
                            {h.source}
                        </p>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onSave?.(h.id, !h.is_saved); }}
                    className="text-white/20 hover:text-white/60 transition shrink-0 mt-0.5"
                >
                    {h.is_saved
                        ? <BookmarkCheck size={15} className="text-yellow-400" />
                        : <Bookmark size={15} />}
                </button>
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
                {h.team_size && (
                    <div className="flex items-center gap-1.5">
                        <Users size={11} />
                        <span>{h.team_size}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <Badge label={h.status} variant={statusVariant[h.status]} />
                {h.tags && h.tags.length > 0 && (
                    <div className="flex gap-1">
                        {h.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-xs text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}