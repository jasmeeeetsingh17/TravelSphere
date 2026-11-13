/** All 28 states and 8 union territories of India, used by the create-trip form. */
export const indianStates: string[] = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

/** A matching picture for states we have artwork for. Others get a generic India picture. */
export const STATE_IMAGES: Record<string, string> = {
    Rajasthan: "/assets/images/2.jpg",
    Kerala: "/assets/images/4.jpg",
    Goa: "/assets/images/5.jpg",
    "Jammu and Kashmir": "/assets/images/10.jpg",
    Punjab: "/assets/images/7.jpg",
    "Uttar Pradesh": "/assets/images/card-img-2.png",
    Maharashtra: "/assets/images/3.jpg",
    "Himachal Pradesh": "/assets/images/8.jpg",
    Sikkim: "/assets/images/8.jpg",
    "Andaman and Nicobar Islands": "/assets/images/13.jpg",
    Meghalaya: "/assets/images/14.jpg",
    Ladakh: "/assets/images/hero-img1.jpg",
    Uttarakhand: "/assets/images/9.jpg",
    "West Bengal": "/assets/images/11.jpg",
    Karnataka: "/assets/images/12.jpg",
    "Madhya Pradesh": "/assets/images/15.jpg",
};
