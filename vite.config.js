import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/itunes": { target: "https://itunes.apple.com", changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/itunes/, "") },
      "/api/wiki": { target: "https://en.wikipedia.org", changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/wiki/, "") },
    },
  },
});
