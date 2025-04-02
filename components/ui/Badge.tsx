import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "../ThemedText";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "error" | "info";
  size?: "small" | "medium";
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = "primary",
  size = "medium",
  style,
}: BadgeProps) {
  const primary = useThemeColor({}, "primary") as string;
  const success = useThemeColor({}, "success") as string;
  const warning = useThemeColor({}, "warning") as string;
  const error = useThemeColor({}, "error") as string;
  const background = useThemeColor({}, "backgroundSecondary") as string;

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return primary;
      case "success":
        return success;
      case "warning":
        return warning;
      case "error":
        return error;
      case "info":
        return background;
      default:
        return primary;
    }
  };

  const getTextColor = () => {
    if (variant === "info") {
      return useThemeColor({}, "text") as string;
    }
    return "#ffffff";
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
        size === "small" ? styles.badgeSmall : styles.badgeMedium,
        style,
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          { color: getTextColor() },
          size === "small" ? styles.textSmall : styles.textMedium,
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontFamily: "PoppinsSemiBold",
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
});
