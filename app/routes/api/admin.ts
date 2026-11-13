import { asServer, HttpError, ids, listDocs, q, requireAdmin } from "~/lib/appwrite.server";
import { buildBooking, isMissingCollection, listAllBookings, NOT_SET_UP, saveBooking, setupCollections } from "~/lib/bookings.server";
import { BOOKING_STATUSES } from "~/lib/booking";
import type { Route } from "./+types/admin";

export const loader = () => Response.json({ error: "Method not allowed" }, { status: 405 });

const docPath = (collectionId: string, id: string) => `/databases/${ids.db}/collections/${collectionId}/documents/${id}`;

/** Deletes every document in a collection whose `attribute` equals `value`. */
async function deleteWhere(collectionId: string, attribute: string, value: string) {
    for (let round = 0; round < 5; round++) {
        const docs = await listDocs(collectionId, [q.equal(attribute, value), q.limit(100)]);
        if (!docs.length) return;
        await Promise.all(docs.map((d) => asServer(docPath(collectionId, d.$id), { method: "DELETE" })));
    }
}

const text = (v: unknown, max = 2000) => String(v ?? "").trim().slice(0, max);
const lines = (v: unknown) => (Array.isArray(v) ? v.map((x) => text(x, 300)).filter(Boolean).slice(0, 12) : []);

/** Checks and trims a trip sent by the edit form. Throws a 400 when something required is missing. */
function cleanTrip(raw: any) {
    if (!raw || typeof raw !== "object") throw new HttpError(400, "Invalid trip.");
    const itinerary = (Array.isArray(raw.itinerary) ? raw.itinerary : []).slice(0, 30).map((d: any, i: number) => ({
        day: i + 1,
        location: text(d?.location, 120),
        activities: (Array.isArray(d?.activities) ? d.activities : [])
            .slice(0, 12)
            .map((a: any) => ({ time: text(a?.time, 20), description: text(a?.description, 300) }))
            .filter((a: { description: string }) => a.description),
    }));

    const trip = {
        ...raw,
        name: text(raw.name, 150),
        description: text(raw.description, 2000),
        estimatedPrice: text(raw.estimatedPrice, 30),
        budget: text(raw.budget, 40),
        travelStyle: text(raw.travelStyle, 40),
        groupType: text(raw.groupType, 40),
        interests: text(raw.interests, 400),
        country: "India",
        state: text(raw.state, 80),
        imageUrls: (Array.isArray(raw.imageUrls) ? raw.imageUrls : [])
            .map((u: unknown) => text(u, 300))
            .filter((u: string) => u.startsWith("/assets/") || u.startsWith("https://"))
            .slice(0, 6),
        itinerary,
        duration: itinerary.length,
        bestTimeToVisit: lines(raw.bestTimeToVisit),
        weatherInfo: lines(raw.weatherInfo),
        location: { ...(raw.location ?? {}), city: text(raw.location?.city, 120) },
    };

    if (!trip.name) throw new HttpError(400, "The trip needs a name.");
    if (!trip.state) throw new HttpError(400, "Pick a state.");
    if (!itinerary.length) throw new HttpError(400, "Add at least one day to the itinerary.");
    if (itinerary.some((d: { location: string }) => !d.location)) throw new HttpError(400, "Every day needs a place.");
    return trip;
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    try {
        const adminId = await requireAdmin(request);
        const body = await request.json().catch(() => ({}));

        switch (body.op) {
            case "listBookings": {
                try {
                    return Response.json({ bookings: await listAllBookings(), ready: true });
                } catch (error) {
                    if (isMissingCollection(error)) return Response.json({ bookings: [], ready: false });
                    throw error;
                }
            }

            case "setupBookings": {
                await setupCollections();
                return Response.json({ ok: true });
            }

            case "createBooking": {
                const status = BOOKING_STATUSES.includes(body.status) ? body.status : "Confirmed";
                const booking = await saveBooking(await buildBooking(body, "admin", status));
                return Response.json({ booking });
            }

            case "setBookingStatus": {
                const id = String(body.id ?? "");
                if (!id || !BOOKING_STATUSES.includes(body.status)) throw new HttpError(400, "Invalid booking or status.");
                await asServer(docPath(ids.bookings, id), { method: "PATCH", body: JSON.stringify({ data: { status: body.status } }) });
                return Response.json({ ok: true });
            }

            case "deleteBooking": {
                const id = String(body.id ?? "");
                if (!id) throw new HttpError(400, "Missing booking.");
                await asServer(docPath(ids.bookings, id), { method: "DELETE" });
                return Response.json({ ok: true });
            }

            case "deleteTrip": {
                const id = String(body.id ?? "");
                if (!id) throw new HttpError(400, "Missing trip.");
                await asServer(docPath(ids.trips, id), { method: "DELETE" });
                return Response.json({ ok: true });
            }

            case "updateTrip": {
                const id = String(body.id ?? "");
                const trip = cleanTrip(body.trip);
                if (!id) throw new HttpError(400, "Missing trip.");
                const data: Record<string, unknown> = { tripDetail: JSON.stringify(trip), imageUrls: trip.imageUrls };
                try {
                    await asServer(docPath(ids.trips, id), { method: "PATCH", body: JSON.stringify({ data }) });
                } catch (error) {
                    // Collections without an imageUrls attribute keep the images inside tripDetail only
                    if (!(error instanceof HttpError && /imageUrls/.test(error.message))) throw error;
                    await asServer(docPath(ids.trips, id), { method: "PATCH", body: JSON.stringify({ data: { tripDetail: data.tripDetail } }) });
                }
                return Response.json({ ok: true });
            }

            case "setRole": {
                const accountId = String(body.accountId ?? "");
                const status = body.status;
                if (!accountId || (status !== "admin" && status !== "user")) throw new HttpError(400, "Invalid user or role.");
                if (accountId === adminId) throw new HttpError(400, "You cannot change your own role.");
                const [doc] = await listDocs(ids.users, [q.equal("accountId", accountId), q.limit(1)]);
                if (!doc) throw new HttpError(404, "User not found.");
                await asServer(docPath(ids.users, doc.$id), { method: "PATCH", body: JSON.stringify({ data: { status } }) });
                return Response.json({ ok: true });
            }

            case "deleteUser": {
                const accountId = String(body.accountId ?? "");
                if (!accountId) throw new HttpError(400, "Missing user.");
                if (accountId === adminId) throw new HttpError(400, "You cannot delete your own account.");

                // Remove what the user created, then their profile, then the login itself
                await deleteWhere(ids.trips, "userId", accountId);
                await deleteWhere(ids.users, "accountId", accountId);
                try {
                    await asServer(`/users/${accountId}`, { method: "DELETE" });
                } catch (error) {
                    // Already gone is fine. Anything else (e.g. missing users.write scope) should be reported.
                    if (!(error instanceof HttpError && error.status === 404)) throw error;
                }
                return Response.json({ ok: true });
            }

            default:
                throw new HttpError(400, "Unknown action.");
        }
    } catch (error) {
        if (isMissingCollection(error)) return Response.json({ error: NOT_SET_UP }, { status: 503 });
        if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
        console.error("Admin action failed:", error);
        return Response.json({ error: "Something went wrong on the server." }, { status: 500 });
    }
}
