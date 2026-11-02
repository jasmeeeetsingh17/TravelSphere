import { calculateTrendPercentage, cn } from "~/lib/utils";

interface StatsCardProps {
    headerTitle: string;
    total: string | number;
    lastMonthCount: number;
    currentMonthCount: number;
}

const StatsCard = ({
    headerTitle,
    total,
    lastMonthCount,
    currentMonthCount,
}: StatsCardProps) => {
    const { trend, percentage } = calculateTrendPercentage(
        currentMonthCount,
        lastMonthCount
    );

    const isDecrement = trend === "decrement";

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_25px_-5px_rgb(0_0_0/0.05),0_8px_10px_-6px_rgb(0_0_0/0.04)] sm:p-6">
            {/* Subtle contextual ambient glow in corner */}
            <div
                className={cn(
                    "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-300 opacity-40 group-hover:opacity-75",
                    isDecrement ? "bg-rose-100" : "bg-emerald-100"
                )}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                    {headerTitle}
                </span>
                <span className="flex size-2 rounded-full bg-slate-200 group-hover:bg-slate-300 transition-colors" />
            </div>

            {/* Main Stats + Graph */}
            <div className="relative mt-4 flex items-end justify-between gap-4">
                {/* Total & Inline Trend Badge */}
                <div className="flex flex-wrap items-baseline gap-2.5">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl tabular-nums">
                        {total}
                    </h2>

                    <div
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight shadow-xs transition-colors",
                            isDecrement
                                ? "bg-rose-50/80 text-rose-700 ring-1 ring-inset ring-rose-500/20"
                                : "bg-emerald-50/80 text-emerald-700 ring-1 ring-inset ring-emerald-500/20"
                        )}
                    >
                        <img
                            src={`/assets/icons/${isDecrement ? "arrow-down-red.svg" : "arrow-up-green.svg"
                                }`}
                            className="size-3 object-contain shrink-0"
                            alt=""
                            aria-hidden="true"
                        />
                        <span>{Math.round(percentage)}%</span>
                    </div>
                </div>

                {/* Sparkline / Trend Graph */}
                <div className="relative flex h-11 w-24 shrink-0 items-center justify-end sm:h-12 sm:w-28 opacity-85 group-hover:opacity-100 transition-opacity">
                    <img
                        src={`/assets/icons/${isDecrement ? "decrement.svg" : "increment.svg"
                            }`}
                        className="h-full w-full object-contain object-bottom drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                        alt={`${isDecrement ? "Decreasing" : "Increasing"} trend graph`}
                    />
                </div>
            </div>
        </article>
    );
};

export default StatsCard;