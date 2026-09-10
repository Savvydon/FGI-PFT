import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Local development proxy. Production uses VITE_API_BASE_URL.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Fix for html2canvas source map error
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },
});
