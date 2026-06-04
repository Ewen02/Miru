"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { DirectMessageDto } from "@miru/types";
import { API_URL } from "./env";

/**
 * Connects to the messaging gateway, joins one conversation room, and invokes
 * `onMessage` for each live message. The socket authenticates via the session
 * cookie (sent with `withCredentials`). Re-joins when the conversation changes.
 */
export function useMessagesSocket(
  conversationId: string | null,
  onMessage: (message: DirectMessageDto) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!conversationId) return;
    const socket: Socket = io(`${API_URL}/ws/messages`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    const handler = (m: DirectMessageDto) => {
      if (m.conversationId === conversationId) onMessageRef.current(m);
    };
    socket.on("message", handler);
    socket.on("connect", () => {
      socket.emit("join", { conversationId });
    });

    return () => {
      socket.off("message", handler);
      socket.disconnect();
    };
  }, [conversationId]);
}
