import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["map/surface-map.webp", "icons/*.svg"],
      manifest: {
        name: "Sons of the Forest Interactive Map",
        short_name: "SOTF Map",
        description: "An offline-friendly, source-backed Sons of the Forest map.",
        theme_color: "#0d1713",
        background_color: "#07100d",
        display: "standalone",
        start_url: ".",
        icons: [
          { src: "icons/map-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json,woff2}"],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ["leaflet", "leaflet.markercluster"],
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
