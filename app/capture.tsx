import { extractTextFromImage, generateFlashcards } from "@/api/openai";
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
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { v4 as uuidv4 } from "uuid";

const FLASH_DURATION = 200;
const CAPTURE_BUTTON_SIZE = 80;

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

  // Animations
  const flashOpacity = useSharedValue(0);
  const captureButtonScale = useSharedValue(1);

  // Styles animés
  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const pulseAnimation = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const captureButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureButtonScale.value }],
  }));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
    
    // Animation de pulsation continue
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(0.95, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  // Simuler la progression pendant le traitement
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (processing) {
      // Réinitialiser la progression au début du traitement
      setProcessingProgress(0);

      interval = setInterval(() => {
        setProcessingProgress((prev) => {
          // Limiter la progression à 90% pour attendre la fin réelle du traitement
          const next = prev + (0.5 + Math.random() * 1.5);
          return next > 90 ? 90 : next;
        });
      }, 300);
    } else {
      // Compléter la progression à 100% à la fin du traitement
      setProcessingProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processing]);

  const animateFlash = () => {
    // Effet de flash visuel lors de la prise de photo
    flashOpacity.value = withSequence(
      withTiming(1, { duration: FLASH_DURATION / 2 }),
      withTiming(0, { duration: FLASH_DURATION / 2 })
    );

    // Animation du bouton de capture
    captureButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );

    // Effet de pulsation accentuée
    pulseAnimation.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(0.8, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );

    // Retour haptique
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        animateFlash();

        if (cameraRef.current instanceof CameraView) {
          // Marquer comme en cours de traitement
          setProcessing(true);
          setProcessingStep("Capture de l'image...");

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
      // Mise à jour du statut de traitement
      setProcessingStep("Conversion de l'image...");

      // Convertir l'image en base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Extraire le texte avec l'API OpenAI
      setProcessingStep("Extraction du texte avec l'IA...");
      const response = await extractTextFromImage(base64);

      // Vérifier si l'extraction a réussi
      if (!response.success || !response.text) {
        Alert.alert(
          "Extraction impossible",
          response.errorMessage ||
            "Impossible d'extraire du texte utilisable de cette image. Essayez avec une photo plus claire ou un meilleur éclairage.",
          [{ text: "OK", onPress: () => setProcessing(false) }]
        );
        return;
      }

      // Générer des flashcards automatiquement
      setProcessingStep("Génération des flashcards...");
      const generatedCards = await generateFlashcards(response.text, 5);

      // Créer un nouveau contenu de cours
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

      // Ajouter le contenu
      await addContent(content);

      // Ajouter les flashcards générées
      for (const card of generatedCards) {
        await addFlashcard(card.question, card.answer, contentId);
      }

      // Compléter la progression
      setProcessingProgress(100);
      setProcessingStep("Terminé !");

      // Ajouter un petit délai pour montrer la progression complète
      setTimeout(() => {
        // Rediriger vers la page de contenu
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
    // Camera permissions are still loading
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>
          Chargement de la caméra...
        </ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <Animated.View
          style={styles.permissionContainer}
          entering={FadeIn.duration(500)}
        >
          <IconSymbol
            name="camera.metering.none"
            size={60}
            color={colors.primary}
          />

          <ThemedText style={styles.errorText}>
            Accès à la caméra refusé. Veuillez activer les permissions de caméra
            pour capturer vos notes.
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
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.cameraGuidelines}>
            <View style={styles.cameraGuidelinesCorner} />
            <View style={styles.cameraGuidelinesCorner} />
            <View style={styles.cameraGuidelinesCorner} />
            <View style={styles.cameraGuidelinesCorner} />
          </View>

          {/* Flash d'animation lors de la prise de photo */}
          <Animated.View
            style={[styles.flash, flashAnimatedStyle]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.8)", "rgba(255,255,255,0)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
        </View>
      </CameraView>

      {/* Overlay de traitement */}
      {processing && (
        <Animated.View
          style={styles.processingOverlay}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
        >
          <BlurView
            intensity={isDark ? 40 : 80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={styles.processingCard}
            entering={SlideInUp.duration(400).springify()}
          >
            <View style={styles.processingIconContainer}>
              <IconSymbol name="brain" size={40} color={colors.primary} />
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
            />
          </Animated.View>
        </Animated.View>
      )}

      <View style={styles.controls}>
        <Button
          variant="outline"
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
          style={[styles.captureButtonContainer, captureButtonAnimatedStyle]}
        >
          <TouchableOpacity
            style={[styles.captureButton, processing && styles.disabledButton]}
            onPress={takePicture}
            disabled={processing}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonInner} />
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

      <View style={styles.instructionContainer}>
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
    width: "90%",
    height: "70%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    position: "relative",
  },
  cameraGuidelinesCorner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "rgba(255, 255, 255, 0.8)",
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
      Platform.OS === "ios" ? "rgba(255, 255, 255, 0.7)" : "#FFFFFF", // Nous utiliserons dynamiquement la couleur appropriée dans le composant
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  processingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 153, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  processingText: {
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },
  processingProgress: {
    width: "100%",
    borderRadius: 4,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  captureButtonContainer: {
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  controlButton: {
    paddingHorizontal: 16,
  },
  controlButtonText: {
    color: "white",
    fontSize: 14,
  },
  cancelButton: {
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
  },
  pickButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
    marginVertical: 10,
  },
  instructionContainer: {
    padding: 15,
    backgroundColor: "#000",
  },
  instructionText: {
    color: "white",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    margin: 20,
    textAlign: "center",
    marginBottom: 30,
  },
  permissionButton: {
    marginBottom: 16,
    width: "100%",
  },
  pickButton: {
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
