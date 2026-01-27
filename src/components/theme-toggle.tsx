"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (systemPrefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Add transition class for smooth change
    document.documentElement.classList.add("transitioning");

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 300);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
        <span className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full hover:bg-primary/10"
      aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors" />
      ) : (
        <Sun className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors" />
      )}
    </Button>
  );
}
