import { DetectionResult } from "../types/detection";
import { DETECTION_ENDPOINT } from "../lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiError = {
  code: "NETWORK" | "SERVER" | "PARSE" | "UNKNOWN";
  message: string;
  status?: number;
};

// ─── API Call ─────────────────────────────────────────────────────────────────

/**
 * Mengirim gambar wajah ke backend anti-spoofing dan mengembalikan hasil deteksi.
 * Dipisahkan dari komponen agar mudah di-test dan diganti endpoint-nya.
 */
export async function predictFace(imageUri: string): Promise<DetectionResult> {
  const formData = new FormData();

  // React Native FormData menerima objek { uri, name, type }
  formData.append("file", {
    uri: imageUri,
    name: "face_scan.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  let response: Response;

  try {
    response = await fetch(DETECTION_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        // Biarkan fetch set boundary Content-Type secara otomatis untuk FormData
        Accept: "application/json",
      },
    });
  } catch (networkError) {
    const err: ApiError = {
      code: "NETWORK",
      message:
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
    };
    throw err;
  }

  if (!response.ok) {
    const err: ApiError = {
      code: "SERVER",
      message: `Server merespons dengan error (${response.status}).`,
      status: response.status,
    };
    throw err;
  }

  try {
    const data = (await response.json()) as DetectionResult;
    return data;
  } catch {
    const err: ApiError = {
      code: "PARSE",
      message: "Respons server tidak valid.",
    };
    throw err;
  }
}
