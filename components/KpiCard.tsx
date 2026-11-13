import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

type Props = {
    label: string;
    value: string | number;
    note?: string;
    Icon: LucideIcon;
    /** Tailwind classes for the icon tile, e.g. "bg-primary-50 text-primary-100" */
    tone: string;
    /** Percent change vs last month. Omit to hide the badge. */
    delta?: number;
};

/** Small metric tile used on the dashboard and analytics pages. */
const KpiCard = ({ label, value, note, Icon, tone, delta }: Props) => (
    <li className="group relative overflow-hidden bg-white rounded-3xl border border-light-400 shadow-sm p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
        <span className={cn("pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-70", tone)} />
        <span className="relative flex items-center justify-between">
            <span className={cn("size-11 rounded-2xl flex items-center justify-center", tone)}>
                <Icon size={22} />
            </span>
            {delta !== undefined && (
                <span
                    className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        delta > 0 ? "bg-success-50 text-success-700" : delta < 0 ? "bg-red-50 text-red-500" : "bg-light-300 text-gray-500"
                    )}
                >
                    {delta > 0 ? <ArrowUpRight size={14} /> : delta < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                    {Math.abs(delta)}%
                </span>
            )}
        </span>
        <span className="relative flex flex-col gap-0.5 min-w-0">
            <small className="text-sm text-gray-100">{label}</small>
            <strong className="text-2xl md:text-3xl font-bold text-dark-100 tabular-nums truncate">{value}</strong>
            {note && <small className="text-xs text-gray-100 truncate">{note}</small>}
        </span>
    </li>
);

export default KpiCard;
