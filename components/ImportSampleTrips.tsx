import { useState } from "react";
import { useRevalidator } from "react-router";
import { CheckCircle2, DatabaseZap, Loader2 } from "lucide-react";
import { adminCall } from "~/appwrite/admin";
import { sampleTrips } from "~/constants/dummyTrips";
import Modal from "./Modal";

/** Button that saves the sample Indian trips to the database (admins only, skips duplicates). */
const ImportSampleTrips = ({ className = "" }: { className?: string }) => {
    const revalidator = useRevalidator();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

    const close = () => {
        if (busy) return;
        setOpen(false);
        setError("");
        setResult(null);
    };

    const run = async () => {
        setBusy(true);
        setError("");
        try {
            const res = await adminCall<{ added: number; skipped: number }>("importSampleTrips");
            setResult(res);
            revalidator.revalidate();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not import the trips.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`flex items-center justify-center gap-2 bg-white border border-light-400 text-dark-100 hover:border-primary-100 hover:text-primary-100 text-sm font-semibold rounded-full px-5 py-3 transition-colors cursor-pointer ${className}`}
            >
                <DatabaseZap size={16} /> Import sample trips
            </button>

            <Modal open={open} title={result ? "Trips imported" : "Import sample Indian trips?"} onClose={close}>
                {result ? (
                    <div className="flex flex-col items-center gap-3 text-center py-2">
                        <CheckCircle2 size={44} className="text-success-700" />
                        <p className="text-gray-100 leading-7">
                            <strong className="text-dark-100">{result.added}</strong> {result.added === 1 ? "trip was" : "trips were"} added to the database.
                            {result.skipped > 0 && ` ${result.skipped} already existed and were skipped.`}
                        </p>
                        <button onClick={close} className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-6 py-2.5 cursor-pointer">
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-100 leading-7">
                            This saves <strong className="text-dark-100">{sampleTrips.length} ready-made trips</strong> across India (Rajasthan, Kerala, Ladakh,
                            Kashmir and more) to your trips collection, priced in rupees. Trips with the same name are skipped, so it is safe to run twice.
                            You can edit or delete any of them afterwards.
                        </p>
                        {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}
                        <div className="flex justify-end gap-3">
                            <button onClick={close} disabled={busy} className="h-11 px-6 rounded-xl border border-light-400 text-dark-100 font-medium hover:bg-light-200 cursor-pointer disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={run} disabled={busy} className="h-11 px-6 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60">
                                {busy && <Loader2 size={16} className="animate-spin" />} {busy ? "Importing..." : "Import trips"}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
};

export default ImportSampleTrips;
