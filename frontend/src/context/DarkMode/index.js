import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import {
  createMuiTheme,
  ThemeProvider as MUIThemeProvider,
} from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import "../../assets/dark-theme.css";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const toggleTheme = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode.toString());
      return newMode;
    });
  };

  // Aplicar atributo data-theme no body
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    return () => {
      document.body.removeAttribute("data-theme");
    };
  }, [darkMode]);

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: darkMode ? "dark" : "light",
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
          ...(darkMode
            ? {
                // Tema escuro
                background: {
                  default: "#111827",
                  paper: "#1f2937",
                  chat: "#0f172a",
                  messageInput: "#374151",
                  messageInputWrapper: "#4b5563",
                  ownMessage: "#1e293b",
                  otherMessage: "#334155",
                  quickAnswers: "#374151",
                },
                text: {
                  primary: "#f9fafb",
                  secondary: "#d1d5db",
                  messageInput: "#ffffff",
                  ownMessage: "#ffffff",
                  otherMessage: "#ffffff",
                },
                divider: "#4b5563",
                action: {
                  active: "#f9fafb",
                  hover: "rgba(99, 102, 241, 0.08)",
                },
              }
            : {
                // Tema claro
                background: {
                  default: "#f9fafb",
                  paper: "#ffffff",
                  chat: "#f3f4f6",
                  messageInput: "#f3f4f6",
                  messageInputWrapper: "#ffffff",
                  ownMessage: "#ddd6fe",
                  otherMessage: "#ffffff",
                  quickAnswers: "#ffffff",
                },
                text: {
                  primary: "#1f2937",
                  secondary: "#6b7280",
                  messageInput: "#1f2937",
                  ownMessage: "#1f2937",
                  otherMessage: "#1f2937",
                },
                divider: "#e5e7eb",
              }),
        },
        scrollbarStyles: {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
            backgroundColor: darkMode ? "#4b5563" : "#d1d5db",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
            borderRadius: "6px",
          },
        },
      }),
    [darkMode]
  );

  const contextValue = useMemo(() => ({ darkMode, toggleTheme }), [darkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useThemeContext = () => useContext(ThemeContext);
