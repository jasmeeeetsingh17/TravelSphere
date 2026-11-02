import { useMemo, useState } from "react";
import { AutoCompleteComponent, DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
import { allTrips } from "~/constants";
import TripCard from "./TripCard";

const PAGE_SIZE = 8;
const STYLES = ["All styles", "Solo", "Couple", "Family", "Friends"];
const names = allTrips.map((t) => t.name);

// The app.css rule for .e-input-group-icon is made for forms, so reset it inside this toolbar.
const resetIcon = "[&_.e-input-group-icon]:!static";

const TripsExplorer = () => {
    const [query, setQuery] = useState("");
    const [style, setStyle] = useState("All styles");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return allTrips.filter((t) => {
            const matchesStyle = style === "All styles" || t.travelStyle === style;
            const text = [t.name, t.itinerary?.[0]?.location, ...t.tags].join(" ").toLowerCase();
            return matchesStyle && (!q || text.includes(q));
        });
    }, [query, style]);

    const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-4 bg-white border border-light-400 rounded-2xl p-4 shadow-sm">
                <div className={`flex-1 ${resetIcon}`}>
                    <AutoCompleteComponent
                        id="trip-search"
                        dataSource={names}
                        placeholder="Search trips, places or interests"
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
                        id="trip-style"
                        dataSource={STYLES}
                        value={style}
                        change={(e) => {
                            setStyle((e.value as string) ?? "All styles");
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {visible.length ? (
                <div className="trip-grid">
                    {visible.map(({ id, name, imageUrls, itinerary, tags }) => (
                        <TripCard
                            key={id}
                            id={id.toString()}
                            name={name}
                            imageUrl={imageUrls[0]}
                            location={itinerary?.[0]?.location ?? ""}
                            tags={tags}
                            price=""
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-100 py-16">
                    No trips match your search. Try a different word or style.
                </p>
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