import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { ComboBoxComponent, DropDownListComponent, MultiSelectComponent } from "@syncfusion/ej2-react-dropdowns";
import { Loader2, Sparkles } from "lucide-react";
import { account } from "~/appwrite/client";
import { getAuthToken, saveTrip } from "~/appwrite/trips";
import { budgetOptions, groupTypes, interests, travelStyles } from "~/constants";
import { indianStates } from "~/constants/indiaStates";
import { generatedToView, type TripView } from "~/lib/trip-view";
import TripDetail from "./TripDetail";

// The app.css rule for .e-input-group-icon is made for another layout, so reset it inside this form.
const field = "flex flex-col gap-2 [&_.e-input-group-icon]:!static";
const labelClass = "text-sm font-medium text-dark-100";

type Props = {
    /** Where saved trips are shown after creation */
    basePath: string;
};

const CreateTripForm = ({ basePath }: Props) => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const presetState = indianStates.find((s) => s.toLowerCase() === (params.get("state") ?? "").toLowerCase()) ?? "";
    const [state, setState] = useState(presetState);
    // Presets from the address, e.g. /trips/create?state=Goa&style=Adventure&budget=Luxury&group=Friends
    const preset = (key: string, list: string[]) => list.find((v) => v.toLowerCase() === (params.get(key) ?? "").toLowerCase()) ?? "";
    const presetStyle = preset("style", travelStyles);
    const presetBudget = preset("budget", budgetOptions);
    const presetGroup = preset("group", groupTypes);
    const [travelStyle, setTravelStyle] = useState(presetStyle);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [budget, setBudget] = useState(presetBudget);
    const [groupType, setGroupType] = useState(presetGroup);
    const [duration, setDuration] = useState(3);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState<TripView | null>(null);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setPreview(null);

        if (!state || !travelStyle || !selectedInterests.length || !budget || !groupType) {
            setError("Please fill in every field before generating a trip.");
            return;
        }
        if (duration < 1 || duration > 14) {
            setError("Duration must be between 1 and 14 days.");
            return;
        }

        setLoading(true);
        try {
            const jwt = await getAuthToken();
            const res = await fetch("/api/create-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-appwrite-jwt": jwt },
                body: JSON.stringify({ state, travelStyle, interest: selectedInterests.join(", "), budget, groupType, duration }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Could not generate the trip.");

            const trip = data.trip as Trip;
            try {
                const me = await account.get();
                const id = await saveTrip(trip, me.$id);
                navigate(`${basePath}/${id}`);
            } catch (saveError) {
                console.error("Error saving trip:", saveError);
                setPreview(generatedToView(trip, { id: "preview", saved: false }));
                const reason = saveError instanceof Error ? saveError.message : "Unknown error";
                setError(`Your trip was generated but could not be saved. Appwrite said: "${reason}"`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={field}>
                    <label htmlFor="state" className={labelClass}>State or union territory (India)</label>
                    <ComboBoxComponent
                        id="state"
                        dataSource={indianStates}
                        placeholder="Choose or type a state"
                        value={presetState || undefined}
                        allowFiltering
                        change={(e) => setState((e.value as string) ?? "")}
                    />
                </div>

                <div className={field}>
                    <label htmlFor="duration" className={labelClass}>Duration (days)</label>
                    <input
                        id="duration"
                        type="number"
                        min={1}
                        max={14}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="h-10.5 rounded-xl border border-light-400 px-4 text-dark-100 outline-none focus:border-primary-100"
                    />
                </div>

                <div className={field}>
                    <label htmlFor="travelStyle" className={labelClass}>Travel style</label>
                    <DropDownListComponent
                        id="travelStyle"
                        dataSource={travelStyles}
                        value={presetStyle || undefined}
                        placeholder="Select a travel style"
                        change={(e) => setTravelStyle((e.value as string) ?? "")}
                    />
                </div>

                <div className={field}>
                    <label htmlFor="groupType" className={labelClass}>Group type</label>
                    <DropDownListComponent
                        id="groupType"
                        dataSource={groupTypes}
                        value={presetGroup || undefined}
                        placeholder="Who is travelling?"
                        change={(e) => setGroupType((e.value as string) ?? "")}
                    />
                </div>

                <div className={field}>
                    <label htmlFor="budget" className={labelClass}>Budget</label>
                    <DropDownListComponent
                        id="budget"
                        dataSource={budgetOptions}
                        value={presetBudget || undefined}
                        placeholder="Select a budget"
                        change={(e) => setBudget((e.value as string) ?? "")}
                    />
                </div>

                <div className={field}>
                    <label htmlFor="interests" className={labelClass}>Interests</label>
                    <MultiSelectComponent
                        id="interests"
                        dataSource={interests}
                        placeholder="Pick one or more interests"
                        change={(e) => setSelectedInterests((e.value as string[]) ?? [])}
                    />
                </div>

                {error && <p className="md:col-span-2 rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}

                <div className="md:col-span-2 flex justify-end">
                    <ButtonComponent type="submit" disabled={loading} className="button-class h-11 w-full md:w-auto md:px-10">
                        {loading ? <Loader2 size={18} className="animate-spin text-white mr-2" /> : <Sparkles size={18} className="text-white mr-2" />}
                        <span className="text-white font-semibold">{loading ? "Generating your trip..." : "Generate trip"}</span>
                    </ButtonComponent>
                </div>
            </form>

            {preview && <TripDetail trip={preview} backTo={basePath} />}
        </div>
    );
};

export default CreateTripForm;
