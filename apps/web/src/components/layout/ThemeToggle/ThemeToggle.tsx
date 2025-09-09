import { Moon, Sun } from "lucide-react";

import { ActionButton } from "~/components/ui";
import { useTheme } from "~/contexts/ThemeContext";
import { useI18n } from "~/i18n/useI18n";

export function ThemeToggle({ "data-testid": testId = "theme-toggle" }) {
  const { isDark, toggleTheme } = useTheme();
  const i18n = useI18n();

  return (
    <ActionButton
      aria-label={isDark ? i18n("Light mode") : i18n("Dark mode")}
      data-testid={testId}
      icon={isDark ? <Sun /> : <Moon />}
      onClick={toggleTheme}
      variant="ghost"
    />
  );
}
