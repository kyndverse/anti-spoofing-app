import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { CameraView } from "expo-camera";
import { useHistory } from "../context/HistoryContext";
import { predictFace } from "../services/detectionApi";
import { DetectionPhase, DetectionResult } from "../types/detection";
import { CHALLENGE_PHASE_SEQUENCE, LIVENESS_CHALLENGES } from "../lib/constants";
import { useFaceCapture } from "./useFaceCapture";

// ─── State Machine Map ────────────────────────────────────────────────────────
const CHALLENGE_DURATION_MAP: Partial<Record<DetectionPhase, number>> =
  Object.fromEntries(
    LIVENESS_CHALLENGES.map((c) => [c.id, c.durationMs]),
  );

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Mengorkestrasi seluruh alur liveness detection:
 *   idle → challenge_position → challenge_blink → challenge_smile
 *        → challenge_nod → capturing → processing → success | error
 *
 * Single source of truth untuk state mesin di halaman utama.
 */
export function useLivenessDetection() {
  const [phase, setPhase] = useState<DetectionPhase>("idle");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("front");

  const cameraRef = useRef<CameraView | null>(null);
  const { captureAndProcess } = useFaceCapture(cameraRef);
  const { addEntry } = useHistory();

  const toggleFacing = useCallback(() => {
    // Hanya bisa flip saat idle (belum mulai challenge)
    if (phase !== "idle") return;
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  }, [phase]);

  // ── Eksekusi sisi-efek capture + API setelah phase berubah ke 'capturing' ──
  const runCapture = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const uri = await captureAndProcess();

      setPhase("processing");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const detectionResult = await predictFace(uri);

      setResult(detectionResult);
      setPhase("success");

      // Simpan ke history
      addEntry({
        timestamp: Date.now(),
        result: detectionResult,
        isReal: detectionResult.prediction === "realperson",
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Terjadi kesalahan yang tidak diketahui.";
      setErrorMessage(msg);
      setPhase("error");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [captureAndProcess, addEntry]);

  // ── FSM Timer: otomatis maju ke fase berikutnya setiap challenge selesai ───
  useEffect(() => {
    const duration = CHALLENGE_DURATION_MAP[phase];
    if (!duration) return; // Bukan fase challenge, tidak perlu timer

    const timer = setTimeout(() => {
      const idx = CHALLENGE_PHASE_SEQUENCE.indexOf(phase as any);
      if (idx === -1) return;

      const next = CHALLENGE_PHASE_SEQUENCE[idx + 1];
      if (!next) return;

      if (next === "capturing") {
        setPhase("capturing");
        // runCapture dipanggil oleh useEffect di bawah
      } else {
        setPhase(next as DetectionPhase);
        Haptics.selectionAsync(); // Haptic ringan setiap ganti challenge
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [phase]);

  // ── Trigger runCapture saat phase = 'capturing' ────────────────────────────
  useEffect(() => {
    if (phase === "capturing") {
      runCapture();
    }
  }, [phase, runCapture]);

  // ── Public API ─────────────────────────────────────────────────────────────
  const startLiveness = useCallback(() => {
    setResult(null);
    setErrorMessage(null);
    setPhase("challenge_position");
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setErrorMessage(null);
  }, []);

  const isActive =
    phase !== "idle" && phase !== "success" && phase !== "error";

  return {
    phase,
    result,
    errorMessage,
    cameraRef,
    isActive,
    facing,
    toggleFacing,
    startLiveness,
    reset,
  };
}
