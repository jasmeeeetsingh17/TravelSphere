import { useState } from "react";
import { useRevalidator } from "react-router";
import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Page, Search, Sort, Toolbar } from "@syncfusion/ej2-react-grids";
import { Loader2, ShieldCheck, ShieldOff, Trash2, UserCheck, Users } from "lucide-react";
import { Header } from "../../../components";
import KpiCard from "../../../components/KpiCard";
import Modal from "../../../components/Modal";
import { nameCell, statusCell } from "../../../components/UserCells";
import { adminCall } from "~/appwrite/admin";
import { getUser } from "~/appwrite/auth";
import { getAllUsers, type UserRow } from "~/appwrite/users";
import type { Route } from "./+types/all-users";

export const meta = () => [{ title: "Users | TravelSphere Admin" }];

export const clientLoader = async () => {
    const [users, me] = await Promise.all([getAllUsers(500), getUser()]);
    return { users, meId: (me?.accountId as string | undefined) ?? "" };
};

type Pending = { user: UserRow; kind: "delete" | "role" } | null;

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
    const { users, meId } = loaderData;
    const revalidator = useRevalidator();
    const [pending, setPending] = useState<Pending>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const admins = users.filter((u) => u.status === "admin").length;
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

    const actionCell = (u: UserRow) =>
        u.accountId === meId ? (
            <span className="text-xs font-medium text-gray-100 bg-light-300 rounded-full px-3 py-1">You</span>
        ) : (
            <span className="flex items-center gap-1">
                <button
                    onClick={() => open(u, "role")}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-100 hover:bg-primary-50 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                >
                    {u.status === "admin" ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                    {u.status === "admin" ? "Remove admin" : "Make admin"}
                </button>
                <button
                    onClick={() => open(u, "delete")}
                    aria-label={`Delete ${u.name}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                >
                    <Trash2 size={15} />
                </button>
            </span>
        );

    return (
        <main className="dashboard wrapper">
            <Header title="Users" description="Everyone who has signed in. Only admins can open this panel." />

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <KpiCard label="Total accounts" value={users.length} Icon={Users} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Admins" value={admins} note="Can open the panel" Icon={ShieldCheck} tone="bg-success-50 text-success-700" />
                <KpiCard label="Without access" value={users.length - admins} note="Signed in but not admin" Icon={UserCheck} tone="bg-amber-50 text-amber-600" />
            </ul>

            {notice && <p className="rounded-xl bg-success-50 text-success-700 px-4 py-3 text-sm">{notice}</p>}

            <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-4 md:p-6">
                <GridComponent
                    dataSource={users}
                    gridLines="None"
                    allowSorting
                    allowPaging
                    pageSettings={{ pageSize: 10 }}
                    toolbar={["Search"]}
                    searchSettings={{ fields: ["name", "email", "status"] }}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="name" headerText="Name" width="240" template={nameCell} />
                        <ColumnDirective field="email" headerText="Email" width="240" />
                        <ColumnDirective field="dateJoined" headerText="Joined" width="150" />
                        <ColumnDirective field="status" headerText="Role" width="110" template={statusCell} />
                        <ColumnDirective headerText="Actions" width="200" template={actionCell} allowSorting={false} />
                    </ColumnsDirective>
                    <Inject services={[Page, Sort, Toolbar, Search]} />
                </GridComponent>
                {!users.length && <p className="text-center text-gray-100 py-6">No users found.</p>}
            </section>

            <Modal
                open={!!pending}
                title={pending?.kind === "delete" ? "Delete this user?" : makeAdmin ? "Give admin access?" : "Remove admin access?"}
                onClose={() => !busy && setPending(null)}
            >
                <p className="text-gray-100 leading-7">
                    {pending?.kind === "delete" ? (
                        <>
                            <strong className="text-dark-100">{target?.name}</strong> ({target?.email}) will be removed together with the trips they
                            created, and their login will be deleted. This cannot be undone.
                        </>
                    ) : makeAdmin ? (
                        <>
                            <strong className="text-dark-100">{target?.name}</strong> will be able to open the admin panel, create trips and manage users.
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
                        className={
                            "h-11 px-6 rounded-xl text-white font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60 " +
                            (pending?.kind === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-primary-100 hover:bg-primary-500")
                        }
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
