import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import Modal from "../../../components/Modal";
import TripDetail from "../../../components/TripDetail";
import { adminCall, loadBookings } from "~/appwrite/admin";
import { withBookingStats } from "~/lib/booking";
import { resolveTrip } from "~/appwrite/trips";
import type { Route } from "./+types/trip-detail";

export const meta = ({ loaderData }: Route.MetaArgs) => [{ title: `${loaderData?.name ?? "Trip"} | TravelSphere Admin` }];

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
    const [trip, { bookings }] = await Promise.all([resolveTrip(params.tripId), loadBookings()]);
    return trip ? withBookingStats([trip], bookings)[0] : null;
};

const AdminTripDetail = ({ loaderData }: Route.ComponentProps) => {
    const navigate = useNavigate();
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const remove = async () => {
        if (!loaderData) return;
        setBusy(true);
        setError("");
        try {
            await adminCall("deleteTrip", { id: loaderData.id });
            navigate("/trips");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not delete the trip.");
            setBusy(false);
        }
    };

    return (
        <main className="dashboard wrapper">
            <TripDetail
                trip={loaderData}
                backTo="/trips"
                showBookings
                actions={
                    <div className="flex flex-col gap-3">
                    <Link
                        to={`/trips/${loaderData?.id}/edit`}
                        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold shadow-md shadow-primary-100/30 transition-colors"
                    >
                        <Pencil size={17} /> Edit trip
                    </Link>
                    <button
                        onClick={() => setConfirming(true)}
                        className="flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        <Trash2 size={18} /> Delete trip
                    </button>
                    </div>
                }
            />

            <Modal open={confirming} title="Delete this trip?" onClose={() => !busy && setConfirming(false)}>
                <p className="text-gray-100 leading-7">
                    <strong className="text-dark-100">{loaderData?.name}</strong> will be removed permanently. This cannot be undone.
                </p>
                {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={() => setConfirming(false)} disabled={busy} className="h-11 px-6 rounded-xl border border-light-400 text-dark-100 font-medium hover:bg-light-200 cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={remove} disabled={busy} className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60">
                        {busy && <Loader2 size={16} className="animate-spin" />} {busy ? "Deleting..." : "Delete trip"}
                    </button>
                </div>
            </Modal>
        </main>
    );
};

export default AdminTripDetail;
