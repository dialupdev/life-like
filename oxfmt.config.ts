import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 120,
  sortImports: {
    groups: [
      ["builtin", "external"],
      ["internal", "parent", "sibling", "index"],
      ["type"],
      ["side_effect", "side_effect_style"],
    ],
  },
  trailingComma: "es5",
});
