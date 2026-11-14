import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "~/lib/utils";

/** Real-time clock that ticks every second. Kept in its own component so only it re-renders. */
const LiveClock = ({ compact = false }: { compact?: boolean }) => {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Render a placeholder on the server so the time never mismatches during hydration
    if (!now) return <div className={compact ? "h-10 w-28" : "h-[60px] w-48"} aria-hidden />;

    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    const date = now.toLocaleDateString("en-IN", compact ? { weekday: "short", day: "numeric", month: "short" } : { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    return (
        <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")} aria-live="off">
            <span className={cn("rounded-2xl bg-primary-50 text-primary-100 flex items-center justify-center shrink-0", compact ? "size-9 rounded-xl" : "size-12")}>
                <Clock size={compact ? 17 : 22} />
            </span>
            <span className="flex flex-col leading-tight">
                <strong className={cn("font-bold text-dark-100 tabular-nums tracking-tight", compact ? "text-sm" : "text-2xl")}>{time}</strong>
                <small className={cn("text-gray-100", compact ? "text-[11px]" : "text-sm")}>{date}</small>
            </span>
        </div>
    );
};

export default LiveClock;
