import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/main.tsx"], // adjust to your entry file
            refresh: true,
        }),
        tailwindcss(),
        react({
            jsxRuntime: "automatic", // ✅ fixes the need for "import React"
        }),
    ],
});
