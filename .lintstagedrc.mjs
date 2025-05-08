export const typeCheck = () => "pnpm exec tsc --project tsconfig.json --noEmit";
export const eslintWithFix = () => "yarn lint --fix";

export default {
  "*.{ts,tsx}": [typeCheck, eslintWithFix],
};
