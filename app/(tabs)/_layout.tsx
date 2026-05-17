import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Dimensions, View } from "react-native";
import { palette, darkColors } from "../../lib/colors";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function TabsLayout() {
  const { isDark } = useTheme();
  const bg = isDark ? darkColors.tabBar : "#FFFFFF";
  const inactive = isDark ? "#334155" : "#94A3B8";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: isDark ? darkColors.border : "#E2E8F0",
          borderTopWidth: 1,
          height: height * 0.09,
          paddingBottom: height * 0.015,
          paddingTop: height * 0.01,
        },
      }}
    >
      {/* ── Tab: History ─────────────────────────────────────────── */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Riwayat",
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }}
      />

      {/* ── Tab: Kamera (Tengah / FAB style) ─────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: width * 0.15,
                height: width * 0.15,
                borderRadius: (width * 0.15) / 2,
                backgroundColor: focused ? palette.primaryDark : palette.primary,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: -(height * 0.018) }],
                shadowColor: palette.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Feather name="shield" size={24} color="white" />
            </View>
          ),
        }}
      />

      {/* ── Tab: Settings ────────────────────────────────────────── */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
