import { Link, useLocation } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { ChipDirective, ChipListComponent, ChipsDirective } from "@syncfusion/ej2-react-buttons";
import { AccordionComponent, AccordionItemDirective, AccordionItemsDirective } from "@syncfusion/ej2-react-navigations";
import { ArrowLeft, CalendarDays, Clock, Sparkles, Users, Wallet } from "lucide-react";
import { getTripById, getTripDetails } from "~/constants/tripDetails";
import { cn } from "~/lib/utils";

const TripDetail = ({ tripId }: { tripId?: string }) => {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith("/trips");
    const backTo = isAdmin ? "/trips" : "/travel";
    const trip = getTripById(tripId);

    if (!trip) {
        return (
            <section className="flex flex-col items-center gap-4 py-24 text-center">
                <h1 className="text-2xl font-semibold text-dark-100">Trip not found</h1>
                <p className="text-gray-100">This trip may have been removed.</p>
                <Link to={backTo} className="text-primary-100 font-semibold">Back to all trips</Link>
            </section>
        );
    }

    const d = getTripDetails(trip);

    const facts = [
        { Icon: Clock, label: "Duration", value: d.duration },
        { Icon: Users, label: "Travel style", value: trip.travelStyle },
        { Icon: CalendarDays, label: "Best time", value: d.bestTime },
        { Icon: Wallet, label: "Estimated price", value: trip.estimatedPrice },
    ];

    return (
        <section className="flex flex-col gap-8">
            <Link to={backTo} className="flex items-center gap-2 text-sm font-medium text-gray-100 hover:text-primary-100 w-fit transition-colors">
                <ArrowLeft size={18} />
                Back to all trips
            </Link>

            {/* Hero image */}
            <figure className="relative h-72 md:h-105 rounded-3xl overflow-hidden">
                <img src={trip.imageUrls[0]} alt={trip.name} className="size-full object-cover" />
                <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <figcaption className="absolute bottom-0 left-0 p-6 md:p-10 text-white flex flex-col gap-2">
                    <h1 className="text-3xl md:text-5xl font-bold">{trip.name}</h1>
                    <span className="flex items-center gap-2 text-sm md:text-lg">
                        <img src="/assets/icons/location-mark.svg" alt="" className="size-5 invert brightness-0" />
                        {d.place}
                    </span>
                </figcaption>
            </figure>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main column */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <article className="bg-white rounded-3xl border border-light-400 p-6 md:p-8 flex flex-col gap-4">
                        <h2 className="text-xl font-semibold text-dark-100">About this trip</h2>
                        <p className="text-gray-100 leading-7">{d.description}</p>
                        <ChipListComponent id="trip-detail-chips">
                            <ChipsDirective>
                                {trip.tags.map((tag, i) => (
                                    <ChipDirective
                                        key={tag}
                                        text={tag}
                                        cssClass={cn(i === 1 ? "!bg-pink-50 !text-pink-500" : "!bg-success-50 !text-success-700")}
                                    />
                                ))}
                            </ChipsDirective>
                        </ChipListComponent>
                    </article>

                    <article className="bg-white rounded-3xl border border-light-400 p-6 md:p-8 flex flex-col gap-4">
                        <h2 className="text-xl font-semibold text-dark-100">Day-by-day itinerary</h2>
                        <AccordionComponent expandMode="Single">
                            <AccordionItemsDirective>
                                {d.days.map((day, i) => (
                                    <AccordionItemDirective
                                        key={day.title}
                                        header={day.title}
                                        expanded={i === 0}
                                        content={`<ul style="list-style:disc;padding-left:20px;line-height:1.9">${day.activities
                                            .map((a) => `<li>${a}</li>`)
                                            .join("")}</ul>`}
                                    />
                                ))}
                            </AccordionItemsDirective>
                        </AccordionComponent>
                    </article>
                </div>

                {/* Summary card */}
                <aside className="flex flex-col gap-5 bg-white rounded-3xl border border-light-400 p-6 h-fit lg:sticky lg:top-24">
                    <h2 className="text-xl font-semibold text-dark-100">Trip summary</h2>
                    <ul className="flex flex-col gap-4">
                        {facts.map(({ Icon, label, value }) => (
                            <li key={label} className="flex items-center gap-3">
                                <span className="size-10 rounded-xl bg-primary-50 text-primary-100 flex items-center justify-center">
                                    <Icon size={20} />
                                </span>
                                <span className="flex flex-col leading-tight">
                                    <small className="text-gray-100">{label}</small>
                                    <strong className="text-dark-100">{value}</strong>
                                </span>
                            </li>
                        ))}
                    </ul>

                    {!isAdmin && (
                        <ButtonComponent
                            type="button"
                            className="button-class h-11 w-full"
                            onClick={() => window.dispatchEvent(new Event("open-ai-mode"))}
                        >
                            <Sparkles size={18} className="text-white mr-2" />
                            <span className="text-white font-semibold">Plan this trip with AI</span>
                        </ButtonComponent>
                    )}
                </aside>
            </div>
        </section>
    );
};

export default TripDetail;