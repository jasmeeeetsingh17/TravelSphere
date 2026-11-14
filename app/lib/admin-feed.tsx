/**
 * Live admin data (bookings + users) fetched once for the whole admin panel and refreshed every 30 seconds.
 * The top bar (notifications) and the sidebar (pending count, Today card) both read from it.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { loadBookings } from "~/appwrite/admin";
import { getAllUsers } from "~/appwrite/users";
import type { Booking } from "~/lib/booking";
import type { UserLite } from "~/lib/notifications";

type Feed = { bookings: Booking[]; users: UserLite[]; loaded: boolean };

const FeedContext = createContext<Feed>({ bookings: [], users: [], loaded: false });

export function AdminFeedProvider({ children }: { children: ReactNode }) {
    const [feed, setFeed] = useState<Feed>({ bookings: [], users: [], loaded: false });
    const { pathname } = useLocation();

    const refresh = useCallback(async () => {
        if (document.visibilityState !== "visible") return;
        const [b, u] = await Promise.all([loadBookings(), getAllUsers(500)]);
        setFeed({ bookings: b.bookings, users: u.map((x) => ({ id: x.id, name: x.name, status: x.status, joinedAt: x.joinedAt })), loaded: true });
    }, []);

    // On load, every 30 seconds, and after moving to another page (e.g. after confirming a booking)
    useEffect(() => {
        refresh();
        const id = setInterval(refresh, 30_000);
        return () => clearInterval(id);
    }, [refresh, pathname]);

    return <FeedContext.Provider value={feed}>{children}</FeedContext.Provider>;
}

export const useAdminFeed = () => useContext(FeedContext);
