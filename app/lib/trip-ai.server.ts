/**
 * Server-only: turns trip preferences into a day-by-day itinerary with Google Gemini.
 * Used by the admin "Create trip" route and the public AI Trip Planner.
 * Set GEMINI_API_KEY (and optionally GEMINI_MODEL) in .env.local. Without a key, or if
 * Gemini fails, a simple template itinerary is returned instead so the page still works.
 */
import { clampDuration, generateTripTemplate, normalizeTrip } from "~/lib/trip-generator";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const clean = (v: unknown, max = 120) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

/** Reads the form fields from a request body. Returns null when something is missing. */
export function readTripForm(body: Record<string, unknown>): TripFormData | null {
    // The destination is an Indian state or union territory. It is sent as "state".
    const form: TripFormData = {
        country: clean(body.state ?? body.country),
        travelStyle: clean(body.travelStyle),
        interest: clean(body.interest, 300),
        budget: clean(body.budget),
        groupType: clean(body.groupType),
        duration: clampDuration(body.duration),
    };
    return form.country && form.travelStyle && form.interest && form.budget && form.groupType ? form : null;
}

const buildPrompt = (f: TripFormData) => `Generate a ${f.duration}-day travel itinerary for ${f.country}, India (an Indian state or union territory).
Travel style: ${f.travelStyle}. Interests: ${f.interest}. Budget: ${f.budget}. Group type: ${f.groupType}.
Return ONLY valid JSON (no markdown) in exactly this shape:
{
  "name": "A descriptive trip name",
  "description": "A short 2-3 sentence description",
  "estimatedPrice": "₹45,000",
  "bestTimeToVisit": ["Season or months and why"],
  "weatherInfo": ["Season: temperature range"],
  "location": { "city": "Main city or region", "coordinates": [latitude, longitude], "openStreetMap": "https://www.openstreetmap.org/..." },
  "itinerary": [
    { "day": 1, "location": "City or area", "activities": [ { "time": "09:00 AM", "description": "What to do" } ] }
  ]
}
The itinerary must have exactly ${f.duration} days with 3 activities per day.
estimatedPrice is the total for the whole group in Indian Rupees, written like "₹45,000" with Indian digit grouping (e.g. "₹1,20,000"). Use real places in this state, Indian food and local experiences, and temperatures in °C.`;

export type GeneratedTrip = { trip: Trip & { state: string }; source: "gemini" | "template" };

/** True when a Gemini key is configured. */
export const aiEnabled = () => Boolean(process.env.GEMINI_API_KEY);

/** Builds the itinerary with Gemini, falling back to the template when there is no key or the call fails. */
export async function generateTrip(form: TripFormData): Promise<GeneratedTrip> {
    // Every trip is in India: keep the state in the location and set the country to India.
    const finalize = (trip: Trip): Trip & { state: string } => {
        const city = String(trip.location?.city ?? "").trim();
        const place = !city ? form.country : city.toLowerCase().includes(form.country.toLowerCase()) ? city : `${city}, ${form.country}`;
        return { ...trip, country: "India", state: form.country, location: { ...trip.location, city: place } as unknown as Location };
    };

    const template = finalize(generateTripTemplate(form));
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { trip: template, source: "template" };

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
                contents: [{ parts: [{ text: buildPrompt(form) }] }],
                generationConfig: { responseMimeType: "application/json" },
            }),
            signal: AbortSignal.timeout(45_000),
        });
        if (!res.ok) throw new Error(`Gemini responded with ${res.status}`);

        const data = await res.json();
        const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        return { trip: finalize(normalizeTrip(parsed, template)), source: "gemini" };
    } catch (error) {
        console.error("AI trip generation failed, using template:", error);
        return { trip: template, source: "template" };
    }
}
