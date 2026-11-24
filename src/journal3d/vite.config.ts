import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The journal ships as a standalone ES module that the static MySpace page
// pulls in with a dynamic import. `base: "./"` keeps every URL relative so the
// bundle also works from a GitHub Pages project sub-path.
export default defineConfig({
  base: "./",
  plugins: [react()],
  // a library build does not replace the environment flag for us, and React
  // reads it at runtime
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  worker: { format: "es" },
  build: {
    target: "es2020",
    outDir: "../../dist/journal3d",
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    minify: "esbuild",
    chunkSizeWarningLimit: 1600,
    lib: {
      entry: "src/main.tsx",
      formats: ["es"],
      fileName: () => "journal3d.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "journal3d.[ext]",
      },
    },
  },
});
