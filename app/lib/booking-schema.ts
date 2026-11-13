/**
 * Appwrite fields for the bookings and subscribers collections.
 * Plain file with no imports so both the app and scripts/seed-sample-data.ts can use it.
 */
export type Attr =
    | { type: "string"; key: string; size: number; required: boolean }
    | { type: "integer"; key: string; required: boolean; min?: number; max?: number }
    | { type: "float"; key: string; required: boolean; min?: number };

export const MAX_TRAVELLERS = 20;

export const BOOKING_ATTRS: Attr[] = [
    { type: "string", key: "tripId", size: 64, required: true },
    { type: "string", key: "tripName", size: 200, required: true },
    { type: "string", key: "tripState", size: 80, required: false },
    { type: "string", key: "tripStyle", size: 40, required: false },
    { type: "string", key: "tripBudget", size: 40, required: false },
    { type: "integer", key: "tripDays", required: false, min: 0, max: 60 },
    { type: "string", key: "customerName", size: 120, required: true },
    { type: "string", key: "email", size: 200, required: false },
    { type: "string", key: "phone", size: 20, required: true },
    { type: "string", key: "travelDate", size: 10, required: true },
    { type: "integer", key: "travellers", required: true, min: 1, max: MAX_TRAVELLERS },
    { type: "float", key: "amount", required: true, min: 0 },
    { type: "string", key: "status", size: 20, required: true },
    { type: "string", key: "notes", size: 500, required: false },
    { type: "string", key: "source", size: 20, required: false },
    // Set for imported bookings so history keeps its real dates; otherwise Appwrite's $createdAt is used
    { type: "string", key: "createdAt", size: 30, required: false },
];

export const SUBSCRIBER_ATTRS: Attr[] = [{ type: "string", key: "email", size: 200, required: true }];
