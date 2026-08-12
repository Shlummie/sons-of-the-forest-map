import { useCallback, useEffect, useState } from "react";
import type { NormalizedCoordinate, ProgressState } from "../types/map";
import { readProgress, writeProgress } from "../utils/storage";

export function useMapProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => readProgress());

  useEffect(() => {
    writeProgress(progress);
  }, [progress]);

  const toggleListValue = useCallback((key: "favorites" | "discovered", id: string) => {
    setProgress((current) => {
      const values = current[key];
      return { ...current, [key]: values.includes(id) ? values.filter((value) => value !== id) : [...values, id] };
    });
  }, []);

  const setCoordinateOverride = useCallback((id: string, coordinates: NormalizedCoordinate) => {
    setProgress((current) => ({
      ...current,
      coordinateOverrides: { ...current.coordinateOverrides, [id]: coordinates },
    }));
  }, []);

  const toggleVerificationFlag = useCallback((id: string) => {
    setProgress((current) => ({
      ...current,
      verificationFlags: current.verificationFlags.includes(id)
        ? current.verificationFlags.filter((value) => value !== id)
        : [...current.verificationFlags, id],
    }));
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setProgress((current) => ({ ...current, highContrast: value }));
  }, []);

  return { progress, toggleListValue, setCoordinateOverride, toggleVerificationFlag, setHighContrast };
}
