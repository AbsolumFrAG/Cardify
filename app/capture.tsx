import { extractTextFromImage, generateFlashcards } from "@/api/openai";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useContent } from "@/context/ContentContext";
import { useFlashcards } from "@/context/FlashcardContext";
import { Camera, CameraView } from "expo-camera";
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
        setProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        if (photo && photo.uri) {
          await processImage(photo.uri);
        } else {
          throw new Error("Photo capture failed.");
        }
      } catch (error) {
        console.error("Erreur lors de la prise de photo:", error);
        Alert.alert(
          "Erreur",
          "Impossible de prendre une photo. Veuillez réessayer."
        );
        setProcessing(false);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProcessing(true);
      await processImage(result.assets[0].uri);
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
        "Impossible de traiter l'image. Veuillez réessayer.",
        [{ text: "OK", onPress: () => setProcessing(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ThemedText>Demande d'autorisation...</ThemedText>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>
          Accès à la caméra refusé. Veuillez activer les permissions de caméra
          dans les paramètres.
        </ThemedText>
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
      {processing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.processingText}>
            Traitement de l'image et extraction du texte...
          </ThemedText>
        </View>
      ) : (
        <>
          <CameraView style={styles.camera} facing={"back"} ref={cameraRef}>
            <View style={styles.overlay}>
              <View style={styles.cameraGuidelines} />
            </View>
          </CameraView>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
              <IconSymbol name="photo" size={24} color="white" />
              <ThemedText style={styles.pickButtonText}>Galerie</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <IconSymbol name="xmark" size={24} color="white" />
              <ThemedText style={styles.pickButtonText}>Annuler</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.instructionContainer}>
            <ThemedText style={styles.instructionText}>
              Prenez une photo claire de vos notes de cours
            </ThemedText>
          </View>
        </>
      )}
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
  pickButton: {
    alignItems: "center",
  },
  pickButtonText: {
    color: "white",
    marginTop: 5,
  },
  cancelButton: {
    alignItems: "center",
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
});
