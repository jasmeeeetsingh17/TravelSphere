import { account } from "~/appwrite/client";

/** Calls the admin-only server route. The server checks the caller is an admin. */
export async function adminCall<T = Record<string, unknown>>(op: string, payload: Record<string, unknown> = {}): Promise<T> {
    const { jwt } = await account.createJWT();
    const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-appwrite-jwt": jwt },
        body: JSON.stringify({ op, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data as T;
}
