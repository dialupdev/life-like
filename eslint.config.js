import eslint from "@eslint/js";
import { configs as eslintPluginLitConfigs } from "eslint-plugin-lit";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      eslintPluginLitConfigs["flat/recommended"],
    ],
    ignores: ["dist/*"],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": ["error", { overrides: { constructors: "off" } }],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
      "no-await-in-loop": "error",
      "no-console": "error",
    },
  },
  {
    files: ["scripts/**/*"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-console": "off",
    },
  }
);
