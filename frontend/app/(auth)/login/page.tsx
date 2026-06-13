// frontend/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { TokenOut, LoginPayload } from "@/types/auth";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const { data } = await api.post<TokenOut>("/auth/login", form);
            setAuth(data.user, data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
                <p className="text-sm text-white/50">Sign in to your HackTrack account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Email</label>
                    <input
                        type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Password</label>
                    <input
                        type="password" required value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition"
                        placeholder="••••••••"
                    />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-white/90 transition disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <p className="text-center text-sm text-white/40">
                No account?{" "}
                <Link href="/register" className="text-white hover:underline">Register</Link>
            </p>
        </div>
    );
}