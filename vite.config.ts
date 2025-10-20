import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    dedupe: ["react", "react-dom"],
    preserveSymlinks: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true, // Force dependency re-optimization
  },
  build: { sourcemap: false },
});
