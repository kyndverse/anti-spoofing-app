import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { palette } from "../../lib/colors";
import { DetectionResult, FakeProbabilityKey } from "../../types/detection";
import ProbabilityBar from "./ProbabilityBar";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = { result: DetectionResult };

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultCard({ result }: Props) {
  const isReal = result.prediction === "realperson";
  const accentColor = isReal ? palette.success : palette.error;
  const glowColor = isReal ? palette.successGlow : palette.errorGlow;

  const sortedEntries = Object.entries(result.probabilities).sort(
    ([, a], [, b]) => b - a,
  ) as [FakeProbabilityKey, number][];

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
      style={{
        backgroundColor: "#0F1A2E",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: accentColor,
        padding: 20,
        marginTop: 16,
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {/* ── Header Badge ── */}
      <View className="flex-row items-center mb-5">
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: glowColor,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Feather
            name={isReal ? "check-circle" : "alert-triangle"}
            size={22}
            color={accentColor}
          />
        </View>

        <View className="flex-1">
          <Text
            style={{ color: accentColor, fontSize: 18, fontWeight: "800" }}
          >
            {isReal ? "Wajah Asli Terdeteksi" : "Spoofing Terdeteksi!"}
          </Text>
          <Text style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>
            {isReal
              ? "Verifikasi liveness berhasil"
              : `Jenis: ${result.prediction.replace("fake_", "").replace("_", " ")}`}
          </Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={{ height: 1, backgroundColor: "#1E2D45", marginBottom: 14 }} />

      {/* ── Probability Bars ── */}
      <Text
        style={{ color: "#475569", fontSize: 11, fontWeight: "600", marginBottom: 10, letterSpacing: 1 }}
      >
        DISTRIBUSI PROBABILITAS
      </Text>
      {sortedEntries.map(([label, value]) => (
        <ProbabilityBar
          key={label}
          label={label}
          value={value}
          isHighlighted={label === result.prediction}
        />
      ))}
    </Animated.View>
  );
}
