import { generateAnswerWithRAG } from "@/api/pinecone";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await generateAnswerWithRAG(query);
      setAnswer(response);

      if (!searchHistory.includes(query)) {
        setSearchHistory((prev) => [query, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setAnswer("Désolé, je n'ai pas pu générer une réponse à cette question.");
    } finally {
      setLoading(false);
    }
  };

  const selectHistoryItem = (item: string) => {
    setQuery(item);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Posez une question sur vos notes..."
            value={query}
            onChangeText={setQuery}
            multiline
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading || !query.trim()}
          >
            <IconSymbol name="magnifyingglass" size={24} color="white" />
          </TouchableOpacity>
        </ThemedView>

        {searchHistory.length > 0 && !answer && (
          <ThemedView style={styles.historyContainer}>
            <ThemedText type="defaultSemiBold" style={styles.historyTitle}>
              Recherches récentes
            </ThemedText>
            {searchHistory.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => selectHistoryItem(item)}
              >
                <IconSymbol name="clock" size={16} color="#0a7ea4" />
                <ThemedText style={styles.historyText}>{item}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <ThemedText style={styles.loadingText}>
              Recherche dans vos notes...
            </ThemedText>
          </ThemedView>
        ) : answer ? (
          <ThemedView style={styles.answerContainer}>
            <ThemedText type="defaultSemiBold" style={styles.questionText}>
              {query}
            </ThemedText>
            <ThemedView style={styles.separator} />
            <ThemedText style={styles.answerText}>{answer}</ThemedText>
            <TouchableOpacity
              style={styles.newSearchButton}
              onPress={() => {
                setAnswer("");
                setQuery("");
              }}
            >
              <ThemedText style={styles.newSearchButtonText}>
                Nouvelle recherche
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol
              name="doc.text.magnifyingglass"
              size={80}
              color="#ccc"
            />
            <ThemedText style={styles.emptyText}>
              Posez une question sur vos notes de cours pour obtenir une réponse
              basée sur votre contenu.
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    paddingTop: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginRight: 10,
    minHeight: 50,
    maxHeight: 100,
  },
  searchButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
  },
  answerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  answerText: {
    lineHeight: 24,
  },
  newSearchButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    alignItems: "center",
  },
  newSearchButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
    maxWidth: "80%",
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    marginLeft: 10,
  },
});
