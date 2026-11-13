/**
 * Server-only booking helpers. Bookings hold customers' names, emails and phone numbers,
 * so the collection has no browser permissions at all: everything goes through the server
 * with the API key (public route /api/book to create, admin route /api/admin to manage).
 */
import { getDummyTrip } from "~/constants/dummyTrips";
import { asServer, HttpError, ids, listDocs, q } from "~/lib/appwrite.server";
import { bookingFromDoc, pricePerPerson, type Booking, type BookingStatus, MAX_TRAVELLERS } from "~/lib/booking";
import { generatedToView, type TripView } from "~/lib/trip-view";

const base = `/databases/${ids.db}/collections`;

/** True when Appwrite says the bookings collection does not exist yet. */
export const isMissingCollection = (error: unknown) =>
    error instanceof HttpError && error.status === 404 && /collection/i.test(error.message);

export const NOT_SET_UP = "Bookings are not set up yet. Open Bookings in the admin panel and click \"Set up bookings\".";

/** All bookings, newest first (up to 2,000). */
export async function listAllBookings(): Promise<Booking[]> {
    const out: Booking[] = [];
    for (let offset = 0; offset < 2000; offset += 100) {
        const docs = await listDocs(ids.bookings, [q.orderDesc("$createdAt"), q.limit(100), q.offset(offset)]);
        out.push(...docs.map(bookingFromDoc));
        if (docs.length < 100) break;
    }
    return out;
}

/** Finds a bookable trip: a sample trip from the public site, or a trip saved in the database. */
export async function findTrip(tripId: string): Promise<TripView | null> {
    const sample = getDummyTrip(tripId);
    if (sample) return sample;
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(tripId)) return null;
    try {
        const doc = await asServer(`${base}/${ids.trips}/documents/${tripId}`);
        return generatedToView(JSON.parse(doc.tripDetail), { id: doc.$id, saved: true });
    } catch {
        return null;
    }
}

const text = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export type BookingInput = {
    tripId: unknown;
    customerName: unknown;
    email: unknown;
    phone: unknown;
    travelDate: unknown;
    travellers: unknown;
    notes?: unknown;
};

/**
 * Checks a booking request and works out the price on the server (never trust a price from the browser).
 * Throws HttpError 400 with a friendly message when something is wrong.
 */
export async function buildBooking(input: BookingInput, source: "website" | "admin", status: BookingStatus = "Pending") {
    const trip = await findTrip(text(input.tripId, 60));
    if (!trip) throw new HttpError(400, "This trip could not be found.");

    const customerName = text(input.customerName, 120);
    const email = text(input.email, 200).toLowerCase();
    const phone = text(input.phone, 20).replace(/[^\d+]/g, "");
    const travelDate = text(input.travelDate, 10);
    const travellers = Math.round(Number(input.travellers));

    if (customerName.length < 2) throw new HttpError(400, "Please enter your full name.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Please enter a valid email address.");
    if (!/^\+?\d{10,13}$/.test(phone)) throw new HttpError(400, "Please enter a valid phone number (10 digits).");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || Number.isNaN(Date.parse(travelDate))) throw new HttpError(400, "Please pick a travel date.");
    if (source === "website" && travelDate <= new Date().toISOString().slice(0, 10)) throw new HttpError(400, "Please pick a date in the future.");
    if (!(travellers >= 1 && travellers <= MAX_TRAVELLERS)) throw new HttpError(400, `Travellers must be between 1 and ${MAX_TRAVELLERS}.`);

    return {
        tripId: trip.id,
        tripName: trip.name.slice(0, 200),
        tripState: (trip.state ?? "").slice(0, 80),
        tripStyle: (trip.style ?? "").slice(0, 40),
        tripBudget: (trip.budget ?? "").slice(0, 40),
        tripDays: trip.dayCount,
        customerName,
        email,
        phone,
        travelDate,
        travellers,
        amount: pricePerPerson(trip) * travellers,
        status,
        notes: text(input.notes, 500),
        source,
    };
}

export async function saveBooking(data: Record<string, unknown>) {
    try {
        const doc = await asServer(`${base}/${ids.bookings}/documents`, {
            method: "POST",
            body: JSON.stringify({ documentId: "unique()", data }),
        });
        return bookingFromDoc(doc);
    } catch (error) {
        if (isMissingCollection(error)) throw new HttpError(503, NOT_SET_UP);
        throw error;
    }
}

/* ---------------- One-click setup of the collections ---------------- */

type Attr =
    | { type: "string"; key: string; size: number; required: boolean }
    | { type: "integer"; key: string; required: boolean; min?: number; max?: number }
    | { type: "float"; key: string; required: boolean; min?: number };

const BOOKING_ATTRS: Attr[] = [
    { type: "string", key: "tripId", size: 64, required: true },
    { type: "string", key: "tripName", size: 200, required: true },
    { type: "string", key: "tripState", size: 80, required: false },
    { type: "string", key: "tripStyle", size: 40, required: false },
    { type: "string", key: "tripBudget", size: 40, required: false },
    { type: "integer", key: "tripDays", required: false, min: 0, max: 60 },
    { type: "string", key: "customerName", size: 120, required: true },
    { type: "string", key: "email", size: 200, required: false },
    { type: "string", key: "phone", size: 20, required: true },
    { type: "string", key: "travelDate", size: 10, required: true },
    { type: "integer", key: "travellers", required: true, min: 1, max: MAX_TRAVELLERS },
    { type: "float", key: "amount", required: true, min: 0 },
    { type: "string", key: "status", size: 20, required: true },
    { type: "string", key: "notes", size: 500, required: false },
    { type: "string", key: "source", size: 20, required: false },
];

const SUBSCRIBER_ATTRS: Attr[] = [{ type: "string", key: "email", size: 200, required: true }];

/** Runs a create call and treats "already exists" (409) as success. */
async function ensure(path: string, body: object) {
    try {
        await asServer(path, { method: "POST", body: JSON.stringify(body) });
        return "created";
    } catch (error) {
        if (error instanceof HttpError && error.status === 409) return "exists";
        throw error;
    }
}

async function ensureCollection(id: string, name: string, attrs: Attr[]) {
    // No permissions: only the server (API key) can read or write these documents
    await ensure(base, { collectionId: id, name, permissions: [], documentSecurity: false, enabled: true });
    for (const { type, ...attr } of attrs) {
        await ensure(`${base}/${id}/attributes/${type}`, attr);
    }
}

/** Creates the bookings and subscribers collections (safe to run more than once). */
export async function setupCollections() {
    try {
        await ensureCollection(ids.bookings, "Bookings", BOOKING_ATTRS);
        await ensureCollection(ids.subscribers, "Newsletter subscribers", SUBSCRIBER_ATTRS);
    } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
            throw new HttpError(
                403,
                `Your Appwrite API key cannot create collections (${error.message}). Add the scopes collections.write and attributes.write to the key, or create the collections by hand (see README).`
            );
        }
        throw error;
    }
}
