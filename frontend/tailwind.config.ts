// frontend/tailwind.config.ts

import type { Config } from "tailwindcss";

export default {
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                border: "rgba(255,255,255,0.1)",
                surface: "#111111",
                muted: "rgba(255,255,255,0.5)",
            },
        },
    },
    plugins: [],
} satisfies Config;