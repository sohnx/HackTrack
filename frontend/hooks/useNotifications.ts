// frontend/hooks/useNotifications.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Notification } from "@/types/notification";

const KEY = "notifications";

export function useNotifications() {
    return useQuery<Notification[]>({
        queryKey: [KEY],
        queryFn: async () => (await api.get("/notifications")).data,
    });
}

export function useMarkNotificationRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, is_read }: { id: string; is_read: boolean }) =>
            api.patch(`/notifications/${id}`, { is_read }),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useMarkAllRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => api.post("/notifications/read-all"),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useDeleteNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/notifications/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}