import { HistoryProvider } from "../context/HistoryContext";
import { ThemeProvider } from "../context/ThemeContext";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="onboarding"
            options={{ animation: "fade" }}
          />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </HistoryProvider>
    </ThemeProvider>
  );
}
