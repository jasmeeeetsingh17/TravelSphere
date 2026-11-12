import { ID, OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";

export const getExistingUser = async (id: string) => {
    try {
        const { documents, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", id)]
        );
        return total > 0 ? documents[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const storeUserData = async () => {
    try {
        const user = await account.get();
        if (!user) throw new Error("User not found");

        const { providerAccessToken } = (await account.getSession("current")) || {};
        const profilePicture = providerAccessToken
            ? await getGooglePicture(providerAccessToken)
            : null;

        const createdUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                email: user.email,
                name: user.name,
                imageUrl: profilePicture,
                joinedAt: new Date().toISOString(),
                status: "user",
            }
        );

        return createdUser;
    } catch (error) {
        console.error("Error storing user data:", error);
        return null;
    }
};

const getGooglePicture = async (accessToken: string) => {
    try {
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch Google profile picture");

        const { photos } = await response.json();
        return photos?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Google picture:", error);
        return null;
    }
};

export const loginWithGoogle = async () => {
    try {
        account.createOAuth2Session({
            provider: OAuthProvider.Google,
            success: `${window.location.origin}/`,
            failure: `${window.location.origin}/sign-in?error=oauth`
        });
    } catch (error) {
        console.error("Error during OAuth2 session creation:", error);
    }
};

export const logoutUser = async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

/**
 * The signed-in user's profile document, or null for guests.
 * The first time someone signs in, their profile is created here, so every
 * signed-in user (not only admins) gets a row in the users collection.
 */
export const getUser = async () => {
    let accountId: string;
    try {
        accountId = (await account.get()).$id;
    } catch {
        return null; // not signed in
    }

    try {
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", accountId), Query.limit(1)]
        );
        return documents[0] ?? (await storeUserData());
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const isAdmin = (user: object | null | undefined) => (user as { status?: string } | null)?.status === "admin";
