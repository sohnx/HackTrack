// frontend/hooks/useTeams.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Team, TeamCreate } from "@/types/team";

const KEY = "teams";

export function useTeams(hackathonId: string) {
    return useQuery<Team[]>({
        queryKey: [KEY, hackathonId],
        queryFn: async () => (await api.get("/teams", { params: { hackathon_id: hackathonId } })).data,
        enabled: !!hackathonId,
    });
}

export function useCreateTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: TeamCreate) => api.post("/teams", data),
        onSuccess: (_res, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.hackathon_id] }),
    });
}

export function useUpdateTeam(hackathonId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
            api.patch(`/teams/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, hackathonId] }),
    });
}

export function useDeleteTeam(hackathonId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/teams/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, hackathonId] }),
    });
}

export function useJoinTeam(hackathonId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (inviteCode: string) => api.post(`/teams/join/${inviteCode}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, hackathonId] }),
    });
}

export function useRemoveMember(hackathonId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
            api.delete(`/teams/${teamId}/members/${userId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, hackathonId] }),
    });
}