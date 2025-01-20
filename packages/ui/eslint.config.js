import baseConfig from "@defierros/eslint-config/base";
import reactConfig from "@defierros/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
