// frontend/hooks/useMilestones.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Milestone, MilestoneCreate } from "@/types/milestone";

const KEY = "milestones";

export function useMilestones(hackathonId: string) {
    return useQuery<Milestone[]>({
        queryKey: [KEY, hackathonId],
        queryFn: async () => (await api.get("/milestones", { params: { hackathon_id: hackathonId } })).data,
        enabled: !!hackathonId,
    });
}

export function useCreateMilestone() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: MilestoneCreate) => api.post("/milestones", data),
        onSuccess: (_res, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.hackathon_id] }),
    });
}

export function useUpdateMilestone(hackathonId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Milestone> }) =>
            api.patch(`/milestones/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, hackathonId] }),
    });
}

export function useDeleteMilestone(hackathonId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/milestones/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, hackathonId] }),
    });
}