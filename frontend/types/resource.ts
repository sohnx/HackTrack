// frontend/types/resource.ts

export type ResourceType = "link" | "file" | "note" | "github" | "figma" | "notion" | "other";

export interface Resource {
    id: string;
    hackathon_id: string;
    user_id: string;
    title: string;
    url: string | null;
    description: string | null;
    type: ResourceType;
    created_at: string;
}

export interface ResourceCreate {
    hackathon_id: string;
    title: string;
    url?: string;
    description?: string;
    type?: ResourceType;
}