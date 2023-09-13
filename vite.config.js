import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const IS_BUILD = (process.env.NODE_ENV || "").includes("production")
  ? true
  : false;

// https://vitejs.dev/config/
export default defineConfig({
  base: IS_BUILD ? "/3dRotateYControl/" : "/",
  plugins: [vue()],
  build: {
    minify: "terser",
    outDir: "docs/",
    terserOptions: {
      compress: {
        drop_console: IS_BUILD,
        drop_debugger: IS_BUILD,
      },
    }, //去掉console
  },
  treeshake: true, // 开启树摇
  chunkSizeWarningLimit: 1000, // 代码块大小警告的限制调整为1MB
});
