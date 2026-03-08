import path from "path";
import react from "@vitejs/plugin-react";
import prism from "vite-plugin-prismjs";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { defineConfig } from "vite";
import pkg from "./package.json";

const packages: { [key in string]: string[] } = {};
const packageKeys = Object.keys(packages) as Array<keyof typeof packages>;

export default defineConfig({
  build: {
    rollupOptions: {
      // external: ["react-player"],
      output: {
        manualChunks: (id: string) => {
          const packageName = packageKeys.find((pkg) =>
            packages[pkg].some((m) => id.includes(`/${m}/`)),
          );
          if (packageName) return packageName;
          else if (id.includes("/node_modules/")) return "vendor";
          else if (id.includes("/pages/")) return;
          return "index";
        },
      },
    },
  },
  define: {
    "process.env": {},
  },
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
      title: "Streaming Display",
      cover_url: "https://streaming-display.onrender.com/cover.png",
      twitter_username: "@daviinacio",
      description: "Centralize all live streamings in one place.",
      site_name: "Streaming Display",
      site_url: "https://streaming-display.onrender.com/grid",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
