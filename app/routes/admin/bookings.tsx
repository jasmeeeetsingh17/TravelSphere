import { useState } from "react";
import { useRevalidator } from "react-router";
import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Page, Search, Sort, Toolbar } from "@syncfusion/ej2-react-grids";
import { Header } from "../../../components";
import { adminCall, loadAllBookings } from "~/appwrite/admin";
import { money, type Booking, type BookingStatus } from "~/lib/booking";
import { cn, formatDate } from "~/lib/utils";
import type { Route } from "./+types/bookings";

export const clientLoader = async () => await loadAllBookings();

const statusStyles: Record<BookingStatus, string> = {
    Confirmed: "bg-success-50 text-success-700",
    Pending: "bg-amber-50 text-amber-600",
    Cancelled: "bg-light-300 text-gray-500",
};

const Bookings = ({ loaderData }: Route.ComponentProps) => {
    const { bookings, error } = loaderData;
    const revalidator = useRevalidator();
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");

    const setStatus = async (id: string, status: BookingStatus) => {
        setBusyId(id);
        setActionError("");
        try {
            await adminCall("setBookingStatus", { id, status });
            revalidator.revalidate();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Could not update the booking.");
        } finally {
            setBusyId("");
        }
    };

    const confirmed = bookings.filter((b) => b.status === "Confirmed");
    const summary = [
        { label: "Total bookings", value: bookings.length },
        { label: "Pending", value: bookings.filter((b) => b.status === "Pending").length },
        { label: "Confirmed", value: confirmed.length },
        { label: "Confirmed revenue", value: money(confirmed.reduce((sum, b) => sum + b.amount, 0)) },
    ];

    const travellerCell = (b: Booking) => (
        <span className="flex flex-col leading-tight">
            <span className="font-medium text-dark-100">{b.userName}</span>
            <small className="text-gray-100">{b.userEmail}</small>
        </span>
    );
    const dateCell = (b: Booking) => <span>{b.travelDate ? formatDate(b.travelDate) : "-"}</span>;
    const amountCell = (b: Booking) => <span className="font-medium text-dark-100">{money(b.amount)}</span>;
    const statusCell = (b: Booking) => (
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusStyles[b.status])}>{b.status}</span>
    );
    const actionCell = (b: Booking) => (
        <span className="flex gap-2">
            {b.status !== "Confirmed" && (
                <button disabled={busyId === b.id} onClick={() => setStatus(b.id, "Confirmed")} className="text-sm font-medium text-success-700 hover:bg-success-50 rounded-lg px-3 py-1.5 cursor-pointer disabled:opacity-50">
                    Confirm
                </button>
            )}
            {b.status !== "Cancelled" && (
                <button disabled={busyId === b.id} onClick={() => setStatus(b.id, "Cancelled")} className="text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 cursor-pointer disabled:opacity-50">
                    Cancel
                </button>
            )}
        </span>
    );

    return (
        <main className="dashboard wrapper">
            <Header title="All Bookings" description="Review booking requests and confirm or cancel them." />

            {(error || actionError) && (
                <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">
                    {actionError || error}
                </p>
            )}

            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                {summary.map(({ label, value }) => (
                    <li key={label} className="bg-white rounded-20 shadow-400 p-6 flex flex-col gap-2">
                        <span className="text-sm text-gray-100">{label}</span>
                        <strong className="text-2xl md:text-3xl font-bold text-dark-100">{value}</strong>
                    </li>
                ))}
            </ul>

            <GridComponent
                dataSource={bookings}
                gridLines="None"
                allowSorting
                allowPaging
                pageSettings={{ pageSize: 8 }}
                toolbar={["Search"]}
                searchSettings={{ fields: ["tripName", "userName", "userEmail", "status"] }}
            >
                <ColumnsDirective>
                    <ColumnDirective field="tripName" headerText="Trip" width="200" />
                    <ColumnDirective field="userName" headerText="Traveller" width="220" template={travellerCell} />
                    <ColumnDirective field="travelDate" headerText="Travel Date" width="140" template={dateCell} />
                    <ColumnDirective field="guests" headerText="Guests" width="90" />
                    <ColumnDirective field="amount" headerText="Amount" width="110" template={amountCell} />
                    <ColumnDirective field="status" headerText="Status" width="120" template={statusCell} />
                    <ColumnDirective headerText="Actions" width="170" template={actionCell} allowSorting={false} />
                </ColumnsDirective>
                <Inject services={[Page, Sort, Toolbar, Search]} />
            </GridComponent>

            {!bookings.length && !error && <p className="text-center text-gray-100">No bookings yet.</p>}
        </main>
    );
};

export default Bookings;
