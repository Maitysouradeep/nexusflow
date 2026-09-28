import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);

  if (!context) {
    throw new Error(
      "useDarkMode must be used within DarkModeProvider"
    );
  }

  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      return savedTheme;
    }

    // Backward compatibility with your old setting
    const oldDarkMode = localStorage.getItem("darkMode");

    if (oldDarkMode !== null) {
      return JSON.parse(oldDarkMode) ? "dark" : "light";
    }

    return "system";
  });

  const [systemIsDark, setSystemIsDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen for changes to the user's operating-system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemThemeChange = (event) => {
      setSystemIsDark(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, []);

  // Apply the selected theme
  useEffect(() => {
    const shouldUseDark =
      theme === "dark" ||
      (theme === "system" && systemIsDark);

    document.documentElement.classList.toggle(
      "dark",
      shouldUseDark
    );

    document.documentElement.style.colorScheme = shouldUseDark
      ? "dark"
      : "light";

    localStorage.setItem("theme", theme);
  }, [theme, systemIsDark]);

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" && systemIsDark);

  const toggleDarkMode = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  return (
    <DarkModeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};