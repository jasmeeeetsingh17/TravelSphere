import { account } from "~/appwrite/client";
import type { Booking } from "~/lib/booking";

/** Calls the admin-only server route. The server checks the caller is an admin. */
export async function adminCall<T = Record<string, unknown>>(op: string, payload: Record<string, unknown> = {}): Promise<T> {
    const { jwt } = await account.createJWT();
    const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-appwrite-jwt": jwt },
        body: JSON.stringify({ op, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data as T;
}

/** All bookings (admin only). Returns the reason as `error` if they can't be loaded. */
export async function loadAllBookings(): Promise<{ bookings: Booking[]; error: string }> {
    try {
        const { bookings } = await adminCall<{ bookings: Booking[] }>("listBookings");
        return { bookings, error: "" };
    } catch (e) {
        return { bookings: [], error: e instanceof Error ? e.message : "Could not load bookings." };
    }
}
