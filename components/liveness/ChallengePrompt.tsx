import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LIVENESS_CHALLENGES } from "../../lib/constants";
import { palette } from "../../lib/colors";
import { DetectionPhase } from "../../types/detection";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = { phase: DetectionPhase };

// ─── Helper ───────────────────────────────────────────────────────────────────

function getChallengeData(phase: DetectionPhase) {
  return LIVENESS_CHALLENGES.find((c) => c.id === phase) ?? null;
}

function getIconColor(phase: DetectionPhase): string {
  switch (phase) {
    case "challenge_blink":
      return "#3B82F6";
    case "challenge_smile":
      return palette.warning;
    case "challenge_nod":
      return "#A855F7";
    default:
      return palette.primary;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChallengePrompt({ phase }: Props) {
  const challenge = getChallengeData(phase);
  const iconScale = useSharedValue(0.6);
  const iconColor = getIconColor(phase);

  // Spring bounce saat phase berganti
  useEffect(() => {
    iconScale.value = 0.6;
    iconScale.value = withSpring(1, { damping: 8, stiffness: 220, mass: 0.8 });
  }, [phase, iconScale]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!challenge) return null;

  return (
    <Animated.View
      key={phase}
      entering={FadeInDown.duration(300).springify()}
      exiting={FadeOutUp.duration(180)}
      style={styles.container}
    >
      {/* Icon dengan spring bounce */}
      <Animated.View
        style={[
          iconAnimStyle,
          styles.iconWrapper,
          { backgroundColor: `${iconColor}22` },
        ]}
      >
        <Feather name={challenge.icon as any} size={28} color={iconColor} />
      </Animated.View>

      {/* Teks instruksi dengan slide masuk dari kanan */}
      <View style={styles.textBlock}>
        <Animated.Text
          entering={SlideInRight.duration(250).delay(60)}
          style={styles.instruction}
        >
          {challenge.instruction}
        </Animated.Text>
        <Animated.Text
          entering={SlideInRight.duration(250).delay(100)}
          style={styles.subInstruction}
        >
          {challenge.subInstruction}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  textBlock: {
    alignItems: "center",
    gap: 4,
  },
  instruction: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  subInstruction: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
