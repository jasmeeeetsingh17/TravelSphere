import { allTrips } from "./index";

export type TripItem = (typeof allTrips)[number];

export const getTripById = (id?: string) => allTrips.find((t) => String(t.id) === id);

/**
 * Sample details built from the fields every trip already has.
 * Replace with real data (e.g. from Appwrite) when trips are stored in the database.
 */
export const getTripDetails = (trip: TripItem) => {
    const place = trip.itinerary?.[0]?.location ?? "";
    const city = place.split(",")[0];
    const [first = "local", second = "culture"] = trip.tags.map((t) => t.toLowerCase());

    return {
        place,
        city,
        duration: "3 days / 2 nights",
        bestTime: "October to March",
        description: `A ${trip.travelStyle.toLowerCase()}-friendly escape to ${place}, built around ${first} and ${second} experiences. Enjoy a relaxed pace, local food and the best sights without the planning stress.`,
        days: [
            {
                title: `Day 1 - Arrive in ${city}`,
                activities: ["Airport or station pickup and hotel check-in", `Evening walk around ${city}`, "Welcome dinner with local dishes"],
            },
            {
                title: `Day 2 - ${trip.tags[0]} highlights`,
                activities: [`Guided ${first} tour of ${city}`, "Lunch at a popular local restaurant", `Free time for ${second} spots and shopping`],
            },
            {
                title: "Day 3 - Relax and depart",
                activities: ["Breakfast and a last visit to your favourite spot", "Souvenir shopping", "Check-out and drop to airport or station"],
            },
        ],
    };
};