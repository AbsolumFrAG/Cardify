/**
 * 🎨 Hook pour récupérer dynamiquement une couleur du thème (light ou dark)
 * Permet de surcharger avec une couleur manuelle via `props`
 * Utilisation : const color = useThemeColor({}, "primary")
 */

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
): string {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName] as string;
  }
}