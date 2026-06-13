// frontend/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { TokenOut, RegisterPayload } from "@/types/auth";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [form, setForm] = useState<RegisterPayload>({ email: "", username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const { data } = await api.post<TokenOut>("/auth/register", form);
            setAuth(data.user, data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const field = (key: keyof RegisterPayload, label: string, type = "text", placeholder = "") => (
        <div className="space-y-1">
            <label className="text-xs text-white/50 uppercase tracking-wider">{label}</label>
            <input
                type={type} required value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">Create account</h1>
                <p className="text-sm text-white/50">Start tracking your hackathons</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {field("email", "Email", "email", "you@example.com")}
                {field("username", "Username", "text", "yourname")}
                {field("password", "Password", "password", "••••••••")}

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-white/90 transition disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/30 uppercase tracking-wider">or</span>
                <div className="h-px flex-1 bg-white/10" />
            </div>

            <GoogleLoginButton onError={setError} />

            <p className="text-center text-sm text-white/40">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:underline">Sign in</Link>
            </p>
        </div>
    );
}