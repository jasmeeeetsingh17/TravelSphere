import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useRouteLoaderData } from "react-router";
import { Bell, ChevronDown, ExternalLink, LogOut, UserCircle } from "lucide-react";
import { logoutUser } from "~/appwrite/auth";
import { useAdminFeed } from "~/lib/admin-feed";
import { buildNotices, useNotificationsSeen } from "~/lib/notifications";
import { cn } from "~/lib/utils";
import ThemeToggle from "./ThemeToggle";
import LiveClock from "./LiveClock";
import { NoticeList } from "./NotificationsPanel";

type AdminUser = { name?: string; email?: string; imageUrl?: string } | undefined;

const TITLES: [RegExp, string][] = [
    [/^\/dashboard/, "Dashboard"],
    [/^\/analytics/, "Analytics"],
    [/^\/bookings/, "Bookings"],
    [/^\/trips\/create/, "AI Trip Planner"],
    [/^\/trips\/[^/]+\/edit/, "Edit trip"],
    [/^\/trips\/[^/]+/, "Trip details"],
    [/^\/trips/, "All trips"],
    [/^\/all-users/, "Users"],
    [/^\/account/, "My account"],
];

/** Closes a drop-down when clicking outside it or pressing Escape. */
function useDismiss(open: boolean, close: () => void) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, close]);
    return ref;
}

const Dropdown = ({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) => (
    <div
        className={cn(
            "absolute right-0 top-full mt-2 bg-surface rounded-2xl border border-light-400 shadow-2xl shadow-dark-100/10 transition-all origin-top-right z-50",
            open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
            className
        )}
    >
        {children}
    </div>
);

/** Fixed bar on every admin page: page title, live clock, notifications and the signed-in admin. */
const AdminTopbar = () => {
    const user = useRouteLoaderData("routes/admin/admin-layout") as AdminUser;
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? "Admin";

    /* ---- notifications from the shared live feed ---- */
    const data = useAdminFeed();
    const notices = useMemo(() => buildNotices(data.bookings, data.users), [data.bookings, data.users]);
    const { isUnread, markAllRead } = useNotificationsSeen();
    const unread = notices.filter(isUnread).length;

    /* ---- drop-downs ---- */
    const [bellOpen, setBellOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const closeBell = useCallback(() => setBellOpen(false), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const bellRef = useDismiss(bellOpen, closeBell);
    const menuRef = useDismiss(menuOpen, closeMenu);
    useEffect(() => {
        setBellOpen(false);
        setMenuOpen(false);
    }, [pathname]);

    const signOut = async () => {
        await logoutUser();
        navigate("/sign-in");
    };

    const name = user?.name ?? "Admin";

    return (
        <header className="sticky top-16 lg:top-0 z-30 bg-surface/90 backdrop-blur border-b border-light-400">
            <div className="wrapper h-16 flex items-center justify-between gap-3">
                <h1 className="hidden sm:block text-lg md:text-xl font-bold text-dark-100 truncate">{title}</h1>

                <div className="flex flex-1 sm:flex-none items-center gap-2 sm:gap-3">
                    <div className="mr-auto sm:mr-0 sm:pl-1">
                        <LiveClock compact />
                    </div>

                    <span className="hidden sm:block h-8 w-px bg-light-400" />

                    <ThemeToggle />

                    {/* Notifications */}
                    <div ref={bellRef} className="relative">
                        <button
                            onClick={() => {
                                setBellOpen((o) => !o);
                                setMenuOpen(false);
                            }}
                            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
                            aria-expanded={bellOpen}
                            className={cn(
                                "relative size-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer",
                                bellOpen ? "bg-primary-50 text-primary-100" : "text-dark-200 hover:bg-light-200"
                            )}
                        >
                            <Bell size={20} className={cn(unread > 0 && "animate-[wiggle_1s_ease-in-out_2]")} />
                            {unread > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-red-100 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                                    {unread > 99 ? "99+" : unread}
                                </span>
                            )}
                        </button>
                        <Dropdown open={bellOpen} className="w-[min(380px,calc(100vw-2rem))] p-4 flex flex-col gap-3">
                            <span className="flex items-center justify-between">
                                <strong className="text-dark-100">Notifications</strong>
                                {unread > 0 ? (
                                    <button onClick={markAllRead} className="text-xs font-semibold text-primary-100 hover:underline cursor-pointer">
                                        Mark all read
                                    </button>
                                ) : (
                                    <small className="text-xs text-gray-100">All read</small>
                                )}
                            </span>
                            <NoticeList notices={notices} isUnread={isUnread} onPick={closeBell} max={8} />
                            <Link to="/bookings" onClick={closeBell} className="text-center text-sm font-semibold text-primary-100 hover:underline">
                                View all bookings
                            </Link>
                        </Dropdown>
                    </div>

                    {/* Signed-in admin */}
                    <div ref={menuRef} className="relative">
                        <button
                            onClick={() => {
                                setMenuOpen((o) => !o);
                                setBellOpen(false);
                            }}
                            aria-expanded={menuOpen}
                            className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-light-200 transition-colors cursor-pointer"
                        >
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full object-cover" />
                            ) : (
                                <span className="size-8 rounded-full bg-linear-to-br from-primary-100 to-violet-600 text-white text-sm font-bold flex items-center justify-center">
                                    {name.charAt(0).toUpperCase()}
                                </span>
                            )}
                            <span className="hidden md:flex flex-col items-start leading-tight max-w-36">
                                <strong className="text-sm text-dark-100 truncate max-w-36">{name}</strong>
                                <small className="text-[11px] text-success-700 font-semibold">Admin</small>
                            </span>
                            <ChevronDown size={16} className={cn("text-gray-100 transition-transform", menuOpen && "rotate-180")} />
                        </button>
                        <Dropdown open={menuOpen} className="w-64 p-2">
                            <div className="px-3 py-2.5 border-b border-light-400 mb-1">
                                <strong className="block text-sm text-dark-100 truncate">{name}</strong>
                                <small className="block text-xs text-gray-100 truncate">{user?.email}</small>
                            </div>
                            <Link to="/account" onClick={closeMenu} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-dark-200 hover:bg-light-200">
                                <UserCircle size={17} /> My account
                            </Link>
                            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-dark-200 hover:bg-light-200">
                                <ExternalLink size={17} /> View website
                            </a>
                            <button onClick={signOut} className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer">
                                <LogOut size={17} /> Sign out
                            </button>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
