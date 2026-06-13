// frontend/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { User, Lock, Send, CheckCircle, XCircle, ExternalLink, LogOut } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/utils/cn";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5">
                <h2 className="text-sm font-medium text-white/60">{title}</h2>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-white/40">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition";
const btnCls = "px-4 py-2 rounded-lg text-sm font-medium transition";

export default function SettingsPage() {
    const { user, setAuth, clearAuth, token } = useAuthStore();
    const router = useRouter();

    // Profile
    const [username, setUsername] = useState(user?.username ?? "");
    const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Password
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [pwLoading, setPwLoading] = useState(false);

    // Telegram
    const [tgConnected, setTgConnected] = useState<boolean | null>(null); // null = loading

    // Always fetch fresh from API — localStorage may have stale user without telegram_chat_id
    useEffect(() => {
        api.get("/auth/me").then((res) => {
            setAuth(res.data, token!);
            setTgConnected(!!res.data.telegram_chat_id);
            setUsername(res.data.username);
        }).catch(() => { setTgConnected(false); });
    }, []);
    const [tgLink, setTgLink] = useState<string | null>(null);
    const [tgLoading, setTgLoading] = useState(false);
    const [tgMsg, setTgMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const handleProfileSave = async () => {
        setProfileLoading(true); setProfileMsg(null);
        try {
            const res = await api.patch("/auth/me", { username });
            const updated = res.data;
            setAuth(updated, token!);
            setProfileMsg({ ok: true, text: "Profile updated." });
        } catch (e: any) {
            setProfileMsg({ ok: false, text: e?.response?.data?.detail ?? "Failed to update." });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPw !== confirmPw) { setPwMsg({ ok: false, text: "Passwords don't match." }); return; }
        if (newPw.length < 6) { setPwMsg({ ok: false, text: "Password must be at least 6 characters." }); return; }
        setPwLoading(true); setPwMsg(null);
        try {
            await api.post("/auth/change-password", { current_password: currentPw, new_password: newPw });
            setPwMsg({ ok: true, text: "Password changed successfully." });
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
        } catch (e: any) {
            setPwMsg({ ok: false, text: e?.response?.data?.detail ?? "Failed to change password." });
        } finally {
            setPwLoading(false);
        }
    };

    const handleTelegramConnect = async () => {
        setTgLoading(true); setTgMsg(null);
        try {
            const res = await api.post("/telegram/link");
            setTgLink(res.data.link);
            setTgMsg({ ok: true, text: "Click the link below to connect your Telegram account." });
        } catch {
            setTgMsg({ ok: false, text: "Failed to generate link." });
        } finally {
            setTgLoading(false);
        }
    };

    const handleTelegramDisconnect = async () => {
        setTgLoading(true); setTgMsg(null);
        try {
            await api.post("/telegram/disconnect");
            setTgConnected(false); setTgLink(null);
            // Update store so other parts of the app reflect the change
            if (user) setAuth({ ...user, telegram_chat_id: null }, token!);
            setTgMsg({ ok: true, text: "Telegram disconnected." });
        } catch {
            setTgMsg({ ok: false, text: "Failed to disconnect." });
        } finally {
            setTgLoading(false);
        }
    };

    const handleLogout = () => { clearAuth(); router.push("/login"); };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <PageHeader title="Settings" subtitle="Manage your account" />

            {/* Profile */}
            <Section title="Profile">
                <Field label="Email">
                    <input className={inputCls} value={user?.email ?? ""} disabled />
                </Field>
                <Field label="Username">
                    <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                </Field>
                {profileMsg && (
                    <p className={cn("text-xs flex items-center gap-1.5", profileMsg.ok ? "text-green-400" : "text-red-400")}>
                        {profileMsg.ok ? <CheckCircle size={12} /> : <XCircle size={12} />} {profileMsg.text}
                    </p>
                )}
                <button
                    onClick={handleProfileSave}
                    disabled={profileLoading}
                    className={cn(btnCls, "bg-white text-black hover:bg-white/90")}
                >
                    {profileLoading ? "Saving..." : "Save changes"}
                </button>
            </Section>

            {/* Password */}
            <Section title="Change Password">
                <Field label="Current password">
                    <input type="password" className={inputCls} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
                </Field>
                <Field label="New password">
                    <input type="password" className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" />
                </Field>
                <Field label="Confirm new password">
                    <input type="password" className={inputCls} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
                </Field>
                {pwMsg && (
                    <p className={cn("text-xs flex items-center gap-1.5", pwMsg.ok ? "text-green-400" : "text-red-400")}>
                        {pwMsg.ok ? <CheckCircle size={12} /> : <XCircle size={12} />} {pwMsg.text}
                    </p>
                )}
                <button
                    onClick={handlePasswordChange}
                    disabled={pwLoading}
                    className={cn(btnCls, "bg-white/10 text-white hover:bg-white/20")}
                >
                    {pwLoading ? "Changing..." : "Change password"}
                </button>
            </Section>

            {/* Telegram */}
            <Section title="Telegram Notifications">
                <p className="text-xs text-white/40">Connect your Telegram account to receive deadline reminders via bot.</p>
                <div className="flex items-center gap-2">
                    {tgConnected === null ? (
                        <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                        <>
                            <div className={cn("w-2 h-2 rounded-full", tgConnected ? "bg-green-400" : "bg-white/20")} />
                            <span className="text-sm text-white/60">{tgConnected ? "Connected ✓" : "Not connected"}</span>
                        </>
                    )}
                </div>
                {tgMsg && (
                    <p className={cn("text-xs flex items-center gap-1.5", tgMsg.ok ? "text-green-400" : "text-red-400")}>
                        {tgMsg.ok ? <CheckCircle size={12} /> : <XCircle size={12} />} {tgMsg.text}
                    </p>
                )}
                {tgLink && (
                    <a href={tgLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition">
                        <ExternalLink size={12} /> Open Telegram to complete connection
                    </a>
                )}
                {tgConnected === true ? (
                    <button onClick={handleTelegramDisconnect} disabled={tgLoading}
                        className={cn(btnCls, "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20")}>
                        {tgLoading ? "Disconnecting..." : "Disconnect Telegram"}
                    </button>
                ) : (
                    <button onClick={handleTelegramConnect} disabled={tgLoading}
                        className={cn(btnCls, "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 flex items-center gap-1.5")}>
                        <Send size={13} /> {tgLoading ? "Generating link..." : "Connect Telegram"}
                    </button>
                )}
            </Section>

            {/* Danger */}
            <Section title="Account">
                <button onClick={handleLogout}
                    className={cn(btnCls, "bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center gap-1.5")}>
                    <LogOut size={13} /> Sign out
                </button>
            </Section>
        </div>
    );
}
