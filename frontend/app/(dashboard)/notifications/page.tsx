// frontend/app/(dashboard)/notifications/page.tsx
"use client";

import { useState } from "react";
import { Bell, BellOff, CheckCheck, Clock, Flag, Users, Info, Trash2, RefreshCw } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useNotifications, useMarkNotificationRead, useMarkAllRead, useDeleteNotification, useCheckDeadlines } from "@/hooks/useNotifications";
import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/utils/cn";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
    deadline: Clock, milestone: Flag, team: Users, system: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
    deadline: "text-red-400", milestone: "text-emerald-400",
    team: "text-blue-400", system: "text-white/40",
};

function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function NotificationRow({ n, onToggleRead, onDelete }: {
    n: Notification; onToggleRead: () => void; onDelete: () => void;
}) {
    const Icon = TYPE_ICON[n.type];
    return (
        <div
            onClick={onToggleRead}
            className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition cursor-pointer group",
                !n.is_read && "bg-white/[0.03]"
            )}
        >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Icon size={14} className={TYPE_COLOR[n.type]} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={cn("text-sm", n.is_read ? "text-white/50" : "text-white font-medium")}>{n.title}</p>
                    {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                </div>
                <p className="text-xs text-white/30 mt-0.5">{n.message}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-white/20">{timeAgo(n.created_at)}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const { data: notifications = [], isLoading } = useNotifications();
    const { mutate: toggleRead } = useMarkNotificationRead();
    const { mutate: markAllRead } = useMarkAllRead();
    const { mutate: deleteNotification } = useDeleteNotification();
    const { mutate: checkDeadlines, isPending: checking } = useCheckDeadlines();
    const [checked, setChecked] = useState(false);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const handleCheck = () => {
        checkDeadlines(undefined, {
            onSuccess: () => setChecked(true),
        });
        setTimeout(() => setChecked(false), 3000);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <PageHeader
                title="Notifications"
                subtitle={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                action={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCheck}
                            disabled={checking}
                            className={cn(
                                "flex items-center gap-1.5 border text-sm px-4 py-2 rounded-lg transition",
                                checked
                                    ? "border-green-500/30 text-green-400 bg-green-500/10"
                                    : "border-white/10 text-white/60 hover:text-white"
                            )}
                        >
                            <RefreshCw size={14} className={cn(checking && "animate-spin")} />
                            {checked ? "Checked!" : "Check deadlines"}
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllRead()}
                                className="flex items-center gap-1.5 border border-white/10 text-white/60 hover:text-white text-sm px-4 py-2 rounded-lg transition"
                            >
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>
                }
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : notifications.length === 0 ? (
                <EmptyState icon={BellOff} title="No notifications" description="Click 'Check deadlines' to scan for upcoming deadlines" />
            ) : (
                <div className="bg-[#111111] border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
                    {notifications.map((n) => (
                        <NotificationRow
                            key={n.id}
                            n={n}
                            onToggleRead={() => toggleRead({ id: n.id, is_read: !n.is_read })}
                            onDelete={() => deleteNotification(n.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
