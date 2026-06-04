// @ts-check
import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "eslint.config.mjs",
      ".next/**",
      "next.config.ts",
      "postcss.config.mjs",
      "sentry.*.config.ts",
      "instrumentation*.ts",
      "public/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // React 19 / Next App Router: no React import needed, JSX runtime is automatic.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Project conventions (CLAUDE.md): no console, justify any.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // autoFocus is a deliberate UX choice in our modals/2FA flows (focus the
      // single input on open). Surface it as a warning rather than block CI.
      "jsx-a11y/no-autofocus": "warn",
    },
  },
  {
    // OG image routes render via Satori (ImageResponse), which only supports
    // raw <img> — next/image is unavailable there. Custom font <link> in the
    // root layout is intentional (Fontshare/Google, App Router has no _document).
    files: ["**/opengraph-image.tsx", "**/layout.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
  eslintConfigPrettier,
);
