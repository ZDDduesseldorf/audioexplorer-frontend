import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ isPreview }) => {
  const backendTarget = isPreview
    ? "http://host.docker.internal:8000"
    : "http://localhost:8000";

  const apiProxy = {
    "/api": {
      target: backendTarget,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],

    // npm run dev → Frontend läuft direkt auf dem Mac
    server: {
      proxy: apiProxy,
    },

    // Docker / npm run preview → Frontend läuft im Container
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
      proxy: apiProxy,
    },
  };
});
