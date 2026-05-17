import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistory } from "../../context/HistoryContext";
import { useTheme } from "../../context/ThemeContext";
import { palette, darkColors, lightColors } from "../../lib/colors";
import { HistoryEntry } from "../../types/detection";

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function HistoryItem({ entry, isDark }: { entry: HistoryEntry; isDark: boolean }) {
  const c = isDark ? darkColors : lightColors;
  const topConf = Math.round(
    (entry.result.probabilities[entry.result.prediction] ?? 0) * 100,
  );
  const accentColor = entry.isReal ? palette.success : palette.error;

  return (
    <View
      style={[
        styles.item,
        {
          backgroundColor: c.bgCard,
          borderColor: `${accentColor}30`,
        },
      ]}
    >
      {/* Status icon */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: `${accentColor}20` },
        ]}
      >
        <Feather
          name={entry.isReal ? "check-circle" : "alert-triangle"}
          size={20}
          color={accentColor}
        />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { color: accentColor }]}>
          {entry.isReal ? "Wajah Asli" : "Spoofing Terdeteksi"}
        </Text>
        <Text style={[styles.itemDate, { color: c.textMuted }]}>
          {formatDate(entry.timestamp)}
        </Text>
      </View>

      {/* Confidence */}
      <Text style={[styles.confidence, { color: c.textSecondary }]}>
        {topConf}%
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { entries, clearHistory } = useHistory();
  const { isDark } = useTheme();
  const c = isDark ? darkColors : lightColors;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={c.bg}
      />

      <View style={[styles.container, { backgroundColor: c.bg }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: c.textPrimary }]}>Riwayat</Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {entries.length} hasil tersimpan
            </Text>
          </View>

          {entries.length > 0 && (
            <TouchableOpacity
              onPress={clearHistory}
              style={[
                styles.clearBtn,
                {
                  backgroundColor: isDark ? "#1A0A0A" : "#FEF2F2",
                  borderColor: isDark ? "#3F1515" : "#FCA5A5",
                },
              ]}
              accessibilityLabel="Hapus semua riwayat"
            >
              <Text style={[styles.clearBtnText, { color: palette.error }]}>
                Hapus Semua
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="clock" size={48} color={c.border} />
            <Text style={[styles.emptyTitle, { color: c.textMuted }]}>
              Belum ada riwayat verifikasi
            </Text>
            <Text style={[styles.emptySubtitle, { color: c.border }]}>
              Hasil deteksi akan muncul di sini
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryItem entry={item} isDark={isDark} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 4 },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearBtnText: { fontSize: 12, fontWeight: "600" },
  item: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemTitle: { fontWeight: "700", fontSize: 14 },
  itemDate: { fontSize: 12, marginTop: 2 },
  confidence: { fontSize: 13, fontWeight: "600" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 15, textAlign: "center" },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
});
