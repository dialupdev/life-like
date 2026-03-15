import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
  },
  options: {
    typeAware: true,
  },
  rules: {
    "eslint/no-await-in-loop": "error",
    "eslint/no-console": "error",
    "eslint/no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    "typescript/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true,
      },
    ],
    // This rule is not yet available in oxlint.
    // https://oxc.rs/docs/guide/usage/linter/rules.html?sort=name&dir=asc
    // "typescript/explicit-member-accessibility": ["error", { overrides: { constructors: "off" } }],
    "typescript/unbound-method": "off",
  },
  overrides: [
    {
      files: ["scripts/**/*"],
      rules: {
        "eslint/no-console": "off",
      },
    },
  ],
});
