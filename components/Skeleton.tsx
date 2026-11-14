import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "~/lib/utils";

/** Grey shimmering block that stands in for content while it loads. */
export const Skeleton = ({ className, style }: { className?: string; style?: CSSProperties }) => (
    <span aria-hidden className={cn("skeleton block rounded-lg", className)} style={style} />
);

/** Admin pages, so moving between them shows a page skeleton instead of the full-screen spinner. */
const ADMIN_PATHS = ["/dashboard", "/analytics", "/all-users", "/trips", "/bookings", "/account"];
export const isAdminPath = (path: string) => ADMIN_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

/** True once `on` has stayed true for `ms`, so fast loads don't flash a skeleton. */
export const useDelayed = (on: boolean, ms = 150) => {
    const [shown, setShown] = useState(false);
    useEffect(() => {
        if (!on) return setShown(false);
        const id = setTimeout(() => setShown(true), ms);
        return () => clearTimeout(id);
    }, [on, ms]);
    return shown;
};

/** Placeholder for an admin page: heading, four stat cards, a chart and a list. */
export const AdminPageSkeleton = () => (
    <div role="status" aria-label="Loading page" className="wrapper flex flex-col gap-8 pb-20">
        <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="rounded-2xl bg-surface border border-light-400 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="size-10 rounded-xl" />
                    </div>
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-3 w-36" />
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-2xl bg-surface border border-light-400 p-5 flex flex-col gap-5">
                <Skeleton className="h-5 w-40" />
                <div className="h-56 flex items-end gap-3">
                    {[45, 70, 55, 85, 60, 95, 75, 50].map((h, i) => (
                        <Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
            <div className="rounded-2xl bg-surface border border-light-400 p-5 flex flex-col gap-4">
                <Skeleton className="h-5 w-32" />
                {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                            <Skeleton className="h-3.5 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <span className="sr-only">Loading...</span>
    </div>
);

/** First load of the admin panel: sidebar, top bar and page placeholder. */
export const AdminShellSkeleton = () => (
    <div className="admin-layout">
        <aside className="hidden lg:flex w-68 shrink-0 h-screen sticky top-0 flex-col gap-3 bg-surface border-r border-light-400 p-6">
            <Skeleton className="h-8 w-40 mb-6" />
            {Array.from({ length: 7 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
        </aside>
        <section className="children">
            <div className="h-16 bg-surface border-b border-light-400 flex items-center justify-between px-4 lg:px-8">
                <Skeleton className="h-6 w-36" />
                <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </div>
            <div className="pt-6 lg:pt-8">
                <AdminPageSkeleton />
            </div>
        </section>
    </div>
);
