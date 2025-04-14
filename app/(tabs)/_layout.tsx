import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useTheme } from "@/context/ThemeContext";

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const tabOpacity = useSharedValue(0);

  // Animation d'entrée pour la barre d'onglets
  useEffect(() => {
    tabOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  // Style animé pour la barre d'onglets
  const tabBarStyle = useAnimatedStyle(() => ({
    opacity: tabOpacity.value,
    transform: [
      { translateY: withTiming(tabOpacity.value * 0, { duration: 300 }) },
    ],
  }));

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        headerStyle: {
          backgroundColor: isDark
            ? colors.backgroundSecondary
            : colors.background,
        },
        headerTitleStyle: {
          fontFamily: "PoppinsSemiBold",
          fontSize: 17,
        },
        headerTintColor: colors.text,
        tabBarLabelStyle: {
          fontFamily: "Poppins",
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarStyle: [
          {
            position: "absolute",
            borderTopColor: colors.border,
            height: 60,
            backgroundColor: isDark
              ? "rgba(30, 32, 33, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
              },
              android: {
                elevation: 8,
              },
            }),
          },
          tabBarStyle,
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View
              style={[
                styles.iconContainer,
                focused && styles.activeIconContainer,
              ]}
            >
              <IconSymbol size={24} name="house.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: "Flashcards",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View
              style={[
                styles.iconContainer,
                focused && styles.activeIconContainer,
              ]}
            >
              <IconSymbol size={24} name="square.stack.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 8,
    borderRadius: 16,
  },
  activeIconContainer: {
    backgroundColor: "rgba(0, 153, 255, 0.1)",
  },
});
