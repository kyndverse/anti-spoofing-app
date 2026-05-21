import { Redirect } from "expo-router";

export default function Index() {
  // Langsung arahkan pengguna ke dalam folder (tabs)
  return <Redirect href="/(tabs)" />;
}
