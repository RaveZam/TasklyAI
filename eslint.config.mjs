import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      "max-lines-per-function": ["error", { max: 40 }],
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-lines": ["warn", 300],

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
