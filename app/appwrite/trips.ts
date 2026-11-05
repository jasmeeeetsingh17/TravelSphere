import { ID, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { generatedToView, sampleTripViews, type TripView } from "~/lib/trip-view";

/*
 * Trips collection attributes used here (create them in Appwrite):
 *   tripDetail (string, large)  - the trip as JSON
 *   imageUrls  (string[])       - image paths
 *   userId     (string)         - Appwrite account id of the creator
 *   createdAt  (string)         - ISO date
 */

const docToView = (doc: any): TripView | null => {
    try {
        const trip = JSON.parse(doc.tripDetail) as Trip;
        return generatedToView(trip, {
            id: doc.$id,
            createdAt: doc.createdAt ?? doc.$createdAt,
            userId: doc.userId,
            saved: true,
        });
    } catch {
        return null;
    }
};

/** Saves a generated trip and returns the new document id. */
export const saveTrip = async (trip: Trip, userId: string) => {
    const doc = await database.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        ID.unique(),
        {
            tripDetail: JSON.stringify(trip),
            imageUrls: trip.imageUrls,
            userId,
            createdAt: new Date().toISOString(),
        }
    );
    return doc.$id as string;
};

/** Reads saved trips (newest first). Returns [] if the collection can't be read. */
export const getSavedTrips = async (limit = 100, userId?: string): Promise<TripView[]> => {
    try {
        const queries = [Query.limit(limit), Query.orderDesc("$createdAt")];
        if (userId) queries.push(Query.equal("userId", userId));
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            queries
        );
        return documents.map(docToView).filter((t): t is TripView => t !== null);
    } catch (error) {
        console.error("Error fetching trips:", error);
        return [];
    }
};

/** Saved trips first, then the sample trips. */
export const getAllTripViews = async (limit = 100) => [...(await getSavedTrips(limit)), ...sampleTripViews];

/** Finds a sample trip by number or a saved trip by Appwrite document id. */
export const resolveTrip = async (id?: string): Promise<TripView | null> => {
    if (!id) return null;
    const sample = sampleTripViews.find((t) => t.id === id);
    if (sample) return sample;
    try {
        const doc = await database.getDocument(appwriteConfig.databaseId, appwriteConfig.tripCollectionId, id);
        return docToView(doc);
    } catch {
        return null;
    }
};

/** JWT the API route uses to check that the caller is signed in. */
export const getAuthToken = async () => (await account.createJWT()).jwt;
