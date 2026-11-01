import type { AxisModel } from "@syncfusion/ej2-react-charts";
import { formatDate } from "~/lib/utils";

export const sidebarItems = [
  {
    id: 1,
    icon: "/assets/icons/home.svg",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: 3,
    icon: "/assets/icons/users.svg",
    label: "All Users",
    href: "/all-users",
  },
  {
    id: 4,
    icon: "/assets/icons/itinerary.svg",
    label: "AI Assit",
    href: "/trips",
  },
  {
    id: 5,
    icon: "/assets/icons/calendar.svg",
    label: "Bookings",
    href: "/bookings",
  },
  {
    id: 6,
    icon: "/assets/icons/chart-bar.svg",
    label: "Analytics",
    href: "/analytics",
  },
  {
    id: 7,
    icon: "/assets/icons/credit-card.svg",
    label: "Billing",
    href: "/billing",
  },
];

export const chartOneData: object[] = [
  {
    x: "Jan",
    y1: 0.5,
    y2: 1.5,
    y3: 0.7,
  },
  {
    x: "Feb",
    y1: 0.8,
    y2: 1.2,
    y3: 0.9,
  },
  {
    x: "Mar",
    y1: 1.2,
    y2: 1.8,
    y3: 1.5,
  },
  {
    x: "Apr",
    y1: 1.5,
    y2: 2.0,
    y3: 1.8,
  },
  {
    x: "May",
    y1: 1.8,
    y2: 2.5,
    y3: 2.0,
  },
  {
    x: "Jun",
    y1: 2.0,
    y2: 2.8,
    y3: 2.5,
  },
];

export const travelStyles = [
  "Relaxed",
  "Luxury",
  "Adventure",
  "Cultural",
  "Nature & Outdoors",
  "City Exploration",
];

export const interests = [
  "Food & Culinary",
  "Historical Sites",
  "Hiking & Nature Walks",
  "Beaches & Water Activities",
  "Museums & Art",
  "Nightlife & Bars",
  "Photography Spots",
  "Shopping",
  "Local Experiences",
];

export const budgetOptions = ["Budget", "Mid-range", "Luxury", "Premium"];

export const groupTypes = ["Solo", "Couple", "Family", "Friends", "Business"];

export const footers = ["Terms & Condition", "Privacy Policy"];

export const selectItems = [
  "groupType",
  "travelStyle",
  "interest",
  "budget",
] as (keyof TripFormData)[];

export const comboBoxItems = {
  groupType: groupTypes,
  travelStyle: travelStyles,
  interest: interests,
  budget: budgetOptions,
} as Record<keyof TripFormData, string[]>;

export const userXAxis: AxisModel = { valueType: "Category", title: "Day" };
export const useryAxis: AxisModel = {
  minimum: 0,
  maximum: 10,
  interval: 2,
  title: "Count",
};

export const tripXAxis: AxisModel = {
  valueType: "Category",
  title: "Travel Styles",
  majorGridLines: { width: 0 },
};

export const tripyAxis: AxisModel = {
  minimum: 0,
  maximum: 10,
  interval: 2,
  title: "Count",
};

export const CONFETTI_SETTINGS = {
  particleCount: 200, // Number of confetti pieces
  spread: 60, // Spread of the confetti burst
  colors: ["#ff0", "#ff7f00", "#ff0044", "#4c94f4", "#f4f4f4"], // Confetti colors
  decay: 0.95, // Gravity decay of the confetti
};

export const LEFT_CONFETTI = {
  ...CONFETTI_SETTINGS,
  angle: 45, // Direction of the confetti burst (90 degrees is top)
  origin: { x: 0, y: 1 }, // Center of the screen
};

export const RIGHT_CONFETTI = {
  ...CONFETTI_SETTINGS,
  angle: 135,
  origin: { x: 1, y: 1 },
};

export const user = { name: 'Adrian' };
export const dashboardStats = {
  totalUsers: 12450,
  usersJoined: { currentMonth: 218, lastMonth: 176 },
  totalTrips: 3210,
  tripsCreated: { currentMonth: 150, lastMonth: 250 },
  userRole: { total: 62, currentMonth: 25, lastMonth: 15 },
}

