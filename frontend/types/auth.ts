// frontend/types/auth.ts

export interface User {
    id: string;
    email: string;
    username: string;
    avatar_url?: string | null;
    telegram_chat_id?: string | null;
}

export interface TokenOut {
    access_token: string;
    token_type: string;
    user: User;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    username: string;
    password: string;
}