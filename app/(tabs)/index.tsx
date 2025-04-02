import { FlashcardStats } from "@/components/FlashcardStats";
import { HeroCard } from "@/components/HeroCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/context/ThemeContext";
import { useFlashcards } from "@/context/FlashcardContext";
import { useScreenTransition } from "@/hooks/useAnimations";
import { getDueFlashcards } from "@/services/leitnerSystem";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { flashcards } = useFlashcards();
  const [dueCards, setDueCards] = useState<number>(0);
  const { colors, isDark } = useTheme();
  const { screenStyle, show } = useScreenTransition(true);

  // Animation d'entrée
  useEffect(() => {
    show(800);
  }, []);

  useEffect(() => {
    const dueFlashcards = getDueFlashcards(flashcards);
    setDueCards(dueFlashcards.length);
  }, [flashcards]);

  const handleCapture = () => {
    router.push("/capture");
  };

  const handleStartReview = () => {
    router.push("/flashcard/review");
  };

  const handleSearch = () => {
    router.push("/search");
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[styles.header, { backgroundColor: colors.background }]}
        entering={FadeIn.duration(400)}
      >
        <ThemedText type="title">Cardify</ThemedText>
        <Button
          variant="ghost"
          size="medium"
          leftIcon="magnifyingglass"
          onPress={handleSearch}
          style={styles.searchButton}
        >
          Rechercher
        </Button>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { backgroundColor: colors.backgroundSecondary },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(700).springify()}
        >
          <HeroCard
            title="Capture des notes"
            description="Prenez une photo de vos notes pour créer des flashcards automatiquement"
            actionLabel="Capturer"
            onAction={handleCapture}
            imageSource={require("@/assets/images/camera.png")}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(700).springify()}
        >
          <View style={styles.statsContainer}>
            <ThemedText type="subtitle">Votre progression</ThemedText>
            <FlashcardStats flashcards={flashcards} />
          </View>
        </Animated.View>

        {dueCards > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(700).springify()}
          >
            <Card
              variant="gradient"
              gradientColors={
                isDark ? ["#1e3a45", "#0d566e"] : ["#e1f5fe", "#b3e5fc"]
              }
              style={styles.reviewCard}
            >
              <Card.Content style={styles.reviewCardContent}>
                <View style={styles.reviewCardTextContainer}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.reviewCardTitle}
                  >
                    {dueCards} cartes à réviser aujourd'hui
                  </ThemedText>
                  <ThemedText style={styles.reviewCardDescription}>
                    Continuez votre routine de révision pour ne rien oublier !
                  </ThemedText>
                </View>
                <View style={styles.reviewCardIconContainer}>
                  <IconSymbol
                    name="sparkles"
                    size={28}
                    color={isDark ? "#FFC107" : colors.primary}
                  />
                </View>
              </Card.Content>
              <Card.Footer>
                <Button
                  variant="primary"
                  size="medium"
                  leftIcon="arrow.counterclockwise"
                  onPress={handleStartReview}
                  fullWidth
                >
                  Réviser maintenant
                </Button>
              </Card.Footer>
            </Card>
          </Animated.View>
        )}

        <Animated.View
          style={styles.quickActions}
          entering={FadeInUp.delay(400).duration(700).springify()}
        >
          <ThemedText type="subtitle">Actions rapides</ThemedText>
          <View style={styles.actionsGrid}>
            <Card
              style={styles.actionButton}
              onPress={() => router.push("/flashcards")}
              variant="elevated"
            >
              <Card.Content style={styles.actionButtonContent}>
                <IconSymbol
                  name="square.stack.fill"
                  size={32}
                  color={colors.primary}
                />
                <ThemedText style={styles.actionText}>
                  Mes Flashcards
                </ThemedText>
              </Card.Content>
            </Card>

            <Card
              style={styles.actionButton}
              onPress={() => router.push("/flashcard/create")}
              variant="elevated"
            >
              <Card.Content style={styles.actionButtonContent}>
                <IconSymbol
                  name="plus.square.fill"
                  size={32}
                  color={colors.primary}
                />
                <ThemedText style={styles.actionText}>
                  Créer une carte
                </ThemedText>
              </Card.Content>
            </Card>

            <Card
              style={styles.actionButton}
              onPress={() => router.push("/contents")}
              variant="elevated"
            >
              <Card.Content style={styles.actionButtonContent}>
                <IconSymbol
                  name="doc.text.fill"
                  size={32}
                  color={colors.primary}
                />
                <ThemedText style={styles.actionText}>Mes cours</ThemedText>
              </Card.Content>
            </Card>

            <Card
              style={styles.actionButton}
              onPress={() => router.push("/quiz")}
              variant="elevated"
            >
              <Card.Content style={styles.actionButtonContent}>
                <IconSymbol
                  name="questionmark.square.fill"
                  size={32}
                  color={colors.primary}
                />
                <ThemedText style={styles.actionText}>Quiz IA</ThemedText>
              </Card.Content>
            </Card>
          </View>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  searchButton: {
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    marginVertical: 16,
  },
  reviewCard: {
    marginVertical: 16,
  },
  reviewCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCardTextContainer: {
    flex: 1,
  },
  reviewCardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  reviewCardDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  reviewCardIconContainer: {
    marginLeft: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  quickActions: {
    marginTop: 8,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    width: (width - 40) / 2,
    marginBottom: 16,
  },
  actionButtonContent: {
    alignItems: "center",
    padding: 16,
  },
  actionText: {
    marginTop: 12,
    textAlign: "center",
    fontFamily: "PoppinsMedium",
  },
});
