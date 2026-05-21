import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ApiResponse = {
  prediction: string;
  probabilities: Record<string, number>;
  raw?: unknown;
};

const API_URL = "https://unnamed-agonize-crestless.ngrok-free.dev/predict";
const WEB_MAX_WIDTH = 430;

const Index = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [facing, setFacing] = useState<"front" | "back">("front");
  const [cameraHeight, setCameraHeight] = useState(400);

  const scannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isProcessing) {
      scannerAnim.stopAnimation();
      scannerAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scannerAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(scannerAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isProcessing, scannerAnim]);

  const translateY = scannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(cameraHeight - 5, 0)],
  });

  const safeHaptic = async (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS === "web") return;

    try {
      await Haptics.notificationAsync(type);
    } catch {
      // Abaikan jika device tidak mendukung haptic
    }
  };

  const normalizeApiResponse = (data: any): ApiResponse => {
    const prediction = String(
      data?.prediction ?? data?.class ?? data?.label ?? "unknown",
    );

    let probabilities =
      data?.probabilities ?? data?.probability ?? data?.scores;

    if (
      !probabilities ||
      typeof probabilities !== "object" ||
      Array.isArray(probabilities)
    ) {
      probabilities = {};
    }

    return {
      prediction,
      probabilities,
      raw: data,
    };
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const sendToDetectionAPI = async (uri: string) => {
    try {
      setIsProcessing(true);
      setResult(null);

      const formData = new FormData();

      if (Platform.OS === "web") {
        const imageResponse = await fetch(uri);
        const blob = await imageResponse.blob();

        formData.append("file", blob, "face_detection.jpg");
      } else {
        formData.append("file", {
          uri,
          name: "face_detection.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const rawText = await response.text();
      console.log("RAW API RESPONSE:", rawText);

      if (!response.ok) {
        throw new Error(
          `Server merespons dengan status ${response.status}: ${rawText}`,
        );
      }

      const parsedData = JSON.parse(rawText);
      console.log("PARSED API DATA:", parsedData);

      const normalizedResult = normalizeApiResponse(parsedData);
      setResult(normalizedResult);

      if (normalizedResult.prediction === "realperson") {
        await safeHaptic(Haptics.NotificationFeedbackType.Success);
      } else {
        await safeHaptic(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error("API Error:", error);

      await safeHaptic(Haptics.NotificationFeedbackType.Error);

      Alert.alert(
        "Koneksi Gagal",
        "Tidak dapat terhubung ke server pemindai. Cek console browser untuk detail error.",
        [{ text: "Mengerti", style: "cancel" }],
      );

      setCapturedUri(null);
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyFace = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setResult(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      if (!photo?.uri) {
        throw new Error("Gagal mengambil URI foto dari kamera.");
      }

      const context = ImageManipulator.manipulate(photo.uri);
      context.resize({ width: 600 });

      if (facing === "front") {
        context.flip("horizontal");
      }

      const rendered = await context.renderAsync();
      const finalPhoto = await rendered.saveAsync({
        compress: 0.7,
        format: SaveFormat.JPEG,
      });

      setCapturedUri(finalPhoto.uri);
      await sendToDetectionAPI(finalPhoto.uri);
    } catch (error) {
      console.error("Gagal mengambil gambar:", error);
      setIsProcessing(false);

      Alert.alert(
        "Kamera Gagal",
        "Gagal mengambil gambar dari kamera. Silakan coba lagi.",
      );
    }
  };

  const pickImage = async () => {
    if (isProcessing) return;

    try {
      setResult(null);

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
      });

      if (
        !pickerResult.canceled &&
        pickerResult.assets &&
        pickerResult.assets.length > 0
      ) {
        const uri = pickerResult.assets[0].uri;

        setCapturedUri(uri);
        await sendToDetectionAPI(uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);

      Alert.alert("Error", "Gagal memuat gambar dari galeri.");
      setIsProcessing(false);
    }
  };

  const resetScan = () => {
    if (isProcessing) return;

    setCapturedUri(null);
    setResult(null);
  };

  if (!permission) {
    return <View className="flex-1 bg-background" />;
  }

  if (!permission.granted) {
    return (
      <View
        className="flex-1 justify-center items-center px-6 bg-background"
        style={
          Platform.OS === "web"
            ? {
                width: "100%",
                alignItems: "center",
              }
            : undefined
        }
      >
        <View
          className="w-full bg-white rounded-3xl p-8 items-center shadow-sm"
          style={
            Platform.OS === "web"
              ? {
                  maxWidth: WEB_MAX_WIDTH,
                }
              : undefined
          }
        >
          <View className="w-20 h-20 bg-blue-50 rounded-full justify-center items-center mb-6">
            <Feather name="camera" color="#1687A7" size={32} />
          </View>

          <Text className="text-gray-900 text-2xl font-bold mb-3 text-center">
            Akses Kamera
          </Text>

          <Text className="text-gray-500 text-center mb-8 leading-relaxed">
            Aplikasi membutuhkan akses kamera untuk melakukan verifikasi
            keaslian wajah.
          </Text>

          <TouchableOpacity
            onPress={requestPermission}
            className="w-full bg-active py-4 rounded-2xl items-center shadow-md"
          >
            <Text className="text-white font-bold text-lg">Izinkan Akses</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isRealPerson = result?.prediction === "realperson";
  const probabilityEntries = Object.entries(result?.probabilities ?? {}).sort(
    ([, valA], [, valB]) => Number(valB) - Number(valA),
  );

  return (
    <View
      className="flex-1 bg-background"
      style={
        Platform.OS === "web"
          ? {
              width: "100%",
              alignItems: "center",
            }
          : undefined
      }
    >
      <View
        className="flex-1 w-full"
        style={
          Platform.OS === "web"
            ? {
                width: "100%",
                maxWidth: WEB_MAX_WIDTH,
                alignSelf: "center",
              }
            : {
                width: "100%",
              }
        }
      >
        <ScrollView
          className="flex-1 w-full"
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 96,
            flexGrow: 1,
            width: "100%",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-10 mb-6">
            <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Liveness Check
            </Text>

            <Text className="text-base text-gray-500 mt-1">
              Arahkan wajah Anda ke kamera atau unggah foto
            </Text>
          </View>

          <View
            onLayout={(event) =>
              setCameraHeight(event.nativeEvent.layout.height)
            }
            className="w-full aspect-[3/4] bg-gray-200 rounded-[32px] overflow-hidden border-4 border-white shadow-lg relative"
          >
            {!capturedUri ? (
              <CameraView
                ref={cameraRef}
                facing={facing}
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <Image
                source={{ uri: capturedUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}

            {Platform.OS !== "web" && !capturedUri && (
              <TouchableOpacity
                onPress={toggleCameraFacing}
                className="absolute top-4 right-4 bg-black/40 p-3 rounded-full border border-white/20"
              >
                <Feather name="refresh-ccw" size={24} color="white" />
              </TouchableOpacity>
            )}

            {isProcessing && (
              <>
                <View className="absolute inset-0 bg-black/40" />

                <Animated.View
                  style={{
                    transform: [{ translateY }],
                    position: "absolute",
                    width: "100%",
                    height: 4,
                    backgroundColor: "#10B981",
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 10,
                    zIndex: 20,
                  }}
                />

                <View className="absolute inset-0 justify-center items-center z-30">
                  <ActivityIndicator color="#10B981" size="large" />

                  <Text className="text-white mt-4 font-bold text-lg tracking-wide">
                    Menganalisis...
                  </Text>
                </View>
              </>
            )}
          </View>

          <View className="mt-8">
            {!capturedUri ? (
              <View className="flex-row gap-4">
                <TouchableOpacity
                  className={`flex-1 bg-active py-4 rounded-2xl flex-row justify-center items-center shadow-md ${
                    isProcessing ? "opacity-50" : "opacity-100"
                  }`}
                  onPress={handleVerifyFace}
                  disabled={isProcessing}
                >
                  <Feather name="shield" size={22} color="white" />

                  <Text className="text-white font-bold text-lg ml-2">
                    Verifikasi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`bg-inactive px-6 rounded-2xl justify-center items-center shadow-md ${
                    isProcessing ? "opacity-50" : "opacity-100"
                  }`}
                  onPress={pickImage}
                  disabled={isProcessing}
                >
                  <Feather name="image" size={24} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className={`bg-gray-800 py-4 rounded-2xl flex-row justify-center items-center shadow-md ${
                  isProcessing ? "opacity-50" : "opacity-100"
                }`}
                onPress={resetScan}
                disabled={isProcessing}
              >
                <Feather name="refresh-ccw" size={20} color="white" />

                <Text className="text-white font-bold text-lg ml-2">
                  Ambil Ulang Data
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {result && (
            <View className="mt-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="font-bold text-xl text-gray-900">
                  Hasil Analisis
                </Text>

                <View
                  className={`px-4 py-1.5 rounded-full ${
                    isRealPerson ? "bg-success/20" : "bg-danger/20"
                  }`}
                >
                  <Text
                    className={`font-bold text-sm tracking-wide ${
                      isRealPerson ? "text-success" : "text-danger"
                    }`}
                  >
                    {isRealPerson ? "ASLI" : "PALSU (SPOOFING)"}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-500 mb-5">
                Prediksi model:{" "}
                <Text className="font-bold text-gray-900">
                  {result.prediction}
                </Text>
              </Text>

              {probabilityEntries.length > 0 ? (
                probabilityEntries.map(([label, value]) => {
                  const numericValue = Number(value);
                  const percentage = Number.isFinite(numericValue)
                    ? numericValue * 100
                    : 0;

                  const safePercentage = Math.max(0, Math.min(percentage, 100));

                  const isReal = label === "realperson";
                  const barColor = isReal ? "bg-success" : "bg-danger";

                  return (
                    <View key={label} className="mb-4">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-sm font-medium text-gray-700 capitalize">
                          {label.replaceAll("_", " ")}
                        </Text>

                        <Text className="text-sm font-bold text-gray-900">
                          {safePercentage.toFixed(1)}%
                        </Text>
                      </View>

                      <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          style={{ width: `${safePercentage}%` }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-500 text-sm leading-relaxed">
                    Probabilitas tidak tersedia dari response API. Cek console
                    browser untuk melihat bentuk response mentah dari server.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default Index;
