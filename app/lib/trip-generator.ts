import { formatPrice, money } from "~/lib/utils";

/**
 * Builds a trip from the create-trip form without any AI service.
 * Used as a fallback by the API route when no GEMINI_API_KEY is set (or the AI call fails).
 */

const TRIP_IMAGES = Array.from({ length: 15 }, (_, i) => `/assets/images/${i + 1}.jpg`);

const hash = (text: string) => [...text].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7);

export const pickImages = (seed: string, count = 3) =>
    Array.from({ length: count }, (_, i) => TRIP_IMAGES[(hash(seed) + i * 4) % TRIP_IMAGES.length]);

const ACTIVITIES: Record<string, string[]> = {
    "Food & Culinary": ["Street-food walk and local market tasting", "Cooking class with a local host", "Dinner at a well-known regional restaurant"],
    "Historical Sites": ["Guided tour of the main historical landmarks", "Visit an old fort, palace or ruins", "Evening heritage walk"],
    "Hiking & Nature Walks": ["Morning nature walk on a scenic trail", "Picnic lunch at a viewpoint", "Sunset hike with a local guide"],
    "Beaches & Water Activities": ["Beach time and swimming", "Water sports session", "Sunset boat ride"],
    "Museums & Art": ["Visit the top museum or art gallery", "Local craft and art workshop", "Gallery district walk"],
    "Nightlife & Bars": ["Rooftop drinks with city views", "Live music night at a popular venue", "Late-night food stop"],
    "Photography Spots": ["Sunrise photo walk at the best viewpoint", "Old town streets and markets photo session", "Golden-hour shoot at a landmark"],
    "Temples & Spiritual Sites": ["Morning darshan at the main temple", "Evening aarti by the river or temple", "Visit a quiet ashram or monastery"],
    "Wildlife Safaris": ["Early-morning jeep safari in the national park", "Birdwatching walk with a naturalist", "Evening talk at the forest lodge"],
    "Festivals & Culture": ["Folk music and dance performance", "Visit a local craft village", "Traditional thali dinner"],
    "Shopping": ["Browse the main local market", "Pick up handmade souvenirs", "Visit a popular shopping street"],
    "Local Experiences": ["Meet a local family for a home-cooked meal", "Join a village or neighbourhood tour", "Attend a local festival or performance"],
};
const FALLBACK = ["Guided sightseeing tour", "Lunch at a local favourite", "Free time to explore on your own"];
const TIMES = ["09:00 AM", "01:00 PM", "07:00 PM"];

/** Rough cost per person per day in rupees (stay, food, local travel, activities). */
const DAILY_COST: Record<string, number> = { Budget: 2500, "Mid-range": 5000, Luxury: 12000, Premium: 20000 };
const GROUP_SIZE: Record<string, number> = { Solo: 1, Couple: 2, Family: 4, Friends: 3, Business: 2 };

export const clampDuration = (n: unknown) => Math.min(14, Math.max(1, Math.round(Number(n)) || 3));

export function generateTripTemplate(form: TripFormData): Trip {
    const days = clampDuration(form.duration);
    const country = form.country || "your destination";
    const interests = form.interest.split(",").map((s) => s.trim()).filter(Boolean);
    const pool = interests.flatMap((i) => ACTIVITIES[i] ?? []);
    const activities = pool.length ? pool : FALLBACK;
    const total = (DAILY_COST[form.budget] ?? 5000) * days * (GROUP_SIZE[form.groupType] ?? 1);

    return {
        id: "",
        name: `${days}-Day ${form.travelStyle} Trip to ${country}`,
        description: `A ${form.travelStyle.toLowerCase()} ${days}-day trip to ${country} for a ${form.groupType.toLowerCase()} group, with a ${form.budget.toLowerCase()} budget. It focuses on ${interests.join(", ").toLowerCase() || "the best local sights"}.`,
        estimatedPrice: money(total),
        duration: days,
        budget: form.budget,
        travelStyle: form.travelStyle,
        interests: form.interest,
        groupType: form.groupType,
        country,
        imageUrls: pickImages(country + form.travelStyle),
        itinerary: Array.from({ length: days }, (_, d) => ({
            day: d + 1,
            location: country,
            activities: TIMES.map((time, t) => ({
                time,
                description: d === 0 && t === 0 ? `Arrive in ${country} and check in` : activities[(d * 3 + t) % activities.length],
            })),
        })),
        bestTimeToVisit: ["October to March for pleasant weather"],
        weatherInfo: ["Check the forecast a week before you travel and pack light layers"],
        location: {
            city: country,
            coordinates: [0, 0],
            openStreetMap: `https://www.openstreetmap.org/search?query=${encodeURIComponent(country)}`,
        } as unknown as Location, // the global Location type in index.d.ts also merges with the DOM Location

        payment_link: "",
    };
}

/** Fills anything missing or malformed in an AI response with values from the template trip. */
export function normalizeTrip(raw: Partial<Trip> | null, fallback: Trip): Trip {
    if (!raw || typeof raw !== "object") return fallback;
    const str = (v: unknown, d: string) => (typeof v === "string" && v.trim() ? v : d);
    const list = (v: unknown, d: string[]) => (Array.isArray(v) && v.length ? v.map(String) : d);
    const itinerary = Array.isArray(raw.itinerary) && raw.itinerary.length
        ? raw.itinerary.map((d, i) => ({
            day: Number(d?.day) || i + 1,
            location: str(d?.location, fallback.country),
            activities: Array.isArray(d?.activities) && d.activities.length
                ? d.activities.map((a) => ({ time: str(a?.time, ""), description: str(a?.description, "") }))
                : fallback.itinerary[0].activities,
        }))
        : fallback.itinerary;

    return {
        ...fallback,
        name: str(raw.name, fallback.name),
        description: str(raw.description, fallback.description),
        estimatedPrice: formatPrice(str(String(raw.estimatedPrice ?? ""), "")) || fallback.estimatedPrice,
        itinerary,
        bestTimeToVisit: list(raw.bestTimeToVisit, fallback.bestTimeToVisit),
        weatherInfo: list(raw.weatherInfo, fallback.weatherInfo),
        location: raw.location && typeof raw.location === "object"
            ? { ...fallback.location, ...raw.location }
            : fallback.location,
    };
}
