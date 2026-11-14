import { useMemo, useState } from "react";
import { Link, useRevalidator } from "react-router";
import dayjs from "dayjs";
import {
    ArrowDownWideNarrow, Check, Copy, Loader2, Search, ShieldCheck, ShieldOff, Trash2, UserPlus, UserRound, Users, UserX,
} from "lucide-react";
import { Header } from "../../../components";
import KpiCard from "../../../components/KpiCard";
import Modal from "../../../components/Modal";
import { adminCall } from "~/appwrite/admin";
import { getUser } from "~/appwrite/auth";
import { getSavedTrips } from "~/appwrite/trips";
import { getAllUsers, type UserRow } from "~/appwrite/users";
import { thisVsLast, pctChange } from "~/lib/stats";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/all-users";

export const meta = () => [{ title: "Users | TravelSphere Admin" }];

export const clientLoader = async () => {
    const [users, me, trips] = await Promise.all([getAllUsers(500), getUser(), getSavedTrips(500)]);
    const tripCounts: Record<string, number> = {};
    for (const t of trips) if (t.userId) tripCounts[t.userId] = (tripCounts[t.userId] ?? 0) + 1;
    return { users, meId: (me?.accountId as string | undefined) ?? "", tripCounts };
};

type Pending = { user: UserRow; kind: "delete" | "role" } | null;
const TABS = ["All", "Admins", "No access"] as const;
type Tab = (typeof TABS)[number];
const SORTS = { newest: "Newest first", oldest: "Oldest first", name: "Name A-Z", trips: "Most trips" } as const;
type Sort = keyof typeof SORTS;

/** "today", "3 days ago", "2 months ago" */
const ago = (iso: string) => {
    const d = dayjs().startOf("day").diff(dayjs(iso).startOf("day"), "day");
    if (d <= 0) return "today";
    if (d === 1) return "yesterday";
    if (d < 30) return `${d} days ago`;
    const m = Math.floor(d / 30);
    if (m < 12) return `${m} ${m === 1 ? "month" : "months"} ago`;
    const y = Math.floor(m / 12);
    return `${y} ${y === 1 ? "year" : "years"} ago`;
};

const Avatar = ({ u, size = "size-10" }: { u: UserRow; size?: string }) =>
    u.imageUrl && !u.imageUrl.includes("david.webp") ? (
        <img src={u.imageUrl} alt="" referrerPolicy="no-referrer" className={cn(size, "rounded-full object-cover shrink-0")} />
    ) : (
        <span className={cn(size, "rounded-full shrink-0 bg-linear-to-br from-primary-100 to-violet-600 text-white font-bold flex items-center justify-center")}>
            {u.name.charAt(0).toUpperCase()}
        </span>
    );

const RoleBadge = ({ status }: { status: string }) =>
    status === "admin" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 text-success-700 px-2.5 py-1 text-xs font-semibold">
            <ShieldCheck size={13} /> Admin
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-600 px-2.5 py-1 text-xs font-semibold">
            <UserX size={13} /> No access
        </span>
    );

/* ---------------- "Add an admin" guide ---------------- */
const InviteGuide = () => {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const link = typeof window !== "undefined" ? `${window.location.origin}/sign-in` : "/sign-in";
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard blocked; the link is visible to copy by hand
        }
    };
    return (
        <>
            <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-6 py-3 shadow-md shadow-primary-100/30 transition-colors cursor-pointer shrink-0">
                <UserPlus size={16} /> Add an admin
            </button>
            <Modal open={open} title="Add a new admin" onClose={() => setOpen(false)}>
                <ol className="flex flex-col gap-4">
                    {[
                        ["Send them the sign-in link", "They sign in once with their Google account."],
                        ["They appear here as \"No access\"", "Signing in creates their account, but they can't open the panel yet."],
                        ["Click \"Make admin\"", "They can open the dashboard the next time they sign in."],
                    ].map(([title, text], i) => (
                        <li key={title} className="flex gap-3">
                            <span className="size-7 shrink-0 rounded-full bg-primary-50 text-primary-100 text-sm font-bold flex items-center justify-center">{i + 1}</span>
                            <span className="flex flex-col leading-snug">
                                <strong className="text-dark-100 text-sm">{title}</strong>
                                <small className="text-gray-100">{text}</small>
                            </span>
                        </li>
                    ))}
                </ol>
                <div className="flex items-center gap-2 rounded-xl border border-light-400 bg-light-200 p-2 pl-4">
                    <code className="flex-1 truncate text-sm text-dark-100">{link}</code>
                    <button onClick={copy} className="flex items-center gap-1.5 rounded-lg bg-surface border border-light-400 px-3 py-2 text-sm font-semibold text-dark-100 hover:border-primary-100 cursor-pointer">
                        {copied ? <Check size={15} className="text-success-700" /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </Modal>
        </>
    );
};

