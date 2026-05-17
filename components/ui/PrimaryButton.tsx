import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { DetectionPhase } from "../../types/detection";
import { palette } from "../../lib/colors";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  phase: DetectionPhase;
  onStart: () => void;
  onReset: () => void;
};

// ─── Config per fase ──────────────────────────────────────────────────────────

type ButtonConfig = {
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  disabled: boolean;
  showSpinner: boolean;
  action: "start" | "reset";
};

function getConfig(phase: DetectionPhase): ButtonConfig {
  switch (phase) {
    case "idle":
      return {
        label: "Mulai Verifikasi",
        icon: "shield",
        color: palette.primary,
        glowColor: palette.primaryGlow,
        disabled: false,
        showSpinner: false,
        action: "start",
      };
    case "success":
      return {
        label: "Verifikasi Ulang",
        icon: "refresh-cw",
        color: palette.success,
        glowColor: palette.successGlow,
        disabled: false,
        showSpinner: false,
        action: "reset",
      };
    case "error":
      return {
        label: "Coba Lagi",
        icon: "refresh-cw",
        color: palette.error,
        glowColor: palette.errorGlow,
        disabled: false,
        showSpinner: false,
        action: "reset",
      };
    default:
      return {
        label: "Memproses...",
        icon: "loader",
        color: palette.processing,
        glowColor: "rgba(59,130,246,0.25)",
        disabled: true,
        showSpinner: true,
        action: "start",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrimaryButton({ phase, onStart, onReset }: Props) {
  const cfg = getConfig(phase);
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (cfg.action === "start") onStart();
    else onReset();
  };

  const onPressIn = () => {
    if (!cfg.disabled) scale.value = withSpring(0.96, { stiffness: 400 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { stiffness: 300 });
  };

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.wrapper}>
      {/* Glow layer */}
      {!cfg.disabled && (
        <View
          style={[
            styles.glow,
            { backgroundColor: cfg.glowColor },
          ]}
        />
      )}

      <Animated.View style={btnAnimStyle}>
        <Animated.View
          accessible
          accessibilityLabel={cfg.label}
          accessibilityRole="button"
          // @ts-ignore — TouchableWithoutFeedback equivalent via onStartShouldSetResponder
          onStartShouldSetResponder={() => true}
          onResponderGrant={onPressIn}
          onResponderRelease={() => {
            onPressOut();
            if (!cfg.disabled) handlePress();
          }}
          onResponderTerminate={onPressOut}
          style={[
            styles.btn,
            {
              backgroundColor: cfg.disabled ? "#1E2D45" : cfg.color,
              opacity: cfg.disabled ? 0.7 : 1,
            },
          ]}
        >
          <View style={styles.btnContent}>
            {cfg.showSpinner ? (
              <ActivityIndicator color="white" size="small" style={styles.btnIcon} />
            ) : (
              <Feather
                name={cfg.icon as any}
                size={18}
                color="white"
                style={styles.btnIcon}
              />
            )}
            <Text style={styles.btnLabel}>{cfg.label}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    position: "relative",
  },
  glow: {
    position: "absolute",
    bottom: -8,
    left: "10%",
    right: "10%",
    height: 20,
    borderRadius: 10,
    filter: undefined,  // blur not available in RN, use opacity instead
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnIcon: {
    marginRight: 8,
  },
  btnLabel: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});
