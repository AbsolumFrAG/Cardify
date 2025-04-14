import { extractTextFromImage, generateFlashcards } from "@/api/cardifyApi";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useContent } from "@/context/ContentContext";
import { useFlashcards } from "@/context/FlashcardContext";
import { useTheme } from "@/context/ThemeContext";
import { BlurView } from "expo-blur";
import { Camera, CameraType, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInUp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { v4 as uuidv4 } from "uuid";

const FLASH_DURATION = 200;
const CAPTURE_BUTTON_SIZE = 70;

export default function CaptureScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [facing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView | null>(null);
  const { addFlashcard } = useFlashcards();
  const { addContent } = useContent();
  const { colors, isDark } = useTheme();

  // Enhanced animations
  const flashOpacity = useSharedValue(0);
  const captureButtonScale = useSharedValue(1);
  const guidlineOpacity = useSharedValue(1);
  const guidelineAnimationProgress = useSharedValue(0);

  // Animated styles
  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const pulseAnimation = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const captureButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: captureButtonScale.value },
      { translateY: withTiming(processing ? 100 : 0, { duration: 400 }) },
    ],
    opacity: withTiming(processing ? 0 : 1, { duration: 300 }),
  }));

  // Animated guidelines
  const guidelinesStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      guidelineAnimationProgress.value,
      [0, 0.5, 1],
      [
        "rgba(255, 255, 255, 0.4)",
        "rgba(255, 255, 255, 0.8)",
        "rgba(255, 255, 255, 0.4)",
      ]
    );

    return {
      borderColor,
      opacity: guidlineOpacity.value,
    };
  });

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    // Enhanced pulsation animation for guidelines
    guidelineAnimationProgress.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    // Pulse animation for capture button
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 1500,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    );
  }, []);

  // Enhanced progress simulation during processing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (processing) {
      // Reset progress at the start of processing
      setProcessingProgress(0);

      // Hide guidelines during processing
      guidlineOpacity.value = withTiming(0, { duration: 300 });

      interval = setInterval(() => {
        setProcessingProgress((prev) => {
          // Limit progress to 92% to wait for actual processing completion
          const next = prev + (0.5 + Math.random() * 1.2);
          return next > 92 ? 92 : next;
        });
      }, 300);
    } else {
      // Complete progress to 100% at the end of processing
      setProcessingProgress(100);

      // Show guidelines when not processing
      guidlineOpacity.value = withTiming(1, { duration: 300 });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processing]);

  // Enhanced flash animation with haptic feedback
  const animateFlash = () => {
    // Visual flash effect when taking a photo
    flashOpacity.value = withSequence(
      withTiming(1, { duration: FLASH_DURATION / 2 }),
      withTiming(0, { duration: FLASH_DURATION / 2 })
    );

    // Enhanced button animation
    captureButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.15, { duration: 150 }),
      withTiming(1, { duration: 250, easing: Easing.elastic(1.2) })
    );

    // Enhanced pulse animation
    pulseAnimation.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(0.8, { duration: 200 }),
      withTiming(1, { duration: 300, easing: Easing.elastic(1.2) })
    );

    // Enhanced haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        animateFlash();

        if (cameraRef.current instanceof CameraView) {
          // Mark as processing
          setProcessing(true);
          setProcessingStep("Capture de l'image en cours...");

          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            skipProcessing: false,
          });

          if (photo && photo.uri) {
            await processImage(photo.uri);
          } else {
            throw new Error("Photo non capturée correctement");
          }
        }
      } catch (error) {
        console.error("Erreur prise photo:", error);
        Alert.alert("Erreur", "Échec de la capture, réessayez.");
        setProcessing(false);
      }
    } else {
      Alert.alert("Erreur", "La caméra n'est pas prête.");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProcessing(true);
        setProcessingStep("Préparation de l'image...");
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection d'image:", error);
      Alert.alert(
        "Erreur",
        "Impossible de sélectionner une image. Veuillez réessayer."
      );
      setProcessing(false);
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      // Update processing status
      setProcessingStep("Conversion de l'image...");

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Extract text with Gemini API
      setProcessingStep("Extraction du texte avec l'IA...");
      const response = await extractTextFromImage(base64);

      // Check if extraction succeeded
      if (!response.success || !response.text) {
        Alert.alert(
          "Extraction impossible",
          response.errorMessage ||
            "Impossible d'extraire du texte utilisable de cette image. Essayez avec une photo plus claire ou un meilleur éclairage.",
          [{ text: "OK", onPress: () => setProcessing(false) }]
        );
        return;
      }

      // Generate flashcards automatically
      setProcessingStep("Génération des flashcards...");
      const generatedCards = await generateFlashcards(response.text, 5);

      // Create new course content
      setProcessingStep("Enregistrement du contenu...");
      const contentId = uuidv4();
      const content = {
        id: contentId,
        rawText: response.text,
        processedChunks: [
          {
            id: uuidv4(),
            text: response.text,
            metadata: {
              position: 0,
            },
          },
        ],
        title: `Notes du ${new Date().toLocaleDateString()}`,
        capturedAt: new Date(),
        imageUri: imageUri,
      };

      // Add content
      await addContent(content);

      // Add generated flashcards
      for (const card of generatedCards) {
        await addFlashcard(card.question, card.answer, contentId);
      }

      // Complete progress
      setProcessingProgress(100);
      setProcessingStep("Terminé !");

      // Add a small delay to show completed progress
      setTimeout(() => {
        // Redirect to content page
        router.replace(`/content/${contentId}`);
      }, 500);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      Alert.alert(
        "Erreur",
        "Impossible de traiter l'image. Veuillez réessayer."
      );
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    // Camera permissions still loading
    return (
      <ThemedView style={styles.loadingContainer}>
        <LinearGradient
          colors={isDark ? ["#121212", "#1e1e1e"] : ["#f5f5f5", "#ffffff"]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>
          Initialisation de la caméra...
        </ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    // Modern no permission UI
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={isDark ? ["#121212", "#1e1e1e"] : ["#f5f5f5", "#ffffff"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={styles.permissionContainer}
          entering={FadeIn.duration(500)}
        >
          <View style={styles.permissionIconContainer}>
            <IconSymbol
              name="camera.metering.none"
              size={60}
              color={colors.primary}
            />
          </View>

          <ThemedText type="subtitle" style={styles.permissionTitle}>
            Accès à la caméra requis
          </ThemedText>

          <ThemedText style={styles.permissionText}>
            Pour capturer vos notes et créer des flashcards automatiquement,
            Cardify a besoin d'accéder à votre caméra.
          </ThemedText>

          <Button
            variant="primary"
            leftIcon="camera.fill"
            style={styles.permissionButton}
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === "granted");
            }}
          >
            Autoriser l'accès à la caméra
          </Button>

          <Button
            variant="outline"
            leftIcon="photo"
            style={styles.pickButton}
            onPress={pickImage}
          >
            Sélectionner une image de la galerie
          </Button>
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Camera view */}
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Enhanced camera guidelines */}
          <Animated.View style={[styles.cameraGuidelines, guidelinesStyle]}>
            <View style={styles.cameraGuidelinesCorner} />
            <View style={styles.cameraGuidelinesCorner} />
            <View style={styles.cameraGuidelinesCorner} />
            <View style={styles.cameraGuidelinesCorner} />

            {/* Center alignment markers */}
            <View style={styles.centerAlignMarker} />
            <View style={[styles.centerAlignMarker, styles.horizontalMarker]} />
          </Animated.View>

          {/* Flash animation during photo capture */}
          <Animated.View
            style={[styles.flash, flashAnimatedStyle]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
        </View>
      </CameraView>

      {/* Enhanced processing overlay */}
      {processing && (
        <Animated.View
          style={styles.processingOverlay}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
        >
          <BlurView
            intensity={isDark ? 40 : 90}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={styles.processingCard}
            entering={SlideInUp.duration(400).springify()}
          >
            <View style={styles.processingIconContainer}>
              <LinearGradient
                colors={
                  isDark
                    ? [colors.primary, colors.secondary]
                    : [colors.primary, colors.primaryLight]
                }
                style={styles.processingIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconSymbol name="brain" size={40} color="#fff" />
              </LinearGradient>
            </View>

            <ThemedText style={styles.processingTitle}>
              Traitement en cours
            </ThemedText>

            <ThemedText style={styles.processingText}>
              {processingStep}
            </ThemedText>

            <ProgressBar
              progress={processingProgress / 100}
              height={8}
              style={styles.processingProgress}
              useGradient
              gradientColors={[colors.primary, colors.secondary]}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Enhanced camera controls */}
      <View style={styles.controlsContainer}>
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)"]}
          style={styles.controlsGradient}
        />

        <View style={styles.controls}>
          <Button
            variant="ghost"
            leftIcon="photo"
            size="medium"
            style={styles.controlButton}
            textStyle={styles.controlButtonText}
            onPress={pickImage}
            disabled={processing}
          >
            Galerie
          </Button>

          <Animated.View
            style={[
              styles.captureButtonContainer,
              captureButtonAnimatedStyle,
              pulseStyle,
            ]}
          >
            <TouchableOpacity
              style={[
                styles.captureButton,
                processing && styles.disabledButton,
              ]}
              onPress={takePicture}
              disabled={processing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f0f0"]}
                style={styles.captureButtonInner}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
            </TouchableOpacity>
          </Animated.View>

          <Button
            variant="ghost"
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            onPress={() => router.back()}
            disabled={processing}
          >
            Annuler
          </Button>
        </View>
      </View>

      {/* Instruction footer */}
      <View style={styles.instructionContainer}>
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        <ThemedText style={styles.instructionText}>
          {processing
            ? "Traitement en cours, veuillez patienter..."
            : "Prenez une photo claire de vos notes de cours"}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraGuidelines: {
    width: "85%",
    height: "65%",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    position: "relative",
  },
  cameraGuidelinesCorner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: -2,
    left: -2,
    borderTopLeftRadius: 16,
  },
  centerAlignMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 40,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginLeft: -20,
    marginTop: -1,
  },
  horizontalMarker: {
    width: 2,
    height: 40,
    marginLeft: -1,
    marginTop: -20,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    opacity: 0,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  processingCard: {
    backgroundColor:
      Platform.OS === "ios" ? "rgba(255, 255, 255, 0.7)" : "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    width: "85%",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  processingIconContainer: {
    marginBottom: 24,
  },
  processingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  processingText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
    fontWeight: "500",
    fontSize: 16,
  },
  processingProgress: {
    width: "100%",
    borderRadius: 6,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  controlsGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
  },
  captureButtonContainer: {
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  captureButton: {
    width: CAPTURE_BUTTON_SIZE,
    height: CAPTURE_BUTTON_SIZE,
    borderRadius: CAPTURE_BUTTON_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  captureButtonInner: {
    width: CAPTURE_BUTTON_SIZE - 12,
    height: CAPTURE_BUTTON_SIZE - 12,
    borderRadius: (CAPTURE_BUTTON_SIZE - 12) / 2,
  },
  controlButton: {
    paddingHorizontal: 16,
  },
  controlButtonText: {
    color: "white",
    fontSize: 15,
  },
  cancelButton: {
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 15,
  },
  instructionContainer: {
    padding: 16,
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
  },
  instructionText: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 153, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  permissionText: {
    margin: 20,
    textAlign: "center",
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  permissionButton: {
    marginBottom: 16,
    width: "100%",
    maxWidth: 350,
  },
  pickButton: {
    width: "100%",
    maxWidth: 350,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
