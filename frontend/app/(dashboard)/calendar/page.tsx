// frontend/app/(dashboard)/calendar/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useHackathons } from "@/hooks/useHackathons";
import { Hackathon } from "@/types/hackathon";
import { cn } from "@/utils/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

type EventKind = "deadline" | "start" | "end";
interface DayEvent { hackathon: Hackathon; kind: EventKind }

const KIND_COLOR: Record<EventKind, string> = {
    deadline: "bg-red-400",
    start: "bg-emerald-400",
    end: "bg-white/40",
};

const KIND_LABEL: Record<EventKind, string> = {
    deadline: "Deadline",
    start: "Starts",
    end: "Ends",
};

function dateKey(d: Date) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function CalendarPage() {
    const { data: hackathons = [] } = useHackathons();
    const router = useRouter();
    const [cursor, setCursor] = useState(() => new Date());
    const [selected, setSelected] = useState<Date | null>(null);

    const eventsByDay = useMemo(() => {
        const map = new Map<string, DayEvent[]>();
        const add = (dateStr: string | null, hackathon: Hackathon, kind: EventKind) => {
            if (!dateStr) return;
            const d = new Date(dateStr);
            const key = dateKey(d);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push({ hackathon, kind });
        };
        hackathons.forEach((h) => {
            add(h.deadline, h, "deadline");
            add(h.start_date, h, "start");
            add(h.end_date, h, "end");
        });
        return map;
    }, [hackathons]);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const cells: (Date | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    const goMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

    const selectedEvents = selected ? eventsByDay.get(dateKey(selected)) ?? [] : [];

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <PageHeader title="Calendar" subtitle="Deadlines, starts, and end dates at a glance" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar grid */}
                <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-white">{MONTHS[month]} {year}</h2>
                        <div className="flex items-center gap-1">
                            <button onClick={() => goMonth(-1)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
                                <ChevronLeft size={13} />
                            </button>
                            <button onClick={() => setCursor(new Date())} className="text-xs text-white/40 hover:text-white px-2 py-1 transition">
                                Today
                            </button>
                            <button onClick={() => goMonth(1)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAYS.map((d) => (
                            <div key={d} className="text-center text-xs text-white/30 py-1">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((date, i) => {
                            if (!date) return <div key={i} />;
                            const events = eventsByDay.get(dateKey(date)) ?? [];
                            const isToday = dateKey(date) === dateKey(today);
                            const isSelected = selected && dateKey(date) === dateKey(selected);
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelected(date)}
                                    className={cn(
                                        "aspect-square rounded-lg border text-left p-1.5 transition flex flex-col",
                                        isSelected
                                            ? "border-white/40 bg-white/10"
                                            : "border-white/5 hover:border-white/15 hover:bg-white/5"
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs",
                                        isToday ? "text-white font-semibold" : "text-white/50"
                                    )}>
                                        {date.getDate()}
                                    </span>
                                    {events.length > 0 && (
                                        <div className="flex gap-0.5 mt-auto flex-wrap">
                                            {events.slice(0, 3).map((e, j) => (
                                                <span key={j} className={cn("w-1.5 h-1.5 rounded-full", KIND_COLOR[e.kind])} />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                        {(["deadline", "start", "end"] as EventKind[]).map((k) => (
                            <div key={k} className="flex items-center gap-1.5 text-xs text-white/30">
                                <span className={cn("w-1.5 h-1.5 rounded-full", KIND_COLOR[k])} />
                                {KIND_LABEL[k]}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected day events */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                    <h2 className="text-sm font-medium text-white mb-3">
                        {selected
                            ? `${MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`
                            : "Select a day"}
                    </h2>

                    {!selected ? (
                        <EmptyState icon={CalendarDays} title="No day selected" description="Click a date to see its events" />
                    ) : selectedEvents.length === 0 ? (
                        <EmptyState icon={CalendarDays} title="Nothing scheduled" description="No hackathon events on this day" />
                    ) : (
                        <div className="space-y-2">
                            {selectedEvents.map((e, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.push(`/hackathons/${e.hackathon.id}`)}
                                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition text-left"
                                >
                                    <span className={cn("w-2 h-2 rounded-full shrink-0", KIND_COLOR[e.kind])} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-white truncate">{e.hackathon.title}</p>
                                        <p className="text-xs text-white/30">{KIND_LABEL[e.kind]}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}