"use client";

import { useThemeContext } from "../theme-provider";
import { Toaster as Sonner } from "sonner@2.0.3";

const Toaster = ({ ...props }) => {
  const { resolvedTheme = "system" } = useThemeContext();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--bg-secondary)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-light)",
        }
      }
      {...props}
    />
  );
};

export { Toaster };
