import { Feather } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DetectionPhase } from "../../types/detection";
import { palette } from "../../lib/colors";
import ScannerOverlay from "./ScannerOverlay";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  cameraRef: React.RefObject<CameraView | null>;
  phase: DetectionPhase;
  facing: "front" | "back";
  onToggleFacing: () => void;
};

const OVERLAY_SIZE = 260;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Komponen kamera murni: menggabungkan CameraView dengan ScannerOverlay
 * dan tombol flip kamera di pojok kanan bawah.
 * Stateless — semua berasal dari props.
 */
export default function CameraScanner({
  cameraRef,
  phase,
  facing,
  onToggleFacing,
}: Props) {
  const isIdle = phase === "idle";
  const isProcessing = phase === "processing" || phase === "capturing";

  // Animasi rotate icon flip
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    rotateAnim.value = withTiming(rotateAnim.value + 180, { duration: 300 });
  }, [facing, rotateAnim]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  return (
    <View style={styles.wrapper} className="rounded-2xl overflow-hidden">
      <CameraView
        ref={cameraRef}
        facing={facing}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dim overlay saat processing */}
      {isProcessing && (
        <View style={[StyleSheet.absoluteFillObject, styles.dimOverlay]} />
      )}

      {/* Bingkai scanner animasi */}
      <View style={styles.overlayContainer}>
        <ScannerOverlay phase={phase} size={OVERLAY_SIZE} />
      </View>

      {/* ── Flip Camera Button ─────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.flipBtn, !isIdle && styles.flipBtnDisabled]}
        onPress={onToggleFacing}
        disabled={!isIdle}
        accessibilityLabel={`Ganti ke kamera ${facing === "front" ? "belakang" : "depan"}`}
        accessibilityRole="button"
      >
        <Animated.View style={iconAnimStyle}>
          <Feather name="refresh-cw" size={18} color={isIdle ? "white" : "rgba(255,255,255,0.3)"} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 360,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  dimOverlay: {
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 1,
  },
  flipBtn: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  flipBtnDisabled: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderColor: "rgba(255,255,255,0.06)",
  },
});
