// ─── Detection Types ──────────────────────────────────────────────────────────

export type FakeProbabilityKey =
  | "fake_mannequin"
  | "fake_mask"
  | "fake_printed"
  | "fake_screen"
  | "fake_unknown"
  | "realperson";

export type DetectionResult = {
  prediction: FakeProbabilityKey;
  probabilities: Record<FakeProbabilityKey, number>;
};

// ─── Liveness FSM ─────────────────────────────────────────────────────────────

export type DetectionPhase =
  | "idle"
  | "challenge_position"
  | "challenge_blink"
  | "challenge_smile"
  | "challenge_nod"
  | "capturing"
  | "processing"
  | "success"
  | "error";

export type LivenessChallenge = {
  id: DetectionPhase;
  instruction: string;
  subInstruction: string;
  icon: string;
  durationMs: number;
};

// ─── History ──────────────────────────────────────────────────────────────────

export type HistoryEntry = {
  id: string;
  timestamp: number;
  result: DetectionResult;
  isReal: boolean;
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export type AppSettings = {
  apiUrl: string;
  theme: "dark" | "light";
  hapticEnabled: boolean;
};
