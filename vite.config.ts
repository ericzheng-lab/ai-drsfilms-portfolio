import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        // Draft of the next home page; served at /home-next, noindex.
        homeNext: fileURLToPath(new URL("./home-next.html", import.meta.url)),
      },
    },
  },
});
