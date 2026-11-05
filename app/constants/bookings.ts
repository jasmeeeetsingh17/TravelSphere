import { allTrips } from "./index";
import { formatDate } from "~/lib/utils";

export type Booking = {
    id: string;
    traveller: string;
    trip: string;
    travelDate: string;
    date: string; // ISO date, used by analytics
    guests: number;
    amount: number;
    status: "Confirmed" | "Pending" | "Cancelled";
};

const travellers = ["Aarav Sharma", "Priya Singh", "Rohan Mehta", "Simran Kaur", "Kabir Verma", "Ananya Gupta", "Harpreet Singh", "Neha Joshi"];
const statuses: Booking["status"][] = ["Confirmed", "Confirmed", "Pending", "Confirmed", "Cancelled", "Pending", "Confirmed", "Confirmed"];
const dates = ["2026-12-05", "2026-12-12", "2026-12-18", "2027-01-03", "2027-01-10", "2027-01-22", "2027-02-02", "2027-02-14"];

/** Sample bookings built from the existing trips. Replace with Appwrite data when bookings are stored. */
export const bookings: Booking[] = travellers.map((traveller, i) => {
    const trip = allTrips[i % allTrips.length];
    const guests = (i % 4) + 1;
    return {
        id: `BK-${1001 + i}`,
        traveller,
        trip: trip.name,
        travelDate: formatDate(dates[i]),
        date: dates[i],
        guests,
        amount: Number(String(trip.estimatedPrice).replace(/[^0-9.]/g, "")) * guests,
        status: statuses[i],
    };
});

/** Share of booking revenue kept as profit. Used for the estimated profit in analytics. */
export const PROFIT_MARGIN = 0.25;
