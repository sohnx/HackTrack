// frontend/components/shared/EmptyState.tsx

import { LucideIcon } from "lucide-react";

interface Props {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Icon size={20} className="text-white/30" />
            </div>
            <div>
                <p className="text-sm font-medium text-white/60">{title}</p>
                {description && <p className="text-xs text-white/30 mt-0.5">{description}</p>}
            </div>
            {action && <div className="pt-1">{action}</div>}
        </div>
    );
}