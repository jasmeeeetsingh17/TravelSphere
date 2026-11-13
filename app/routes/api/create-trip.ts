import { HttpError, requireAdmin } from "~/lib/appwrite.server";
import { generateTrip, readTripForm } from "~/lib/trip-ai.server";
import type { Route } from "./+types/create-trip";

export const loader = () => Response.json({ error: "Method not allowed" }, { status: 405 });

/** Admin "Create trip": generates an itinerary that the browser then saves to the database. */
export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    // Only admins may create trips
    try {
        await requireAdmin(request);
    } catch (error) {
        const status = error instanceof HttpError ? error.status : 500;
        return Response.json({ error: error instanceof Error ? error.message : "Not allowed." }, { status });
    }

    const body = await request.json().catch(() => null);
    const form = body && typeof body === "object" ? readTripForm(body) : null;
    if (!form) return Response.json({ error: "Please fill in every field." }, { status: 400 });

    return Response.json(await generateTrip(form));
}
