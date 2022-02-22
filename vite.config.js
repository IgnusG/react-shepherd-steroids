import pluginReactFastRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";
import pluginDts from "vite-plugin-dts";
import pluginReactJSX from "vite-react-jsx";



export default defineConfig(({ command }) => ({
  root: command === "build" ? undefined : "example",
  plugins: [
    ...command !== "build" ? [pluginReactJSX(), pluginReactFastRefresh()] : [],
    {
      ...pluginDts(),
      apply: "build"
    }
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.ts"),
      name: "react-shepherd-steroids",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-shepherd"],
      output: {
        globals: {
          react: "React",
          ["react-dom"]: "ReactDOM",
        },
      },
    },
  },
}));
