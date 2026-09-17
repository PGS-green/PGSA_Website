import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Honour the port the launcher hands us instead of silently walking to the
    // next free one, which would leave the preview pointed at a dead port.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
});
