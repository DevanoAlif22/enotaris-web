"use client";

import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);

// Function to get system preference
const getSystemTheme = () => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

// Function to apply theme to DOM
const applyTheme = (newTheme) => {
  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove("light", "dark");

  // Add new theme class
  root.classList.add(newTheme);

  // Set data attribute for additional styling
  root.setAttribute("data-theme", newTheme);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      return stored || "system";
    }
    return "system";
  });

  const [actualTheme, setActualTheme] = useState("light");

  // Effect to handle theme changes
  useEffect(() => {
    let effectiveTheme;

    if (theme === "system") {
      effectiveTheme = getSystemTheme();
    } else {
      effectiveTheme = theme;
    }

    applyTheme(effectiveTheme);
    setActualTheme(effectiveTheme);

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Effect to listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        if (theme === "system") {
          const systemTheme = getSystemTheme();
          applyTheme(systemTheme);
          setActualTheme(systemTheme);
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = theme === "system" ? getSystemTheme() : theme;
    applyTheme(initialTheme);
    setActualTheme(initialTheme);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      // If system, toggle to opposite of current actual theme
      setTheme(actualTheme === "light" ? "dark" : "light");
    }
  };

  const value = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Export the context for use in the hook
export { ThemeContext };
