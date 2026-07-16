import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Override for local testing against the mock server, e.g.:
      //   HYPERVISOR_BACKEND=http://localhost:4040 npm run dev
      "/backend": {
        target: process.env.HYPERVISOR_BACKEND || "http://localhost:80",
        changeOrigin: true,
      },
    },
  },
})