export const allTrips = [
  {
    id: 1,
    name: "Taj Mahal Escape",
    imageUrls: ["/assets/images/card-img-2.png"],
    itinerary: [{ location: "Agra, Uttar Pradesh" }],
    tags: ["Heritage", "Culture"],
    travelStyle: "Couple",
    estimatedPrice: "$500",
  },
  {
    id: 2,
    name: "Spiritual Varanasi",
    imageUrls: ["/assets/images/1.jpg"],
    itinerary: [{ location: "Varanasi, Uttar Pradesh" }],
    tags: ["Spiritual", "Culture"],
    travelStyle: "Solo",
    estimatedPrice: "$400",
  },
  {
    id: 3,
    name: "Royal Jaipur Journey",
    imageUrls: ["/assets/images/2.jpg"],
    itinerary: [{ location: "Jaipur, Rajasthan" }],
    tags: ["Heritage", "Adventure"],
    travelStyle: "Family",
    estimatedPrice: "$600",
  },
  {
    id: 4,
    name: "Mumbai City Escape",
    imageUrls: ["/assets/images/3.jpg"],
    itinerary: [{ location: "Mumbai, Maharashtra" }],
    tags: ["City Life", "Shopping"],
    travelStyle: "Friends",
    estimatedPrice: "$700",
  },
  {
    id: 5,
    name: "Kerala Backwater Retreat",
    imageUrls: ["/assets/images/4.jpg"],
    itinerary: [{ location: "Alleppey, Kerala" }],
    tags: ["Nature", "Relaxation"],
    travelStyle: "Couple",
    estimatedPrice: "$900",
  },
  {
    id: 6,
    name: "Goa Beach Paradise",
    imageUrls: ["/assets/images/5.jpg"],
    itinerary: [{ location: "Goa, India" }],
    tags: ["Beach", "Adventure"],
    travelStyle: "Friends",
    estimatedPrice: "$800",
  },
  {
    id: 7,
    name: "Udaipur Royal Getaway",
    imageUrls: ["/assets/images/6.jpg"],
    itinerary: [{ location: "Udaipur, Rajasthan" }],
    tags: ["Luxury", "Heritage"],
    travelStyle: "Couple",
    estimatedPrice: "$1,000",
  },
  {
    id: 8,
    name: "Golden Temple Visit",
    imageUrls: ["/assets/images/7.jpg"],
    itinerary: [{ location: "Amritsar, Punjab" }],
    tags: ["Spiritual", "Culture"],
    travelStyle: "Family",
    estimatedPrice: "$350",
  },
  {
    id: 9,
    name: "Manali Mountain Adventure",
    imageUrls: ["/assets/images/8.jpg"],
    itinerary: [{ location: "Manali, Himachal Pradesh" }],
    tags: ["Adventure", "Nature"],
    travelStyle: "Friends",
    estimatedPrice: "$750",
  },
  {
    id: 10,
    name: "Rishikesh River Retreat",
    imageUrls: ["/assets/images/9.jpg"],
    itinerary: [{ location: "Rishikesh, Uttarakhand" }],
    tags: ["Adventure", "Spiritual"],
    travelStyle: "Solo",
    estimatedPrice: "$450",
  },
  {
    id: 11,
    name: "Kashmir Paradise",
    imageUrls: ["/assets/images/10.jpg"],
    itinerary: [{ location: "Srinagar, Jammu and Kashmir" }],
    tags: ["Nature", "Relaxation"],
    travelStyle: "Couple",
    estimatedPrice: "$1,100",
  },
  {
    id: 12,
    name: "Darjeeling Hill Escape",
    imageUrls: ["/assets/images/11.jpg"],
    itinerary: [{ location: "Darjeeling, West Bengal" }],
    tags: ["Mountains", "Nature"],
    travelStyle: "Family",
    estimatedPrice: "$650",
  },
  {
    id: 13,
    name: "Mysore Heritage Tour",
    imageUrls: ["/assets/images/12.jpg"],
    itinerary: [{ location: "Mysore, Karnataka" }],
    tags: ["Heritage", "Culture"],
    travelStyle: "Family",
    estimatedPrice: "$500",
  },
  {
    id: 14,
    name: "Andaman Island Escape",
    imageUrls: ["/assets/images/13.jpg"],
    itinerary: [{ location: "Port Blair, Andaman and Nicobar Islands" }],
    tags: ["Beach", "Adventure"],
    travelStyle: "Couple",
    estimatedPrice: "$1,200",
  },
  {
    id: 15,
    name: "Meghalaya Nature Retreat",
    imageUrls: ["/assets/images/14.jpg"],
    itinerary: [{ location: "Shillong, Meghalaya" }],
    tags: ["Nature", "Adventure"],
    travelStyle: "Friends",
    estimatedPrice: "$850",
  },
  {
    id: 16,
    name: "Khajuraho Temple Tour",
    imageUrls: ["/assets/images/15.jpg"],
    itinerary: [{ location: "Khajuraho, Madhya Pradesh" }],
    tags: ["Historical", "Culture"],
    travelStyle: "Solo",
    estimatedPrice: "$550",
  },
];

export const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-01"),
    itineraryCreated: 10,
    status: "user",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-02"),
    itineraryCreated: 4,
    status: "user",
  },
  {
    id: 3,
    name: "John Smith",
    email: "john.smith@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-03"),
    itineraryCreated: 8,
    status: "admin",
  },
];