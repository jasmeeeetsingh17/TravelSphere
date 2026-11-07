import { Query } from "appwrite";
import { database, appwriteConfig } from "~/appwrite/client";
import { formatDate } from "~/lib/utils";

export type UserRow = {
    id: string;
    accountId: string;
    name: string;
    email: string;
    imageUrl: string;
    dateJoined: string;
    joinedAt: string; // ISO date
    status: string;
};

/** Reads users from the Appwrite users collection. Returns [] if it can't be read. */
export const getAllUsers = async (limit = 100): Promise<UserRow[]> => {
    try {
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit), Query.orderDesc("$createdAt")]
        );

        return documents.map((d) => ({
            id: d.$id,
            accountId: d.accountId ?? "",
            name: d.name,
            email: d.email,
            imageUrl: d.imageUrl || "/assets/images/david.webp",
            dateJoined: formatDate(d.joinedAt ?? d.$createdAt),
            joinedAt: d.joinedAt ?? d.$createdAt,
            status: d.status ?? "user",
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};