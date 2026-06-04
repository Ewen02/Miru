"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { ConversationDetailDto, DirectMessageDto } from "@miru/types";
import { sendMessage } from "@/lib/messages-api";
import { useMessagesSocket } from "@/lib/use-messages-socket";

/**
 * Live 1-to-1 conversation. Renders the message history, subscribes to the
 * gateway for incoming messages, and sends via REST (the server then
 * broadcasts, so our own sent message also arrives over the socket — we
 * de-duplicate by id).
 */
export function ConversationView({
  conversation,
  viewerId,
}: {
  conversation: ConversationDetailDto;
  viewerId: string;
}) {
  const t = useTranslations("messagesPage");
  const [messages, setMessages] = useState<DirectMessageDto[]>(conversation.messages);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useMessagesSocket(conversation.id, (incoming) => {
    setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const text = body.trim();
    if (!text || pending) return;
    setBody("");
    startTransition(async () => {
      const result = await sendMessage(conversation.id, text);
      if ("error" in result) {
        setBody(text);
        return;
      }
      // The socket broadcast may not round-trip to the sender instantly; add
      // optimistically and let the de-dup guard handle the echo.
      setMessages((prev) => (prev.some((m) => m.id === result.id) ? prev : [...prev, result]));
    });
  };

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-border-subtle bg-bg-surface">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="m-0 py-10 text-center font-body text-sm text-text-tertiary">
            {t("noMessages")}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {messages.map((m) => {
              const mine = m.senderId === viewerId;
              return (
                <li key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <span
                    className="max-w-[75%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 font-body text-sm"
                    style={{
                      backgroundColor: mine ? "var(--color-accent)" : "var(--color-bg-elevated)",
                      color: mine ? "var(--color-bg-base)" : "var(--color-text-primary)",
                    }}
                  >
                    {m.body}
                  </span>
                </li>
              );
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border-subtle p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          maxLength={5000}
          placeholder={t("placeholder")}
          className="flex-1 rounded-lg border border-border bg-bg-base px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || body.trim().length === 0}
          className="inline-flex h-10 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base disabled:opacity-50"
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}
