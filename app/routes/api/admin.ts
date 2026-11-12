import { bookingFromDoc, BOOKING_STATUSES } from "~/lib/booking";
import { asServer, HttpError, ids, listDocs, q, requireAdmin } from "~/lib/appwrite.server";
import type { Route } from "./+types/admin";

export const loader = () => Response.json({ error: "Method not allowed" }, { status: 405 });

/** Deletes every document in a collection whose `attribute` equals `value`. */
async function deleteWhere(collectionId: string, attribute: string, value: string) {
    for (let round = 0; round < 5; round++) {
        const docs = await listDocs(collectionId, [q.equal(attribute, value), q.limit(100)]);
        if (!docs.length) return;
        await Promise.all(
            docs.map((d) => asServer(`/databases/${ids.db}/collections/${collectionId}/documents/${d.$id}`, { method: "DELETE" }))
        );
    }
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    try {
        const adminId = await requireAdmin(request);
        const body = await request.json().catch(() => ({}));

        switch (body.op) {
            case "listBookings": {
                if (!ids.bookings) throw new HttpError(503, "Bookings are not set up yet. Add VITE_APPWRITE_BOOKINGS_COLLECTION_ID to .env.local.");
                const docs = await listDocs(ids.bookings, [q.orderDesc("$createdAt"), q.limit(500)]);
                return Response.json({ bookings: docs.map(bookingFromDoc) });
            }

            case "setBookingStatus": {
                const { id, status } = body;
                if (typeof id !== "string" || !BOOKING_STATUSES.includes(status)) {
                    throw new HttpError(400, "Invalid booking or status.");
                }
                await asServer(`/databases/${ids.db}/collections/${ids.bookings}/documents/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ data: { status } }),
                });
                return Response.json({ ok: true });
            }

            case "deleteUser": {
                const accountId = String(body.accountId ?? "");
                if (!accountId) throw new HttpError(400, "Missing user.");
                if (accountId === adminId) throw new HttpError(400, "You cannot delete your own account.");

                // Remove what the user created, then their profile, then the login itself
                await deleteWhere(ids.trips, "userId", accountId);
                if (ids.bookings) await deleteWhere(ids.bookings, "userId", accountId);
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
        if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
        console.error("Admin action failed:", error);
        return Response.json({ error: "Something went wrong on the server." }, { status: 500 });
    }
}
