import { FlashcardItem } from "@/components/FlashcardItem";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFlashcards } from "@/context/FlashcardContext";
import { getDueFlashcards } from "@/services/leitnerSystem";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function FlashcardsScreen() {
  const { flashcards, deleteFlashcard } = useFlashcards();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredFlashcards = useMemo(() => {
    let filtered = [...flashcards];

    // Filtrage par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.question.toLowerCase().includes(query) ||
          card.answer.toLowerCase().includes(query)
      );
    }

    // Filtrage par catégorie
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
        // 'all' - pas de filtrage supplémentaire
        break;
    }

    // Tri par date de création (les plus récentes d'abord)
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

  const renderFilterButton = (filter: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <ThemedText
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des flashcards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddFlashcard}>
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {renderFilterButton("all", "Toutes")}
        {renderFilterButton("due", "À réviser")}
        {renderFilterButton("box1", "Boîte 1")}
        {renderFilterButton("box2", "Boîte 2")}
        {renderFilterButton("box3", "Boîte 3")}
        {renderFilterButton("box4", "Boîte 4")}
        {renderFilterButton("box5", "Boîte 5")}
      </ScrollView>

      {getDueFlashcards(flashcards).length > 0 && (
        <TouchableOpacity style={styles.reviewButton} onPress={handleReview}>
          <IconSymbol name="arrow.counterclockwise" size={20} color="white" />
          <ThemedText style={styles.reviewButtonText}>
            Réviser {getDueFlashcards(flashcards).length} cartes
          </ThemedText>
        </TouchableOpacity>
      )}

      {filteredFlashcards.length > 0 ? (
        <FlatList
          data={filteredFlashcards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FlashcardItem
              flashcard={item}
              onEdit={() => handleEditFlashcard(item.id)}
              onDelete={() => handleDeleteFlashcard(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="square.stack" size={60} color="#ccc" />
          <ThemedText style={styles.emptyText}>
            {flashcards.length === 0
              ? "Vous n'avez pas encore créé de flashcards"
              : "Aucune flashcard ne correspond à votre recherche"}
          </ThemedText>
          {flashcards.length === 0 && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddFlashcard}
            >
              <ThemedText style={styles.emptyButtonText}>
                Créer une flashcard
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#0a7ea4",
  },
  filterButtonText: {
    color: "#333",
  },
  filterButtonTextActive: {
    color: "white",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4caf50",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 16,
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
