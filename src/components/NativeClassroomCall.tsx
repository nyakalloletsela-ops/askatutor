import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Users, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

import type { MediaDiagnostics, Participant, ParticipantStatus } from "@/components/JitsiRoom";

type NativeCallApi = { executeCommand: (cmd: string, ...args: unknown[]) => void };
type SignalPayload = {
  senderId: string;
  senderName?: string;
  targetId?: string;
  kind: "offer" | "answer" | "candidate" | "leave";
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};
type PresencePayload = { userId: string; displayName: string };

const initialDiagnostics: MediaDiagnostics = {
  cameraAvailable: "checking",
  microphoneAvailable: "checking",
  cameraPermission: "checking",
  microphonePermission: "checking",
  jitsiMessages: [],
};

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface Props {
  roomId: string;
  displayName?: string;
  email?: string;
  audioOnly?: boolean;
  showParticipants?: boolean;
  onParticipantsChange?: (participants: Participant[]) => void;
  onDiagnosticsChange?: (diagnostics: MediaDiagnostics) => void;
  onApiReady?: (api: NativeCallApi | null) => void;
}

const readPermission = async (name: "camera" | "microphone") => {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";
  try {
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return status.state;
  } catch {
    return "unknown";
  }
};

const streamConstraints = (videoDeviceId?: string, audioDeviceId?: string): MediaStreamConstraints => ({
  video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
  audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
});

