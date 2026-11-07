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
    price: trip.estimatedPrice,
    group: trip.groupType,
    style: trip.travelStyle,
    country: trip.country,
    state: (trip as Trip & { state?: string }).state,
    description: trip.description,
    duration: `${trip.duration} ${trip.duration === 1 ? "day" : "days"}`,
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
