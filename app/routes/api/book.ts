import { HttpError } from "~/lib/appwrite.server";
import { buildBooking, saveBooking } from "~/lib/bookings.server";
import { clientKey, tooMany } from "~/lib/rate-limit.server";
import type { Route } from "./+types/book";

export const loader = () => Response.json({ error: "Method not allowed" }, { status: 405 });

/** Public booking request from a trip page. No sign-in needed; saved as "Pending" for an admin to confirm. */
export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    try {
        if (tooMany(`book:${clientKey(request)}`)) throw new HttpError(429, "Too many booking requests. Please try again in a few minutes.");

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") throw new HttpError(400, "Invalid request.");
        // Hidden field that people never fill in; bots usually do
        if (body.company) return Response.json({ ok: true });

        const data = await buildBooking(body, "website");
        const booking = await saveBooking(data);
        return Response.json({ ok: true, reference: booking.id.slice(-6).toUpperCase(), amount: booking.amount });
    } catch (error) {
        // Visitors should not see admin set-up instructions
        if (error instanceof HttpError && error.status === 503) {
            return Response.json({ error: "Online booking is not available right now. Please call or email us and we'll book it for you." }, { status: 503 });
        }
        if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
        console.error("Booking failed:", error);
        return Response.json({ error: "Could not save your booking. Please try again." }, { status: 500 });
    }
}
