import pluginReactFastRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import pluginReactJSX from "vite-react-jsx";

export default defineConfig(() => ({
  root: "example",
  plugins: [
    pluginReactJSX(), pluginReactFastRefresh(),
  ],
}));
