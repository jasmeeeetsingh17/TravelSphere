import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("MMMM DD, YYYY");
};

export function getFirstWord(input: string = ""): string {
    return input.trim().split(/\s+/)[0] || "";
}

/** Older trips were saved in US dollars. They are converted at this rate so every value shows in rupees. */
export const USD_TO_INR = 83;

/** "₹1,20,000" -> 120000. A "$" price is converted to rupees. */
export const priceToNumber = (price: string | number) => {
    const text = String(price ?? "");
    const n = Number(text.replace(/[^0-9.]/g, "")) || 0;
    return text.includes("$") ? Math.round(n * USD_TO_INR) : n;
};

/** 120000 -> "₹1,20,000" (Indian digit grouping) */
export const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** 120000 -> "₹1.2L", 25000 -> "₹25K" for tight spaces like chart labels */
export const moneyShort = (n: number) =>
    n >= 1e7 ? `₹${+(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${+(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${Math.round(n / 1e3)}K` : `₹${Math.round(n)}`;

/** Any stored price string -> rupee string. Empty when there is no number. */
export const formatPrice = (price: string | number) => {
    const n = priceToNumber(price);
    return n ? money(n) : "";
};
