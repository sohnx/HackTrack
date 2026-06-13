// frontend/types/hackathon.ts

export type HackathonStatus = "upcoming" | "ongoing" | "completed" | "saved";
export type HackathonSource =
    | "devfolio" | "devpost" | "unstop" | "hack2skill"
    | "ethglobal" | "mlh" | "hackerearth" | "kaggle" | "reskilll" | "manual";

export interface Hackathon {
    id: string;
    owner_id: string;
    title: string;
    description: string | null;
    url: string | null;
    banner_url: string | null;
    source: HackathonSource;
    status: HackathonStatus;
    location: string | null;
    is_online: boolean;
    prize_pool: string | null;
    team_size: string | null;
    start_date: string | null;
    end_date: string | null;
    deadline: string | null;
    is_saved: boolean;
    created_at: string;
    tags?: string[];
}

export interface HackathonCreate {
    title: string;
    description?: string;
    url?: string;
    banner_url?: string;
    source?: HackathonSource;
    location?: string;
    is_online?: boolean;
    prize_pool?: string;
    team_size?: string;
    start_date?: string;
    end_date?: string;
    deadline?: string;
    tags?: string[];
}

export interface DiscoveredHackathon {
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    banner_url: string | null;
    source: HackathonSource;
    location: string | null;
    is_online: boolean;
    prize_pool: string | null;
    team_size: string | null;
    start_date: string | null;
    end_date: string | null;
    deadline: string | null;
    tags: string[];
}