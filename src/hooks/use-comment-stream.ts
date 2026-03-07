"use client";

import { useEffect, useRef } from "react";

interface CommentData {
  id: number;
  userId: string;
  themeId: number;
  parentId: number | null;
  content: string;
  mentions: string[];
  depth: number;
  deleted: boolean;
  editedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    displayName: string | null;
    image: string | null;
  };
}

interface CommentStreamCallbacks {
  onComment: (comment: CommentData) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function useCommentStream(
  themeId: number | null,
  callbacks: CommentStreamCallbacks,
) {
  const ref = useRef(callbacks);
  ref.current = callbacks;

  useEffect(() => {
    if (!themeId) return;

    const es = new EventSource(`/api/comments/stream?themeId=${themeId}`);

    es.addEventListener("comment", (e) => {
      try {
        const comment = JSON.parse(e.data) as CommentData;
        ref.current.onComment(comment);
      } catch {
        // ignore
      }
    });

    es.addEventListener("edit", () => {
      ref.current.onEdit?.();
    });

    es.addEventListener("delete", () => {
      ref.current.onDelete?.();
    });

    return () => es.close();
  }, [themeId]);
}

export type { CommentData };
