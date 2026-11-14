/** Booking shape shared by the browser and the server. */
import type { TripView } from "~/lib/trip-view";
import { GROUP_SIZE } from "~/constants";
import { priceToNumber } from "~/lib/utils";

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled";
export const BOOKING_STATUSES: BookingStatus[] = ["Pending", "Confirmed", "Cancelled"];

export type Booking = {
    id: string;
    tripId: string;
    tripName: string;
    tripState: string;
    tripStyle: string;
    tripBudget: string;
    tripDays: number;
    customerName: string;
    email: string;
    phone: string;
    travelDate: string; // YYYY-MM-DD
    travellers: number;
    amount: number; // rupees, for all travellers
    status: BookingStatus;
    notes: string;
    source: "website" | "admin";
    createdAt: string; // ISO
};

export { MAX_TRAVELLERS } from "~/lib/booking-schema";

export const bookingFromDoc = (d: any): Booking => ({
    id: d.$id,
    tripId: d.tripId ?? "",
    tripName: d.tripName ?? "",
    tripState: d.tripState ?? "",
    tripStyle: d.tripStyle ?? "",
    tripBudget: d.tripBudget ?? "",
    tripDays: Number(d.tripDays) || 0,
    customerName: d.customerName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    travelDate: d.travelDate ?? "",
    travellers: Number(d.travellers) || 1,
    amount: Number(d.amount) || 0,
    status: BOOKING_STATUSES.includes(d.status) ? d.status : "Pending",
    notes: d.notes ?? "",
    source: d.source === "admin" ? "admin" : "website",
    // `createdAt` is set for imported bookings; otherwise Appwrite's own timestamp
    createdAt: d.createdAt || d.$createdAt || "",
});

/**
 * A trip's price covers its whole group (e.g. a Family trip is priced for 4 people),
 * so one traveller pays price ÷ group size.
 */
export const pricePerPerson = (trip: Pick<TripView, "price" | "group">) =>
    Math.round(priceToNumber(trip.price) / (GROUP_SIZE[trip.group] ?? 1));

/** Bookings that still count (not cancelled). */
export const active = (b: Booking) => b.status !== "Cancelled";

/**
 * Adds live booking numbers to trips:
 * `bookings` = people booked on non-cancelled bookings, `revenue` = confirmed amount.
 * Bookings are matched by trip id, or by name for trips booked from the public site.
 */
export const withBookingStats = <T extends TripView>(trips: T[], bookings: Booking[]): T[] => {
    const byKey = new Map<string, { people: number; revenue: number }>();
    const add = (key: string, b: Booking) => {
        const cur = byKey.get(key) ?? { people: 0, revenue: 0 };
        if (active(b)) cur.people += b.travellers;
        if (b.status === "Confirmed") cur.revenue += b.amount;
        byKey.set(key, cur);
    };
    for (const b of bookings) {
        add(`id:${b.tripId}`, b);
        add(`name:${b.tripName.toLowerCase()}`, b);
    }
    return trips.map((t) => {
        const s = byKey.get(`id:${t.id}`) ?? byKey.get(`name:${t.name.toLowerCase()}`);
        return { ...t, bookings: s?.people ?? 0, revenue: s?.revenue ?? 0 };
    });
};

export type BookedTrip = { key: string; name: string; state: string; imageUrl: string; href: string; people: number; bookings: number; revenue: number };

/**
 * Bookings grouped by trip, most people first. `catalog` (database + sample trips) supplies
 * the image and link; a trip that no longer exists still shows with a placeholder image.
 */
export const bookedTrips = (bookings: Booking[], catalog: { trip: TripView; href: string }[]): BookedTrip[] => {
    const groups = new Map<string, BookedTrip>();
    for (const b of bookings.filter(active)) {
        const key = b.tripName.toLowerCase();
        const match = catalog.find((c) => c.trip.id === b.tripId) ?? catalog.find((c) => c.trip.name.toLowerCase() === key);
        const g = groups.get(key) ?? {
            key,
            name: b.tripName,
            state: b.tripState,
            imageUrl: match?.trip.imageUrl ?? "/assets/images/hero-img1.jpg",
            href: match?.href ?? "/bookings",
            people: 0,
            bookings: 0,
            revenue: 0,
        };
        g.people += b.travellers;
        g.bookings += 1;
        if (b.status === "Confirmed") g.revenue += b.amount;
        groups.set(key, g);
    }
    return [...groups.values()].sort((a, b) => b.people - a.people || b.revenue - a.revenue);
};
