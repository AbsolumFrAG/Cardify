import "dotenv/config";

export default {
  expo: {
    owner: "cardify",
    name: "Cardify",
    slug: "cardify",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "cardify",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cardify.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.cardify.app",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission:
            "Autorisez Cardify à accéder à votre appareil photo pour capturer vos notes de cours.",
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission:
            "Autorisez Cardify à accéder à vos photos pour enregistrer les images capturées.",
        },
      ],
    ],
    extra: {
      openAIApiKey: process.env.OPENAI_API_KEY,
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
      pineconeIndex: process.env.PINECONE_INDEX,
      eas: {
        projectId: "8ee92364-5ea8-419c-b26b-43b55c11ccb4",
      },
    },
    experiments: {
      typedRoutes: true,
    },
  },
};
