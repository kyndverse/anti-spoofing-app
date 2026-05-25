import { Stack } from "expo-router";
import "../global.css"; // Letakkan di baris paling atas Root Layout

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}