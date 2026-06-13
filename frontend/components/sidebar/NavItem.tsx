// frontend/components/sidebar/NavItem.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface Props {
    href: string;
    label: string;
    icon: LucideIcon;
    collapsed: boolean;
}

export default function NavItem({ href, label, icon: Icon, collapsed }: Props) {
    const pathname = usePathname();
    const active = pathname === href || pathname.startsWith(href + "/");

    return (
        <Link
            href={href}
            className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                active
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
            )}
            title={collapsed ? label : undefined}
        >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}