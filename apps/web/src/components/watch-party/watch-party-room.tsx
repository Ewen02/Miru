"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/env";

interface Playback {
  playing: boolean;
  positionSeconds: number;
  updatedAtMs: number;
}
interface ChatMessage {
  userId: string;
  userName: string;
  body: string;
  atMs: number;
}

/**
 * Watch-party room. Connects to /ws/party, then either creates a party (and
 * becomes host) or joins one by code. The host's transport controls broadcast
 * playback to guests; everyone shares a live chat. Pure client/real-time —
 * no persistence, so a refresh leaves the party.
 */
export function WatchPartyRoom({
  isAuthenticated,
  initialCode,
}: {
  isAuthenticated: boolean;
  /** S3-08 — when present, auto-join this code once the socket is connected. */
  initialCode?: string;
}) {
  const t = useTranslations("watchPartyPage");
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState(initialCode ?? "");
  const [isHost, setIsHost] = useState(false);
  const [playback, setPlayback] = useState<Playback>({ playing: false, positionSeconds: 0, updatedAtMs: 0 });
  const [members, setMembers] = useState<number>(1);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = io(`${API_URL}/ws/party`, { withCredentials: true, transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("playback", (p: Playback) => setPlayback(p));
    socket.on("members", (m: { members: string[] }) => setMembers(m.members.length));
    socket.on("chat", (m: ChatMessage) => setChat((prev) => [...prev.slice(-99), m]));

    // S3-08: auto-join when the page was loaded with a code in the URL.
    if (initialCode) {
      socket.emit(
        "join",
        { code: initialCode },
        (res: { error?: string; state?: { code: string; playback: Playback; members: string[] } }) => {
          if (res.error || !res.state) {
            setError(t("notFound"));
            return;
          }
          setCode(res.state.code);
          setIsHost(false);
          setPlayback(res.state.playback);
          setMembers(res.state.members.length);
        },
      );
    }

    return () => {
      socket.disconnect();
    };
    // initialCode only changes on a brand-new page load — intentional dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-md border border-border-subtle bg-bg-surface px-4 py-2 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated"
      >
        {t("loginToParty")}
      </button>
    );
  }

  const create = () => {
    socketRef.current?.emit("create", { title: "Watch party" }, (res: { code?: string; error?: string }) => {
      if (res.error || !res.code) return setError(res.error ?? "error");
      setCode(res.code);
      setIsHost(true);
      // S3-08: bump the URL to the persistent /party/{code} variant so the
      // host can copy from the address bar AND a refresh re-joins the same
      // party (the gateway is in-memory, the auto-join uses initialCode).
      router.replace(`/party/${res.code}`, { scroll: false });
    });
  };

  const copyShareLink = async () => {
    if (!code || typeof window === "undefined") return;
    const url = `${window.location.origin}/party/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked — the URL is already in the address bar, no need
      // to surface an error to the user.
    }
  };

  const join = () => {
    const c = joinCode.trim().toUpperCase();
    if (!c) return;
    socketRef.current?.emit("join", { code: c }, (res: { error?: string; state?: { code: string; playback: Playback; members: string[] } }) => {
      if (res.error || !res.state) return setError(t("notFound"));
      setCode(res.state.code);
      setIsHost(false);
      setPlayback(res.state.playback);
      setMembers(res.state.members.length);
      setError(null);
    });
  };

  const hostControl = (playing: boolean, positionSeconds: number) => {
    const next = { playing, positionSeconds, updatedAtMs: Date.now() };
    setPlayback(next);
    socketRef.current?.emit("sync", next);
  };

  const sendChat = () => {
    const body = draft.trim();
    if (!body) return;
    socketRef.current?.emit("chat", { body });
    setDraft("");
  };

  if (!code) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={create}
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base"
        >
          {t("createParty")}
        </button>
        <div className="flex items-center gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            maxLength={6}
            placeholder={t("codePlaceholder")}
            className="flex-1 rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 font-mono text-sm uppercase tracking-widest text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <button
            type="button"
            onClick={join}
            className="inline-flex h-10 items-center rounded-md border border-border bg-bg-surface px-4 font-body text-sm font-medium text-text-primary"
          >
            {t("joinParty")}
          </button>
        </div>
        {error && <p className="m-0 font-body text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm uppercase tracking-widest text-accent">{code}</span>
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex h-7 items-center rounded-md border border-border-subtle bg-bg-base px-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-150 hover:border-border hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            {copied ? t("copied") : t("copyLink")}
          </button>
        </div>
        <span className="font-mono text-[11px] text-text-tertiary">
          {t("members", { count: members })} · {isHost ? t("host") : t("guest")}
        </span>
      </div>

      {/* Mock player surface synced to playback state */}
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-border-subtle bg-bg-elevated">
        <p className="m-0 font-display text-2xl text-text-secondary">
          {playback.playing ? "▶" : "⏸"} {Math.floor(playback.positionSeconds / 60)}:
          {String(Math.floor(playback.positionSeconds % 60)).padStart(2, "0")}
        </p>
        {isHost && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => hostControl(!playback.playing, playback.positionSeconds)}
              className="rounded-md bg-accent px-3 py-1.5 font-body text-sm font-medium text-bg-base"
            >
              {playback.playing ? t("pause") : t("play")}
            </button>
            <button
              type="button"
              onClick={() => hostControl(playback.playing, playback.positionSeconds + 30)}
              className="rounded-md border border-border bg-bg-surface px-3 py-1.5 font-body text-sm text-text-primary"
            >
              +30s
            </button>
          </div>
        )}
      </div>

      {/* Live chat */}
      <div className="flex h-64 flex-col rounded-2xl border border-border-subtle bg-bg-surface">
        <div className="flex-1 overflow-y-auto p-3">
          {chat.length === 0 ? (
            <p className="m-0 py-6 text-center font-body text-xs text-text-tertiary">{t("chatEmpty")}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {chat.map((m, i) => (
                <li key={`${m.atMs}-${i}`} className="font-body text-sm">
                  <span className="font-semibold text-text-primary">{m.userName}</span>{" "}
                  <span className="text-text-secondary">{m.body}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2 border-t border-border-subtle p-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            maxLength={500}
            placeholder={t("chatPlaceholder")}
            className="flex-1 rounded-lg border border-border bg-bg-base px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <button
            type="button"
            onClick={sendChat}
            className="rounded-md bg-accent px-3.5 font-body text-sm font-medium text-bg-base"
          >
            {t("chatSend")}
          </button>
        </div>
      </div>
    </div>
  );
}
