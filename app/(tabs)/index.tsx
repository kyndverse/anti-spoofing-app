import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ApiResponse = {
  prediction: string;
  probabilities: {
    fake_mannequin: number;
    fake_mask: number;
    fake_printed: number;
    fake_screen: number;
    fake_unknown: number;
    realperson: number;
  };
};

const Index = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full bg-gray-800 border rounded-3xl p-6 items-center shadow-lg">
          <View className="w-16 h-16 bg-blue-300/20 rounded-full justify-center items-center mb-5">
            <Feather name="camera" color="white" size={24} />
          </View>

          <Text className="text-white text-xl font-bold mb-2">
            Camera Access
          </Text>
          <Text className="text-slate-400 text-center mb-8 leading-6">
            Allow app to access your camera
          </Text>

          <TouchableOpacity
            onPress={requestPermission}
            className="w-full bg-blue-600 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-bold text-base">
              Add Permission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleVerifyFace = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
        });

        const context = ImageManipulator.manipulate(photo.uri);

        context.resize({ width: 600 });

        context.flip("horizontal");

        const rendered = await context.renderAsync();

        const finalPhoto = await rendered.saveAsync({
          compress: 0.7,
          format: SaveFormat.JPEG,
        });

        setCapturedUri(finalPhoto.uri);

        await sendToDetectionAPI(finalPhoto.uri);
      } catch (error) {
        console.error("Gagal mengambil gambar:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  type UploadFile = {
    uri: string;
    name: string;
    type: string;
  };

  const sendToDetectionAPI = async (uri: string) => {
    const formData = new FormData();

    const file: UploadFile = {
      uri,
      name: "face_detection.jpg",
      type: "image/jpeg",
    };

    formData.append("file", file as any);

    try {
      const response = await fetch(
        "https://unnamed-agonize-crestless.ngrok-free.dev/predict",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setResult(result);
      console.log("Hasil Deteksi:", result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView className="flex-1 p-5">
      <View
        style={{ height: 400 }}
        className="rounded-lg overflow-hidden mt-12 border border-[#1E293B]"
      >
        {!capturedUri && (
          <CameraView ref={cameraRef} facing="front" style={{ flex: 1 }} />
        )}

        {capturedUri && (
          <>
            <Image
              source={{ uri: capturedUri }}
              style={{ width: "100%", height: "100%" }}
            />

            {isProcessing && (
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
          </>
        )}
      </View>

      {!capturedUri ? (
        <TouchableOpacity
          className="bg-gray-800 p-4 rounded-xl mt-5 items-center"
          onPress={handleVerifyFace}
          disabled={isProcessing}
        >
          <Text className="text-white font-bold text-base">Verify Face</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="bg-gray-800 p-4 rounded-xl mt-5 items-center"
          onPress={() => setCapturedUri(null)}
          disabled={isProcessing}
        >
          <Text className="text-white font-bold text-base">Retake Photo</Text>
        </TouchableOpacity>
      )}

      {result && (
        <View className="mt-4 mb-16">
          <Text className="font-bold text-lg mb-3">
            Prediction: {result.prediction}
          </Text>

          {Object.entries(result.probabilities).map(([label, value]) => {
            const percentage = value * 100;

            return (
              <View key={label} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm">{label}</Text>
                  <Text className=" text-sm">{percentage.toFixed(1)}%</Text>
                </View>

                <View className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 shadow-sm">
                  <View
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-zinc-300 rounded-full"
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default Index;
