import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HistoryEntry } from "../types/detection";

// ─── Context ──────────────────────────────────────────────────────────────────

type HistoryContextValue = {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id">) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue>({
  entries: [],
  addEntry: () => {},
  clearHistory: () => {},
});

const STORAGE_KEY = "@antispoofing/history";
const MAX_ENTRIES = 50;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Load dari AsyncStorage saat mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setEntries(JSON.parse(raw) as HistoryEntry[]);
        } catch {
          // Data corrupt, reset
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    });
  }, []);

  const persist = useCallback((newEntries: HistoryEntry[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  }, []);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id">) => {
      setEntries((prev) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        // Terbaru di atas, maksimum MAX_ENTRIES entri
        const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const clearHistory = useCallback(() => {
    setEntries([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <HistoryContext.Provider value={{ entries, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHistory() {
  return useContext(HistoryContext);
}