export function NativeClassroomCall({
  roomId,
  displayName,
  audioOnly = false,
  showParticipants = true,
  onParticipantsChange,
  onDiagnosticsChange,
  onApiReady,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const userIdRef = useRef<string>("");
  const remoteUserIdRef = useRef<string>("");
  const makingOfferRef = useRef(false);
  const deviceIdsRef = useRef({ camera: "", mic: "", speaker: "" });
  const [started, setStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [diagnostics, setDiagnostics] = useState<MediaDiagnostics>(initialDiagnostics);
  const fullClassUrl = typeof window === "undefined" ? `/classroom/${roomId}` : `${window.location.origin}/classroom/${roomId}`;

  const patchDiagnostics = useCallback((patch: Partial<MediaDiagnostics>) => {
    setDiagnostics((current) => ({ ...current, ...patch, lastCheckedAt: Date.now() }));
  }, []);

  const addMessage = useCallback((message: string) => {
    setDiagnostics((current) => ({
      ...current,
      jitsiMessages: [message, ...current.jitsiMessages].slice(0, 5),
      lastCheckedAt: Date.now(),
    }));
  }, []);

  const refreshDiagnostics = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      patchDiagnostics({ cameraAvailable: "unavailable", microphoneAvailable: "unavailable", cameraPermission: "unavailable", microphonePermission: "unavailable" });
      return;
    }
    const [cameraPermission, microphonePermission] = await Promise.all([readPermission("camera"), readPermission("microphone")]);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      patchDiagnostics({
        cameraPermission,
        microphonePermission,
        cameraAvailable: devices.some((device) => device.kind === "videoinput") ? "available" : "missing",
        microphoneAvailable: devices.some((device) => device.kind === "audioinput") ? "available" : "missing",
      });
    } catch {
      patchDiagnostics({ cameraPermission, microphonePermission, cameraAvailable: "unknown", microphoneAvailable: "unknown" });
    }
  }, [patchDiagnostics]);

  const updateParticipants = useCallback((remote?: PresencePayload, status: ParticipantStatus = "connecting") => {
    const ownName = displayName ?? "You";
    setParticipants([
      { id: userIdRef.current || "local", displayName: ownName, status: "joined" },
      ...(remote ? [{ id: remote.userId, displayName: remote.displayName, status }] : []),
    ]);
  }, [displayName]);

  const sendSignal = useCallback((signal: Omit<SignalPayload, "senderId" | "senderName">) => {
    const senderId = userIdRef.current;
    if (!senderId || !channelRef.current) return;
    void channelRef.current.send({
      type: "broadcast",
      event: "signal",
      payload: { ...signal, senderId, senderName: displayName ?? "Guest" } satisfies SignalPayload,
    });
  }, [displayName]);

  const ensurePeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ kind: "candidate", targetId: remoteUserIdRef.current, candidate: event.candidate.toJSON() });
      }
    };
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      setParticipants((current) => current.map((p) => (p.id === remoteUserIdRef.current ? { ...p, status: "joined" } : p)));
      addMessage("Peer video connected");
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") addMessage("Peer connection established");
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") addMessage(`Peer connection ${pc.connectionState}`);
    };
    return pc;
  }, [addMessage, sendSignal]);

  const makeOffer = useCallback(async (targetId: string) => {
    if (!localStreamRef.current || !targetId || makingOfferRef.current) return;
    const pc = ensurePeerConnection();
    if (pc.signalingState !== "stable") return;
    makingOfferRef.current = true;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ kind: "offer", targetId, description: pc.localDescription?.toJSON() });
    } finally {
      makingOfferRef.current = false;
    }
  }, [ensurePeerConnection, sendSignal]);

  const handleSignal = useCallback(async ({ payload }: { payload: SignalPayload }) => {
    if (!payload || payload.senderId === userIdRef.current) return;
    if (payload.targetId && payload.targetId !== userIdRef.current) return;
    remoteUserIdRef.current = payload.senderId;
    updateParticipants({ userId: payload.senderId, displayName: payload.senderName ?? "Guest" });
    const pc = ensurePeerConnection();
    try {
      if (payload.kind === "offer" && payload.description) {
        await pc.setRemoteDescription(payload.description);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ kind: "answer", targetId: payload.senderId, description: pc.localDescription?.toJSON() });
      } else if (payload.kind === "answer" && payload.description) {
        await pc.setRemoteDescription(payload.description);
      } else if (payload.kind === "candidate" && payload.candidate) {
        await pc.addIceCandidate(payload.candidate);
      } else if (payload.kind === "leave") {
        remoteUserIdRef.current = "";
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        updateParticipants(undefined);
      }
    } catch (error) {
      addMessage(error instanceof Error ? error.message : "Peer signal failed");
    }
  }, [addMessage, ensurePeerConnection, sendSignal, updateParticipants]);

  const startSignaling = useCallback(async () => {
    if (channelRef.current) return;
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) {
      setPermissionError("Please sign in again before starting video.");
      return;
    }
    userIdRef.current = userId;
    const channel = supabase.channel(`classroom-call:${roomId}`, { config: { broadcast: { self: false }, presence: { key: userId } } });
    channelRef.current = channel;
    channel.on("broadcast", { event: "signal" }, handleSignal);
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresencePayload>();
      const remote = Object.values(state).flat().find((p) => p.userId !== userId);
      remoteUserIdRef.current = remote?.userId ?? "";
      updateParticipants(remote, remote ? "connecting" : "joined");
      if (remote?.userId && userId < remote.userId) void makeOffer(remote.userId);
    });
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void channel.track({ userId, displayName: displayName ?? "Guest" } satisfies PresencePayload);
        updateParticipants(undefined);
      }
    });
  }, [displayName, handleSignal, makeOffer, roomId, updateParticipants]);

  const switchInput = useCallback(async (kind: "camera" | "mic", deviceId: string) => {
    deviceIdsRef.current = { ...deviceIdsRef.current, [kind]: deviceId };
    if (!localStreamRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia(streamConstraints(deviceIdsRef.current.camera, deviceIdsRef.current.mic));
    const oldStream = localStreamRef.current;
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    const pc = pcRef.current;
    if (pc) {
      for (const track of stream.getTracks()) {
        const sender = pc.getSenders().find((s) => s.track?.kind === track.kind);
        if (sender) await sender.replaceTrack(track);
      }
    }
    oldStream.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    onDiagnosticsChange?.(diagnostics);
  }, [diagnostics, onDiagnosticsChange]);

  useEffect(() => {
    onParticipantsChange?.(participants);
  }, [participants, onParticipantsChange]);

  useEffect(() => {
    void refreshDiagnostics();
  }, [refreshDiagnostics]);

  useEffect(() => {
    const api: NativeCallApi = {
      executeCommand: (cmd, _label, deviceId) => {
        if (cmd === "setVideoInputDevice" && typeof deviceId === "string") void switchInput("camera", deviceId);
        if (cmd === "setAudioInputDevice" && typeof deviceId === "string") void switchInput("mic", deviceId);
        if (cmd === "setAudioOutputDevice" && typeof deviceId === "string") {
          deviceIdsRef.current.speaker = deviceId;
          const el = remoteVideoRef.current as HTMLVideoElement & { setSinkId?: (id: string) => Promise<void> };
          void el?.setSinkId?.(deviceId);
        }
      },
    };
    onApiReady?.(api);
    return () => onApiReady?.(null);
  }, [onApiReady, switchInput]);

  useEffect(
    () => () => {
      sendSignal({ kind: "leave", targetId: remoteUserIdRef.current });
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      pcRef.current?.close();
      if (channelRef.current) void supabase.removeChannel(channelRef.current);
    },
    [sendSignal],
  );

  const startCall = async () => {
    setPermissionError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser cannot access the camera or microphone.");
      patchDiagnostics({ cameraAvailable: "unavailable", microphoneAvailable: "unavailable", cameraPermission: "unavailable", microphonePermission: "unavailable" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(streamConstraints(deviceIdsRef.current.camera, deviceIdsRef.current.mic));
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setStarted(true);
      patchDiagnostics({ cameraAvailable: "available", microphoneAvailable: "available", cameraPermission: "granted", microphonePermission: "granted" });
      await startSignaling();
      addMessage("Native classroom video started");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        patchDiagnostics({ cameraAvailable: "blocked", microphoneAvailable: "blocked", cameraPermission: "denied", microphonePermission: "denied" });
        setPermissionError("Camera or microphone is blocked. Tap the lock icon in the address bar and allow camera and microphone.");
      } else if (name === "NotFoundError") {
        patchDiagnostics({ cameraAvailable: "missing", microphoneAvailable: "missing" });
        setPermissionError("No camera or microphone was found on this device.");
      } else {
        patchDiagnostics({ cameraAvailable: "unknown", microphoneAvailable: "unknown" });
        setPermissionError("Camera and microphone could not start. Check browser permissions and try again.");
      }
    }
  };

  return (
    <div className="relative h-full w-full bg-background">
      <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full bg-background object-cover" />
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className={`absolute bottom-2 right-2 h-20 w-28 rounded-md border border-border bg-muted object-cover shadow-lg ${audioOnly ? "opacity-0" : "opacity-100"}`}
      />
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center bg-background p-4">
          <div className="flex max-w-xs flex-col items-center gap-3 text-center">
            <Button onClick={startCall} className="w-full">
              <Video className="mr-2 h-4 w-4" /> Start camera and mic
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={fullClassUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open full classroom tab
              </a>
            </Button>
            {permissionError && <p className="text-xs text-destructive">{permissionError}</p>}
          </div>
        </div>
      )}
      {started && !remoteStreamRef.current && (
        <div className="absolute inset-x-2 top-2 rounded-md bg-background/80 px-2 py-1 text-center text-xs text-muted-foreground backdrop-blur">
          Waiting for the other person to start camera and mic…
        </div>
      )}
      {started && showParticipants && participants.length > 0 && (
        <div className="pointer-events-none absolute left-2 bottom-2 z-10 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur">
          <Users className="h-3 w-3" />
          <span>{participants.length}</span>
        </div>
      )}
    </div>
  );
}