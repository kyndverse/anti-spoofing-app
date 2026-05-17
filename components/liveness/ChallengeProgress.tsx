import React from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { View } from "react-native";
import { LIVENESS_CHALLENGES } from "../../lib/constants";
import { palette } from "../../lib/colors";
import { DetectionPhase } from "../../types/detection";

type Props = { phase: DetectionPhase };

const CHALLENGE_IDS = LIVENESS_CHALLENGES.map((c) => c.id);

export default function ChallengeProgress({ phase }: Props) {
  const currentIndex = CHALLENGE_IDS.indexOf(phase as any);

  return (
    <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 12 }}>
      {CHALLENGE_IDS.map((id, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        const bg = isDone ? palette.success : isActive ? palette.primary : "#1E2D45";
        const w = isActive ? 20 : 8;

        return (
          <AnimatedDot key={id} width={w} bgColor={bg} />
        );
      })}
    </View>
  );
}

function AnimatedDot({ width, bgColor }: { width: number; bgColor: string }) {
  const widthAnim = useSharedValue(width);

  React.useEffect(() => {
    widthAnim.value = withTiming(width, { duration: 280 });
  }, [width, widthAnim]);

  const style = useAnimatedStyle(() => ({
    width: widthAnim.value,
    height: 8,
    borderRadius: 4,
    backgroundColor: bgColor,
  }));

  return <Animated.View style={style} />;
}
