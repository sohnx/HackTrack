// frontend/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "HackTrack",
    description: "Track, manage, and win hackathons",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
