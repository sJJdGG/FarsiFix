import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import Terminal from "vite-plugin-terminal";

export default defineConfig({
  plugins: (() => {
    const terminal = Terminal({
      console: "terminal",
      output: ["terminal", "console"],
    }) as Plugin | Plugin[];
    const terminalPlugins = Array.isArray(terminal) ? terminal : [terminal];
    for (const plugin of terminalPlugins) {
      plugin.apply = "serve";
    }
    return [tailwindcss(), react(), ...terminalPlugins];
  })(),
});
