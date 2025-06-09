import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import ViteSitemap from "vite-plugin-sitemap"
import { createHtmlPlugin } from "vite-plugin-html"

export default defineConfig({
  plugins: [
    react(),
    ViteSitemap({
      hostname: "http://localhost:3000",
      generateRobotsTxt: true,
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: "Khronos",
          description: "SFA Khronos",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
})
