import React, { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";
import "./assets/dark-theme.css";
import "./assets/modern-animations.css";
import "./assets/chatwoot-layout.css";

import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

const App = () => {
  const [locale, setLocale] = useState();

  const theme = createTheme(
    {
      palette: {
        primary: {
          main: "#6366f1",
          light: "#8b5cf6",
          dark: "#4f46e5",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#10b981",
          light: "#34d399",
          dark: "#059669",
          contrastText: "#ffffff",
        },
        error: {
          main: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        warning: {
          main: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        info: {
          main: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
        },
        success: {
          main: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
          fontSize: "2.5rem",
        },
        h2: {
          fontWeight: 600,
          fontSize: "2rem",
        },
        h3: {
          fontWeight: 600,
          fontSize: "1.75rem",
        },
        h4: {
          fontWeight: 600,
          fontSize: "1.5rem",
        },
        h5: {
          fontWeight: 500,
          fontSize: "1.25rem",
        },
        h6: {
          fontWeight: 500,
          fontSize: "1rem",
        },
      },
      shape: {
        borderRadius: 12,
      },
      spacing: 8,
    },
    locale
  );

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale =
      i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Routes />
    </ThemeProvider>
  );
};

export default App;
