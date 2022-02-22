import path from "path";
import { defineConfig } from "vite";
import pluginDts from "vite-plugin-dts";

export default defineConfig(() => ({
  plugins: [
    {
      ...pluginDts(),
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