/* ---------------- Page ---------------- */
const AllUsers = ({ loaderData }: Route.ComponentProps) => {
    const { users, meId, tripCounts } = loaderData;
    const revalidator = useRevalidator();
    const [pending, setPending] = useState<Pending>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [tab, setTab] = useState<Tab>("All");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<Sort>("newest");

    const admins = users.filter((u) => u.status === "admin").length;
    const joined = thisVsLast(users.map((u) => ({ date: u.joinedAt })));
    const counts: Record<Tab, number> = { All: users.length, Admins: admins, "No access": users.length - admins };

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = users.filter(
            (u) =>
                (tab === "All" || (tab === "Admins" ? u.status === "admin" : u.status !== "admin")) &&
                (!q || `${u.name} ${u.email}`.toLowerCase().includes(q))
        );
        const by: Record<Sort, (a: UserRow, b: UserRow) => number> = {
            newest: (a, b) => b.joinedAt.localeCompare(a.joinedAt),
            oldest: (a, b) => a.joinedAt.localeCompare(b.joinedAt),
            name: (a, b) => a.name.localeCompare(b.name),
            trips: (a, b) => (tripCounts[b.accountId] ?? 0) - (tripCounts[a.accountId] ?? 0),
        };
        // Keep "you" at the top
        return list.sort((a, b) => (a.accountId === meId ? -1 : b.accountId === meId ? 1 : by[sort](a, b)));
    }, [users, tab, query, sort, tripCounts, meId]);

    const target = pending?.user;
    const makeAdmin = target?.status !== "admin";

    const confirm = async () => {
        if (!pending) return;
        setBusy(true);
        setError("");
        try {
            if (pending.kind === "delete") {
                await adminCall("deleteUser", { accountId: pending.user.accountId });
                setNotice(`${pending.user.name} was deleted.`);
            } else {
                await adminCall("setRole", { accountId: pending.user.accountId, status: makeAdmin ? "admin" : "user" });
                setNotice(makeAdmin ? `${pending.user.name} is now an admin.` : `${pending.user.name} no longer has admin access.`);
            }
            setPending(null);
            revalidator.revalidate();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setBusy(false);
        }
    };

    const open = (user: UserRow, kind: "delete" | "role") => {
        setError("");
        setNotice("");
        setPending({ user, kind });
    };

    const Actions = ({ u }: { u: UserRow }) =>
        u.accountId === meId ? (
            <Link to="/account" className="text-xs font-semibold text-primary-100 hover:underline">My account</Link>
        ) : (
            <span className="flex items-center justify-end gap-1">
                <button
                    onClick={() => open(u, "role")}
                    className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                        u.status === "admin" ? "text-gray-100 hover:bg-light-300" : "text-white bg-primary-100 hover:bg-primary-500"
                    )}
                >
                    {u.status === "admin" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                    {u.status === "admin" ? "Remove admin" : "Make admin"}
                </button>
                <button onClick={() => open(u, "delete")} aria-label={`Delete ${u.name}`} title="Delete account" className="rounded-lg p-2 text-gray-100 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                    <Trash2 size={15} />
                </button>
            </span>
        );

    return (
        <main className="dashboard wrapper">
            <span className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <Header title="Users" description="Everyone who has signed in. Only admins can open this panel." />
                <InviteGuide />
            </span>

            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard label="Total accounts" value={users.length} note="Signed in at least once" Icon={Users} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Admins" value={admins} note="Can open the panel" Icon={ShieldCheck} tone="bg-success-50 text-success-700" />
                <KpiCard label="Without access" value={users.length - admins} note={users.length - admins ? "Waiting for an admin" : "Everyone has access"} Icon={UserX} tone="bg-amber-50 text-amber-600" />
                <KpiCard label="New this month" value={joined.current} note={`${joined.last} last month`} delta={pctChange(joined.current, joined.last)} Icon={UserPlus} tone="bg-violet-50 text-violet-600" />
            </ul>

            {notice && <p className="rounded-xl bg-success-50 text-success-700 px-4 py-3 text-sm">{notice}</p>}

            <section className="bg-surface rounded-3xl border border-light-400 shadow-sm p-4 md:p-6 flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1 bg-light-200 rounded-full p-1 w-fit" role="tablist">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                role="tab"
                                aria-selected={tab === t}
                                onClick={() => setTab(t)}
                                className={cn("rounded-full px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer", tab === t ? "bg-surface text-dark-100 shadow" : "text-gray-100 hover:text-dark-100")}
                            >
                                {t} <span className="text-xs text-gray-100">{counts[t]}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <span className="relative sm:w-72">
                            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-100" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search name or email"
                                className="h-11 w-full rounded-xl border border-light-400 bg-surface pl-10 pr-4 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15"
                            />
                        </span>
                        <label className="relative">
                            <ArrowDownWideNarrow size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-100 pointer-events-none" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as Sort)}
                                aria-label="Sort users"
                                className="h-11 w-full rounded-xl border border-light-400 bg-surface pl-10 pr-8 text-sm text-dark-100 outline-none focus:border-primary-100 cursor-pointer appearance-none"
                            >
                                {Object.entries(SORTS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {visible.length ? (
                    <>
                        {/* Table on larger screens */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-gray-100 border-b border-light-400">
                                        <th className="py-3 pr-3 font-semibold">User</th>
                                        <th className="py-3 pr-3 font-semibold">Role</th>
                                        <th className="py-3 pr-3 font-semibold">Joined</th>
                                        <th className="py-3 pr-3 font-semibold text-right">Trips created</th>
                                        <th className="py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light-400">
                                    {visible.map((u) => (
                                        <tr key={u.id} className={cn("hover:bg-light-200/60", u.accountId === meId && "bg-primary-50/40")}>
                                            <td className="py-3.5 pr-3">
                                                <span className="flex items-center gap-3">
                                                    <Avatar u={u} />
                                                    <span className="min-w-0 flex flex-col leading-tight">
                                                        <strong className="flex items-center gap-2 text-dark-100 truncate">
                                                            {u.name}
                                                            {u.accountId === meId && <span className="rounded-full bg-primary-100 text-white text-[10px] font-bold px-2 py-0.5">YOU</span>}
                                                        </strong>
                                                        <a href={`mailto:${u.email}`} className="text-xs text-gray-100 hover:text-primary-100 truncate">{u.email}</a>
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 pr-3"><RoleBadge status={u.status} /></td>
                                            <td className="py-3.5 pr-3 whitespace-nowrap">
                                                <span className="flex flex-col leading-tight">
                                                    <span className="text-dark-100">{dayjs(u.joinedAt).format("D MMM YYYY")}</span>
                                                    <small className="text-xs text-gray-100">{ago(u.joinedAt)}</small>
                                                </span>
                                            </td>
                                            <td className="py-3.5 pr-3 text-right tabular-nums font-semibold text-dark-100">{tripCounts[u.accountId] ?? 0}</td>
                                            <td className="py-3.5"><Actions u={u} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards on phones */}
                        <ul className="md:hidden flex flex-col gap-3">
                            {visible.map((u) => (
                                <li key={u.id} className={cn("rounded-2xl border border-light-400 p-4 flex flex-col gap-3", u.accountId === meId && "border-primary-100 bg-primary-50/40")}>
                                    <span className="flex items-center gap-3">
                                        <Avatar u={u} size="size-11" />
                                        <span className="flex-1 min-w-0 flex flex-col leading-tight">
                                            <strong className="text-dark-100 truncate">{u.name}{u.accountId === meId && " (you)"}</strong>
                                            <small className="text-xs text-gray-100 truncate">{u.email}</small>
                                        </span>
                                        <RoleBadge status={u.status} />
                                    </span>
                                    <span className="flex items-center justify-between gap-2 text-xs text-gray-100">
                                        <span>Joined {ago(u.joinedAt)} · {tripCounts[u.accountId] ?? 0} trips</span>
                                        <Actions u={u} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center py-14 bg-light-200 rounded-2xl">
                        <UserRound size={32} className="text-gray-100" />
                        <p className="text-gray-100">{users.length ? "No users match this filter." : "No users yet."}</p>
                    </div>
                )}
            </section>

            <Modal
                open={!!pending}
                title={pending?.kind === "delete" ? "Delete this user?" : makeAdmin ? "Give admin access?" : "Remove admin access?"}
                onClose={() => !busy && setPending(null)}
            >
                <p className="text-gray-100 leading-7">
                    {pending?.kind === "delete" ? (
                        <>
                            <strong className="text-dark-100">{target?.name}</strong> ({target?.email}) will be removed together with the {tripCounts[target?.accountId ?? ""] ?? 0} trips they
                            created, and their login will be deleted. This cannot be undone.
                        </>
                    ) : makeAdmin ? (
                        <>
                            <strong className="text-dark-100">{target?.name}</strong> will be able to open the admin panel, manage trips and bookings, and change other users.
                        </>
                    ) : (
                        <>
                            <strong className="text-dark-100">{target?.name}</strong> will no longer be able to open the admin panel.
                        </>
                    )}
                </p>
                {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={() => setPending(null)} disabled={busy} className="h-11 px-6 rounded-xl border border-light-400 text-dark-100 font-medium hover:bg-light-200 cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={confirm}
                        disabled={busy}
                        className={cn(
                            "h-11 px-6 rounded-xl text-white font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60",
                            pending?.kind === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-primary-100 hover:bg-primary-500"
                        )}
                    >
                        {busy && <Loader2 size={16} className="animate-spin" />}
                        {busy ? "Saving..." : pending?.kind === "delete" ? "Delete user" : makeAdmin ? "Make admin" : "Remove admin"}
                    </button>
                </div>
            </Modal>
        </main>
    );
};

export default AllUsers;
