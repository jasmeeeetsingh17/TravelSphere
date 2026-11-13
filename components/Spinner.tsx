import { cn } from "~/lib/utils";

type Props = {
    /** Text under the spinner; also read by screen readers */
    label?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
};

const sizes = { sm: "size-8 border-[3px]", md: "size-14 border-4", lg: "size-20 border-[5px]" };

/** Brand spinner: a spinning gradient ring around the TravelSphere logo. */
const Spinner = ({ label = "Loading", size = "md", className }: Props) => (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center gap-4", className)}>
        <span className="relative flex items-center justify-center">
            <span className={cn("rounded-full border-primary-50 border-t-primary-100 border-r-violet-500 animate-spin", sizes[size])} />
            {size !== "sm" && <img src="/assets/icons/logo.svg" alt="" className={cn("absolute", size === "lg" ? "size-8" : "size-6")} />}
        </span>
        {label && size !== "sm" && <span className="text-sm font-medium text-gray-100 animate-pulse">{label}...</span>}
        <span className="sr-only">{label}</span>
    </div>
);

export default Spinner;
