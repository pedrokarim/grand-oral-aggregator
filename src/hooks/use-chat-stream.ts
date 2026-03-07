"use client";

import { useEffect, useRef } from "react";

interface ChatMessage {
  id: number;
  userId: string;
  content: string;
  mentions: string[];
  deleted: boolean;
  editedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    displayName: string | null;
    image: string | null;
    status: string;
  };
}

interface ChatStreamCallbacks {
  onMessage: (msg: ChatMessage) => void;
  onEdit?: (msg: ChatMessage) => void;
  onDelete?: (data: { id: number }) => void;
}

export function useChatStream(callbacks: ChatStreamCallbacks) {
  const ref = useRef(callbacks);
  ref.current = callbacks;

  useEffect(() => {
    const es = new EventSource("/api/chat/stream");

    es.addEventListener("message", (e) => {
      try {
        const msg = JSON.parse(e.data) as ChatMessage;
        ref.current.onMessage(msg);
      } catch {
        // ignore malformed data
      }
    });

    es.addEventListener("edit", (e) => {
      try {
        const msg = JSON.parse(e.data) as ChatMessage;
        ref.current.onEdit?.(msg);
      } catch {
        // ignore
      }
    });

    es.addEventListener("delete", (e) => {
      try {
        const data = JSON.parse(e.data) as { id: number };
        ref.current.onDelete?.(data);
      } catch {
        // ignore
      }
    });

    es.onerror = () => {
      // EventSource auto-reconnects
    };

    return () => es.close();
  }, []);
}

export type { ChatMessage };
