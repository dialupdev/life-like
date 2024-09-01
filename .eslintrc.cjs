module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "lit", "lit-a11y", "import-x"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier", "plugin:import-x/typescript"],
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
    "import-x/no-default-export": "error",
    "import-x/order": [
      "error",
      {
        groups: [["builtin", "external"], ["internal", "parent", "sibling", "index"], ["type"]],
        "newlines-between": "never",
        pathGroups: [
          {
            pattern: "core",
            group: "external",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
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
