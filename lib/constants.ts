import { LivenessChallenge } from "../types/detection";

// ─── API Config (12-Factor: dari environment variable) ────────────────────────
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://unnamed-agonize-crestless.ngrok-free.dev";

export const DETECTION_ENDPOINT = `${API_BASE_URL}/predict`;

// ─── Konfigurasi Capture Kamera ───────────────────────────────────────────────
export const CAPTURE_CONFIG = {
  quality: 0.6,
  resizeWidth: 640,
  compressRatio: 0.75,
} as const;

// ─── Liveness Multi-Step Challenge Sequence ───────────────────────────────────
export const LIVENESS_CHALLENGES: LivenessChallenge[] = [
  {
    id: "challenge_position",
    instruction: "Posisikan Wajah Anda",
    subInstruction: "Tempatkan wajah Anda di dalam bingkai oval",
    icon: "user",
    durationMs: 2500,
  },
  {
    id: "challenge_blink",
    instruction: "Silakan Berkedip",
    subInstruction: "Kedipkan mata Anda sebanyak 2 kali",
    icon: "eye",
    durationMs: 3500,
  },
  {
    id: "challenge_smile",
    instruction: "Silakan Tersenyum",
    subInstruction: "Berikan senyum natural Anda",
    icon: "smile",
    durationMs: 3000,
  },
  {
    id: "challenge_nod",
    instruction: "Anggukkan Kepala",
    subInstruction: "Anggukkan kepala Anda perlahan ke bawah",
    icon: "arrow-down",
    durationMs: 3500,
  },
];

// Urutan FSM untuk memudahkan traversal
export const CHALLENGE_PHASE_SEQUENCE = [
  "challenge_position",
  "challenge_blink",
  "challenge_smile",
  "challenge_nod",
  "capturing",
] as const;
