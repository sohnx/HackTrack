// frontend/components/auth/GoogleLoginButton.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { TokenOut, GoogleAuthPayload } from "@/types/auth";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: Record<string, unknown>) => void;
                    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
                };
            };
        };
    }
}

interface GoogleLoginButtonProps {
    onError?: (message: string) => void;
}

export default function GoogleLoginButton({ onError }: GoogleLoginButtonProps) {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleCredentialResponse = async (response: { credential: string }) => {
        try {
            const payload: GoogleAuthPayload = { credential: response.credential };
            const { data } = await api.post<TokenOut>("/auth/google", payload);
            setAuth(data.user, data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            onError?.(err.response?.data?.detail ?? "Google sign-in failed");
        }
    };

    const initialize = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || !window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            width: 360,
            text: "continue_with",
        });
    };

    useEffect(() => {
        // In case the script already loaded before this effect ran
        if (window.google) initialize();
    }, []);

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

    return (
        <>
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={initialize}
            />
            <div ref={buttonRef} className="w-full flex justify-center" />
        </>
    );
}