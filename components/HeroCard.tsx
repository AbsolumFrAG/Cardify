import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface HeroCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  imageSource: ImageSourcePropType;
}

const { width } = Dimensions.get("window");

export function HeroCard({
  title,
  description,
  actionLabel,
  onAction,
  imageSource,
}: HeroCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={isDark ? ["#1D3D47", "#0a7ea4"] : ["#e1f5fe", "#81d4fa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.textContainer}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.description}>{description}</ThemedText>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAction}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.actionButtonText}>
                {actionLabel}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        </ThemedView>
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
  },
  textContainer: {
    flex: 3,
    paddingRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    color: "#fff",
    opacity: 0.9,
  },
  actionButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
    fontSize: 14,
  },
  image: {
    flex: 2,
    height: 120,
    width: width * 0.25,
    marginLeft: "auto",
  },
});
