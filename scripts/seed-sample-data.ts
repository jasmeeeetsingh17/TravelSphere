/**
 * Fills Appwrite with sample data so the admin dashboard, bookings and analytics have something to show.
 *
 *   npm run seed            add 18 Indian trips + ~64 bookings + newsletter subscribers
 *   npm run seed -- --remove   delete the sample bookings/subscribers and the sample trips again
 *
 * Safe to run twice: trips with the same name and existing sample bookings are skipped.
 * Sample bookings use phone numbers starting with 90000 and @example.com emails, so they are easy to spot.
 * Reads APPWRITE_API_KEY and the VITE_APPWRITE_* ids from .env.local (never prints them).
 */
import { readFileSync } from "node:fs";
import { BOOKING_ATTRS, SUBSCRIBER_ATTRS } from "../app/lib/booking-schema.ts";
import { sampleTripDetails } from "../app/constants/dummyTrips.ts";

/* ---------------- env + REST helper ---------------- */
const env: Record<string, string> = {};
for (const file of [".env", ".env.local"]) {
    try {
        for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
            const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
            if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
    } catch {
        // file is optional
    }
}
const need = (k: string) => env[k] || process.env[k] || (console.error(`Missing ${k} in .env.local`), process.exit(1));
const ENDPOINT = need("VITE_APPWRITE_API_ENDPOINT") as string;
const PROJECT = need("VITE_APPWRITE_PROJECT_ID") as string;
const KEY = (env.APPWRITE_API_KEY || env.VITE_APPWRITE_API_KEY || need("APPWRITE_API_KEY")) as string;
const DB = need("VITE_APPWRITE_DATABASE_ID") as string;
const USERS = need("VITE_APPWRITE_USERS_COLLECTION_ID") as string;
const TRIPS = need("VITE_APPWRITE_TRIPS_COLLECTION_ID") as string;
const BOOKINGS = env.VITE_APPWRITE_BOOKINGS_COLLECTION_ID || "bookings";
const SUBSCRIBERS = env.VITE_APPWRITE_SUBSCRIBERS_COLLECTION_ID || "subscribers";

class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function api(path: string, init: { method?: string; body?: unknown } = {}) {
    const res = await fetch(`${ENDPOINT}${path}`, {
        method: init.method ?? "GET",
        headers: { "Content-Type": "application/json", "X-Appwrite-Project": PROJECT, "X-Appwrite-Key": KEY },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data?.message ?? res.statusText);
    return data;
}

const col = (id: string) => `/databases/${DB}/collections/${id}`;
const q = (list: object[]) => list.map((x) => `queries[]=${encodeURIComponent(JSON.stringify(x))}`).join("&");
async function listAll(collectionId: string) {
    const out: any[] = [];
    for (let offset = 0; ; offset += 100) {
        const page = await api(`${col(collectionId)}/documents?${q([{ method: "limit", values: [100] }, { method: "offset", values: [offset] }])}`);
        out.push(...page.documents);
        if (page.documents.length < 100) return out;
    }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------------- deterministic random ---------------- */
let seed = 20261113;
const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
const weighted = <T,>(list: [T, number][]) => {
    let r = rand() * list.reduce((s, [, w]) => s + w, 0);
    for (const [v, w] of list) if ((r -= w) <= 0) return v;
    return list[list.length - 1][0];
};

/* ---------------- sample people ---------------- */
const NAMES = [
    "Aarav Sharma", "Ananya Iyer", "Rohan Mehta", "Priya Nair", "Vikram Singh", "Sneha Reddy", "Arjun Kapoor", "Kavya Menon",
    "Rahul Verma", "Isha Gupta", "Siddharth Rao", "Meera Joshi", "Karan Malhotra", "Pooja Desai", "Aditya Kulkarni", "Neha Agarwal",
    "Harpreet Kaur", "Rajesh Pillai", "Divya Krishnan", "Amit Patel", "Shreya Banerjee", "Nikhil Chauhan", "Tanvi Shah", "Manish Yadav",
    "Ritika Bose", "Varun Saxena", "Anjali Mishra", "Kunal Jain", "Swati Pandey", "Gaurav Bhatia", "Lakshmi Subramanian", "Imran Khan",
];
const NOTES = [
    "", "", "", "", "", "Vegetarian meals please", "Need airport pickup", "Celebrating our anniversary", "Travelling with a senior citizen",
    "Prefer a ground-floor room", "Kids aged 6 and 9", "Can we add one extra day?", "Jain food if possible",
];
const GROUP_SIZE: Record<string, number> = { Solo: 1, Couple: 2, Family: 4, Friends: 3, Business: 2 };
const TRAVELLERS: Record<string, [number, number]> = { Solo: [1, 2], Couple: [2, 2], Family: [3, 6], Friends: [3, 6], Business: [1, 3] };
const POPULARITY: Record<string, number> = {
    "goa-beach-break": 9, "kerala-backwaters": 8, "royal-rajasthan": 7, "kashmir-paradise": 6, "himachal-hills": 6, "taj-heritage": 5,
    "varanasi-ghats": 5, "andaman-islands": 4, "mumbai-city-lights": 4, "rishikesh-yoga-rafting": 4, "ladakh-high-passes": 3,
    "golden-temple-amritsar": 3, "meghalaya-clouds": 3, "darjeeling-tea-trails": 3, "udaipur-lakes": 2, "mysore-coorg": 3,
    "sikkim-monasteries": 2, "hampi-ruins": 2,
};

const day = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const price = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;

/* ---------------- steps ---------------- */
async function findAdminId() {
    const users = await listAll(USERS);
    return users.find((u) => u.status === "admin")?.accountId ?? users[0]?.accountId ?? "sample-admin";
}

async function seedTrips(adminId: string) {
    const existing = await listAll(TRIPS);
    const byName = new Map<string, string>();
    for (const d of existing) {
        try {
            byName.set(String(JSON.parse(d.tripDetail).name).toLowerCase(), d.$id);
        } catch {
            // skip broken rows
        }
    }

    let added = 0;
    for (const [i, { trip }] of sampleTripDetails.entries()) {
        if (byName.has(trip.name.toLowerCase())) continue;
        const data: Record<string, unknown> = {
            tripDetail: JSON.stringify(trip),
            imageUrls: trip.imageUrls,
            userId: adminId,
            createdAt: new Date(Date.now() - Math.round((i / (sampleTripDetails.length - 1)) * 175) * day).toISOString(),
        };
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const doc = await api(`${col(TRIPS)}/documents`, { method: "POST", body: { documentId: "unique()", data } });
                byName.set(trip.name.toLowerCase(), doc.$id);
                added++;
                break;
            } catch (e) {
                const unknown = e instanceof ApiError ? /Unknown attribute:?\s*"?([A-Za-z0-9_]+)"?/.exec(e.message)?.[1] : undefined;
                if (unknown && unknown in data && unknown !== "tripDetail") {
                    delete data[unknown];
                    continue;
                }
                throw e;
            }
        }
    }
    console.log(`Trips: ${added} added, ${sampleTripDetails.length - added} already there.`);
    return byName;
}

