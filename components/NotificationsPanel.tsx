import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { Bell } from "lucide-react";
import type { Booking } from "~/lib/booking";
import { ago, buildNotices, useNotificationsSeen, useNow, type Notice, type UserLite } from "~/lib/notifications";
import { cn } from "~/lib/utils";

/** List of notifications with unread dots. Used by the dashboard panel and the top bar bell. */
export const NoticeList = ({ notices, isUnread, onPick, max = 12 }: { notices: Notice[]; isUnread: (n: Notice) => boolean; onPick?: () => void; max?: number }) => {
    const now = useNow();
    if (!notices.length) {
        return <p className="flex items-center justify-center text-center text-sm text-gray-100 bg-light-200 rounded-2xl px-4 py-10">You're all caught up.</p>;
    }
    return (
        <ul className="flex flex-col -mx-2 max-h-[420px] overflow-y-auto">
            {notices.slice(0, max).map((n) => {
                const isNew = isUnread(n);
                return (
                    <li key={n.id}>
                        <Link to={n.href} onClick={onPick} className={cn("flex gap-3 rounded-xl px-2 py-3 hover:bg-light-200 transition-colors", isNew && "bg-primary-50/40")}>
                            <span className={cn("size-9 shrink-0 rounded-xl flex items-center justify-center", n.tone)}>
                                <n.Icon size={17} />
                            </span>
                            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <span className="flex items-center justify-between gap-2">
                                    <strong className="text-sm font-semibold text-dark-100 truncate">{n.title}</strong>
                                    <small className="shrink-0 text-[11px] text-gray-100">{ago(n.at, now)}</small>
                                </span>
                                <small className="text-xs text-gray-100 line-clamp-2">{n.text}</small>
                            </span>
                            {isNew && <span className="size-2 mt-2 shrink-0 rounded-full bg-primary-100" aria-label="Unread" />}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

type Props = {
    bookings: Booking[];
    users: UserLite[];
    /** Called to fetch fresh data; the panel calls it every 30 seconds */
    onRefresh: () => void;
    refreshing: boolean;
};

/** Dashboard card with the full notifications feed. */
const NotificationsPanel = ({ bookings, users, onRefresh, refreshing }: Props) => {
    const notices = useMemo(() => buildNotices(bookings, users), [bookings, users]);
    const { isUnread, markAllRead } = useNotificationsSeen();
    const unread = notices.filter(isUnread).length;

    // Live: re-fetch every 30 seconds
    useEffect(() => {
        const id = setInterval(onRefresh, 30_000);
        return () => clearInterval(id);
    }, [onRefresh]);

    return (
        <article className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
            <header className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                    <span className="relative size-10 rounded-xl bg-primary-50 text-primary-100 flex items-center justify-center">
                        <Bell size={19} />
                        {unread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-100 text-white text-[11px] font-bold flex items-center justify-center">
                                {unread > 99 ? "99+" : unread}
                            </span>
                        )}
                    </span>
                    <span className="flex flex-col leading-tight">
                        <h2 className="text-lg font-semibold text-dark-100">Notifications</h2>
                        <small className="flex items-center gap-1.5 text-xs text-gray-100">
                            <span className={cn("size-2 rounded-full bg-success-500", refreshing ? "animate-ping" : "animate-pulse")} />
                            Live · updates every 30 seconds
                        </small>
                    </span>
                </span>
                {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs font-semibold text-primary-100 hover:underline cursor-pointer shrink-0">
                        Mark all read
                    </button>
                )}
            </header>
            <NoticeList notices={notices} isUnread={isUnread} />
        </article>
    );
};

export default NotificationsPanel;
