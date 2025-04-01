import { extractTextFromImage, generateFlashcards } from "@/api/openai";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useContent } from "@/context/ContentContext";
import { useFlashcards } from "@/context/FlashcardContext";
import { Camera, CameraType, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export default function CaptureScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const [facing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView | null>(null);
  const { addFlashcard } = useFlashcards();
  const { addContent } = useContent();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        if (cameraRef.current instanceof CameraView) {
          // Set processing state to show overlay (not replacing the camera)
          setProcessing(true);
          const photo = await cameraRef.current.takePictureAsync();

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
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProcessing(true);
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
      // Convertir l'image en base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Extraire le texte avec l'API OpenAI
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
      const generatedCards = await generateFlashcards(response.text, 5);

      // Créer un nouveau contenu de cours
      const contentId = uuidv4();
      const content = {
        id: contentId,
        rawText: response.text,
        processedChunks: [
          {
            id: uuidv4(),
            text: response.text,
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

      // Rediriger vers la page de contenu
      router.replace(`/content/${contentId}`);
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>
          Chargement de la caméra...
        </ThemedText>
      </View>
    );
  }

  if (hasPermission === false) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>
          Accès à la caméra refusé. Veuillez activer les permissions de caméra.
        </ThemedText>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <ThemedText style={styles.permissionButtonText}>
            Autoriser l'accès à la caméra
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
          <ThemedText style={styles.pickButtonText}>
            Sélectionner une image de la galerie
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.cameraGuidelines} />
        </View>
      </CameraView>

      {/* Processing overlay - shown on top of camera instead of replacing it */}
      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <ThemedText style={styles.processingText}>
              Traitement de l'image et extraction du texte...
            </ThemedText>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={pickImage}
          disabled={processing}
        >
          <IconSymbol
            name="photo"
            size={24}
            color={processing ? "rgba(255,255,255,0.5)" : "white"}
          />
          <ThemedText
            style={[styles.buttonText, processing && styles.disabledText]}
          >
            Galerie
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, processing && styles.disabledButton]}
          onPress={takePicture}
          disabled={processing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={processing}
      >
        <ThemedText
          style={[styles.cancelButtonText, processing && styles.disabledText]}
        >
          Annuler
        </ThemedText>
      </TouchableOpacity>

      <View style={styles.instructionContainer}>
        <ThemedText style={styles.instructionText}>
          {processing
            ? "Traitement en cours, veuillez patienter..."
            : "Prenez une photo claire de vos notes de cours"}
        </ThemedText>
      </View>
    </View>
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
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  processingCard: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000",
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
    alignItems: "center",
    width: 80,
  },
  buttonText: {
    color: "white",
    marginTop: 5,
    fontSize: 14,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
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
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  processingText: {
    color: "white",
    marginTop: 20,
    textAlign: "center",
  },
  errorText: {
    color: "white",
    margin: 20,
    textAlign: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  pickButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
