import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    //開発環境設定
    return {
      server: {
        port: 8000,
      },
    };
  } else {
    //本番環境設定
    return {
      css: {
        postcss: {
          plugins: [autoprefixer],
        },
      },
    };
  }
});