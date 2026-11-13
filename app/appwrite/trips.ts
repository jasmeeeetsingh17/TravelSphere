import { ID, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { generatedToView, type TripView } from "~/lib/trip-view";

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

/**
 * Saves a generated trip and returns the new document id.
 * `tripDetail` and `userId` are required. `imageUrls` and `createdAt` are dropped
 * automatically if your collection does not have those attributes.
 */
export const saveTrip = async (trip: Trip, userId: string) => {
    const data: Record<string, unknown> = {
        tripDetail: JSON.stringify(trip),
        imageUrls: trip.imageUrls,
        userId,
        createdAt: new Date().toISOString(),
    };

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const doc = await database.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId,
                ID.unique(),
                data
            );
            return doc.$id as string;
        } catch (error) {
            const unknown = /Unknown attribute:?\s*"?([A-Za-z0-9_$]+)"?/.exec(error instanceof Error ? error.message : "")?.[1];
            if (unknown && (unknown === "imageUrls" || unknown === "createdAt") && unknown in data) {
                delete data[unknown];
                continue;
            }
            throw error;
        }
    }
    throw new Error("Could not save the trip.");
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

/** Finds a saved trip by its Appwrite document id. */
export const resolveTrip = async (id?: string): Promise<TripView | null> => {
    if (!id) return null;
    try {
        const doc = await database.getDocument(appwriteConfig.databaseId, appwriteConfig.tripCollectionId, id);
        return docToView(doc);
    } catch {
        return null;
    }
};

export type EditableTrip = Trip & { state?: string };

/** The raw saved trip, for the edit form. */
export const getTripForEdit = async (id?: string): Promise<{ id: string; trip: EditableTrip } | null> => {
    if (!id) return null;
    try {
        const doc = await database.getDocument(appwriteConfig.databaseId, appwriteConfig.tripCollectionId, id);
        return { id: doc.$id, trip: JSON.parse(doc.tripDetail) as EditableTrip };
    } catch {
        return null;
    }
};

/** JWT the API route uses to check that the caller is signed in. */
export const getAuthToken = async () => (await account.createJWT()).jwt;
