import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  {
    ignores: [
      "node_modules/*",
      ".git/*",
      ".gitignore",
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/bun.lockb",
      "dist/*",
    ],
  },
);
