import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { DetectionPhase } from "../../types/detection";
import { palette } from "../../lib/colors";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  phase: DetectionPhase;
  size: number;
};

// ─── Phase → warna bracket ────────────────────────────────────────────────────

function getPhaseColor(phase: DetectionPhase): string {
  switch (phase) {
    case "success":
      return palette.success;
    case "error":
      return palette.error;
    case "processing":
    case "capturing":
      return palette.processing;
    case "idle":
      return palette.primaryDark;
    default:
      return palette.primary; // challenge phases
  }
}

// ─── Phase → angka 0-7 untuk interpolateColor ─────────────────────────────────

const PHASE_ORDER: DetectionPhase[] = [
  "idle",
  "challenge_position",
  "challenge_blink",
  "challenge_smile",
  "challenge_nod",
  "capturing",
  "processing",
  "success",
  "error",
];

function phaseToIndex(phase: DetectionPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScannerOverlay({ phase, size }: Props) {
  const colorProgress = useSharedValue(phaseToIndex(phase));
  const scanLineY = useSharedValue(size / 2);
  const pulseScale = useSharedValue(1);
  const bracketOpacity = useSharedValue(1);

  const CORNER = size * 0.08;
  const THICKNESS = 3;

  // Smooth color transition saat phase berubah
  useEffect(() => {
    colorProgress.value = withTiming(phaseToIndex(phase), { duration: 400 });
  }, [phase, colorProgress]);

  // Animasi scan line (hanya aktif saat challenge)
  useEffect(() => {
    const isChallenge = phase.startsWith("challenge_");
    if (isChallenge) {
      scanLineY.value = withRepeat(
        withTiming(size - 4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      scanLineY.value = withTiming(size / 2, { duration: 400 });
    }
  }, [phase, size, scanLineY]);

  // Animasi pulse saat processing
  useEffect(() => {
    if (phase === "processing") {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
      );
      bracketOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      bracketOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [phase, pulseScale, bracketOpacity]);

  // ── Smooth interpolated color (Reanimated worklet) ────────────────────────

  const colorInputRange = PHASE_ORDER.map((_, i) => i);
  const colorOutputRange = PHASE_ORDER.map((p) => getPhaseColor(p));

  const animColor = useDerivedValue(() =>
    interpolateColor(colorProgress.value, colorInputRange, colorOutputRange),
  );

  // ── Animated styles ───────────────────────────────────────────────────────

  const bracketAnimStyle = useAnimatedStyle(() => ({
    opacity: bracketOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const scanLineAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: phase.startsWith("challenge_") ? 0.7 : 0,
    backgroundColor: animColor.value,
  }));

  const cornerAnimStyle = useAnimatedStyle(() => ({
    borderColor: animColor.value,
  }));

  return (
    <Animated.View
      style={[styles.container, { width: size, height: size }, bracketAnimStyle]}
    >
      {/* ── Top-Left ── */}
      <Animated.View
        style={[
          styles.corner,
          styles.topLeft,
          cornerAnimStyle,
          { width: CORNER, height: CORNER, borderWidth: THICKNESS },
        ]}
      />
      {/* ── Top-Right ── */}
      <Animated.View
        style={[
          styles.corner,
          styles.topRight,
          cornerAnimStyle,
          { width: CORNER, height: CORNER, borderWidth: THICKNESS },
        ]}
      />
      {/* ── Bottom-Left ── */}
      <Animated.View
        style={[
          styles.corner,
          styles.bottomLeft,
          cornerAnimStyle,
          { width: CORNER, height: CORNER, borderWidth: THICKNESS },
        ]}
      />
      {/* ── Bottom-Right ── */}
      <Animated.View
        style={[
          styles.corner,
          styles.bottomRight,
          cornerAnimStyle,
          { width: CORNER, height: CORNER, borderWidth: THICKNESS },
        ]}
      />

      {/* ── Scan Line ── */}
      <Animated.View
        style={[
          styles.scanLine,
          { width: size * 0.85 },
          scanLineAnimStyle,
        ]}
      />
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    borderColor: "transparent",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },
  scanLine: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
    top: 0,
    left: "7.5%",
  },
});
