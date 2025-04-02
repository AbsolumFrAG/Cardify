import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/context/ThemeContext";
import { forwardRef, ForwardRefRenderFunction, useState } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedView = Animated.createAnimatedComponent(View);

interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  variant?: "outlined" | "filled" | "underlined";
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
}

const InputBase: ForwardRefRenderFunction<TextInput, InputProps> = (
  {
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    containerStyle,
    labelStyle,
    inputStyle,
    helperStyle,
    variant = "outlined",
    onRightIconPress,
    onLeftIconPress,
    secureTextEntry,
    value,
    onChangeText,
    placeholder,
    ...rest
  },
  ref
) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputFocus = useSharedValue(0);

  // Gérer l'animation de focus
  const handleFocus = () => {
    setIsFocused(true);
    inputFocus.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    inputFocus.value = withTiming(0, { duration: 200 });
  };

  // Basculer la visibilité du mot de passe
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Styles animés
  const containerAnimatedStyle = useAnimatedStyle(() => {
    let borderColor;

    if (error) {
      borderColor = colors.error;
    } else {
      borderColor = interpolateColor(
        inputFocus.value,
        [0, 1],
        [colors.border, colors.primary]
      );
    }

    return {
      borderColor,
      borderWidth: variant === "underlined" ? 0 : 1,
      borderBottomWidth: variant === "underlined" ? 1 : 1,
      backgroundColor:
        variant === "filled"
          ? isDark
            ? "rgba(41, 42, 43, 0.8)"
            : "rgba(0, 0, 0, 0.03)"
          : colors.input,
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    if (!label) return {};

    const fontSize = withTiming(isFocused || value ? 12 : 16, {
      duration: 200,
    });

    const top = withTiming(
      isFocused || value ? -8 : variant === "underlined" ? 8 : 12,
      { duration: 200 }
    );

    const color = error
      ? colors.error
      : interpolateColor(
          inputFocus.value,
          [0, 1],
          [colors.textSecondary, colors.primary]
        );

    return {
      fontSize,
      top,
      color,
      backgroundColor: variant === "filled" ? "transparent" : colors.background,
      paddingHorizontal: variant === "filled" ? 0 : 4,
    };
  });

  // Gérer les styles selon la variante
  const getVariantStyles = () => {
    switch (variant) {
      case "outlined":
        return {
          container: {
            borderRadius: 8,
          },
          input: {
            paddingHorizontal: leftIcon ? 8 : 12,
          },
        };
      case "filled":
        return {
          container: {
            borderRadius: 8,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            borderWidth: 0,
            borderBottomWidth: 2,
          },
          input: {
            paddingHorizontal: leftIcon ? 8 : 12,
          },
        };
      case "underlined":
        return {
          container: {
            borderRadius: 0,
            paddingHorizontal: 0,
          },
          input: {
            paddingHorizontal: leftIcon ? 8 : 0,
          },
        };
      default:
        return {
          container: {
            borderRadius: 8,
          },
          input: {
            paddingHorizontal: leftIcon ? 8 : 12,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            {
              zIndex: 1,
              left: leftIcon ? 36 : 12,
              paddingHorizontal: variant === "underlined" ? 0 : 4,
            },
            labelAnimatedStyle,
          ]}
          pointerEvents="none"
        >
          <ThemedText style={[styles.label, labelStyle]}>{label}</ThemedText>
        </Animated.View>
      )}

      <AnimatedView
        style={[
          styles.container,
          variantStyles.container,
          {
            paddingHorizontal: variant === "underlined" ? 0 : 12,
          },
          containerAnimatedStyle,
        ]}
      >
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            style={styles.leftIcon}
          >
            <IconSymbol
              name={leftIcon as any}
              size={20}
              color={error ? colors.error : colors.icon}
            />
          </TouchableOpacity>
        )}

        <AnimatedTextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused || !label ? placeholder : ""}
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: leftIcon
                ? 32
                : variantStyles.input.paddingHorizontal,
              paddingRight:
                rightIcon || secureTextEntry
                  ? 40
                  : variantStyles.input.paddingHorizontal,
            },
            inputStyle,
          ]}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
          >
            <IconSymbol
              name={isPasswordVisible ? ("eye.slash" as any) : ("eye" as any)}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            <IconSymbol name={rightIcon as any} size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </AnimatedView>

      {(helperText || error) && (
        <ThemedText
          style={[
            styles.helperText,
            {
              color: error ? colors.error : colors.textSecondary,
              marginLeft: leftIcon ? 36 : 12,
            },
            helperStyle,
          ]}
        >
          {error || helperText}
        </ThemedText>
      )}
    </View>
  );
};

export const Input = forwardRef(InputBase);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 42,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  labelContainer: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  leftIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    zIndex: 1,
  },
});
