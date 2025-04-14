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
  withSequence,
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
  fullWidth?: boolean;
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
    fullWidth = false,
    ...rest
  },
  ref
) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputFocus = useSharedValue(0);
  const shake = useSharedValue(0);

  // Enhanced focus animation
  const handleFocus = () => {
    setIsFocused(true);
    inputFocus.value = withTiming(1, { duration: 250 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    inputFocus.value = withTiming(0, { duration: 250 });
  };

  // Function to shake the input if there's an error
  const shakeInput = () => {
    shake.value = withSequence(
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Enhanced container animation with shake
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
      transform: [{ translateX: shake.value }],
      borderWidth: variant === "underlined" ? 0 : 1.5,
      borderBottomWidth: variant === "underlined" ? 1.5 : 1.5,
      backgroundColor:
        variant === "filled"
          ? isDark
            ? "rgba(41, 42, 43, 0.8)"
            : "rgba(0, 0, 0, 0.04)"
          : colors.input,
    };
  });

  // Animated label for enhanced floating experience
  const labelAnimatedStyle = useAnimatedStyle(() => {
    if (!label) return {};

    const fontSize = withTiming(isFocused || value ? 12 : 16, {
      duration: 250,
    });

    const top = withTiming(
      isFocused || value ? -10 : variant === "underlined" ? 8 : 14,
      { duration: 250 }
    );

    const color = error
      ? colors.error
      : interpolateColor(
          inputFocus.value,
          [0, 1],
          [colors.textSecondary, colors.primary]
        );

    const scale = withTiming(isFocused || value ? 0.85 : 1, { duration: 250 });

    return {
      fontSize,
      top,
      color,
      transform: [{ scale }],
      backgroundColor: variant === "filled" ? "transparent" : colors.background,
      paddingHorizontal: variant === "filled" ? 0 : 6,
      zIndex: 10,
    };
  });

  // Enhanced variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "outlined":
        return {
          container: {
            borderRadius: 12,
          },
          input: {
            paddingHorizontal: leftIcon ? 8 : 16,
          },
        };
      case "filled":
        return {
          container: {
            borderRadius: 12,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderWidth: 0,
            borderBottomWidth: 2,
          },
          input: {
            paddingHorizontal: leftIcon ? 8 : 16,
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
            borderRadius: 12,
          },
          input: {
            paddingHorizontal: leftIcon ? 8 : 16,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Effect to shake input when error changes
  if (error) {
    setTimeout(() => shakeInput(), 100);
  }

  return (
    <View
      style={[styles.wrapper, fullWidth && styles.fullWidth, containerStyle]}
    >
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            {
              left: leftIcon ? 42 : 16,
              paddingHorizontal: variant === "underlined" ? 0 : 6,
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
            paddingHorizontal: variant === "underlined" ? 0 : 16,
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
              color={
                isFocused ? colors.primary : error ? colors.error : colors.icon
              }
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
                ? 36
                : variantStyles.input.paddingHorizontal,
              paddingRight:
                rightIcon || secureTextEntry
                  ? 44
                  : variantStyles.input.paddingHorizontal,
            },
            inputStyle,
          ]}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          selectionColor={colors.primary}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            activeOpacity={0.7}
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
            activeOpacity={0.7}
          >
            <IconSymbol
              name={rightIcon as any}
              size={20}
              color={isFocused ? colors.primary : colors.icon}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>

      {(helperText || error) && (
        <Animated.View
          style={[
            styles.helperContainer,
            {
              opacity: withTiming(helperText || error ? 1 : 0, {
                duration: 200,
              }),
              transform: [
                {
                  translateY: withTiming(helperText || error ? 0 : -10, {
                    duration: 200,
                  }),
                },
              ],
            },
          ]}
        >
          {error && (
            <IconSymbol
              name="exclamationmark.circle"
              size={14}
              color={colors.error}
              style={styles.helperIcon}
            />
          )}
          <ThemedText
            style={[
              styles.helperText,
              {
                color: error ? colors.error : colors.textSecondary,
              },
              helperStyle,
            ]}
          >
            {error || helperText}
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
};

export const Input = forwardRef(InputBase);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  fullWidth: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 46,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  labelContainer: {
    position: "absolute",
    backgroundColor: "transparent",
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 15,
  },
  helperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 16,
  },
  helperIcon: {
    marginRight: 6,
  },
  helperText: {
    fontSize: 13,
  },
  leftIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 16,
    zIndex: 1,
    padding: 4,
  },
});
