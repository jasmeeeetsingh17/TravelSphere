/**
 * Server-only helpers (the .server.ts name keeps this file out of the browser bundle).
 * They call the Appwrite REST API with APPWRITE_API_KEY so admins can do things
 * that browser users must never be allowed to do directly.
 */

const endpoint = import.meta.env.VITE_APPWRITE_API_ENDPOINT as string;
const project = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;

export const ids = {
    db: import.meta.env.VITE_APPWRITE_DATABASE_ID as string,
    users: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID as string,
    trips: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID as string,
    bookings: import.meta.env.VITE_APPWRITE_BOOKINGS_COLLECTION_ID as string,
};

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

async function call(path: string, headers: Record<string, string>, init: RequestInit = {}) {
    const res = await fetch(`${endpoint}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", "X-Appwrite-Project": project, ...headers },
    });
    if (res.status === 204) return null;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new HttpError(res.status, body?.message ?? res.statusText);
    return body;
}

/** Calls Appwrite as the server (full access). */
export const asServer = (path: string, init: RequestInit = {}) => {
    // VITE_APPWRITE_API_KEY is accepted for older setups; prefer APPWRITE_API_KEY so the name makes clear it is server-only.
    const key = process.env.APPWRITE_API_KEY || process.env.VITE_APPWRITE_API_KEY;
    if (!key) throw new HttpError(503, "APPWRITE_API_KEY is not set on the server. Add it to .env.local and restart.");
    return call(path, { "X-Appwrite-Key": key }, init);
};

/** Calls Appwrite as the signed-in user, using the JWT sent by the browser. */
export const asUser = (path: string, jwt: string) => call(path, { "X-Appwrite-JWT": jwt });

export const queries = (list: object[]) => list.map((q) => `queries[]=${encodeURIComponent(JSON.stringify(q))}`).join("&");

export const q = {
    equal: (attribute: string, value: string) => ({ method: "equal", attribute, values: [value] }),
    limit: (n: number) => ({ method: "limit", values: [n] }),
    orderDesc: (attribute: string) => ({ method: "orderDesc", attribute }),
};

export const listDocs = async (collectionId: string, list: object[]) =>
    (await asServer(`/databases/${ids.db}/collections/${collectionId}/documents?${queries(list)}`)).documents as any[];

/** Throws unless the caller is a signed-in user whose users-collection status is "admin". Returns their account id. */
export async function requireAdmin(request: Request): Promise<string> {
    const jwt = request.headers.get("x-appwrite-jwt");
    if (!jwt) throw new HttpError(401, "Please sign in.");

    let accountId: string;
    try {
        accountId = (await asUser("/account", jwt)).$id;
    } catch {
        throw new HttpError(401, "Your session has expired. Please sign in again.");
    }

    const [me] = await listDocs(ids.users, [q.equal("accountId", accountId), q.limit(1)]);
    if (me?.status !== "admin") throw new HttpError(403, "Only admins can do this.");
    return accountId;
}
