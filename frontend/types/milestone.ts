// frontend/types/milestone.ts

export type MilestoneStatus = "todo" | "in_progress" | "done";

export interface Milestone {
    id: string;
    hackathon_id: string;
    title: string;
    description: string | null;
    status: MilestoneStatus;
    due_date: string | null;
    is_completed: boolean;
    created_at: string;
}

export interface MilestoneCreate {
    hackathon_id: string;
    title: string;
    description?: string;
    status?: MilestoneStatus;
    due_date?: string;
}