import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_* vars to import.meta.env. Server-only secrets
  // (APPWRITE_API_KEY, GEMINI_API_KEY) are read from process.env by the API
  // routes, so copy every .env / .env.local value into process.env for dev and build.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: [/@syncfusion/],
    },
  };
});
