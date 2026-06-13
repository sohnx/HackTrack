// frontend/components/shared/PageHeader.tsx

interface Props {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
    return (
        <div className="flex items-start justify-between mb-8">
            <div className="space-y-0.5">
                <h1 className="text-xl font-semibold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}