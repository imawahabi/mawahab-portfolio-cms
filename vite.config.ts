import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE;
  const hasRemoteApi = Boolean(apiBase && apiBase.startsWith("http"));

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: hasRemoteApi
        ? undefined
        : {
            "/api": {
              target: "http://localhost:4600",
              changeOrigin: true,
          },
        },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Ensure the environment variable is available at build time
      'import.meta.env.VITE_API_BASE': JSON.stringify(apiBase || "/api"),
    },
  };
});
