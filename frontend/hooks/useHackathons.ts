// frontend/hooks/useHackathons.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Hackathon, HackathonCreate } from "@/types/hackathon";

const KEY = "hackathons";

export function useHackathons() {
    return useQuery<Hackathon[]>({
        queryKey: [KEY],
        queryFn: async () => (await api.get("/hackathons")).data,
    });
}

export function useHackathon(id: string) {
    return useQuery<Hackathon>({
        queryKey: [KEY, id],
        queryFn: async () => (await api.get(`/hackathons/${id}`)).data,
        enabled: !!id,
    });
}

export function useCreateHackathon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: HackathonCreate) => api.post("/hackathons", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useUpdateHackathon(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Hackathon>) => api.patch(`/hackathons/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useDeleteHackathon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/hackathons/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}
export function useSaveHackathon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, is_saved }: { id: string; is_saved: boolean }) =>
            api.patch(`/hackathons/${id}`, { is_saved }),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}