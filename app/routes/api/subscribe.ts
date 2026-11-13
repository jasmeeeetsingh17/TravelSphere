import { asServer, HttpError, ids, listDocs, q } from "~/lib/appwrite.server";
import { isMissingCollection } from "~/lib/bookings.server";
import { clientKey, tooMany } from "~/lib/rate-limit.server";
import type { Route } from "./+types/subscribe";

export const loader = () => Response.json({ error: "Method not allowed" }, { status: 405 });

/** Newsletter signup from the landing page. Duplicate emails are accepted quietly. */
export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    try {
        if (tooMany(`sub:${clientKey(request)}`)) throw new HttpError(429, "Too many requests. Please try again later.");
        const body = await request.json().catch(() => ({}));
        if (body.company) return Response.json({ ok: true });

        const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Please enter a valid email address.");

        const existing = await listDocs(ids.subscribers, [q.equal("email", email), q.limit(1)]);
        if (!existing.length) {
            await asServer(`/databases/${ids.db}/collections/${ids.subscribers}/documents`, {
                method: "POST",
                body: JSON.stringify({ documentId: "unique()", data: { email } }),
            });
        }
        return Response.json({ ok: true });
    } catch (error) {
        if (isMissingCollection(error)) return Response.json({ error: "Newsletter signup is not available right now." }, { status: 503 });
        if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
        console.error("Subscribe failed:", error);
        return Response.json({ error: "Could not subscribe. Please try again." }, { status: 500 });
    }
}
