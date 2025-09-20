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
          primary: { main: "#2576d2" },
          ...(darkMode
            ? {
                // Tema escuro
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                  chat: "#0d1117",
                  messageInput: "#21262d",
                  messageInputWrapper: "#30363d",
                  ownMessage: "#1f2937",
                  otherMessage: "#374151",
                  quickAnswers: "#21262d",
                },
                text: {
                  primary: "#e6e6e6",
                  secondary: "#a8a8a8",
                  messageInput: "#ffffff",
                  ownMessage: "#ffffff",
                  otherMessage: "#ffffff",
                },
                divider: "#30363d",
                action: {
                  active: "#e6e6e6",
                  hover: "rgba(255, 255, 255, 0.08)",
                },
              }
            : {
                // Tema claro
                background: {
                  default: "#fafafa",
                  paper: "#ffffff",
                  chat: "#eee",
                  messageInput: "#eee",
                  messageInputWrapper: "#fff",
                  ownMessage: "#dcf8c6",
                  otherMessage: "#ffffff",
                  quickAnswers: "#ffffff",
                },
                text: {
                  primary: "#333333",
                  secondary: "#666666",
                  messageInput: "#000000",
                  ownMessage: "#303030",
                  otherMessage: "#303030",
                },
              }),
        },
        scrollbarStyles: {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
            backgroundColor: darkMode ? "#484848" : "#e8e8e8",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: darkMode ? "#2d2d2d" : "#f1f1f1",
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
