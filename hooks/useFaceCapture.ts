import { CameraView } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { RefObject, useCallback, useState } from "react";
import { CAPTURE_CONFIG } from "../lib/constants";

/**
 * Mengelola logika pengambilan foto dan pemrosesan gambar (resize + flip).
 * Dipisah dari useLivenessDetection agar mudah di-test secara terpisah.
 */
export function useFaceCapture(cameraRef: RefObject<CameraView | null>) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const captureAndProcess = useCallback(async (): Promise<string> => {
    if (!cameraRef.current) {
      throw new Error("Kamera belum siap.");
    }

    setIsCapturing(true);

    try {
      // 1. Ambil foto
      const photo = await cameraRef.current.takePictureAsync({
        quality: CAPTURE_CONFIG.quality,
        base64: false,
      });

      if (!photo) throw new Error("Gagal mengambil foto.");

      // 2. Proses gambar: resize + flip horizontal (koreksi kamera depan)
      const context = ImageManipulator.manipulate(photo.uri);
      context.resize({ width: CAPTURE_CONFIG.resizeWidth });
      context.flip("horizontal");

      const rendered = await context.renderAsync();
      const finalPhoto = await rendered.saveAsync({
        compress: CAPTURE_CONFIG.compressRatio,
        format: SaveFormat.JPEG,
      });

      setCapturedUri(finalPhoto.uri);
      return finalPhoto.uri;
    } finally {
      setIsCapturing(false);
    }
  }, [cameraRef]);

  const resetCapture = useCallback(() => {
    setCapturedUri(null);
  }, []);

  return { captureAndProcess, isCapturing, capturedUri, resetCapture };
}
