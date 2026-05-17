import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistory } from "../../context/HistoryContext";
import { useTheme } from "../../context/ThemeContext";
import { palette, darkColors, lightColors } from "../../lib/colors";
import { API_BASE_URL } from "../../lib/constants";

const API_URL_KEY = "@antispoofing/api_url_override";

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  const c = isDark ? darkColors : lightColors;
  return (
    <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
      {title}
    </Text>
  );
}

// ─── Row Item ─────────────────────────────────────────────────────────────────

function SettingRow({
  icon,
  label,
  subtitle,
  right,
  isDark,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  right: React.ReactNode;
  isDark: boolean;
}) {
  const c = isDark ? darkColors : lightColors;
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: c.bgCard, borderColor: c.border },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: `${palette.primary}20` },
        ]}
      >
        <Feather name={icon as any} size={16} color={palette.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: c.textPrimary }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: c.textMuted }]}>{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { entries, clearHistory } = useHistory();
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const c = isDark ? darkColors : lightColors;

  // Load saved API URL override
  useEffect(() => {
    AsyncStorage.getItem(API_URL_KEY).then((saved) => {
      if (saved) setApiUrl(saved);
    });
  }, []);

  const saveApiUrl = () => {
    AsyncStorage.setItem(API_URL_KEY, apiUrl);
    setIsEditingUrl(false);
    Alert.alert(
      "URL Tersimpan",
      "Endpoint API baru akan aktif pada verifikasi berikutnya.",
      [{ text: "OK" }],
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Hapus Semua Riwayat",
      `Ini akan menghapus ${entries.length} entri riwayat secara permanen.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: clearHistory,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={c.bg}
      />

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.pageTitle, { color: c.textPrimary }]}>Pengaturan</Text>
        <Text style={[styles.pageSubtitle, { color: c.textMuted }]}>
          Konfigurasi aplikasi dan preferensi
        </Text>

        {/* ── Tampilan ─────────────────────────────────────────────────── */}
        <SectionHeader title="Tampilan" isDark={isDark} />

        <SettingRow
          isDark={isDark}
          icon="moon"
          label="Mode Gelap"
          subtitle={isDark ? "Aktif" : "Nonaktif"}
          right={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: c.border, true: palette.primary }}
              thumbColor={isDark ? palette.primaryLight : "#94A3B8"}
              accessibilityLabel="Toggle dark mode"
            />
          }
        />

        <SettingRow
          isDark={isDark}
          icon="smartphone"
          label="Getaran (Haptic)"
          subtitle={hapticEnabled ? "Aktif" : "Nonaktif"}
          right={
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: c.border, true: palette.primary }}
              thumbColor={hapticEnabled ? palette.primaryLight : "#94A3B8"}
              accessibilityLabel="Toggle haptic feedback"
            />
          }
        />

        {/* ── API Endpoint ──────────────────────────────────────────────── */}
        <SectionHeader title="Konfigurasi API" isDark={isDark} />

        <View
          style={[
            styles.apiCard,
            {
              backgroundColor: c.bgCard,
              borderColor: isEditingUrl ? palette.primary : c.border,
            },
          ]}
        >
          <View style={styles.apiLabelRow}>
            <Feather name="link" size={14} color={palette.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.apiLabelText, { color: c.textSecondary }]}>
              ENDPOINT URL
            </Text>
          </View>

          <TextInput
            value={apiUrl}
            onChangeText={setApiUrl}
            onFocus={() => setIsEditingUrl(true)}
            onBlur={() => setIsEditingUrl(false)}
            style={[
              styles.apiInput,
              {
                color: c.textPrimary,
                backgroundColor: isDark ? "#070D18" : "#F8FAFC",
              },
            ]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            accessibilityLabel="API URL input field"
          />

          <TouchableOpacity
            onPress={saveApiUrl}
            style={[styles.saveBtn, { backgroundColor: palette.primary }]}
            accessibilityLabel="Simpan URL API"
          >
            <Text style={styles.saveBtnLabel}>Simpan URL</Text>
          </TouchableOpacity>
        </View>

        {/* ── Data & Privacy ────────────────────────────────────────────── */}
        <SectionHeader title="Data & Privasi" isDark={isDark} />

        <TouchableOpacity onPress={handleClearHistory}>
          <SettingRow
            isDark={isDark}
            icon="trash-2"
            label="Hapus Semua Riwayat"
            subtitle={`${entries.length} entri tersimpan`}
            right={
              <Feather name="chevron-right" size={16} color={c.textMuted} />
            }
          />
        </TouchableOpacity>

        {/* ── Info ─────────────────────────────────────────────────────── */}
        <SectionHeader title="Informasi" isDark={isDark} />
        <SettingRow
          isDark={isDark}
          icon="info"
          label="Versi Aplikasi"
          subtitle="Anti-Spoofing App"
          right={
            <Text style={[styles.versionText, { color: c.textMuted }]}>v1.1.0</Text>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  pageSubtitle: { fontSize: 13, marginBottom: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 20,
    textTransform: "uppercase",
  },
  row: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowLabel: { fontWeight: "600", fontSize: 14 },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  apiCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  apiLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  apiLabelText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  apiInput: {
    fontSize: 13,
    fontFamily: "monospace",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveBtnLabel: { color: "white", fontWeight: "700", fontSize: 13 },
  versionText: { fontSize: 13 },
});
