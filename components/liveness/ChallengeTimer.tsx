import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { palette } from "../../lib/colors";
import { DetectionPhase } from "../../types/detection";
import { LIVENESS_CHALLENGES } from "../../lib/constants";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  phase: DetectionPhase;
};

// ─── Color per challenge ──────────────────────────────────────────────────────

function getChallengeColor(phase: DetectionPhase): string {
  switch (phase) {
    case "challenge_blink":
      return "#3B82F6"; // blue
    case "challenge_smile":
      return "#22C55E"; // green
    case "challenge_nod":
      return "#A855F7"; // purple
    default:
      return palette.primary; // teal for position
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Animated horizontal progress bar yang mundur dari 100% → 0%
 * selama `durationMs` per challenge phase.
 * Reset otomatis setiap kali `phase` berubah.
 */
export default function ChallengeTimer({ phase }: Props) {
  const progress = useSharedValue(1); // 1 = penuh, 0 = habis

  const challenge = LIVENESS_CHALLENGES.find((c) => c.id === phase);
  const durationMs = challenge?.durationMs ?? 3000;
  const color = getChallengeColor(phase);

  // Setiap kali phase berubah, reset dan mulai countdown baru
  useEffect(() => {
    // Set ulang ke penuh tanpa animasi
    progress.value = 1;

    // Langsung jalankan animasi mundur
    progress.value = withTiming(0, {
      duration: durationMs,
      easing: Easing.linear,
    });
  }, [phase, durationMs, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
    backgroundColor: color,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.4,
    backgroundColor: color,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      {/* Label */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color }]}>Waktu Tantangan</Text>
      </View>

      {/* Track */}
      <View style={styles.track}>
        {/* Glow layer */}
        <Animated.View style={[styles.glow, glowStyle]} />
        {/* Progress bar */}
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  track: {
    height: 6,
    backgroundColor: "#1E2D45",
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  glow: {
    position: "absolute",
    inset: 0,
    borderRadius: 3,
    height: "100%",
    width: "100%",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
});
