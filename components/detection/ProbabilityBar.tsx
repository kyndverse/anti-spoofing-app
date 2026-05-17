import React from "react";
import { View, Text } from "react-native";
import { palette } from "../../lib/colors";
import { FakeProbabilityKey } from "../../types/detection";

// ─── Label Map ────────────────────────────────────────────────────────────────

const LABEL_MAP: Record<FakeProbabilityKey, string> = {
  realperson: "Wajah Asli",
  fake_printed: "Foto Cetak",
  fake_screen: "Layar Digital",
  fake_mask: "Topeng",
  fake_mannequin: "Manekin",
  fake_unknown: "Pemalsuan Lain",
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  label: FakeProbabilityKey;
  value: number; // 0.0 – 1.0
  isHighlighted: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProbabilityBar({ label, value, isHighlighted }: Props) {
  const percentage = value * 100;
  const barColor = isHighlighted
    ? label === "realperson"
      ? palette.success
      : palette.error
    : palette.primary;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text
          className="text-sm"
          style={{
            color: isHighlighted ? barColor : "#94A3B8",
            fontWeight: isHighlighted ? "700" : "400",
          }}
        >
          {LABEL_MAP[label]}
        </Text>
        <Text
          className="text-sm font-mono"
          style={{ color: isHighlighted ? barColor : "#475569" }}
        >
          {percentage.toFixed(1)}%
        </Text>
      </View>

      {/* Track */}
      <View
        style={{
          height: 6,
          backgroundColor: "#1E2D45",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Fill */}
        <View
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: 3,
            opacity: isHighlighted ? 1 : 0.5,
          }}
        />
      </View>
    </View>
  );
}
