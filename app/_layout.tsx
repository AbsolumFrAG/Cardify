import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { ContentProvider } from "@/context/ContentContext";
import { FlashcardProvider } from "@/context/FlashcardContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
    PoppinsSemiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("@/assets/fonts/Poppins-Bold.ttf"),
    PoppinsMedium: require("@/assets/fonts/Poppins-Medium.ttf"),
    PoppinsLight: require("@/assets/fonts/Poppins-Light.ttf"),
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
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <NavigationThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ContentProvider>
            <FlashcardProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade_from_bottom",
                  contentStyle: { backgroundColor: "transparent" },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="flashcard/create"
                  options={{
                    title: "Créer une flashcard",
                    presentation: "card",
                    animation: "slide_from_right",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="flashcard/edit/[id]"
                  options={{
                    title: "Modifier une flashcard",
                    presentation: "card",
                    animation: "slide_from_right",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="flashcard/review"
                  options={{
                    title: "Réviser",
                    presentation: "fullScreenModal",
                    animation: "fade",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="capture"
                  options={{
                    title: "Capturer des Notes",
                    presentation: "fullScreenModal",
                    animation: "fade",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="content/[id]"
                  options={{
                    title: "Détails du Contenu",
                    presentation: "card",
                    animation: "slide_from_right",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="search"
                  options={{
                    title: "Rechercher",
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: true,
                  }}
                />
              </Stack>
              <StatusBar style="auto" />
            </FlashcardProvider>
          </ContentProvider>
        </NavigationThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
