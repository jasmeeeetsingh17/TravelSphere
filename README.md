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
| AI | <!-- e.g. Gemini API --> |
| Deployment | <!-- e.g. Vercel --> |

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
cp .env.example .env

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SYNCFUSION_LICENSE_KEY=your_syncfusion_license_key

# Add the keys your project uses, for example:
# VITE_API_URL=
# VITE_AUTH_PROJECT_ID=
# VITE_AI_API_KEY=
```

> ⚠️ Never commit your `.env` file. Make sure it is listed in `.gitignore`.

## 📂 Project Structure

```
TravelSphere/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components (Navbar, Footer, Cards...)
│   ├── pages/         # Landing page, dashboard, auth pages
│   ├── assets/        # Images and icons
│   └── ...
├── .env.example
├── package.json
└── README.md
```

> Adjust this tree to match your actual folders.


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
