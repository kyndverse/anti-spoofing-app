import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { palette, darkColors } from "../lib/colors";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "@antispoofing/onboarding_done";

// ─── Slide Data ───────────────────────────────────────────────────────────────

type Slide = {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  steps?: string[];
  tip?: string;
};

const SLIDES: Slide[] = [
  {
    id: "welcome",
    icon: "shield",
    iconBg: palette.primaryGlow,
    title: "Selamat Datang di\nAnti-Spoofing App",
    subtitle:
      "Teknologi liveness detection berbasis AI untuk memverifikasi bahwa Anda adalah orang nyata, bukan foto atau video.",
  },
  {
    id: "how",
    icon: "cpu",
    iconBg: "rgba(59,130,246,0.2)",
    title: "Cara Kerja\nLiveness Detection",
    subtitle: "Ikuti 4 tantangan sederhana untuk membuktikan keaslian wajah Anda:",
    steps: [
      "📍  Posisikan wajah di dalam bingkai",
      "👁️  Kedipkan mata 2 kali",
      "😊  Berikan senyum natural",
      "🤝  Anggukkan kepala perlahan",
    ],
  },
  {
    id: "tips",
    icon: "sun",
    iconBg: "rgba(245,158,11,0.2)",
    title: "Tips untuk Hasil\nTerbaik",
    subtitle: "Pastikan kondisi berikut sebelum memulai verifikasi:",
    steps: [
      "💡  Pencahayaan cukup dan merata",
      "👤  Wajah menghadap langsung ke kamera",
      "🚫  Tidak menggunakan kacamata gelap atau masker",
      "📱  Pegang ponsel setinggi wajah",
    ],
    tip: "Proses verifikasi hanya memakan waktu ±15 detik",
  },
];

// ─── Dot Indicator ────────────────────────────────────────────────────────────

function Dots({ activeIndex, total }: { activeIndex: number; total: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              width: i === activeIndex ? 24 : 8,
              backgroundColor:
                i === activeIndex ? palette.primary : darkColors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Single Slide Card ────────────────────────────────────────────────────────

function SlideCard({ slide, isActive }: { slide: Slide; isActive: boolean }) {
  return (
    <View style={{ width, paddingHorizontal: 28, justifyContent: "center", flex: 1 }}>
      {/* Icon Circle */}
      <Animated.View
        entering={isActive ? FadeIn.duration(500) : undefined}
        style={[styles.iconCircle, { backgroundColor: slide.iconBg }]}
      >
        <Feather name={slide.icon as any} size={52} color={palette.primary} />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={isActive ? FadeInDown.delay(100).duration(400) : undefined}
        style={styles.title}
      >
        {slide.title}
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        entering={isActive ? FadeInDown.delay(200).duration(400) : undefined}
        style={styles.subtitle}
      >
        {slide.subtitle}
      </Animated.Text>

      {/* Steps */}
      {slide.steps && (
        <Animated.View
          entering={isActive ? FadeInDown.delay(300).duration(400) : undefined}
          style={styles.stepsContainer}
        >
          {slide.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Tip box */}
      {slide.tip && (
        <Animated.View
          entering={isActive ? FadeInDown.delay(450).duration(400) : undefined}
          style={styles.tipBox}
        >
          <Feather name="clock" size={13} color={palette.warning} style={{ marginRight: 6 }} />
          <Text style={styles.tipText}>{slide.tip}</Text>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Onboarding Screen ────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const btnScale = useSharedValue(1);

  const isLast = activeIndex === SLIDES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const handleSkip = () => finishOnboarding();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const onPressIn = () => { btnScale.value = withSpring(0.96); };
  const onPressOut = () => { btnScale.value = withSpring(1); };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={darkColors.bg} />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} accessibilityLabel="Lewati onboarding">
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item, index }) => (
          <SlideCard slide={item} isActive={index === activeIndex} />
        )}
        contentContainerStyle={{ alignItems: "center" }}
        style={{ flex: 1 }}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <Dots activeIndex={activeIndex} total={SLIDES.length} />

        <Animated.View style={[styles.nextBtnWrapper, btnAnimStyle]}>
          <TouchableOpacity
            style={[styles.nextBtn, isLast && { backgroundColor: palette.success }]}
            onPress={handleNext}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            accessibilityLabel={isLast ? "Mulai menggunakan aplikasi" : "Slide berikutnya"}
          >
            <Text style={styles.nextBtnText}>{isLast ? "Mulai Sekarang" : "Berikutnya"}</Text>
            <Feather name={isLast ? "check" : "arrow-right"} size={18} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bg,
  },
  skipBtn: {
    position: "absolute",
    top: 52,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: darkColors.bgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  skipText: {
    color: darkColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 36,
    borderWidth: 1,
    borderColor: "rgba(22,135,167,0.15)",
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 14,
  },
  subtitle: {
    color: darkColors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  stepsContainer: {
    backgroundColor: darkColors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: darkColors.border,
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepText: {
    color: darkColors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
  },
  tipText: {
    color: palette.warning,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    paddingTop: 16,
    gap: 20,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtnWrapper: {
    width: "100%",
  },
  nextBtn: {
    backgroundColor: palette.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
