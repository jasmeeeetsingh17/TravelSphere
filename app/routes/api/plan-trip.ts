import { aiEnabled, generateTrip, readTripForm } from "~/lib/trip-ai.server";
import { clientKey, tooMany } from "~/lib/rate-limit.server";
import type { Route } from "./+types/plan-trip";

/** GET tells the planner page whether a Gemini key is set (for the "Powered by Gemini" badge). */
export const loader = () => Response.json({ ai: aiEnabled() });

/**
 * Public AI Trip Planner. No sign-in; nothing is saved.
 * Limited to 6 plans per hour per visitor so the Gemini quota can't be drained.
 */
export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    if (tooMany(`plan:${clientKey(request)}`, 6, 60 * 60_000)) {
        return Response.json({ error: "You have planned a lot of trips in the last hour. Please try again a little later." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (body?.company) return Response.json({ error: "Invalid request." }, { status: 400 }); // bot trap
    const form = body && typeof body === "object" ? readTripForm(body) : null;
    if (!form) return Response.json({ error: "Please fill in every field." }, { status: 400 });

    return Response.json(await generateTrip(form));
}
