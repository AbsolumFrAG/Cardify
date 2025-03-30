import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useContent } from "@/context/ContentContext";
import { formatDateToString, formatRelativeDate } from "@/utils/dateUtils";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function ContentsScreen() {
  const { contents, deleteContent, searchContent } = useContent();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContents = useMemo(() => {
    if (!searchQuery.trim()) return contents;
    return searchContent(searchQuery);
  }, [contents, searchQuery]);

  const handleCapture = () => {
    router.push("/capture");
  };

  const handleOpenContent = (id: string) => {
    router.push(`/content/${id}`);
  };

  const handleDeleteContent = (id: string) => {
    Alert.alert(
      "Supprimer le contenu",
      "Êtes-vous sûr de vouloir supprimer ce contenu ? Les flashcards associées ne seront pas supprimées.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: () => deleteContent(id),
          style: "destructive",
        },
      ]
    );
  };

  const renderContentItem = ({ item }: { item: any }) => {
    // Extraire les premiers mots du texte pour l'aperçu
    const previewText = item.rawText
      .substring(0, 100)
      .replace(/\n/g, " ")
      .trim();

    const contentTitle =
      item.title || `Notes du ${formatDateToString(new Date(item.capturedAt))}`;

    return (
      <TouchableOpacity
        style={styles.contentCard}
        onPress={() => handleOpenContent(item.id)}
      >
        <ThemedView style={styles.contentHeader}>
          <ThemedText style={styles.contentTitle} numberOfLines={1}>
            {contentTitle}
          </ThemedText>
          <TouchableOpacity onPress={() => handleDeleteContent(item.id)}>
            <IconSymbol name="trash" size={20} color="#ff3d00" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.contentPreview}>
          {item.imageUri ? (
            <Image
              source={{ uri: item.imageUri }}
              style={styles.thumbnailImage}
            />
          ) : (
            <ThemedView style={styles.thumbnailPlaceholder}>
              <IconSymbol name="doc.text.fill" size={30} color="#0a7ea4" />
            </ThemedView>
          )}

          <ThemedView style={styles.previewTextContainer}>
            <ThemedText style={styles.previewText} numberOfLines={2}>
              {previewText}...
            </ThemedText>

            <ThemedView style={styles.contentFooter}>
              <ThemedText style={styles.dateText}>
                Capturé {formatRelativeDate(new Date(item.capturedAt))}
              </ThemedText>
              <ThemedText style={styles.chunksText}>
                {item.processedChunks.length} fragments
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans vos notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <IconSymbol name="camera.fill" size={24} color="white" />
        </TouchableOpacity>
      </ThemedView>

      {filteredContents.length > 0 ? (
        <FlatList
          data={filteredContents}
          keyExtractor={(item) => item.id}
          renderItem={renderContentItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="doc.text" size={60} color="#ccc" />
          <ThemedText style={styles.emptyText}>
            {contents.length === 0
              ? "Vous n'avez pas encore capturé de notes"
              : "Aucune note ne correspond à votre recherche"}
          </ThemedText>
          {contents.length === 0 && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCapture}
            >
              <ThemedText style={styles.emptyButtonText}>
                Capturer des notes
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
  captureButton: {
    width: 50,
    height: 50,
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  contentPreview: {
    flexDirection: "row",
  },
  thumbnailImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  contentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  chunksText: {
    fontSize: 12,
    color: "#0a7ea4",
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
