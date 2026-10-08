import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` matches the GitHub Pages URL: https://<user>.github.io/todo-app/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/todo-app/" : "/",
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
}));
