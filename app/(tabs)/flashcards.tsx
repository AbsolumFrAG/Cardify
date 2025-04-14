import { FlashcardItem } from "@/components/FlashcardItem";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFlashcards } from "@/context/FlashcardContext";
import { useTheme } from "@/context/ThemeContext";
import { getDueFlashcards } from "@/services/leitnerSystem";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function FlashcardsScreen() {
  const { flashcards, deleteFlashcard } = useFlashcards();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchFocused, setSearchFocused] = useState(false);

  // Animation values
  const searchFocus = useSharedValue(0);

  // Filter tabs animation
  const getFilterStyle = useCallback(
    (filter: string) => {
      const isActive = selectedFilter === filter;
      return {
        backgroundColor: isActive
          ? colors.primary
          : isDark
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.05)",
        color: isActive ? "#FFFFFF" : colors.text,
      };
    },
    [selectedFilter, colors, isDark]
  );

  // Search focus animation
  const handleSearchFocus = () => {
    setSearchFocused(true);
    searchFocus.value = withTiming(1, { duration: 200 });
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
    if (!searchQuery) {
      searchFocus.value = withTiming(0, { duration: 200 });
    }
  };

  // Animated search container style
  const searchContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      searchFocus.value,
      [0, 1],
      [
        isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
      ]
    );

    return {
      backgroundColor,
      borderColor: interpolateColor(
        searchFocus.value,
        [0, 1],
        [colors.border, colors.primary]
      ),
    };
  });

  // Filtered flashcards
  const filteredFlashcards = useMemo(() => {
    let filtered = [...flashcards];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.question.toLowerCase().includes(query) ||
          card.answer.toLowerCase().includes(query)
      );
    }

    // Category filter
    switch (selectedFilter) {
      case "due":
        filtered = getDueFlashcards(filtered);
        break;
      case "box1":
        filtered = filtered.filter((card) => card.boxLevel === 1);
        break;
      case "box2":
        filtered = filtered.filter((card) => card.boxLevel === 2);
        break;
      case "box3":
        filtered = filtered.filter((card) => card.boxLevel === 3);
        break;
      case "box4":
        filtered = filtered.filter((card) => card.boxLevel === 4);
        break;
      case "box5":
        filtered = filtered.filter((card) => card.boxLevel === 5);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by creation date (newest first)
    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [flashcards, searchQuery, selectedFilter]);

  const handleAddFlashcard = () => {
    router.push("/flashcard/create");
  };

  const handleEditFlashcard = (id: string) => {
    router.push(`/flashcard/edit/${id}`);
  };

  const handleDeleteFlashcard = (id: string) => {
    Alert.alert(
      "Supprimer la flashcard",
      "Êtes-vous sûr de vouloir supprimer cette flashcard ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: () => deleteFlashcard(id),
          style: "destructive",
        },
      ]
    );
  };

  const handleReview = () => {
    router.push("/flashcard/review");
  };

  const renderFilterButton = (filter: string, label: string) => {
    const { backgroundColor, color } = getFilterStyle(filter);
    return (
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor }]}
        onPress={() => setSelectedFilter(filter)}
      >
        <ThemedText style={[styles.filterButtonText, { color }]}>
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // More modern empty state
  const renderEmptyState = () => (
    <Animated.View
      style={styles.emptyContainer}
      entering={FadeInDown.duration(400)}
    >
      <Card variant="elevated" style={styles.emptyCard}>
        <Card.Content style={styles.emptyCardContent}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={isDark ? ["#293238", "#1d2529"] : ["#f5f5f5", "#e0e0e0"]}
              style={styles.emptyIconGradient}
            >
              <IconSymbol
                name="square.stack"
                size={60}
                color={colors.textTertiary}
              />
            </LinearGradient>
          </View>

          <ThemedText style={styles.emptyTitle}>
            {flashcards.length === 0
              ? "Créez votre première flashcard"
              : "Aucun résultat trouvé"}
          </ThemedText>

          <ThemedText style={styles.emptyText}>
            {flashcards.length === 0
              ? "Commencez par capturer des notes ou créer manuellement une flashcard pour enrichir votre collection."
              : "Essayez de modifier vos critères de recherche ou de filtrage pour trouver ce que vous cherchez."}
          </ThemedText>

          {flashcards.length === 0 && (
            <Button
              variant="primary"
              leftIcon="plus"
              style={styles.emptyButton}
              onPress={handleAddFlashcard}
            >
              Créer une flashcard
            </Button>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const dueFlashcards = getDueFlashcards(flashcards);

  return (
    <ThemedView style={styles.container}>
      {/* Header with search and add button */}
      <View style={styles.headerContainer}>
        <Animated.View
          style={[styles.searchContainer, searchContainerStyle]}
          entering={FadeIn.duration(300)}
        >
          <IconSymbol
            name="magnifyingglass"
            size={18}
            color={searchFocused ? colors.primary : colors.textTertiary}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher des flashcards..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddFlashcard}
        >
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <Animated.View entering={FadeIn.delay(150).duration(300)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {renderFilterButton("all", "Toutes")}
          {renderFilterButton("due", `À réviser (${dueFlashcards.length})`)}
          {renderFilterButton("box1", "Boîte 1")}
          {renderFilterButton("box2", "Boîte 2")}
          {renderFilterButton("box3", "Boîte 3")}
          {renderFilterButton("box4", "Boîte 4")}
          {renderFilterButton("box5", "Boîte 5")}
        </ScrollView>
      </Animated.View>

      {/* Review button - Only show if there are due cards */}
      {dueFlashcards.length > 0 && (
        <Animated.View
          entering={SlideInRight.duration(400)}
          style={styles.reviewButtonContainer}
        >
          <TouchableOpacity
            style={[styles.reviewButton, { backgroundColor: colors.success }]}
            onPress={handleReview}
          >
            <View style={styles.reviewButtonContent}>
              <IconSymbol
                name="arrow.counterclockwise"
                size={20}
                color="white"
              />
              <ThemedText style={styles.reviewButtonText}>
                Réviser {dueFlashcards.length} cartes
              </ThemedText>
            </View>
            <View style={styles.reviewButtonArrow}>
              <IconSymbol name="chevron.right" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Flashcards list or empty state */}
      {filteredFlashcards.length > 0 ? (
        <FlatList
          data={filteredFlashcards}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(100 + index * 50).duration(300)}
            >
              <FlashcardItem
                flashcard={item}
                onEdit={() => handleEditFlashcard(item.id)}
                onDelete={() => handleDeleteFlashcard(item.id)}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 15,
  },
  clearButton: {
    padding: 6,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  reviewButtonContainer: {
    marginBottom: 16,
  },
  reviewButton: {
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
  reviewButtonArrow: {
    opacity: 0.8,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emptyCard: {
    width: "100%",
    borderRadius: 16,
  },
  emptyCardContent: {
    alignItems: "center",
    padding: 30,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.7,
  },
  emptyButton: {
    minWidth: 200,
  },
});
