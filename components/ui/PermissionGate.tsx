import { Feather } from "@expo/vector-icons";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { palette, darkColors, lightColors } from "../../lib/colors";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  onRequest: () => void;
  isPermanent?: boolean;
  onOpenSettings?: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Ditampilkan saat izin kamera ditolak.
 * Menangani dua skenario: bisa diminta lagi, atau ditolak permanen.
 * Mendukung dark/light mode.
 */
export default function PermissionGate({
  onRequest,
  isPermanent = false,
  onOpenSettings,
}: Props) {
  const { isDark } = useTheme();
  const c = isDark ? darkColors : lightColors;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={c.bg}
      />
      <View style={styles.inner}>
        {/* Icon */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: `${palette.primary}22`,
              borderColor: `${palette.primary}44`,
            },
          ]}
        >
          <Feather name="camera-off" size={36} color={palette.primary} />
        </View>

        {/* Judul */}
        <Text style={[styles.title, { color: c.textPrimary }]}>
          {isPermanent ? "Akses Ditolak Permanen" : "Izin Kamera Diperlukan"}
        </Text>

        {/* Deskripsi */}
        <Text style={[styles.desc, { color: c.textSecondary }]}>
          {isPermanent
            ? "Anda telah menolak akses kamera secara permanen. Buka Pengaturan perangkat untuk mengaktifkannya kembali."
            : "Aplikasi ini memerlukan akses kamera untuk melakukan verifikasi liveness wajah Anda."}
        </Text>

        {/* CTA Button */}
        {isPermanent ? (
          <TouchableOpacity
            onPress={onOpenSettings}
            style={[styles.btn, { backgroundColor: palette.primary }]}
            accessibilityLabel="Buka pengaturan perangkat"
          >
            <Feather name="settings" size={18} color="white" />
            <Text style={styles.btnLabel}>Buka Pengaturan</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onRequest}
            style={[styles.btn, { backgroundColor: palette.primary }]}
            accessibilityLabel="Izinkan akses kamera"
          >
            <Feather name="camera" size={18} color="white" />
            <Text style={styles.btnLabel}>Izinkan Akses Kamera</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  btn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnLabel: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});