async function ensure(path: string, body: object) {
    try {
        await api(path, { method: "POST", body });
    } catch (e) {
        if (!(e instanceof ApiError && e.status === 409)) throw e;
    }
}

async function ensureCollections() {
    await ensure(`/databases/${DB}/collections`, { collectionId: BOOKINGS, name: "Bookings", permissions: [], documentSecurity: false, enabled: true });
    for (const { type, ...attr } of BOOKING_ATTRS) await ensure(`${col(BOOKINGS)}/attributes/${type}`, attr);
    await ensure(`/databases/${DB}/collections`, { collectionId: SUBSCRIBERS, name: "Newsletter subscribers", permissions: [], documentSecurity: false, enabled: true });
    for (const { type, ...attr } of SUBSCRIBER_ATTRS) await ensure(`${col(SUBSCRIBERS)}/attributes/${type}`, attr);

    // Appwrite builds new attributes in the background; wait until they are ready
    for (let i = 0; i < 30; i++) {
        const [a, b] = await Promise.all([api(`${col(BOOKINGS)}/attributes`), api(`${col(SUBSCRIBERS)}/attributes`)]);
        const all = [...a.attributes, ...b.attributes];
        const failed = all.filter((x: any) => x.status === "failed");
        if (failed.length) throw new Error(`Appwrite could not create: ${failed.map((x: any) => x.key).join(", ")}`);
        if (all.every((x: any) => x.status === "available")) return;
        await sleep(1500);
    }
    throw new Error("Timed out waiting for Appwrite to finish creating the booking fields. Run the script again in a minute.");
}

