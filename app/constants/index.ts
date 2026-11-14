/**
 * All fixed values the app uses in one place: form options, Indian states, prices and the
 * choices offered by the AI Trip Planner and AI Suggest.
 * (The sample trips for the public site live in dummyTrips.ts because they are data, not settings.)
 */

/* ---------------- Trip options ---------------- */

export const travelStyles = ["Relaxed", "Luxury", "Adventure", "Cultural", "Spiritual", "Nature & Outdoors", "City Exploration"];

export const interests = [
    "Food & Culinary",
    "Historical Sites",
    "Temples & Spiritual Sites",
    "Hiking & Nature Walks",
    "Beaches & Water Activities",
    "Wildlife Safaris",
    "Museums & Art",
    "Festivals & Culture",
    "Nightlife & Bars",
    "Photography Spots",
    "Shopping",
    "Local Experiences",
];

export const budgetOptions = ["Budget", "Mid-range", "Luxury", "Premium"];

export const groupTypes = ["Solo", "Couple", "Family", "Friends", "Business"];

/** Group types visitors can pick on the public site (Business is admin-only). */
export const travellerGroups = ["Solo", "Couple", "Family", "Friends"];

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Trip length filters used on the public site and by AI Suggest. */
export const TRIP_LENGTHS = { short: "Up to 3 days", mid: "4 to 5 days", long: "6+ days" } as const;
export type TripLength = keyof typeof TRIP_LENGTHS | "";
export const fitsLength = (days: number, len: TripLength) =>
    !len || (len === "short" ? days <= 3 : len === "mid" ? days >= 4 && days <= 5 : days >= 6);

/* ---------------- Prices ---------------- */

/** Rough cost per person per day in rupees (stay, food, local travel, activities). */
export const DAILY_COST: Record<string, number> = { Budget: 2500, "Mid-range": 5000, Luxury: 12000, Premium: 20000 };

/** People counted for the price of each group type. */
export const GROUP_SIZE: Record<string, number> = { Solo: 1, Couple: 2, Family: 4, Friends: 3, Business: 2 };

export const BUDGET_NOTES: Record<string, string> = {
    Budget: "Hostels, trains, street food",
    "Mid-range": "3-star stays, cabs",
    Luxury: "5-star hotels, private tours",
    Premium: "Palace stays, the very best",
};

/* ---------------- Indian states ---------------- */

/** All 28 states and 8 union territories of India. */
export const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

/** A matching picture for states we have artwork for. Others get pictures from TRIP_IMAGES. */
export const STATE_IMAGES: Record<string, string> = {
    Rajasthan: "/assets/images/2.jpg",
    Kerala: "/assets/images/4.jpg",
    Goa: "/assets/images/5.jpg",
    "Jammu and Kashmir": "/assets/images/10.jpg",
    Punjab: "/assets/images/7.jpg",
    "Uttar Pradesh": "/assets/images/card-img-2.png",
    Maharashtra: "/assets/images/3.jpg",
    "Himachal Pradesh": "/assets/images/8.jpg",
    Sikkim: "/assets/images/8.jpg",
    "Andaman and Nicobar Islands": "/assets/images/13.jpg",
    Meghalaya: "/assets/images/14.jpg",
    Ladakh: "/assets/images/hero-img1.jpg",
    Uttarakhand: "/assets/images/9.jpg",
    "West Bengal": "/assets/images/11.jpg",
    Karnataka: "/assets/images/12.jpg",
    "Madhya Pradesh": "/assets/images/15.jpg",
};

/** General travel pictures used for trips in states without their own picture. */
export const TRIP_IMAGES = Array.from({ length: 15 }, (_, i) => `/assets/images/${i + 1}.jpg`);

/* ---------------- AI Trip Planner (admin) ---------------- */

export const POPULAR_STATES = ["Rajasthan", "Kerala", "Goa", "Himachal Pradesh", "Ladakh", "Jammu and Kashmir"];

/** One-click starting points for the planner. */
export const PLANNER_IDEAS = [
    { label: "Goa weekend with friends", state: "Goa", days: 3, group: "Friends", style: "Relaxed", budget: "Mid-range", interests: ["Beaches & Water Activities", "Nightlife & Bars", "Food & Culinary"] },
    { label: "Kerala family holiday", state: "Kerala", days: 6, group: "Family", style: "Nature & Outdoors", budget: "Mid-range", interests: ["Beaches & Water Activities", "Local Experiences", "Food & Culinary"] },
    { label: "Royal Rajasthan for couples", state: "Rajasthan", days: 5, group: "Couple", style: "Luxury", budget: "Luxury", interests: ["Historical Sites", "Photography Spots", "Shopping"] },
    { label: "Ladakh road adventure", state: "Ladakh", days: 7, group: "Friends", style: "Adventure", budget: "Mid-range", interests: ["Hiking & Nature Walks", "Photography Spots"] },
    { label: "Varanasi spiritual trip", state: "Uttar Pradesh", days: 3, group: "Solo", style: "Spiritual", budget: "Budget", interests: ["Temples & Spiritual Sites", "Local Experiences"] },
];

export const PLANNER_STEPS = ["Picking the best places", "Planning each day", "Checking the weather", "Working out the price"];

/** Longest "anything else?" note sent to the AI. */
export const NOTES_MAX = 300;
