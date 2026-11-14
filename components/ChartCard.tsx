import type { ReactNode } from "react";

type Props = {
    title: string;
    subtitle?: string;
    /** When true the chart is replaced by this message */
    empty?: string;
    children: ReactNode;
    className?: string;
};

/** White card used around every chart so they all look the same. */
const ChartCard = ({ title, subtitle, empty, children, className = "" }: Props) => (
    <article className={`bg-surface rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4 ${className}`}>
        <header className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold text-dark-100">{title}</h2>
            {subtitle && <p className="text-sm text-gray-100">{subtitle}</p>}
        </header>
        {empty ? (
            <p className="flex items-center justify-center text-center text-sm text-gray-100 bg-light-200 rounded-2xl min-h-[260px] px-6">
                {empty}
            </p>
        ) : (
            children
        )}
    </article>
);

export default ChartCard;
