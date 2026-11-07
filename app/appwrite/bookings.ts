import { ID, Permission, Query, Role } from "appwrite";
import { database, appwriteConfig } from "~/appwrite/client";
import { bookingFromDoc, type Booking } from "~/lib/booking";

/*
 * Bookings collection attributes (create them in Appwrite):
 *   tripId, tripName, userId, userName, userEmail, travelDate, status  (strings)
 *   guests (integer), amount (float)
 * Turn "Document security" ON and give role "Users" the Create permission only.
 * Each booking is readable by the person who made it; admins read all bookings through the server.
 */

type NewBooking = Pick<Booking, "tripId" | "tripName" | "userId" | "userName" | "userEmail" | "travelDate" | "guests" | "amount">;

export const createBooking = async (b: NewBooking) => {
    const doc = await database.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.bookingCollectionId,
        ID.unique(),
        { ...b, status: "Pending" },
        [Permission.read(Role.user(b.userId))]
    );
    return bookingFromDoc(doc);
};

/** The signed-in user's own bookings, newest first. */
export const getMyBookings = async (userId: string): Promise<Booking[]> => {
    try {
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.bookingCollectionId,
            [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(50)]
        );
        return documents.map(bookingFromDoc);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
};
