// frontend/components/shared/Modal.tsx

import { X } from "lucide-react";

interface Props {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[#111111] border border-white/10 rounded-xl p-5 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-white">{title}</h2>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition">
                        <X size={15} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}