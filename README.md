<div align="center">

# 🌍 TravelSphere

**Plan smarter. Travel further.**
A modern travel platform with a public landing page, curated trips, an AI trip assistant, and an admin dashboard to manage it all.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Syncfusion](https://img.shields.io/badge/UI-Syncfusion-F37021)
![License](https://img.shields.io/badge/license-MIT-green)


</div>

---

## 📖 About

TravelSphere is a travel web app where visitors can explore featured destinations and handpicked trips, and signed-in users get access to a dashboard for managing travel content. The UI is kept clean and simple, built with Syncfusion components wherever possible, and inspired by the Tourvisto design.

## ✨ Features

- 🏠 **Public landing page**: hero section, featured destinations and handpicked trips
- 🔐 **Authentication**: sign in to unlock the dashboard (a **Dashboard** button appears in the navbar for signed-in users)
- 📊 **Admin dashboard**: manage trips, destinations and users in one place
- 🤖 **AI mode**: a slide-up/slide-down popup assistant for trip ideas and planning
- 🎨 **Consistent UI**: landing page styled to match the dashboard
- 📱 **Responsive design**: works across mobile, tablet and desktop
- 🌙 **Clean footer** with social links and quick navigation

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| Frontend | React, TypeScript |
| UI Components | Syncfusion |
| Icons | lucide-react |
| Styling | Tailwind CSS  |
| Backend / Auth |  Appwrite |
| AI | Google Gemini (optional) |
| Deployment | Docker (`Dockerfile` included) |

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm or yarn
- A Syncfusion license key (the community license is free)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jasmeeeetsingh17/TravelSphere.git

# 2. Move into the project folder
cd TravelSphere

# 3. Install dependencies
npm install

# 4. Set up environment variables (see below)
cp .env.example .env.local

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Where it is used |
| --- | --- |
| `VITE_SYNCFUSION_LICENSE_KEY` | Syncfusion UI components |
| `VITE_APPWRITE_API_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID` | Appwrite client |
| `VITE_APPWRITE_DATABASE_ID` | Database holding the collections below |
| `VITE_APPWRITE_USERS_COLLECTION_ID` | User profiles (`accountId`, `name`, `email`, `imageUrl`, `joinedAt`, `status`) |
| `VITE_APPWRITE_TRIPS_COLLECTION_ID` | Saved trips (`tripDetail`, `imageUrls`, `userId`, `createdAt`) |
| `VITE_APPWRITE_BOOKINGS_COLLECTION_ID` | Bookings (see `app/appwrite/bookings.ts` for attributes) |
| `APPWRITE_API_KEY` | **Server only.** Admin actions: list bookings, change status, delete users |
| `GEMINI_API_KEY` | **Server only, optional.** AI itineraries; falls back to a template without it |

> ⚠️ Never commit your `.env.local` file. It is listed in `.gitignore`.

### Making yourself an admin

Sign in once with Google, then in the Appwrite console open the users collection and set your document's `status` to `admin`. The **Dashboard** button then appears in the navbar.

## 📂 Project Structure

```
TravelSphere/
├── app/
│   ├── appwrite/      # Browser-side Appwrite calls (auth, trips, bookings, users)
│   ├── constants/     # Dropdown options, states, map data
│   ├── lib/           # Shared helpers, trip generator, server-only Appwrite client
│   ├── routes/
│   │   ├── root/      # Public site: landing, trips, trip detail, plan, account, sign-in
│   │   ├── admin/     # Dashboard, analytics, users, trips, bookings
│   │   └── api/       # Server routes: create-trip (AI), admin actions
│   ├── root.tsx
│   └── routes.ts
├── components/        # Reusable UI (TripCard, TripDetail, AiAssistant, BookTrip...)
├── public/assets/     # Icons and images
├── .env.example
└── package.json
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👤 Author

**Jasmeet Singh**

- GitHub: [@jasmeeeetsingh17](https://github.com/jasmeeeetsingh17)


## 🙏 Acknowledgements

- [Syncfusion](https://www.syncfusion.com/) for UI components
- [Lucide](https://lucide.dev/) for icons
- Tourvisto, for the design inspiration

---

<div align="center">

⭐ If you like this project, give it a star!

</div>
