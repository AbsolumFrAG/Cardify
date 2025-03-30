import { Flashcard } from "@/types/flashcard";
import { formatRelativeDate } from "@/utils/dateUtils";
import { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const flipCard = () => {
    Animated.spring(animation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  const frontInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Déterminer la couleur de la boîte
  let boxColor;
  switch (flashcard.boxLevel) {
    case 1:
      boxColor = "#ff8a80";
      break; // Rouge clair
    case 2:
      boxColor = "#ffab91";
      break; // Orange clair
    case 3:
      boxColor = "#ffe082";
      break; // Jaune clair
    case 4:
      boxColor = "#c5e1a5";
      break; // Vert clair
    case 5:
      boxColor = "#a5d6a7";
      break; // Vert
    default:
      boxColor = "#e0e0e0";
  }

  // Vérifier si la carte est due
  const isDue = flashcard.nextReviewDate <= new Date();

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={flipCard}>
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <ThemedView style={styles.cardContent}>
            <ThemedView style={styles.cardHeader}>
              <ThemedView
                style={[styles.boxIndicator, { backgroundColor: boxColor }]}
              >
                <ThemedText style={styles.boxText}>
                  Boîte {flashcard.boxLevel}
                </ThemedText>
              </ThemedView>
              {isDue && (
                <ThemedView style={styles.dueIndicator}>
                  <IconSymbol
                    name="exclamationmark.circle.fill"
                    size={16}
                    color="#ff3d00"
                  />
                  <ThemedText style={styles.dueText}>À réviser</ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            <ThemedText style={styles.cardTitle}>Question</ThemedText>
            <ThemedText style={styles.cardText}>
              {flashcard.question}
            </ThemedText>

            <ThemedView style={styles.cardFooter}>
              <ThemedText style={styles.dateText}>
                Créée {formatRelativeDate(flashcard.createdAt)}
              </ThemedText>
              <ThemedText style={styles.tapText}>
                Appuyez pour retourner
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Animated.View>

        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}
        >
          <ThemedView style={styles.cardContent}>
            <ThemedView style={styles.cardHeader}>
              <ThemedView
                style={[styles.boxIndicator, { backgroundColor: boxColor }]}
              >
                <ThemedText style={styles.boxText}>
                  Boîte {flashcard.boxLevel}
                </ThemedText>
              </ThemedView>
              {isDue && (
                <ThemedView style={styles.dueIndicator}>
                  <IconSymbol
                    name="exclamationmark.circle.fill"
                    size={16}
                    color="#ff3d00"
                  />
                  <ThemedText style={styles.dueText}>À réviser</ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            <ThemedText style={styles.cardTitle}>Réponse</ThemedText>
            <ThemedText style={styles.cardText}>{flashcard.answer}</ThemedText>

            <ThemedView style={styles.cardFooter}>
              <ThemedText style={styles.dateText}>
                Prochaine révision:{" "}
                {formatRelativeDate(flashcard.nextReviewDate)}
              </ThemedText>
              <ThemedText style={styles.tapText}>
                Appuyez pour retourner
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </TouchableOpacity>

      <ThemedView style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <IconSymbol name="pencil" size={18} color="#0a7ea4" />
          <ThemedText style={styles.editButtonText}>Modifier</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <IconSymbol name="trash" size={18} color="#ff3d00" />
          <ThemedText style={styles.deleteButtonText}>Supprimer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backfaceVisibility: "hidden",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: "#f9f9f9",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  boxIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  boxText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
  dueIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueText: {
    color: "#ff3d00",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 20,
    minHeight: 50,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginRight: 12,
  },
  editButtonText: {
    color: "#0a7ea4",
    marginLeft: 4,
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  deleteButtonText: {
    color: "#ff3d00",
    marginLeft: 4,
    fontSize: 14,
  },
});
