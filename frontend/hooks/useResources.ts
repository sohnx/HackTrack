// frontend/hooks/useResources.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Resource, ResourceCreate } from "@/types/resource";

const KEY = "resources";

export function useResources(hackathonId: string) {
    return useQuery<Resource[]>({
        queryKey: [KEY, hackathonId],
        queryFn: async () => (await api.get("/resources", { params: { hackathon_id: hackathonId } })).data,
        enabled: !!hackathonId,
    });
}

export function useCreateResource() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: ResourceCreate) => api.post("/resources", data),
        onSuccess: (_res, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.hackathon_id] }),
    });
}

export function useDeleteResource(hackathonId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/resources/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, hackathonId] }),
    });
}