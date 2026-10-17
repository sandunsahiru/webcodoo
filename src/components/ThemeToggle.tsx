"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
      style={{
        background: theme === "dark"
          ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
          : "linear-gradient(135deg, #e0d7ff, #c4b5fd)",
      }}
    >
      {/* Track icons */}
      <span
        className="absolute inset-y-0 left-1.5 flex items-center text-[11px] select-none transition-opacity duration-200"
        style={{ opacity: theme === "light" ? 1 : 0 }}
      >
        ☀️
      </span>
      <span
        className="absolute inset-y-0 right-1.5 flex items-center text-[11px] select-none transition-opacity duration-200"
        style={{ opacity: theme === "dark" ? 1 : 0 }}
      >
        🌙
      </span>

      {/* Thumb */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-sm"
        style={{
          left: theme === "dark" ? "calc(100% - 1.625rem)" : "0.125rem",
          background: theme === "dark" ? "#1e1b4b" : "#ffffff",
          boxShadow: theme === "dark"
            ? "0 2px 8px rgba(0,0,0,0.5)"
            : "0 2px 8px rgba(124,58,237,0.2)",
        }}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
