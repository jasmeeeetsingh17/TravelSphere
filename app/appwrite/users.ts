import { Query } from "appwrite";
import { database, appwriteConfig } from "~/appwrite/client";
import { formatDate } from "~/lib/utils";

export type UserRow = {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    dateJoined: string;
    status: string;
};

/** Reads users from the Appwrite users collection. Returns [] if it can't be read. */
export const getAllUsers = async (limit = 100): Promise<UserRow[]> => {
    try {
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit)]
        );

        return documents.map((d) => ({
            id: d.$id,
            name: d.name,
            email: d.email,
            imageUrl: d.imageUrl || "/assets/images/david.webp",
            dateJoined: formatDate(d.joinedAt),
            status: d.status ?? "user",
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};