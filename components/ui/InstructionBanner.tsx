import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInLeft,
} from "react-native-reanimated";
import { DetectionPhase, DetectionResult } from "../../types/detection";
import { palette } from "../../lib/colors";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  phase: DetectionPhase;
  result?: DetectionResult | null;
  errorMessage?: string | null;
};

// ─── Config ───────────────────────────────────────────────────────────────────

type BannerConfig = {
  icon: string;
  text: string;
  color: string;
  bgColor: string;
};

function getConfig(
  phase: DetectionPhase,
  result?: DetectionResult | null,
  errorMessage?: string | null,
): BannerConfig {
  switch (phase) {
    case "idle":
      return {
        icon: "info",
        text: "Tekan tombol untuk memulai verifikasi liveness",
        color: "#94A3B8",
        bgColor: "#0F1A2E",
      };
    case "challenge_position":
      return {
        icon: "user",
        text: "Posisikan wajah Anda di dalam bingkai",
        color: palette.primary,
        bgColor: `${palette.primary}18`,
      };
    case "challenge_blink":
      return {
        icon: "eye",
        text: "Silakan berkedip 2 kali secara natural",
        color: palette.primaryLight,
        bgColor: `${palette.primaryLight}18`,
      };
    case "challenge_smile":
      return {
        icon: "smile",
        text: "Tunjukkan senyum natural Anda",
        color: palette.warning,
        bgColor: `${palette.warning}18`,
      };
    case "challenge_nod":
      return {
        icon: "arrow-down",
        text: "Anggukkan kepala perlahan ke bawah",
        color: "#A855F7",
        bgColor: "rgba(168,85,247,0.1)",
      };
    case "capturing":
      return {
        icon: "aperture",
        text: "Mengambil foto wajah Anda...",
        color: palette.processing,
        bgColor: `${palette.processing}18`,
      };
    case "processing":
      return {
        icon: "cpu",
        text: "Menganalisis keaslian wajah dengan AI...",
        color: palette.processing,
        bgColor: `${palette.processing}18`,
      };
    case "success":
      return {
        icon: result?.prediction === "realperson" ? "check-circle" : "alert-triangle",
        text:
          result?.prediction === "realperson"
            ? "✅ Verifikasi Berhasil — Wajah asli terkonfirmasi"
            : "⚠️ Peringatan — Indikasi spoofing terdeteksi",
        color: result?.prediction === "realperson" ? palette.success : palette.error,
        bgColor:
          result?.prediction === "realperson"
            ? `${palette.success}18`
            : `${palette.error}18`,
      };
    case "error":
      return {
        icon: "x-circle",
        text: errorMessage ?? "Terjadi kesalahan. Silakan coba lagi.",
        color: palette.error,
        bgColor: `${palette.error}18`,
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Banner instruksi dengan smooth FadeIn+SlideIn saat phase berganti.
 * key={phase} memaksa Reanimated me-remount komponen setiap transisi.
 */
export default function InstructionBanner({ phase, result, errorMessage }: Props) {
  const cfg = getConfig(phase, result, errorMessage);
  const isProcessing = phase === "processing" || phase === "capturing";

  return (
    <Animated.View
      key={phase}
      entering={FadeInDown.duration(350).springify()}
      exiting={FadeOutUp.duration(180)}
      style={[
        styles.banner,
        {
          backgroundColor: cfg.bgColor,
          borderColor: `${cfg.color}30`,
        },
      ]}
    >
      {isProcessing ? (
        <ActivityIndicator color={cfg.color} size="small" style={styles.icon} />
      ) : (
        <Feather
          name={cfg.icon as any}
          size={18}
          color={cfg.color}
          style={styles.icon}
        />
      )}
      <Animated.Text
        entering={SlideInLeft.duration(300).delay(50)}
        style={[styles.text, { color: cfg.color }]}
      >
        {cfg.text}
      </Animated.Text>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
