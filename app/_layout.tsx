import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { ContentProvider } from "@/context/ContentContext";
import { FlashcardProvider } from "@/context/FlashcardContext";
import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ContentProvider>
        <FlashcardProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="flashcard/create"
              options={{ title: "Créer une flashcard" }}
            />
            <Stack.Screen
              name="flashcard/edit/[id]"
              options={{ title: "Modifier une flashcard" }}
            />
            <Stack.Screen
              name="flashcard/review"
              options={{ title: "Réviser" }}
            />
            <Stack.Screen
              name="capture"
              options={{ title: "Capturer des Notes", presentation: "modal" }}
            />
            <Stack.Screen
              name="content/[id]"
              options={{ title: "Détails du Contenu" }}
            />
            <Stack.Screen name="search" options={{ title: "Rechercher" }} />
          </Stack>
          <StatusBar style="auto" />
        </FlashcardProvider>
      </ContentProvider>
    </ThemeProvider>
  );
}
