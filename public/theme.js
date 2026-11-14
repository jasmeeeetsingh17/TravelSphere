// Applies the saved light/dark theme before the page paints, so a dark page never flashes white.
try {
  var t = localStorage.getItem("ts-theme");
  if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.classList.add("dark");
} catch (e) {}
