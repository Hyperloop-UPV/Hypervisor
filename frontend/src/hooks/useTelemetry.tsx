import { useEffect, useMemo, useRef, useState } from "react";
import type { TelemetryData } from "../types/telemetry";
import type {
  MeasurementDictionary,
  MeasurementUpdate,
} from "@/hooks/telemetryUtils";
import {
  applyUpdateAndBuildTelemetry,
  buildTelemetryFromInitialDictionary,
  getTelemetrySignals,
  hasMeasurementValues,
  isMeasurementDictionary,
  isMeasurementUpdate,
  buildTimestamp,
} from "@/hooks/telemetryUtils";

export type TelemetrySignals = ReturnType<typeof getTelemetrySignals>;

export const useTelemetry = (url: string) => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const dictionaryRef = useRef<MeasurementDictionary>({});

  useEffect(() => {
    const source = new EventSource(url);

    const handleInitialDictionary = (
      payload: MeasurementDictionary,
      now: number,
    ) => {
      // Initial dictionary payload: defines all measurement ids/units and may or may not include values.
      dictionaryRef.current = { ...payload };
      setData(buildTelemetryFromInitialDictionary(dictionaryRef.current));
      if (hasMeasurementValues(dictionaryRef.current)) {
        setLastUpdatedAt(Date.now());
      }
    };

    const handleUpdate = (payload: MeasurementUpdate, now: number) => {
      // Incremental update payload: just values keyed by measurement id.
      setData(applyUpdateAndBuildTelemetry(dictionaryRef.current, payload));
      setLastUpdatedAt(buildTimestamp(payload));
    };

    source.onopen = () => setStatus("open");
    source.onerror = () => {
      setStatus(
        source.readyState === EventSource.CLOSED ? "closed" : "connecting",
      );
    };

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const now = Date.now();

      if (isMeasurementDictionary(payload)) {
        handleInitialDictionary(payload, now);
        return;
      }

      if (!isMeasurementUpdate(payload)) return;
      handleUpdate(payload, now);
    };

    return () => {
      source.close();
      setStatus("closed");
    };
  }, [url]);

  const signals = useMemo(() => getTelemetrySignals(data), [data]);

  return { data, status, lastUpdatedAt, signals };
};
