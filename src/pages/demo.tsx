"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/services/token";

// Minimal types to avoid any
type StreamingEventHandler = (event: unknown) => void;
interface MinimalStreamingAvatar {
  on: (event: string, handler: StreamingEventHandler) => void;
  createStartAvatar: (options: StartAvatarOptions) => Promise<unknown>;
  stopAvatar: () => Promise<void> | void;
  speak: (options: { text: string; task_type: string }) => Promise<void>;
}

type StartAvatarOptions = {
  quality: unknown;
  avatarName?: string;
  voice?: { voiceId: string };
  activityIdleTimeout?: number;
};

export default function Demo() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const avatarRef = useRef<MinimalStreamingAvatar | null>(null);

  const start = async () => {
    setError(null);
    setBusy(true);

    try {
      const tokenRes = await getAccessToken();
      const tokenJson = await tokenRes.json();
      const token = tokenJson?.data?.token;
      if (!token) throw new Error("No streaming session token returned");

      const {
        default: StreamingAvatar,
        StreamingEvents,
        AvatarQuality,
        TaskType,
      } = await import("@heygen/streaming-avatar");

      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => setTalking(true));
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => setTalking(false));
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setError("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event: CustomEvent<MediaStream>) => {
        const stream: MediaStream | undefined = event?.detail;
        if (!stream) return;

        const v = stream.getVideoTracks().length;
        const a = stream.getAudioTracks().length;
        console.log("STREAM_READY tracks:", { video: v, audio: a });

        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => { });
        }
        if (audioRef.current) {
          audioRef.current.muted = true;
          audioRef.current.srcObject = stream;
          audioRef.current.play().catch(() => { });
        }

        if (!v) setError("No video track (check avatarName/avatarId).");
        if (!a) setError("No audio track (check voiceId).");
      });

      const startOptions: StartAvatarOptions = {
        quality: AvatarQuality.High,
        avatarName: "default",
        voice: { voiceId: "119caed25533477ba63822d5d1552d25" },
        activityIdleTimeout: 300,
      };

      await avatar.createStartAvatar(startOptions);

      setBusy(false);

      await avatar.speak({
        text: "Hello! Your streaming avatar is live.",
        task_type: TaskType.REPEAT,
      });
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Failed to start streaming avatar";
      setError(message);
      setBusy(false);
    }
  };

  const stop = async () => {
    try {
      await avatarRef.current?.stopAvatar();
    } catch { }
  };

  const say = async (text: string) => {
    if (!text.trim()) return;
    const { TaskType } = await import("@heygen/streaming-avatar");
    await avatarRef.current?.speak({ text, task_type: TaskType.TALK });
  };

  useEffect(() => {
    return () => {
      try { avatarRef.current?.stopAvatar(); } catch { }
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Streaming Avatar (SDK)</h1>

      <div className="flex gap-2">
        <button
          onClick={start}
          disabled={busy}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {busy ? "Starting…" : "Start"}
        </button>
        <button onClick={stop} className="px-4 py-2 rounded bg-red-800">
          Stop
        </button>
        <button
          onClick={() => {
            if (videoRef.current) videoRef.current.muted = false;
            if (audioRef.current) audioRef.current.muted = false;
            videoRef.current?.play().catch(() => { });
            audioRef.current?.play().catch(() => { });
          }}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Unmute
        </button>
      </div>

      <div className="rounded overflow-hidden bg-black w-full h-[500px]">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className="w-full h-full object-contain"
        />
        <audio ref={audioRef} style={{ display: "none" }} />
      </div>

      <ChatBox onSend={say} />

      <div className="text-sm text-gray-600">{talking ? "Avatar is talking…" : "Idle"}</div>
      {error && <div className="text-red-600 text-sm">Error: {error}</div>}
    </div>
  );
}

function ChatBox({ onSend }: { onSend: (t: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend(text);
            setText("");
          }
        }}
        placeholder="Type a message…"
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        onClick={() => {
          onSend(text);
          setText("");
        }}
        className="px-4 py-2 rounded bg-blue-500 text-white"
      >
        Send
      </button>
    </div>
  );
}
