import swc from "@rollup/plugin-swc";
import { defineConfig, withFilter } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  build: {
    target: "es2024",
  },
  server: {
    port: 9000,
  },
  plugins: [
    // The oxc transformer doesn't support native decorators yet,
    // so we have to use SWC to transform files with decorators.
    // https://github.com/oxc-project/oxc/issues/9170
    withFilter(
      swc({
        swc: {
          jsc: {
            parser: { syntax: "typescript", decorators: true },
            // SWC doesn't support the 2023-11 version yet.
            transform: { decoratorVersion: "2022-03" },
          },
        },
      }),
      // Only run this transform if the file contains a decorator.
      { transform: { code: "@" } }
    ),
    createHtmlPlugin({
      entry: "/src/main.ts",
      template: "./src/index.html",
    }),
  ],
});
