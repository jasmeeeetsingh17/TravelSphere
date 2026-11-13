import { useMemo, useState } from "react";
import { AutoCompleteComponent, DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
import { Link } from "react-router";
import type { TripView } from "~/lib/trip-view";
import TripCard from "./TripCard";

const PAGE_SIZE = 8;
const GROUPS = ["All groups", "Solo", "Couple", "Family", "Friends", "Business"];

// The app.css rule for .e-input-group-icon is made for forms, so reset it inside this toolbar.
const resetIcon = "[&_.e-input-group-icon]:!static";

type Props = {
    trips: TripView[];
    /** Where a trip card links to, e.g. "/travel" or "/trips" */
    basePath: string;
    /** Search text to start with (e.g. from ?q= in the address) */
    initialQuery?: string;
};

const TripsExplorer = ({ trips, basePath, initialQuery = "" }: Props) => {
    const [query, setQuery] = useState(initialQuery);
    const [group, setGroup] = useState("All groups");
    const [page, setPage] = useState(1);

    const names = useMemo(() => trips.map((t) => t.name), [trips]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return trips.filter((t) => {
            const matchesGroup = group === "All groups" || t.group === group;
            const text = [t.name, t.location, ...t.tags].join(" ").toLowerCase();
            return matchesGroup && (!q || text.includes(q));
        });
    }, [trips, query, group]);

    const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-4 bg-white border border-light-400 rounded-2xl p-4 shadow-sm">
                <div className={`flex-1 ${resetIcon}`}>
                    <AutoCompleteComponent
                        id="trip-search"
                        dataSource={names}
                        placeholder="Search trips, places or interests"
                        value={initialQuery}
                        showClearButton
                        filtering={(e) => {
                            setQuery(e.text ?? "");
                            setPage(1);
                        }}
                        change={(e) => {
                            setQuery((e.value as string) ?? "");
                            setPage(1);
                        }}
                    />
                </div>
                <div className={`md:w-60 ${resetIcon}`}>
                    <DropDownListComponent
                        id="trip-group"
                        dataSource={GROUPS}
                        value={group}
                        change={(e) => {
                            setGroup((e.value as string) ?? "All groups");
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {visible.length ? (
                <div className="trip-grid">
                    {visible.map((t) => (
                        <TripCard
                            key={t.id}
                            id={t.id}
                            name={t.name}
                            imageUrl={t.imageUrl}
                            location={t.location}
                            tags={t.tags}
                            price={t.price}
                            href={`${basePath}/${t.id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 text-center py-16">
                    <p className="text-gray-100">
                        {trips.length ? "No trips match your search. Try a different word or group." : "There are no trips yet."}
                    </p>
                    {basePath === "/trips" && !trips.length && (
                        <Link
                            to="/trips/create"
                            className="bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-6 py-2.5 transition-colors"
                        >
                            Create the first trip
                        </Link>
                    )}
                </div>
            )}

            {filtered.length > PAGE_SIZE && (
                <PagerComponent
                    totalRecordsCount={filtered.length}
                    pageSize={PAGE_SIZE}
                    currentPage={page}
                    click={(args: { currentPage: number }) => setPage(args.currentPage)}
                />
            )}
        </section>
    );
};

export default TripsExplorer;
