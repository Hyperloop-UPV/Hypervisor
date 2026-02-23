import { useEffect, useMemo, useRef, useState } from "react";
import type { TelemetryData } from "../types/telemetry";
import type {
  MeasurementDictionary,
} from "@/hooks/telemetryUtils";
import {
  applyUpdateAndBuildTelemetry,
  buildTelemetryFromInitialDictionary,
  getConnectionUptimeSeconds,
  getTelemetrySignals,
  hasMeasurementValues,
  isMeasurementDictionary,
  normalizeMeasurementUpdate,
} from "@/hooks/telemetryUtils";

export type TelemetrySignals = ReturnType<typeof getTelemetrySignals>;

export const useTelemetry = (url: string) => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );
  const [connectionUptimeSeconds, setConnectionUptimeSeconds] = useState<number | null>(null);
  // We keep the dictionary in a ref so incoming SSE updates can mutate it
  // without triggering re-renders for every key assignment.
  const dictionaryRef = useRef<MeasurementDictionary>({});

  useEffect(() => {
    const source = new EventSource(url);

    const handleInitialDictionary = (payload: MeasurementDictionary) => {
      // Initial dictionary payload: defines all measurement ids/units and may or may not include values.
      dictionaryRef.current = { ...payload };
      setData(buildTelemetryFromInitialDictionary(dictionaryRef.current));
      if (hasMeasurementValues(dictionaryRef.current)) {
        setConnectionUptimeSeconds(0);
      }
    };

    const handleUpdate = (rawPayload: unknown) => {
      const payload = normalizeMeasurementUpdate(rawPayload);
      if (!payload) return;

      // Incremental update payload: just values keyed by measurement id.
      setData(applyUpdateAndBuildTelemetry(dictionaryRef.current, payload));
      setConnectionUptimeSeconds(getConnectionUptimeSeconds(payload));
    };

    source.onopen = () => setStatus("open");
    source.onerror = () => {
      setStatus(
        source.readyState === EventSource.CLOSED ? "closed" : "connecting",
      );
    };

    source.onmessage = (event) => {
      // Backends can send either a full dictionary (first payload)
      // or incremental value updates (subsequent payloads).
      const payload = JSON.parse(event.data);

      if (isMeasurementDictionary(payload)) {
        handleInitialDictionary(payload);
        return;
      }

      handleUpdate(payload);
    };

    return () => {
      source.close();
      setStatus("closed");
    };
  }, [url]);

  const signals = useMemo(() => getTelemetrySignals(data), [data]);

  return { data, status, connectionUptimeSeconds, signals };
};
