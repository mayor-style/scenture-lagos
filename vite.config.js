import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss"; // ✅ Correct package
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.JPG"],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer], // ✅ Uses correct PostCSS package
    },
  },
});
