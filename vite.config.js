import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Add these optimizations for PDF.js
  optimizeDeps: {
    include: ["pdfjs-dist"],
  },

  // Handle worker files and other assets
  assetsInclude: ["**/*.worker.js"],

  // Configure build options
  build: {
    rollupOptions: {
      output: {
        // Ensure worker files are handled correctly
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.includes("worker")) {
            return "assets/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },

  // Add server configuration for development
  server: {
    // Enable CORS for CDN resources
    cors: true,
    // headers: {
    //   "Cross-Origin-Embedder-Policy": "require-corp",
    //   "Cross-Origin-Opener-Policy": "same-origin",
    // },
  },
});
