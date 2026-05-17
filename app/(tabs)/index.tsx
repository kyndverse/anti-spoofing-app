import React from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraScanner from "../../components/camera/CameraScanner";
import ResultCard from "../../components/detection/ResultCard";
import ChallengeProgress from "../../components/liveness/ChallengeProgress";
import ChallengePrompt from "../../components/liveness/ChallengePrompt";
import ChallengeTimer from "../../components/liveness/ChallengeTimer";
import InstructionBanner from "../../components/ui/InstructionBanner";
import PermissionGate from "../../components/ui/PermissionGate";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useTheme } from "../../context/ThemeContext";
import { useCameraPermission } from "../../hooks/useCameraPermission";
import { useLivenessDetection } from "../../hooks/useLivenessDetection";
import { darkColors, lightColors } from "../../lib/colors";

// ─── Halaman Utama ────────────────────────────────────────────────────────────

export default function DetectionScreen() {
  const { isDark } = useTheme();
  const c = isDark ? darkColors : lightColors;

  // ── Izin Kamera ──────────────────────────────────────────────────────────
  const {
    isLoading,
    isGranted,
    isPermanentlyDenied,
    requestPermission,
    openSettings,
  } = useCameraPermission();

  // ── Liveness Detection FSM ────────────────────────────────────────────────
  const {
    phase,
    result,
    errorMessage,
    cameraRef,
    facing,
    toggleFacing,
    startLiveness,
    reset,
  } = useLivenessDetection();

  // ── Guard: menunggu status izin ───────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: c.textMuted, fontSize: 13 }}>Memuat...</Text>
      </View>
    );
  }

  // ── Guard: izin ditolak ───────────────────────────────────────────────────
  if (!isGranted) {
    return (
      <PermissionGate
        onRequest={requestPermission}
        isPermanent={isPermanentlyDenied}
        onOpenSettings={openSettings}
      />
    );
  }

  // ── UI Utama ──────────────────────────────────────────────────────────────
  const showCamera = phase !== "success" && phase !== "error";
  const showChallenge = phase.startsWith("challenge_");
  const showResult = phase === "success" && result;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={c.bg}
      />

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: c.textPrimary, fontSize: 24, fontWeight: "800" }}>
            Verifikasi Wajah
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 4 }}>
            Anti-Spoofing Liveness Detection
          </Text>
        </View>

        {/* ── Instruction Banner ─────────────────────────────────────────── */}
        <InstructionBanner
          phase={phase}
          result={result}
          errorMessage={errorMessage}
        />

        {/* ── Camera View ────────────────────────────────────────────────── */}
        {showCamera && (
          <CameraScanner
            cameraRef={cameraRef}
            phase={phase}
            facing={facing}
            onToggleFacing={toggleFacing}
          />
        )}

        {/* ── Challenge Indicators (progress dots + prompt + timer) ───────── */}
        {showChallenge && (
          <View style={{ marginTop: 20 }}>
            <ChallengeProgress phase={phase} />
            <View style={{ marginTop: 16 }}>
              <ChallengePrompt phase={phase} />
            </View>
            {/* Countdown timer animasi */}
            <ChallengeTimer phase={phase} />
          </View>
        )}

        {/* ── Primary Action Button ──────────────────────────────────────── */}
        <PrimaryButton
          phase={phase}
          onStart={startLiveness}
          onReset={reset}
        />

        {/* ── Result Card (muncul saat success) ─────────────────────────── */}
        {showResult && <ResultCard result={result} />}

        {/* ── Error Detail ───────────────────────────────────────────────── */}
        {phase === "error" && (
          <View
            style={{
              marginTop: 12,
              padding: 14,
              backgroundColor: isDark ? "#1A0A0A" : "#FEF2F2",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#3F1515" : "#FCA5A5",
            }}
          >
            <Text
              style={{
                color: "#EF4444",
                fontSize: 13,
                lineHeight: 18,
              }}
            >
              {errorMessage}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
