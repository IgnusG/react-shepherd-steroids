import path from "path";

import pluginReactJSX from "vite-react-jsx";
import pluginDts from "vite-plugin-dts";

import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  root: command === "build" ? undefined : "example",
  plugins: [
    pluginReactJSX(),
    {
      ...pluginDts(),
      apply: "build"
    }
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.tsx"),
      name: "react-shepherd-steroids",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "react",
          ["react-dom"]: "react-dom",
        },
      },
    },
  },
}));
