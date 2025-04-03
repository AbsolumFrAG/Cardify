import { TransitionPresets } from "@react-navigation/stack";
import { Easing } from "react-native-reanimated";

// These transitions are used for screen navigation animations
export const ScreenTransitions = {
  // For modal presentations
  modalSlideFromBottom: {
    ...TransitionPresets.ModalSlideFromBottomIOS,
    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 450,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
        },
      },
      close: {
        animation: "timing",
        config: {
          duration: 450,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
        },
      },
    },
  },

  modalTransparent: TransitionPresets.ModalTransition,

  // For standard page navigation
  defaultTransition: {
    ...TransitionPresets.DefaultTransition,
    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 400,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
        },
      },
      close: {
        animation: "timing",
        config: {
          duration: 400,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
        },
      },
    },
  },

  fadeTransition: TransitionPresets.FadeFromBottomAndroid,

  // Custom transitions
  slideFromRight: {
    ...TransitionPresets.SlideFromRightIOS,
    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
      },
      close: {
        animation: "timing",
        config: {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
      },
    },
    cardStyleInterpolator: ({
      current,
      layouts,
    }: {
      current: { progress: any };
      layouts: { screen: { width: number } };
    }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },
};

export const TabTransitions = {
  fade: (current: any) => ({
    opacity: current.progress,
  }),
  slideUp: (current: any, next: any) => ({
    transform: [
      {
        translateY: next
          ? next.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 100],
            })
          : current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
      },
    ],
  }),
};
