import { TransitionPresets } from "@react-navigation/stack";

// These transitions are used for screen navigation animations
export const ScreenTransitions = {
  // For modal presentations
  modalSlideFromBottom: TransitionPresets.ModalSlideFromBottomIOS,
  modalTransparent: TransitionPresets.ModalTransition,

  // For standard page navigation
  defaultTransition: TransitionPresets.DefaultTransition,
  fadeTransition: TransitionPresets.FadeFromBottomAndroid,

  // Custom transitions
  slideFromRight: {
    ...TransitionPresets.SlideFromRightIOS,
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
