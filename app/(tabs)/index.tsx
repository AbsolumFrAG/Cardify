import { FlashcardStats } from "@/components/FlashcardStats";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFlashcards } from "@/context/FlashcardContext";
import { useTheme } from "@/context/ThemeContext";
import { useScreenTransition } from "@/hooks/useAnimations";
import { getDueFlashcards } from "@/services/leitnerSystem";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 60;

export default function HomeScreen() {
  const { flashcards } = useFlashcards();
  const [dueCards, setDueCards] = useState<number>(0);
  const { colors, isDark } = useTheme();
  const { screenStyle, show } = useScreenTransition(true);

  // Animated scroll for header effect
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header style
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [0, 1], {
      extrapolateRight: "clamp",
    });

    return {
      opacity,
      backgroundColor: isDark
        ? `rgba(18, 18, 18, ${opacity * 0.9})`
        : `rgba(255, 255, 255, ${opacity * 0.9})`,
      borderBottomWidth: opacity * StyleSheet.hairlineWidth,
      transform: [{ translateY: withSpring(0) }],
    };
  });

  // Animation entrance
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

  const handleCreateFlashcard = () => {
    router.push("/flashcard/create");
  };

  return (
    <ThemedView style={styles.container}>
      {/* Animated header overlay */}
      <Animated.View
        style={[
          styles.headerOverlay,
          { borderBottomColor: colors.border },
          headerStyle,
        ]}
      >
        <ThemedText type="subtitle">Cardify</ThemedText>
      </Animated.View>

      {/* Main content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { backgroundColor: colors.backgroundSecondary },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Header area with title */}
        <Animated.View
          style={[styles.header, { backgroundColor: "transparent" }]}
          entering={FadeIn.duration(400)}
        >
          <View>
            <ThemedText type="title">Cardify</ThemedText>
            <ThemedText
              style={styles.subtitle}
              lightColor="rgba(0,0,0,0.6)"
              darkColor="rgba(255,255,255,0.6)"
            >
              Votre assistant de mémorisation
            </ThemedText>
          </View>
        </Animated.View>

        {/* Hero card for camera capture */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(700).springify()}
        >
          <Card
            variant="gradient"
            gradientColors={
              isDark ? ["#1e3a45", "#0d566e"] : ["#e1f5fe", "#b3e5fc"]
            }
            onPress={handleCapture}
            style={styles.heroCard}
          >
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(0,0,0,0.3)", "transparent"]
                  : ["rgba(255,255,255,0.4)", "transparent"]
              }
              style={styles.heroGradientOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <Card.Content style={styles.heroCardContent}>
              <View style={styles.heroTextContainer}>
                <View style={styles.heroIconContainer}>
                  <IconSymbol name="camera.fill" size={24} color="#fff" />
                </View>
                <ThemedText style={styles.heroTitle}>
                  Capture tes notes
                </ThemedText>
                <ThemedText style={styles.heroDescription}>
                  Prends une photo de tes notes et crée des flashcards
                  automatiquement
                </ThemedText>
                <Button
                  variant="primary"
                  size="medium"
                  style={styles.heroButton}
                  onPress={handleCapture}
                >
                  Capturer
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Actionable quick cards */}
        <View style={styles.quickActionsContainer}>
          <Animated.View
            style={styles.quickActionRow}
            entering={FadeInDown.delay(200).duration(500)}
          >
            <Card
              variant="elevated"
              style={styles.quickActionCard}
              onPress={handleCreateFlashcard}
              fullWidth={false}
              compact={true}
              elevation={2}
            >
              <Card.Content style={styles.quickActionContent} padded={true}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <IconSymbol name="plus" size={18} color={colors.primary} />
                </View>
                <ThemedText style={styles.quickActionText}>
                  Créer une flashcard
                </ThemedText>
              </Card.Content>
            </Card>

            <Card
              variant="elevated"
              style={styles.quickActionCard}
              onPress={() => router.push("/flashcards")}
              fullWidth={false}
              compact={true}
              elevation={2}
            >
              <Card.Content style={styles.quickActionContent} padded={true}>
                <View
                  style={[
                    styles.quickActionIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(208, 131, 241, 0.2)"
                        : "rgba(208, 131, 241, 0.1)",
                    },
                  ]}
                >
                  <IconSymbol
                    name="square.stack.fill"
                    size={18}
                    color={colors.secondary}
                  />
                </View>
                <ThemedText style={styles.quickActionText}>
                  Voir mes flashcards
                </ThemedText>
              </Card.Content>
            </Card>
          </Animated.View>
        </View>

        {/* Stats panel */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(700).springify()}
        >
          <View style={styles.statsContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol
                name="chart.bar.fill"
                size={18}
                color={colors.primary}
                style={styles.sectionIcon}
              />
              Votre progression
            </ThemedText>
            <FlashcardStats flashcards={flashcards} />
          </View>
        </Animated.View>

        {/* Review card for due cards */}
        {dueCards > 0 && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(700).springify()}
          >
            <Card
              variant="gradient"
              gradientColors={
                isDark ? ["#3d2d3d", colors.primary] : ["#faf0f8", "#f9e5fb"]
              }
              style={styles.reviewCard}
              onPress={handleStartReview}
            >
              <Card.Content style={styles.reviewCardContent}>
                <View style={styles.reviewCardIconContainer}>
                  <IconSymbol
                    name="sparkles"
                    size={28}
                    color={isDark ? "#FFC107" : colors.primary}
                  />
                </View>
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
                  <Button
                    variant={isDark ? "outline" : "secondary"}
                    size="small"
                    leftIcon="arrow.counterclockwise"
                    onPress={handleStartReview}
                    style={styles.reviewButton}
                  >
                    Réviser maintenant
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        )}

        {/* Tips card */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(700).springify()}
        >
          <Card variant="outlined" style={styles.tipsCard}>
            <Card.Content>
              <View style={styles.tipsHeader}>
                <IconSymbol name="lightbulb.fill" size={20} color="#FFC107" />
                <ThemedText style={styles.tipsTitle}>
                  Conseil pour réussir
                </ThemedText>
              </View>
              <ThemedText style={styles.tipsText}>
                Réviser régulièrement est plus efficace que de longues sessions
                espacées. Essayez de réviser vos flashcards chaque jour pendant
                5-10 minutes.
              </ThemedText>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
    marginBottom: 6,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  statsContainer: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  quickActionsContainer: {
    padding: 16,
  },
  quickActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 48) / 2,
    margin: 0,
  },
  quickActionContent: {
    alignItems: "flex-start",
    padding: 16,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
  },
  heroGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: 1,
  },
  heroCardContent: {
    padding: 20,
    zIndex: 2,
  },
  heroTextContainer: {
    flex: 3,
    paddingRight: 20,
  },
  heroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 16,
  },
  heroButton: {
    alignSelf: "flex-start",
  },
  heroImageContainer: {
    flex: 2,
  },
  reviewCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  reviewCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  reviewCardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
    marginBottom: 12,
  },
  reviewButton: {
    alignSelf: "flex-start",
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  bottomSpacing: {
    height: 40,
  },
});
