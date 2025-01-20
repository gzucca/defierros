import baseConfig, { restrictEnvAccess } from "@defierros/eslint-config/base";
import nextjsConfig from "@defierros/eslint-config/nextjs";
import reactConfig from "@defierros/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
