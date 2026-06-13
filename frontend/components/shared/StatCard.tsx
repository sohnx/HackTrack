// frontend/components/shared/StatCard.tsx

import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface Props {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: "default" | "green" | "yellow" | "blue";
}

const colorMap = {
    default: "text-white/60",
    green: "text-emerald-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
};

export default function StatCard({ label, value, icon: Icon, trend, color = "default" }: Props) {
    return (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
                <Icon size={15} className={colorMap[color]} />
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-white">{value}</span>
                {trend && <span className="text-xs text-white/30">{trend}</span>}
            </div>
        </div>
    );
}