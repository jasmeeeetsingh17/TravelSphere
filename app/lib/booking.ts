/** Booking shape shared by the browser and the server. */
export type BookingStatus = "Pending" | "Confirmed" | "Cancelled";
export const BOOKING_STATUSES: BookingStatus[] = ["Pending", "Confirmed", "Cancelled"];

export type Booking = {
    id: string;
    tripId: string;
    tripName: string;
    userId: string;
    userName: string;
    userEmail: string;
    travelDate: string; // ISO date
    guests: number;
    amount: number;
    status: BookingStatus;
    createdAt: string;
};

export const bookingFromDoc = (d: any): Booking => ({
    id: d.$id,
    tripId: d.tripId ?? "",
    tripName: d.tripName ?? "",
    userId: d.userId ?? "",
    userName: d.userName ?? "",
    userEmail: d.userEmail ?? "",
    travelDate: d.travelDate ?? "",
    guests: Number(d.guests) || 1,
    amount: Number(d.amount) || 0,
    status: BOOKING_STATUSES.includes(d.status) ? d.status : "Pending",
    createdAt: d.$createdAt ?? "",
});

/** "$1,200" -> 1200 */
export const priceToNumber = (price: string) => Number(String(price).replace(/[^0-9.]/g, "")) || 0;

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
