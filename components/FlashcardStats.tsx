import { LEITNER_BOX_INTERVALS } from "@/services/leitnerSystem";
import { Flashcard } from "@/types/flashcard";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

interface FlashcardStatsProps {
  flashcards: Flashcard[];
}

export function FlashcardStats({ flashcards }: FlashcardStatsProps) {
  const stats = useMemo(() => {
    const byBox = [0, 0, 0, 0, 0];
    let totalDue = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalReviewed = 0;
    let lastSevenDaysReviewed = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    flashcards.forEach((card) => {
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

    const masteryPercentage = flashcards.length
      ? Math.round(((byBox[3] + byBox[4]) / flashcards.length) * 100)
      : 0;

    const totalCards = flashcards.length;

    return {
      byBox,
      totalDue,
      totalReviewed,
      lastSevenDaysReviewed,
      masteryPercentage,
      totalCards,
    };
  }, [flashcards]);

  if (stats.totalCards === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          Aucune flashcard pour le moment. Commencez par capturer des notes ou
          créer manuellement une flashcard.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Statistiques générales */}
      <ThemedView style={styles.generalStats}>
        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statValue}>{stats.totalCards}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statValue}>{stats.totalDue}</ThemedText>
          <ThemedText style={styles.statLabel}>À réviser</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {stats.masteryPercentage}%
          </ThemedText>
          <ThemedText style={styles.statLabel}>Maîtrisées</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Visualisation des boîtes Leitner */}
      <ThemedText style={styles.sectionTitle}>Répartition par boîte</ThemedText>
      <ThemedView style={styles.boxesContainer}>
        {stats.byBox.map((count, index) => {
          const boxNumber = index + 1;
          const percentage = Math.round((count / stats.totalCards) * 100) || 0;

          // Couleurs pour les différentes boîtes (du rouge au vert)
          const colors = [
            "#ff8a80",
            "#ffab91",
            "#ffe082",
            "#c5e1a5",
            "#a5d6a7",
          ];

          return (
            <ThemedView key={boxNumber} style={styles.boxItem}>
              <ThemedView style={styles.boxLabelContainer}>
                <ThemedText style={styles.boxLabel}>
                  Boîte {boxNumber}
                </ThemedText>
                <ThemedText style={styles.boxCount}>{count}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.progressBarContainer}>
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

              <ThemedText style={styles.boxInfo}>
                {boxNumber < 5
                  ? `Révision tous les ${LEITNER_BOX_INTERVALS[index]} jours`
                  : "Maîtrisée"}
              </ThemedText>
            </ThemedView>
          );
        })}
      </ThemedView>

      {/* Activité de révision */}
      <ThemedView style={styles.activityContainer}>
        <ThemedView style={styles.activityItem}>
          <IconSymbol name="chart.bar.fill" size={20} color="#0a7ea4" />
          <ThemedText style={styles.activityText}>
            {stats.lastSevenDaysReviewed} cartes révisées cette semaine
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.activityItem}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#0a7ea4" />
          <ThemedText style={styles.activityText}>
            {Math.round((stats.totalReviewed / stats.totalCards) * 100)}% de
            cartes révisées au moins une fois
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  generalStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  boxesContainer: {
    marginBottom: 20,
  },
  boxItem: {
    marginBottom: 12,
  },
  boxLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  boxLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  boxCount: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
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
    color: "#666",
  },
  activityContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activityText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
  },
});
