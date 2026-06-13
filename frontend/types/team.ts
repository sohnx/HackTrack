// frontend/types/team.ts

export type TeamRole = "owner" | "admin" | "member";

export interface TeamMember {
    id: string;
    user_id: string;
    role: TeamRole;
    joined_at: string;
}

export interface Team {
    id: string;
    hackathon_id: string;
    name: string;
    description: string | null;
    invite_code: string | null;
    created_at: string;
    members: TeamMember[];
}

export interface TeamCreate {
    hackathon_id: string;
    name: string;
    description?: string;
}