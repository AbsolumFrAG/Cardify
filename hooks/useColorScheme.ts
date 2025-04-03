/**
 * Redirige automatiquement vers la bonne implémentation selon la plateforme (web ou mobile).
 * 📦 Le fichier `useColorScheme.web.ts` est utilisé uniquement sur le web.
 * 📱 Sur mobile, on garde celui de React Native.
 */
export { useColorScheme } from "react-native";
