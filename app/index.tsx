import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

const ONBOARDING_KEY = "@antispoofing/onboarding_done";

export default function RootIndex() {
  const [isReady, setIsReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setOnboardingDone(val === "true");
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#070D18", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#1687A7" size="large" />
      </View>
    );
  }

  return <Redirect href={onboardingDone ? "/(tabs)" : "/onboarding"} />;
}
