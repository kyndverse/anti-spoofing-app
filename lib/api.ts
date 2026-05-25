import { ApiResponse } from "@/types/ApiResponse";
import { Platform } from "react-native";

const API_URL = "https://unnamed-agonize-crestless.ngrok-free.dev/predict";

export const getPrediction = async (uri: string): Promise<ApiResponse> => {
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

  const parsedData = JSON.parse(rawText) as ApiResponse;
  return parsedData;
};
