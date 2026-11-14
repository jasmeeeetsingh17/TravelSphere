import { Link, useLocation } from "react-router";
import dayjs from "dayjs";
import {
    ArrowRight, BarChart3, CalendarCheck, CalendarPlus, Clock, LayoutDashboard, Map, Sparkles, Users, type LucideIcon,
} from "lucide-react";
import { useAdminFeed } from "~/lib/admin-feed";
import { cn } from "~/lib/utils";

type Badge = "pending" | "waiting";
type NavLinkItem = { href: string; label: string; Icon: LucideIcon; badge?: Badge };

const sections: { title: string; links: NavLinkItem[] }[] = [
    {
        title: "Overview",
        links: [
            { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
            { href: "/analytics", label: "Analytics", Icon: BarChart3 },
        ],
    },
    {
        title: "Bookings",
        links: [
            { href: "/bookings", label: "All bookings", Icon: CalendarCheck },
            { href: "/bookings?status=Pending", label: "Pending requests", Icon: Clock, badge: "pending" },
            { href: "/bookings?new=1", label: "Add booking", Icon: CalendarPlus },
        ],
    },
    {
        title: "Trips",
        links: [
            { href: "/trips", label: "All trips", Icon: Map },
            { href: "/trips/create", label: "AI Trip Planner", Icon: Sparkles },
        ],
    },
    {
        title: "People",
        links: [{ href: "/all-users", label: "Users", Icon: Users, badge: "waiting" }],
    },
];

/** Which link is highlighted: matches the path and, for links with a query (e.g. ?status=Pending), that query too. */
const isActive = (href: string, pathname: string, search: string) => {
    const [path, query] = href.split("?");
    const params = new URLSearchParams(search);
    if (query) {
        const [k, v] = query.split("=");
        return pathname === path && params.get(k)?.toLowerCase() === v.toLowerCase();
    }
    if (path === "/bookings") return pathname === path && !params.get("status") && !params.get("new");
    if (path === "/trips") return pathname === "/trips" || (/^\/trips\/(?!create)/.test(pathname));
    return pathname === path || pathname.startsWith(`${path}/`);
};

/** Admin sidebar: grouped navigation with live counts (pending requests, people waiting for access) and a one-line "Today" summary. */
const NavItems = ({ handleClick }: { handleClick?: () => void }) => {
    const { bookings, users, loaded } = useAdminFeed();
    const { pathname, search } = useLocation();
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const waiting = users.filter((u) => u.status !== "admin").length;
    const today = bookings.filter((b) => b.createdAt && dayjs(b.createdAt).isSame(dayjs(), "day"));

    return (
        <section className="flex flex-col h-full bg-white border-r border-light-400 px-5">
            <Link to="/dashboard" onClick={handleClick} className="flex items-center gap-2 py-7 border-b border-light-400">
                <img src="/assets/icons/logo.svg" alt="" className="size-8" />
                <span className="flex flex-col leading-tight">
                    <strong className="text-xl font-bold text-dark-100">TravelSphere</strong>
                    <small className="text-xs font-medium text-primary-100">Admin panel</small>
                </span>
            </Link>

            <nav className="flex-1 flex flex-col gap-5 pt-6 overflow-y-auto">
                {sections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-1.5">
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-100">{section.title}</p>
                        {section.links.map(({ href, label, Icon, badge }) => {
                            const on = isActive(href, pathname, search);
                            const count = badge === "pending" ? pending : badge === "waiting" ? waiting : 0;
                            const cls = cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                on ? "bg-primary-100 text-white shadow-md shadow-primary-100/25" : "text-dark-200 hover:bg-primary-50 hover:text-primary-100"
                            );
                            const inner = (
                                <>
                                    <Icon size={19} />
                                    <span className="flex-1">{label}</span>
                                    {count > 0 && (
                                        <span
                                            title={badge === "pending" ? `${count} waiting for confirmation` : `${count} waiting for admin access`}
                                            className={cn(
                                                "min-w-6 h-6 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center",
                                                on ? "bg-white text-primary-100" : badge === "pending" ? "bg-amber-400 text-dark-100" : "bg-violet-100 text-violet-700"
                                            )}
                                        >
                                            {count > 99 ? "99+" : count}
                                        </span>
                                    )}
                                </>
                            );
                            return (
                                <Link key={href} to={href} onClick={handleClick} aria-current={on ? "page" : undefined} className={cls}>
                                    {inner}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Today, in one line */}
            <div className="py-5 border-t border-light-400">
                <Link
                    to="/bookings"
                    onClick={handleClick}
                    className="flex items-center justify-between gap-2 rounded-xl bg-light-200 hover:bg-primary-50 px-3 py-3 text-sm transition-colors"
                >
                    <span className="flex flex-col leading-tight">
                        <small className="text-[11px] font-semibold uppercase tracking-wider text-gray-100">Today</small>
                        <span className="text-dark-100">
                            {loaded ? (
                                <>
                                    <strong>{pending}</strong> pending · <strong>{today.length}</strong> new
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary-100">
                        Review <ArrowRight size={14} />
                    </span>
                </Link>
            </div>
        </section>
    );
};

export default NavItems;
