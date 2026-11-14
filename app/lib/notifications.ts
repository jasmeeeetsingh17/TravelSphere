/** Admin notifications: built from bookings and users. Shared by the top bar bell and the dashboard panel. */
import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, CheckCircle2, UserPlus, XCircle, type LucideIcon } from "lucide-react";
import type { Booking } from "~/lib/booking";
import { money } from "~/lib/utils";

export type UserLite = { id: string; name: string; status: string; joinedAt: string };

export type Notice = { id: string; at: string; title: string; text: string; href: string; Icon: LucideIcon; tone: string };

/** "just now", "5 min ago", "3 h ago", "2 days ago" */
export const ago = (iso: string, now: number) => {
    const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    const d = Math.floor(s / 86400);
    return d < 30 ? `${d} ${d === 1 ? "day" : "days"} ago` : new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/** Bookings (by status) and people waiting for admin access, newest first. */
export const buildNotices = (bookings: Booking[], users: UserLite[]): Notice[] => {
    const fromBookings = bookings.map((b): Notice => {
        const who = `${b.customerName} · ${b.travellers} ${b.travellers === 1 ? "person" : "people"} · ${money(b.amount)}`;
        if (b.status === "Pending")
            return { id: b.id, at: b.createdAt, title: "New booking request", text: `${b.tripName}. ${who}`, href: "/bookings", Icon: CalendarPlus, tone: "bg-amber-50 text-amber-600" };
        if (b.status === "Confirmed")
            return { id: b.id, at: b.createdAt, title: "Booking confirmed", text: `${b.tripName}. ${who}`, href: "/bookings", Icon: CheckCircle2, tone: "bg-success-50 text-success-700" };
        return { id: b.id, at: b.createdAt, title: "Booking cancelled", text: `${b.tripName}. ${b.customerName}`, href: "/bookings", Icon: XCircle, tone: "bg-light-300 text-gray-500" };
    });
    const fromUsers = users
        .filter((u) => u.status !== "admin")
        .map((u): Notice => ({
            id: `user-${u.id}`,
            at: u.joinedAt,
            title: "Waiting for admin access",
            text: `${u.name} signed in. Give them access on the Users page.`,
            href: "/all-users",
            Icon: UserPlus,
            tone: "bg-violet-50 text-violet-600",
        }));
    return [...fromBookings, ...fromUsers].filter((n) => n.at).sort((a, b) => b.at.localeCompare(a.at));
};

const SEEN_KEY = "ts-notifications-seen";
const SEEN_EVENT = "ts-notifications-seen";

/**
 * When notifications were last read (per browser). Every component using this hook stays in sync,
 * so "Mark all read" in the bell also clears the dashboard panel and vice versa.
 */
export function useNotificationsSeen() {
    const [seen, setSeen] = useState("");

    useEffect(() => {
        const read = () => {
            try {
                setSeen(localStorage.getItem(SEEN_KEY) ?? "");
            } catch {
                // storage blocked: everything shows as unread
            }
        };
        read();
        window.addEventListener(SEEN_EVENT, read);
        window.addEventListener("storage", read);
        return () => {
            window.removeEventListener(SEEN_EVENT, read);
            window.removeEventListener("storage", read);
        };
    }, []);

    const markAllRead = useCallback(() => {
        const stamp = new Date().toISOString();
        setSeen(stamp);
        try {
            localStorage.setItem(SEEN_KEY, stamp);
        } catch {
            // ignore
        }
        window.dispatchEvent(new Event(SEEN_EVENT));
    }, []);

    const isUnread = useCallback((n: Notice) => !seen || n.at > seen, [seen]);

    return { isUnread, markAllRead };
}

/** Re-renders every `ms` so relative times ("5 min ago") stay current. */
export function useNow(ms = 30_000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(id);
    }, [ms]);
    return now;
}
