import { useThemeColor } from "@/hooks/useThemeColor";
import { LEITNER_BOX_INTERVALS } from "@/services/leitnerSystem";
import { Flashcard } from "@/types/flashcard";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

interface FlashcardStatsProps {
  flashcards?: Flashcard[]; // safeguard
}

export function FlashcardStats({ flashcards }: FlashcardStatsProps) {
  const surface = useThemeColor({}, "backgroundSecondary");
  const border = useThemeColor({}, "border");
  const primary = useThemeColor({}, "primary");
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");

  const stats = useMemo(() => {
    const byBox = [0, 0, 0, 0, 0];
    let totalDue = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalReviewed = 0;
    let lastSevenDaysReviewed = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    (flashcards ?? []).forEach((card) => {
      byBox[card.boxLevel - 1]++;

      if (card.nextReviewDate <= new Date()) {
        totalDue++;
      }

      if (card.lastReviewedAt) {
        totalReviewed++;
        if (card.lastReviewedAt >= sevenDaysAgo) {
          lastSevenDaysReviewed++;
        }
      }
    });

    const masteryPercentage = flashcards?.length
      ? Math.round(((byBox[3] + byBox[4]) / flashcards.length) * 100)
      : 0;

    const totalCards = flashcards?.length || 0;

    return {
      byBox,
      totalDue,
      totalReviewed,
      lastSevenDaysReviewed,
      masteryPercentage,
      totalCards,
    };
  }, [flashcards]);

  if (!flashcards || stats.totalCards === 0) {
    return (
      <ThemedView style={[styles.emptyContainer, { backgroundColor: surface }]}>
        <IconSymbol name="square.stack" size={36} color={textSecondary} />
        <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
          Aucune flashcard pour le moment. Commencez par capturer des notes ou
          créer manuellement une flashcard.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: surface }]}>
      {/* General stats */}
      <Animated.View
        style={styles.generalStats}
        entering={FadeIn.duration(400)}
      >
        <ThemedView style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: primary }]}>
            {stats.totalCards}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
            Total
          </ThemedText>
        </ThemedView>

        <View style={styles.statDivider} />

        <ThemedView style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: primary }]}>
            {stats.totalDue}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
            À réviser
          </ThemedText>
        </ThemedView>

        <View style={styles.statDivider} />

        <ThemedView style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: primary }]}>
            {stats.masteryPercentage}%
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
            Maîtrisées
          </ThemedText>
        </ThemedView>
      </Animated.View>

      {/* Box distribution visualization */}
      <ThemedText style={[styles.sectionTitle, { color: text }]}>
        Répartition par boîte
      </ThemedText>

      <ThemedView style={styles.boxesContainer}>
        {stats.byBox.map((count, index) => {
          const boxNumber = index + 1;
          const percentage = Math.round((count / stats.totalCards) * 100) || 0;

          // Enhanced colors with better contrast
          const colors = [
            "#F44336", // Red for Box 1
            "#FF9800", // Orange for Box 2
            "#FFC107", // Amber for Box 3
            "#8BC34A", // Light Green for Box 4
            primary, // Primary color for Box 5
          ];

          return (
            <Animated.View
              key={boxNumber}
              style={styles.boxItem}
              entering={FadeIn.delay(100 * index).duration(400)}
            >
              <ThemedView style={styles.boxLabelContainer}>
                <ThemedView style={styles.boxLabelGroup}>
                  <View
                    style={[
                      styles.boxColorIndicator,
                      { backgroundColor: colors[index] },
                    ]}
                  />
                  <ThemedText style={[styles.boxLabel, { color: text }]}>
                    Boîte {boxNumber}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={[styles.boxCount, { color: text }]}>
                  {count}
                </ThemedText>
              </ThemedView>

              <ThemedView
                style={[
                  styles.progressBarContainer,
                  { backgroundColor: border },
                ]}
              >
                <ThemedView
                  style={[
                    styles.progressBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: colors[index],
                    },
                  ]}
                />
              </ThemedView>

              <ThemedText style={[styles.boxInfo, { color: textSecondary }]}>
                {boxNumber < 5
                  ? `Révision tous les ${LEITNER_BOX_INTERVALS[index]} jours`
                  : "Maîtrisée"}
              </ThemedText>
            </Animated.View>
          );
        })}
      </ThemedView>

      {/* Review activity */}
      <Animated.View
        style={[styles.activityContainer, { backgroundColor: border }]}
        entering={FadeIn.delay(500).duration(400)}
      >
        <ThemedView style={styles.activityItem}>
          <IconSymbol name="chart.bar.fill" size={20} color={primary} />
          <ThemedText style={[styles.activityText, { color: text }]}>
            {stats.lastSevenDaysReviewed} cartes révisées cette semaine
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.activityItem}>
          <IconSymbol name="checkmark.circle.fill" size={20} color={primary} />
          <ThemedText style={[styles.activityText, { color: text }]}>
            {Math.round((stats.totalReviewed / stats.totalCards) * 100)}% de
            cartes révisées au moins une fois
          </ThemedText>
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
  },
  generalStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  boxesContainer: {
    marginBottom: 24,
  },
  boxItem: {
    marginBottom: 14,
  },
  boxLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  boxLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  boxColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  boxLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  boxCount: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  boxInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  activityContainer: {
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  activityText: {
    marginLeft: 10,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
  },
});