async function seedBookings(tripIds: Map<string, string>) {
    const existing = await listAll(BOOKINGS);
    if (existing.some((d) => String(d.phone).startsWith("90000"))) {
        console.log("Bookings: sample bookings already there, skipped.");
        return;
    }

    const trips = sampleTripDetails.map(({ sampleId, trip }) => ({ sampleId, trip, id: tripIds.get(trip.name.toLowerCase()) ?? sampleId }));
    const customers: { name: string; phone: string; email: string }[] = [];
    const today = new Date();
    let count = 0;

    for (let i = 0; i < 64; i++) {
        // more bookings recently, so the charts show growth
        const daysAgo = Math.floor(175 * (1 - Math.sqrt(rand())));
        const created = new Date(today.getTime() - daysAgo * day - int(0, 20) * 3_600_000);

        const t = weighted(trips.map((x) => [x, POPULARITY[x.sampleId] ?? 2] as [typeof x, number]));
        const customer =
            customers.length > 5 && rand() < 0.15
                ? pick(customers) // repeat customer
                : (() => {
                      const name = NAMES[customers.length % NAMES.length];
                      const c = {
                          name,
                          phone: `90000${String(10000 + customers.length * 137).slice(-5)}`,
                          email: rand() < 0.85 ? `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com` : "",
                      };
                      customers.push(c);
                      return c;
                  })();

        const [min, max] = TRAVELLERS[t.trip.groupType] ?? [1, 4];
        const travellers = int(min, max);
        const travel = new Date(created.getTime() + int(12, 80) * day);
        const status =
            travel < today
                ? weighted([["Confirmed", 85], ["Cancelled", 15]])
                : daysAgo < 12
                  ? weighted([["Pending", 60], ["Confirmed", 30], ["Cancelled", 10]])
                  : weighted([["Confirmed", 70], ["Pending", 15], ["Cancelled", 15]]);

        await api(`${col(BOOKINGS)}/documents`, {
            method: "POST",
            body: {
                documentId: "unique()",
                data: {
                    tripId: t.id,
                    tripName: t.trip.name,
                    tripState: t.trip.state,
                    tripStyle: t.trip.travelStyle,
                    tripBudget: t.trip.budget,
                    tripDays: t.trip.duration,
                    customerName: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    travelDate: isoDay(travel),
                    travellers,
                    amount: Math.round(price(t.trip.estimatedPrice) / (GROUP_SIZE[t.trip.groupType] ?? 1)) * travellers,
                    status,
                    notes: pick(NOTES),
                    source: rand() < 0.8 ? "website" : "admin",
                    createdAt: created.toISOString(),
                },
            },
        });
        count++;
        if (count % 16 === 0) console.log(`  ...${count} bookings`);
    }
    console.log(`Bookings: ${count} added (${customers.length} different customers).`);
}

async function seedSubscribers() {
    const existing = new Set((await listAll(SUBSCRIBERS)).map((d) => d.email));
    let added = 0;
    for (const name of NAMES.slice(0, 18)) {
        const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
        if (existing.has(email)) continue;
        await api(`${col(SUBSCRIBERS)}/documents`, { method: "POST", body: { documentId: "unique()", data: { email } } });
        added++;
    }
    console.log(`Newsletter subscribers: ${added} added.`);
}

async function removeSamples() {
    const del = (c: string, id: string) => api(`${col(c)}/documents/${id}`, { method: "DELETE" });
    let b = 0, s = 0, t = 0;
    try {
        for (const d of await listAll(BOOKINGS)) if (String(d.phone).startsWith("90000")) (await del(BOOKINGS, d.$id), b++);
        for (const d of await listAll(SUBSCRIBERS)) if (String(d.email).endsWith("@example.com")) (await del(SUBSCRIBERS, d.$id), s++);
    } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) throw e;
    }
    const names = new Set(sampleTripDetails.map((x) => x.trip.name.toLowerCase()));
    for (const d of await listAll(TRIPS)) {
        try {
            if (names.has(String(JSON.parse(d.tripDetail).name).toLowerCase())) (await del(TRIPS, d.$id), t++);
        } catch {
            // skip
        }
    }
    console.log(`Removed ${t} sample trips, ${b} sample bookings and ${s} sample subscribers.`);
}

/* ---------------- run ---------------- */
try {
    if (process.argv.includes("--remove")) {
        await removeSamples();
    } else {
        console.log("Adding sample data to Appwrite...");
        const adminId = await findAdminId();
        const tripIds = await seedTrips(adminId);
        await ensureCollections();
        await seedBookings(tripIds);
        await seedSubscribers();
        console.log("Done. Refresh the admin panel to see it.");
    }
} catch (e) {
    const cause = e instanceof Error && (e as { cause?: { code?: string; message?: string } }).cause;
    const msg = (e instanceof Error ? e.message : String(e)) + (cause ? ` (${cause.code ?? cause.message})` : "");
    console.error(`\nFailed: ${msg}`);
    if (/missing scope/i.test(msg)) {
        console.error("Your API key needs more permissions. In Appwrite: Overview → API keys → your key → Scopes: tick the Database scopes (collections, attributes, documents read/write).");
    }
    process.exit(1);
}
