import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "heading"
    | "subheading"
    | "defaultSemiBold"
    | "subtitle"
    | "caption"
    | "button"
    | "link";
  opacity?: number;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  opacity = 1,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color: color as string, opacity },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "heading" ? styles.heading : undefined,
        type === "subheading" ? styles.subheading : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "caption" ? styles.caption : undefined,
        type === "button" ? styles.button : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Poppins",
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    fontFamily: "PoppinsSemiBold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
    fontFamily: "PoppinsBold",
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    fontFamily: "PoppinsBold",
  },
  subheading: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    fontFamily: "PoppinsSemiBold",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 24,
    fontFamily: "PoppinsSemiBold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins",
    opacity: 0.7,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    fontFamily: "PoppinsSemiBold",
    textAlign: "center",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Poppins",
    color: "#0a7ea4",
    textDecorationLine: "underline",
  },
});
