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
    "typescript/consistent-type-imports": "error",
    "typescript/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true,
      },
    ],
    // This rule is not yet available in oxlint.
    // https://github.com/oxc-project/oxc/issues/2180
    // "typescript/explicit-member-accessibility": ["error", { overrides: { constructors: "off" } }],
    "typescript/unbound-method": "off",
    "unicorn/no-array-for-each": "error",
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
