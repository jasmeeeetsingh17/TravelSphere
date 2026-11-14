import { aiEnabled, readSuggestForm, suggestTrips } from "~/lib/ai.server";
import { clientKey, tooMany } from "~/lib/rate-limit.server";
import type { Route } from "./+types/suggest";

/** GET tells the AI Suggest page whether a Gemini key is set (for the "Powered by Gemini" badge). */
export const loader = () => Response.json({ ai: aiEnabled() });

/**
 * Public AI Suggest: recommends trips from the sample catalogue. No sign-in; nothing is saved.
 * Limited to 15 requests per hour per visitor so the Gemini quota can't be drained.
 */
export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    if (tooMany(`suggest:${clientKey(request)}`, 15, 60 * 60_000)) {
        return Response.json({ error: "You have asked for a lot of suggestions in the last hour. Please try again a little later." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return Response.json({ error: "Invalid request." }, { status: 400 });
    if ((body as Record<string, unknown>).company) return Response.json({ error: "Invalid request." }, { status: 400 }); // bot trap

    return Response.json(await suggestTrips(readSuggestForm(body as Record<string, unknown>)));
}
