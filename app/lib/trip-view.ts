import { formatPrice } from "~/lib/utils";

/** One shape for every trip in the UI, whether it is a sample trip or one saved in Appwrite. */
export type TripView = {
    id: string;
    name: string;
    location: string;
    imageUrl: string;
    tags: string[];
    price: string;
    group: string; // Solo, Couple, Family...
    style?: string; // Relaxed, Adventure... (generated trips only)
    country?: string;
    state?: string;
    description: string;
    duration: string;
    /** Number of days, for charts */
    dayCount: number;
    /** People who booked this trip (admin-entered). 0 when not set. */
    bookings: number;
    /** Confirmed booking revenue in rupees (admin pages only) */
    revenue?: number;
    budget?: string;
    interests?: string[];
    bestTime: string;
    days: { title: string; activities: string[] }[];
    weather: string[];
    createdAt?: string;
    userId?: string;
    saved: boolean;
};

export const generatedToView = (
    trip: Trip,
    extra: { id: string; createdAt?: string; userId?: string; saved: boolean }
): TripView => ({
    id: extra.id,
    name: trip.name,
    location: [trip.location?.city, trip.country].filter((v, i, a) => v && a.indexOf(v) === i).join(", "),
    imageUrl: trip.imageUrls?.[0] ?? "/assets/images/1.jpg",
    tags: [trip.travelStyle, trip.interests?.split(",")[0]?.trim() ?? ""].filter(Boolean),
    price: formatPrice(trip.estimatedPrice),
    group: trip.groupType,
    style: trip.travelStyle,
    country: trip.country,
    state: (trip as Trip & { state?: string }).state,
    description: trip.description,
    duration: `${trip.duration} ${trip.duration === 1 ? "day" : "days"}`,
    dayCount: Number(trip.duration) || trip.itinerary?.length || 0,
    bookings: Math.max(0, Math.round(Number(trip.bookings) || 0)),
    budget: trip.budget,
    interests: (trip.interests ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    bestTime: (trip.bestTimeToVisit ?? []).join(" · "),
    days: (trip.itinerary ?? []).map((d) => ({
        title: `Day ${d.day} - ${d.location}`,
        activities: d.activities.map((a) => (a.time ? `${a.time}: ${a.description}` : a.description)),
    })),
    weather: trip.weatherInfo ?? [],
    createdAt: extra.createdAt,
    userId: extra.userId,
    saved: extra.saved,
});
