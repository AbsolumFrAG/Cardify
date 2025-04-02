import { Colors } from "@/constants/Colors";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

// Types pour le contexte de thème
type ThemeType = "light" | "dark";
type ThemeContextType = {
  theme: ThemeType;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
};

// Création du contexte
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider du thème pour l'application
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Récupérer le thème système
  const deviceTheme = useDeviceColorScheme();
  const [theme, setThemeState] = useState<ThemeType>(deviceTheme || "light");

  // Mettre à jour le thème si le thème du système change
  useEffect(() => {
    if (deviceTheme) {
      setThemeState(deviceTheme);
    }
  }, [deviceTheme]);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  };

  // Fonction pour définir un thème spécifique
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  // Vérifier si le thème actuel est sombre
  const isDark = theme === "dark";

  // Obtenir les couleurs du thème actuel
  const colors = theme === "dark" ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider
      value={{ theme, colors, toggleTheme, setTheme, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook pour utiliser le thème dans les composants
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
