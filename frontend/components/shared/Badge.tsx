// frontend/components/shared/Badge.tsx

import { cn } from "@/utils/cn";

interface Props {
    label: string;
    variant?: "default" | "green" | "yellow" | "blue" | "red" | "purple";
}

const variants = {
    default: "bg-white/10 text-white/50",
    green: "bg-emerald-500/10 text-emerald-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
};

export default function Badge({ label, variant = "default" }: Props) {
    return (
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", variants[variant])}>
            {label}
        </span>
    );
}