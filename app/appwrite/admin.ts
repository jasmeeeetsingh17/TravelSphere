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

export type BookingsData = { bookings: Booking[]; subscribers: number; ready: boolean; error: string };

/** All bookings for admin pages. Never throws: problems come back as `error`, a missing collection as `ready: false`. */
export async function loadBookings(): Promise<BookingsData> {
    try {
        const data = await adminCall<Omit<BookingsData, "error">>("listBookings");
        return { ...data, error: "" };
    } catch (e) {
        return { bookings: [], subscribers: 0, ready: true, error: e instanceof Error ? e.message : "Could not load bookings." };
    }
}
