// frontend/hooks/useDiscover.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DiscoveredHackathon, Hackathon } from "@/types/hackathon";

const KEY = "discovered";
const HACKATHONS_KEY = "hackathons";

export function useDiscovered() {
    return useQuery<DiscoveredHackathon[]>({
        queryKey: [KEY],
        queryFn: async () => (await api.get("/sync/discovered")).data,
    });
}

export function useSyncSources() {
    return useQuery<string[]>({
        queryKey: [KEY, "sources"],
        queryFn: async () => (await api.get("/sync/sources")).data,
    });
}

/**
 * "Yes" — mark a discovered hackathon to track. Copies it into the user's
 * My Hackathons list (and the backend auto-creates a deadline milestone).
 */
export function useSaveDiscovered() {
    const qc = useQueryClient();
    return useMutation<Hackathon, unknown, DiscoveredHackathon>({
        mutationFn: async (h) => (await api.post(`/sync/discovered/${h.id}/track`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [HACKATHONS_KEY] });
            qc.invalidateQueries({ queryKey: [KEY] });
        },
    });
}
