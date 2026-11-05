import { clampDuration, generateTripTemplate, normalizeTrip } from "~/lib/trip-generator";
import type { Route } from "./+types/create-trip";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const clean = (v: unknown, max = 120) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

/** Only signed-in users may spend the AI quota: ask Appwrite whether the JWT is valid. */
async function isSignedIn(jwt: string | null) {
    const endpoint = import.meta.env.VITE_APPWRITE_API_ENDPOINT;
    const project = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    if (!jwt || !endpoint || !project) return false;
    try {
        const res = await fetch(`${endpoint}/account`, {
            headers: { "X-Appwrite-Project": project, "X-Appwrite-JWT": jwt },
        });
        return res.ok;
    } catch {
        return false;
    }
}

const buildPrompt = (f: TripFormData) => `Generate a ${f.duration}-day travel itinerary for ${f.country}.
Travel style: ${f.travelStyle}. Interests: ${f.interest}. Budget: ${f.budget}. Group type: ${f.groupType}.
Return ONLY valid JSON (no markdown) in exactly this shape:
{
  "name": "A descriptive trip name",
  "description": "A short 2-3 sentence description",
  "estimatedPrice": "$1,200",
  "bestTimeToVisit": ["Season or months and why"],
  "weatherInfo": ["Season: temperature range"],
  "location": { "city": "Main city", "coordinates": [latitude, longitude], "openStreetMap": "https://www.openstreetmap.org/..." },
  "itinerary": [
    { "day": 1, "location": "City or area", "activities": [ { "time": "09:00 AM", "description": "What to do" } ] }
  ]
}
The itinerary must have exactly ${f.duration} days with 3 activities per day.`;

export const loader = () => Response.json({ error: "Method not allowed" }, { status: 405 });

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    if (!(await isSignedIn(request.headers.get("x-appwrite-jwt")))) {
        return Response.json({ error: "Please sign in to create a trip." }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const form: TripFormData = {
        country: clean(body.country),
        travelStyle: clean(body.travelStyle),
        interest: clean(body.interest, 300),
        budget: clean(body.budget),
        groupType: clean(body.groupType),
        duration: clampDuration(body.duration),
    };
    if (!form.country || !form.travelStyle || !form.interest || !form.budget || !form.groupType) {
        return Response.json({ error: "Please fill in every field." }, { status: 400 });
    }

    const template = generateTripTemplate(form);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ trip: template, source: "template" });

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
                contents: [{ parts: [{ text: buildPrompt(form) }] }],
                generationConfig: { responseMimeType: "application/json" },
            }),
        });
        if (!res.ok) throw new Error(`Gemini responded with ${res.status}`);

        const data = await res.json();
        const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        return Response.json({ trip: normalizeTrip(parsed, template), source: "gemini" });
    } catch (error) {
        console.error("AI trip generation failed, using template:", error);
        return Response.json({ trip: template, source: "template" });
    }
}
