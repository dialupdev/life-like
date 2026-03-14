import { defineConfig } from "oxfmt";

export default defineConfig({
  arrowParens: "avoid",
  ignorePatterns: ["dist/*"],
  printWidth: 120,
  trailingComma: "es5",
});
