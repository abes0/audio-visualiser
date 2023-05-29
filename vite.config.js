import { defineConfig } from "vite"
import autoprefixer from "autoprefixer"
import path from "path"

export default defineConfig(({ command }) => {
  if (command === "serve") {
    //開発環境設定
    return {
      server: {
        port: 8000,
      },
      resolve: {
        alias: {
          "@Components/": path.join(__dirname, "src/Components/"),
          "~/": path.join(__dirname, "src/"),
        },
      },
    }
  } else {
    //本番環境設定
    return {
      css: {
        postcss: {
          plugins: [autoprefixer],
        },
      },
      resolve: {
        alias: {
          "@Components/": path.join(__dirname, "src/Components/"),
          "~/": path.join(__dirname, "src/"),
        },
      },
    }
  }
})
