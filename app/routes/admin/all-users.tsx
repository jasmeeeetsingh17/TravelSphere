import { useState } from "react";
import { useRevalidator } from "react-router";
import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Page, Search, Sort, Toolbar } from "@syncfusion/ej2-react-grids";
import { Loader2, Trash2 } from "lucide-react";
import { Header } from "../../../components";
import Modal from "../../../components/Modal";
import { nameCell, statusCell } from "../../../components/UserCells";
import { adminCall } from "~/appwrite/admin";
import { getUser } from "~/appwrite/auth";
import { getAllUsers, type UserRow } from "~/appwrite/users";
import type { Route } from "./+types/all-users";

export const clientLoader = async () => {
    const [users, me] = await Promise.all([getAllUsers(500), getUser()]);
    return { users, meId: me && !(me instanceof Response) ? (me.accountId as string) : "" };
};

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
    const { users, meId } = loaderData;
    const revalidator = useRevalidator();
    const [target, setTarget] = useState<UserRow | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const confirmDelete = async () => {
        if (!target) return;
        setBusy(true);
        setError("");
        try {
            await adminCall("deleteUser", { accountId: target.accountId });
            setNotice(`${target.name} was deleted.`);
            setTarget(null);
            revalidator.revalidate();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not delete the user.");
        } finally {
            setBusy(false);
        }
    };

    const actionCell = (u: UserRow) =>
        u.accountId === meId ? (
            <span className="text-xs text-gray-100">You</span>
        ) : (
            <button
                onClick={() => { setError(""); setNotice(""); setTarget(u); }}
                aria-label={`Delete ${u.name}`}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
            >
                <Trash2 size={15} /> Delete
            </button>
        );

    return (
        <main className="dashboard wrapper">
            <Header title="Manage Users" description="Search, sort and remove the people using TravelSphere." />

            {notice && <p className="rounded-xl bg-success-50 text-success-700 px-4 py-3 text-sm">{notice}</p>}

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
                    <ColumnDirective field="dateJoined" headerText="Date Joined" width="150" />
                    <ColumnDirective field="status" headerText="Role" width="110" template={statusCell} />
                    <ColumnDirective headerText="Actions" width="120" template={actionCell} allowSorting={false} />
                </ColumnsDirective>
                <Inject services={[Page, Sort, Toolbar, Search]} />
            </GridComponent>

            {!users.length && <p className="text-center text-gray-100">No users found.</p>}

            <Modal open={!!target} title="Delete this user?" onClose={() => !busy && setTarget(null)}>
                <p className="text-gray-100 leading-7">
                    <strong className="text-dark-100">{target?.name}</strong> ({target?.email}) will be removed together with their
                    trips and bookings, and their login will be deleted. This cannot be undone.
                </p>
                {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={() => setTarget(null)} disabled={busy} className="h-11 px-6 rounded-xl border border-light-400 text-dark-100 font-medium hover:bg-light-200 cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={confirmDelete} disabled={busy} className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60">
                        {busy && <Loader2 size={16} className="animate-spin" />} {busy ? "Deleting..." : "Delete user"}
                    </button>
                </div>
            </Modal>
        </main>
    );
};

export default AllUsers;
