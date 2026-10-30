import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { whop } from "@whop/cli/vite";
import tsconfigPaths from "vite-tsconfig-paths";

function nameWhopServerEntry(): Plugin {
  return {
    name: "name-whop-server-entry",
    apply: "build",
    configEnvironment(name) {
      if (name !== "ssr") return;
      return {
        build: {
          rollupOptions: {
            output: {
              entryFileNames: "index.js",
            },
          },
        },
      };
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackStart(),
    nameWhopServerEntry(),
    tsconfigPaths(),
    react(),
    whop(),
  ],
});
