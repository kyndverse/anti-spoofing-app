import { useCameraPermissions } from "expo-camera";
import { Linking } from "react-native";

/**
 * Wraps expo-camera's useCameraPermissions dengan state yang lebih eksplisit
 * dan fungsi openSettings untuk kasus izin ditolak permanen.
 */
export function useCameraPermission() {
  const [permission, requestPermission] = useCameraPermissions();

  const isLoading = permission === null;
  const isGranted = permission?.granted ?? false;
  const isDenied = !isGranted && !isLoading;
  const canAskAgain = permission?.canAskAgain ?? true;
  const isPermanentlyDenied = isDenied && !canAskAgain;

  const openSettings = () => Linking.openSettings();

  return {
    isLoading,
    isGranted,
    isDenied,
    canAskAgain,
    isPermanentlyDenied,
    requestPermission,
    openSettings,
  };
}
