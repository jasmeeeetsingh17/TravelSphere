import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "~/lib/utils";

/** Same key as public/theme.js, which applies the saved theme before the page paints. */
const KEY = "ts-theme";

/** Sun / moon button that switches between light and dark mode and remembers the choice. */
const ThemeToggle = ({ className }: { className?: string }) => {
    const [dark, setDark] = useState(false);
    // Re-apply the saved choice on mount, in case React rebuilt <html> after a hydration error
    useEffect(() => {
        let saved: string | null = null;
        try {
            saved = localStorage.getItem(KEY);
        } catch {
            // storage blocked: fall back to the device setting
        }
        const isDark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", isDark);
        setDark(isDark);
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        // Fade the colours instead of snapping (skipped for people who prefer less motion)
        const root = document.documentElement;
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
            root.classList.add("theme-switching");
            setTimeout(() => root.classList.remove("theme-switching"), 350);
        }
        root.classList.toggle("dark", next);
        try {
            localStorage.setItem(KEY, next ? "dark" : "light");
        } catch {
            // storage blocked: the choice just won't be remembered
        }
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
            className={cn(
                "size-10 shrink-0 rounded-full flex items-center justify-center text-dark-100 hover:bg-light-300 hover:text-primary-100 transition-colors cursor-pointer",
                className
            )}
        >
            <span key={dark ? "sun" : "moon"} className="animate-[spin_0.5s_ease-out_1] motion-reduce:animate-none">
                {dark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
            </span>
        </button>
    );
};

export default ThemeToggle;
