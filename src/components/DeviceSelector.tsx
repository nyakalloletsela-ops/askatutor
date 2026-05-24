import { useCallback, useEffect, useState } from "react";
import { Camera, Mic, Volume2 } from "lucide-react";

export type JitsiDeviceApi = {
  executeCommand: (cmd: string, ...args: unknown[]) => void;
};

interface Props {
  api: JitsiDeviceApi | null;
}

type DeviceList = {
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
};

const empty: DeviceList = { cameras: [], mics: [], speakers: [] };

export function DeviceSelector({ api }: Props) {
  const [devices, setDevices] = useState<DeviceList>(empty);
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [speakerId, setSpeakerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      setError("Device selection not supported in this browser.");
      return;
    }
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        cameras: list.filter((d) => d.kind === "videoinput"),
        mics: list.filter((d) => d.kind === "audioinput"),
        speakers: list.filter((d) => d.kind === "audiooutput"),
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not list devices.");
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
    const handler = () => void refresh();
    navigator.mediaDevices.addEventListener?.("devicechange", handler);
    return () => navigator.mediaDevices.removeEventListener?.("devicechange", handler);
  }, [refresh]);

  const pick = (
    kind: "camera" | "mic" | "speaker",
    deviceId: string,
    label: string,
  ) => {
    if (!api) {
      setError("Start the camera and mic before switching devices.");
      return;
    }
    const cmd =
      kind === "camera"
        ? "setVideoInputDevice"
        : kind === "mic"
          ? "setAudioInputDevice"
          : "setAudioOutputDevice";
    try {
      api.executeCommand(cmd, label, deviceId);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Switch failed.");
    }
  };

  const renderSelect = (
    icon: React.ReactNode,
    label: string,
    list: MediaDeviceInfo[],
    value: string,
    setValue: (v: string) => void,
    kind: "camera" | "mic" | "speaker",
  ) => (
    <label className="flex min-w-0 items-center gap-1.5 text-xs">
      <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
        {icon} {label}
      </span>
      <select
        value={value}
        onChange={(e) => {
          const id = e.target.value;
          setValue(id);
          const dev = list.find((d) => d.deviceId === id);
          pick(kind, id, dev?.label ?? "");
        }}
        className="min-w-0 max-w-[160px] truncate rounded border border-border bg-background px-1.5 py-0.5 text-xs"
        disabled={list.length === 0}
      >
        {list.length === 0 && <option value="">No devices</option>}
        {list.map((d, i) => (
          <option key={d.deviceId || i} value={d.deviceId}>
            {d.label || `${label} ${i + 1}`}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section className="border-b bg-muted/10 px-2 py-2 sm:px-4" aria-label="Device selector">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {renderSelect(<Camera className="h-3 w-3" />, "Camera", devices.cameras, cameraId, setCameraId, "camera")}
        {renderSelect(<Mic className="h-3 w-3" />, "Mic", devices.mics, micId, setMicId, "mic")}
        {renderSelect(<Volume2 className="h-3 w-3" />, "Speaker", devices.speakers, speakerId, setSpeakerId, "speaker")}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </section>
  );
}
