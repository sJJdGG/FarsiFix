import { useCallback, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "farsifix-theme";
const THEME_COLORS: Record<Exclude<Theme, "system">, string> = {
  light: "#fafaf9",
  dark: "#0f1221",
};

const getSystemTheme = (): Exclude<Theme, "system"> => {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const readStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return null;
};

const themeCycle: Theme[] = ["light", "dark", "system"];

const applyResolvedTheme = (resolvedTheme: Exclude<Theme, "system">) => {
  if (typeof window === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEME_COLORS[resolvedTheme]);
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? "system");
  const [systemTheme, setSystemTheme] = useState<Exclude<Theme, "system">>(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemTheme(media.matches ? "dark" : "light");
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  const resolvedTheme = useMemo<Exclude<Theme, "system">>(
    () => (theme === "system" ? systemTheme : theme),
    [theme, systemTheme],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    applyResolvedTheme(resolvedTheme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, resolvedTheme]);

  const setResolvedTheme = useCallback((next: Exclude<Theme, "system">) => {
    setTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const index = themeCycle.indexOf(current);
      return themeCycle[(index + 1) % themeCycle.length];
    });
  }, []);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    setTheme,
    setResolvedTheme,
    toggleTheme,
  };
};
