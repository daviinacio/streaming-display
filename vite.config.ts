import path from "path";
import react from "@vitejs/plugin-react";
import prism from "vite-plugin-prismjs";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
  plugins: [
    react(),
    prism({
      languages: ["javascript", "css", "html", "typescript"],
      plugins: ["line-numbers"],
      theme: "tomorrow",
      css: true,
    }),
    ViteEjsPlugin({
      year: new Date().getFullYear(),
      version: String(`v${pkg.version}`).padStart(9, " "),
      title: "Streaming Display v2",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
