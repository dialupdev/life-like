module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "lit", "lit-a11y", "import"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier", "plugin:import/typescript"],
  parserOptions: {
    ecmaVersion: 2020,
    project: "./tsconfig.json",
  },
  env: {
    browser: true,
  },
  rules: {
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true,
      },
    ],
    "@typescript-eslint/explicit-member-accessibility": ["error", { overrides: { constructors: "off" } }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "import/no-default-export": "error",
    "import/order": [
      "error",
      {
        groups: [["builtin", "external"], ["internal", "parent", "sibling", "index"], ["type"]],
        "newlines-between": "never",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "no-await-in-loop": "error",
    "no-console": "error",
  },
  overrides: [
    {
      files: ["src/utils/**/*"],
      rules: {
        "import/prefer-default-export": "off",
      },
    },
  ],
};
