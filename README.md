# TravelSphere

**Plan smarter. Travel further.**

TravelSphere is a travel website for India with a built-in admin panel. Visitors can browse trips, plan an itinerary with an AI trip planner and send a booking request without creating an account. Admins sign in with Google to manage trips, bookings and users, and to follow revenue and profit in live analytics.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Getting started](#getting-started)
- [Appwrite setup](#appwrite-setup)
- [Environment variables](#environment-variables)
- [Sample data](#sample-data)
- [Scripts](#scripts)
- [Docker](#docker)
- [Project structure](#project-structure)
- [Customising](#customising)
- [Security notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

## Features

### Public website

No sign-in is needed.

- **Landing page** with a hero, featured destinations across India, travel deals, reasons to choose TravelSphere, an FAQ and a footer with contact details.
- **Explore trips** at `/travel`: search by place or interest, filter by group type and page through the results.
- **Trip pages** with a day-by-day itinerary, weather and best time to visit, a price estimate and a map that highlights the destination.
- **Online booking requests**: visitors enter their name, phone number, travel date and number of travellers. The request is saved as *Pending* until an admin confirms it. There is no payment step.
- **AI Trip Planner** at `/plan`: choose a state or union territory, travel style, interests, budget, group type and trip length to get a full itinerary. It uses Google Gemini when a key is set and falls back to a built-in planner otherwise. Plans are not saved.

### Admin panel

Only accounts with the `admin` role can open it.

- **Dashboard**: key numbers and charts for bookings, new trips, budget mix, group types, top interests and popular states.
- **Analytics**: a date-range selector with charts for bookings over time, booking status, travellers by month, group sizes, most booked trips and estimated profit by trip, travel style and state.
- **Trips**: search all trips, create one with AI, edit every detail (itinerary, season, price, interests, cover image) or delete it.
- **Bookings**: confirm, cancel or delete requests, and add bookings you take by phone.
- **Users**: make or remove admins, delete accounts and follow a short guide for adding a new admin.
- **Account**: your profile and sign-out.

### Built in

- Responsive layout for phones, tablets and desktops.
- Loading indicator between pages.
- Consistent charts, cards and tables built with Syncfusion components.
- Rate limiting and a hidden spam trap on the public booking and planner forms.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | React Router 8 (framework mode, server-side rendering) |
| Language | TypeScript, React 19 |
| UI components | Syncfusion (Grid, Charts, Maps, Pager, DropDowns, Buttons, Navigations) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide |
| Backend and auth | Appwrite (database and Google sign-in) |
| AI | Google Gemini, optional |
| Deployment | Docker, a `Dockerfile` is included |

## How it works

The project has two sides that share one codebase.

**The public website** shows sample trips that live in `app/constants/dummyTrips.ts`, so it works immediately and never needs a visitor to sign in. Booking requests and AI plans go through small server routes.

**The admin panel** reads and writes real data in Appwrite. Every sensitive action, such as listing bookings, deleting a user or changing a role, runs on the server through `/api/admin`. That route checks the caller's session, confirms they are an admin and only then uses the server API key. The key never reaches the browser.

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/travel`, `/travel/:tripId` | Trip list and trip details with booking form |
| `/plan` | AI Trip Planner |
| `/sign-in` | Admin sign-in with Google |
| `/dashboard`, `/analytics` | Admin overview and analytics |
| `/trips`, `/trips/create`, `/trips/:tripId`, `/trips/:tripId/edit` | Admin trip management |
| `/bookings`, `/all-users`, `/account` | Admin bookings, users and profile |
| `/api/book`, `/api/plan-trip` | Public server routes (rate limited) |
| `/api/create-trip`, `/api/admin` | Admin-only server routes |

## Getting started

### Prerequisites

- Node.js **22.22 or newer** (the Docker image uses Node 24)
- npm
- An [Appwrite](https://appwrite.io/) project (Cloud or self-hosted)
- A Syncfusion license key. The community license is free.
- Optional: a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Install and run

```bash
# 1. Clone the repository
git clone https://github.com/jasmeeeetsingh17/TravelSphere.git
cd TravelSphere

# 2. Install dependencies
npm install

# 3. Create your environment file and fill in the values
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

The app opens at `http://localhost:5173`. The public website works as soon as the server starts. The admin panel needs the Appwrite setup below.

## Appwrite setup

1. **Create a project and a database**, then copy the project ID and database ID into `.env.local`.
2. **Add a Web platform** for `localhost` (and for your real domain when you deploy) so sign-in is allowed.
3. **Enable Google sign-in** under Auth, Settings, OAuth2 providers.
4. **Create a users collection** with these attributes:

   | Attribute | Type |
   | --- | --- |
   | `accountId`, `name`, `email`, `imageUrl`, `joinedAt` | string |
   | `status` | string (`user` or `admin`) |

5. **Create a trips collection** with these attributes:

   | Attribute | Type | Notes |
   | --- | --- | --- |
   | `tripDetail` | string, size 20000 | The whole trip stored as JSON |
   | `imageUrls` | string array | Image paths |
   | `userId` | string | Account ID of the creator |
   | `createdAt` | string | ISO date |

6. **Set collection permissions.** Give the role **Users** the Create and Read permissions on both collections. Updates, deletes, role changes and everything to do with bookings go through the server and use the API key instead.
7. **Create a server API key** under Overview, Integrations, API keys, with the scopes `databases.read`, `documents.read`, `documents.write` and `users.write`. To let the app create the bookings collection for you, also add `collections.write` and `attributes.write`.
8. **Create the bookings collection.** Open **Bookings** in the admin panel and press **Set up bookings**. It creates a private collection that only the server can read. To do it by hand, create a collection with the ID `bookings` and add the fields listed in `app/lib/booking-schema.ts`.

### Becoming the first admin

The first admin has to be set by hand. Sign in once with Google at `/sign-in` (you will be told you are not an admin), then open the users collection in the Appwrite console and set `status` to `admin` on your document. From then on, admins can give or remove access for other people on the **Users** page.

## Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`; it is listed in `.gitignore`.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SYNCFUSION_LICENSE_KEY` | Yes | Syncfusion license key |
| `VITE_APPWRITE_API_ENDPOINT` | Yes | Appwrite endpoint, for example `https://cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Yes | Appwrite project ID |
| `VITE_APPWRITE_DATABASE_ID` | Yes | Database that holds the collections |
| `VITE_APPWRITE_USERS_COLLECTION_ID` | Yes | Users collection ID |
| `VITE_APPWRITE_TRIPS_COLLECTION_ID` | Yes | Trips collection ID |
| `VITE_APPWRITE_BOOKINGS_COLLECTION_ID` | No | Bookings collection ID. Defaults to `bookings` |
| `APPWRITE_API_KEY` | Yes | **Server only.** Used by the admin and booking routes |
| `GEMINI_API_KEY` | No | **Server only.** Enables real AI itineraries. Without it, trips are built from a template |
| `GEMINI_MODEL` | No | Gemini model name. Defaults to `gemini-2.5-flash` |

Variables that start with `VITE_` are included in the browser bundle, so they must never hold secrets. `APPWRITE_API_KEY` and `GEMINI_API_KEY` have no prefix and are only read on the server.

## Sample data

To fill the admin panel with something to look at, run:

```bash
npm run seed              # adds 18 Indian trips and about 64 bookings
npm run seed -- --remove  # deletes the sample data again
```

The script needs `APPWRITE_API_KEY` and the Appwrite IDs in `.env.local`. It is safe to run twice: trips with the same name and bookings that already exist are skipped. Sample bookings use phone numbers that start with `90000` and `@example.com` emails, so they are easy to recognise.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Generate route types and run the TypeScript compiler |
| `npm run seed` | Add or remove sample data in Appwrite |

## Docker

```bash
docker build -t travelsphere .
docker run -p 3000:3000 \
  -e APPWRITE_API_KEY=your_key \
  -e GEMINI_API_KEY=your_key \
  travelsphere
```

The `VITE_` values are read from `.env.local` while the image is built, so create that file before running `docker build`. The two server secrets are passed when the container starts and are not stored in the image. The app is then available at `http://localhost:3000`.

## Project structure

```
TravelSphere/
├── app/
│   ├── appwrite/        Browser-side Appwrite calls (auth, trips, users, admin requests)
│   ├── constants/       Dropdown options, Indian states, map data, sample trips
│   ├── lib/             Shared helpers, trip generator, profit estimates, stats,
│   │                    chart theme, and server-only code (*.server.ts)
│   ├── routes/
│   │   ├── root/        Public website and sign-in
│   │   ├── admin/       Admin panel pages
│   │   └── api/         Server routes (booking, planner, admin actions)
│   ├── root.tsx
│   └── routes.ts        Route configuration
├── components/          Reusable UI such as TripCard, TripDetail, BookTrip,
│                        ChartCard, KpiCard, Modal and Spinner
├── public/assets/       Icons and images
├── scripts/             Sample data script
├── Dockerfile
└── .env.example
```

## Customising

- **Contact details** on the landing page and footer are placeholders. Change `CONTACT` in `components/LandingSections.tsx`.
- **Profit margins** are estimates, because trips do not store their real costs. Edit the margin for each budget level in `app/lib/profit.ts` and every analytics chart follows.
- **Sample trips** for the public site are in `app/constants/dummyTrips.ts`.
- **Dropdown options** such as travel styles, interests and budgets are in `app/constants/index.ts`.

## Security notes

- Only the server holds the Appwrite API key. Admin actions check the caller's session and role before doing anything.
- Booking details are stored in a collection with no browser permissions, so customer names and phone numbers can only be read through the server.
- The booking and planner forms are limited per visitor and include a hidden field that bots tend to fill in. The limiter keeps its counts in memory, which is enough for a single server and resets when the server restarts. Use a shared store if you run several instances.
- Anyone who signs in with a non-admin Google account is signed out and shown a message.

## Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Describe your change"`.
4. Push the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Please run `npm run typecheck` before you open a pull request.

## License

Released under the MIT License.

## Author

**Jasmeet Singh** ([@jasmeeeetsingh17](https://github.com/jasmeeeetsingh17))

## Acknowledgements

Built with [React Router](https://reactrouter.com/), [Appwrite](https://appwrite.io/), [Syncfusion](https://www.syncfusion.com/), [Tailwind CSS](https://tailwindcss.com/), [Lucide](https://lucide.dev/) and [Google Gemini](https://ai.google.dev/).
