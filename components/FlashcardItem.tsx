import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { Flashcard } from "@/types/flashcard";
import { formatRelativeDate } from "@/utils/dateUtils";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface FlashcardItemProps {
  flashcard: Flashcard;
  onEdit: () => void;
  onDelete: () => void;
}

export function FlashcardItem({
  flashcard,
  onEdit,
  onDelete,
}: FlashcardItemProps) {
  const { colors, isDark } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(isDark ? 5 : 3);

  // Enhanced entry animation
  useEffect(() => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 10 }),
      withTiming(1, {
        duration: 500,
        easing: Easing.elastic(1.1),
      })
    );
  }, []);

  // Enhanced flip animation with better timing
  const flipCard = () => {
    const newValue = isFlipped ? 0 : 1;

    // Increase elevation during flip for better 3D effect
    elevation.value = withSequence(
      withTiming(isDark ? 8 : 6, { duration: 150 }),
      withTiming(isDark ? 5 : 3, {
        duration: 150,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      })
    );

    // Smoother rotation animation
    rotate.value = withTiming(newValue, {
      duration: 600,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });

    setIsFlipped(!isFlipped);
  };

  // Enhanced front card animation
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [0, 180]);
    const zIndex = rotate.value > 0.5 ? -1 : 1;
    const shadowOpacity = interpolate(rotate.value, [0, 0.5], [0.15, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateValue}deg` },
        { scale: scale.value },
      ],
      opacity: rotate.value > 0.5 ? 0 : 1,
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      zIndex,

      // Enhanced shadows for better depth
      shadowColor: isDark ? "#000" : "rgba(0,0,0,0.4)",
      shadowOffset: { width: 0, height: isDark ? 3 : 2 },
      shadowOpacity,
      shadowRadius: elevation.value,
      elevation: elevation.value,
    };
  });

  // Enhanced back card animation
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [180, 360]);
    const zIndex = rotate.value < 0.5 ? -1 : 1;
    const shadowOpacity = interpolate(rotate.value, [0.5, 1], [0, 0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateValue}deg` },
        { scale: scale.value },
      ],
      opacity: rotate.value < 0.5 ? 0 : 1,
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      zIndex,

      // Enhanced shadows for better depth
      shadowColor: isDark ? "#000" : "rgba(0,0,0,0.4)",
      shadowOffset: { width: 0, height: isDark ? 3 : 2 },
      shadowOpacity,
      shadowRadius: elevation.value,
      elevation: elevation.value,
    };
  });

  // Get the box color for visual indication
  const boxColor =
    colors.boxColors[flashcard.boxLevel as keyof typeof colors.boxColors];

  // Check if card needs review
  const isDue = flashcard.nextReviewDate <= new Date();

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <AnimatedTouchableOpacity
          activeOpacity={0.95}
          onPress={flipCard}
          style={{ width: "100%", height: 190 }}
        >
          {/* Front of card */}
          <Animated.View style={[styles.cardSide, frontAnimatedStyle]}>
            <Card variant={isDark ? "default" : "elevated"} style={styles.card}>
              <LinearGradient
                colors={
                  isDark ? ["#1d2529", "#293238"] : ["#ffffff", "#f9f9f9"]
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.boxIndicator,
                        { backgroundColor: boxColor },
                      ]}
                    >
                      <ThemedText style={styles.boxText}>
                        Boîte {flashcard.boxLevel}
                      </ThemedText>
                    </View>
                    {isDue && (
                      <View style={styles.dueIndicator}>
                        <IconSymbol
                          name="exclamationmark.circle.fill"
                          size={16}
                          color={colors.error}
                        />
                        <ThemedText style={styles.dueText}>
                          À réviser
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  <ThemedText style={styles.cardTitle}>Question</ThemedText>
                  <ThemedText style={styles.cardText} numberOfLines={3}>
                    {flashcard.question}
                  </ThemedText>

                  <View style={styles.cardFooter}>
                    <ThemedText style={styles.dateText}>
                      Créée {formatRelativeDate(flashcard.createdAt)}
                    </ThemedText>
                    <ThemedText style={styles.tapText}>
                      Appuyez pour retourner
                    </ThemedText>
                  </View>
                </Card.Content>
              </LinearGradient>
            </Card>
          </Animated.View>

          {/* Back of card */}
          <Animated.View style={[styles.cardSide, backAnimatedStyle]}>
            <Card
              variant={isDark ? "default" : "elevated"}
              style={[styles.card, styles.cardBack]}
            >
              <LinearGradient
                colors={
                  isDark ? ["#293238", "#1d2529"] : ["#f9f9f9", "#ffffff"]
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.boxIndicator,
                        { backgroundColor: boxColor },
                      ]}
                    >
                      <ThemedText style={styles.boxText}>
                        Boîte {flashcard.boxLevel}
                      </ThemedText>
                    </View>
                    {isDue && (
                      <View style={styles.dueIndicator}>
                        <IconSymbol
                          name="exclamationmark.circle.fill"
                          size={16}
                          color={colors.error}
                        />
                        <ThemedText style={styles.dueText}>
                          À réviser
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  <ThemedText style={styles.cardTitle}>Réponse</ThemedText>
                  <ThemedText style={styles.cardText} numberOfLines={4}>
                    {flashcard.answer}
                  </ThemedText>

                  <View style={styles.cardFooter}>
                    <ThemedText style={styles.dateText}>
                      Prochaine révision:{" "}
                      {formatRelativeDate(flashcard.nextReviewDate)}
                    </ThemedText>
                    <ThemedText style={styles.tapText}>
                      Appuyez pour retourner
                    </ThemedText>
                  </View>
                </Card.Content>
              </LinearGradient>
            </Card>
          </Animated.View>
        </AnimatedTouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          size="small"
          leftIcon="pencil"
          onPress={onEdit}
          style={styles.editButton}
        >
          Modifier
        </Button>

        <Button
          variant="danger"
          size="small"
          leftIcon="trash"
          onPress={onDelete}
          style={styles.deleteButton}
        >
          Supprimer
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  cardContainer: {
    height: 190,
    position: "relative",
    marginBottom: 10,
  },
  cardSide: {
    width: "100%",
    height: "100%",
  },
  card: {
    margin: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 16,
  },
  cardGradient: {
    flex: 1,
  },
  cardBack: {
    backgroundColor: "#f9f9f9",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  boxIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  boxText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  dueIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dueText: {
    color: "#ff3d00",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 17,
    lineHeight: 24,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  tapText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  editButton: {
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderColor: "transparent",
  },
});
