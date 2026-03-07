"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, LogIn, MoreHorizontal, Pencil, Send, Trash2, X } from "lucide-react";
import { signIn, useSession } from "@/lib/auth-client";
import { useCommentStream, type CommentData } from "@/hooks/use-comment-stream";
import { MentionAutocomplete, type MentionUser } from "./mention-autocomplete";

interface CommentWithReplies extends CommentData {
  replies?: CommentWithReplies[];
}

interface ThemeCommentsProps {
  themeName: string;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "à l'instant";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days > 1 ? "s" : ""}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;

  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
}

function getDisplayName(comment: CommentWithReplies) {
  return comment.user.displayName || comment.user.name || "Utilisateur";
}

function renderContent(content: string, mentions: string[]) {
  if (mentions.length === 0) return content;

  return content.split(/(@\S+)/g).map((part, index) => {
    if (!part.startsWith("@")) return part;
    return (
      <span
        key={`mention-${index}`}
        className="rounded-[4px] bg-[#EB9D2A]/20 px-1 py-0.5 text-[#C67F1D] dark:text-[#F0B14E]"
      >
        {part}
      </span>
    );
  });
}

function CommentAvatar({
  image,
  size,
}: {
  image: string | null;
  size: "sm" | "md";
}) {
  const classes = size === "md" ? "h-9 w-9" : "h-8 w-8";

  if (image) {
    return <img src={image} alt="" className={`${classes} shrink-0 rounded-full`} />;
  }

  return <div className={`${classes} shrink-0 rounded-full bg-[#D6D8CE] dark:bg-[#3B3E47]`} />;
}

function CommentThread({
  comment,
  themeId,
  onRefresh,
}: {
  comment: CommentWithReplies;
  themeId: number;
  onRefresh: () => void;
}) {
  const { data: session } = useSession();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionVisible, setMentionVisible] = useState(false);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isReply = comment.depth > 0;

  async function handleDelete() {
    try {
      await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id }),
      });
      onRefresh();
    } catch {
      // ignore
    }
    setMenuOpen(false);
  }

  async function handleEditSave() {
    if (!editText.trim()) return;
    try {
      await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id, content: editText.trim() }),
      });
      onRefresh();
      setEditing(false);
      setEditText("");
    } catch {
      // ignore
    }
  }

  async function handleReplySubmit() {
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId,
          parentId: comment.id,
          content: replyText.trim(),
          mentions: mentionIds,
        }),
      });
      setReplying(false);
      setReplyText("");
      setMentionIds([]);
      onRefresh();
    } catch {
      // ignore
    } finally {
      setSendingReply(false);
    }
  }

  function handleReplyInputChange(value: string) {
    setReplyText(value);
    const cursorPos = replyTextareaRef.current?.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionVisible(true);
    } else {
      setMentionVisible(false);
    }
  }

  function handleReplyMentionSelect(user: MentionUser) {
    const cursorPos = replyTextareaRef.current?.selectionStart ?? replyText.length;
    const textBeforeCursor = replyText.slice(0, cursorPos);
    const textAfterCursor = replyText.slice(cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);
    if (!mentionMatch) return;

    const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
    const displayName = user.displayName || user.name;
    setReplyText(`${beforeMention}@${displayName} ${textAfterCursor}`);
    setMentionIds((prev) => [...prev, user.id]);
    setMentionVisible(false);
    replyTextareaRef.current?.focus();
  }

  return (
    <div className={isReply ? "relative ml-11 pl-6" : "relative"}>
      {isReply && (
        <>
          <div className="absolute left-0 top-0 bottom-0 border-l border-[#D2D3CC] dark:border-[#3A3D46]" />
          <div className="absolute left-0 top-5 w-6 border-t border-[#D2D3CC] dark:border-[#3A3D46]" />
        </>
      )}

      <article className={`group ${isReply ? "pb-4" : "py-4"}`}>
        <div className="flex gap-3">
          <CommentAvatar image={comment.user.image} size={isReply ? "sm" : "md"} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14px] font-bold leading-none text-[#23251D] dark:text-[#EAECF6]">
                {getDisplayName(comment)}
              </span>
              <span className="text-[13px] leading-none text-[#8D8F85] dark:text-[#8F93A3]">
                {timeAgo(comment.createdAt)}
              </span>
              {comment.editedAt && !comment.deleted && (
                <span className="text-[12px] italic leading-none text-[#8D8F85] dark:text-[#8F93A3]">
                  (modifié)
                </span>
              )}
            </div>

            {comment.deleted ? (
              <p className="mt-1 text-[14px] italic text-[#8D8F85] dark:text-[#8F93A3]">
                [Commentaire supprimé]
              </p>
            ) : editing ? (
              <div className="mt-2">
                <textarea
                  ref={editTextareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleEditSave();
                    }
                    if (e.key === "Escape") {
                      setEditing(false);
                      setEditText("");
                    }
                  }}
                  rows={3}
                  className="w-full resize-none rounded-md border border-[#C8CABF] bg-[#F4F4EE] px-3 py-2 text-[14px] text-[#2E3028]
                    outline-none transition-colors focus:border-[#EB9D2A] dark:border-[#3A3D46] dark:bg-[#25272D] dark:text-[#EAECF6]"
                  autoFocus
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleEditSave}
                    className="inline-flex items-center gap-1 rounded-md bg-[#EB9D2A] px-2.5 py-1 text-[12px] font-medium text-[#FDFDF8] transition-colors hover:bg-[#D58C20]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditText("");
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-[#C8CABF] px-2.5 py-1 text-[12px] font-medium text-[#5A5C53] transition-colors hover:bg-[#ECEDE5] dark:border-[#3A3D46] dark:text-[#B8BBC8] dark:hover:bg-[#2A2D35]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-[1.55] text-[#4D4F46] dark:text-[#C4C8D5]">
                {renderContent(comment.content, comment.mentions ?? [])}
              </p>
            )}

            {!comment.deleted && comment.depth < 10 && session && !editing && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="mt-2 text-[13px] font-medium text-[#74776D] transition-colors hover:text-[#23251D] dark:text-[#A4A8B8] dark:hover:text-[#EAECF6]"
              >
                Reply
              </button>
            )}

            {replying && (
              <div className="relative mt-3 flex items-center gap-2">
                <CommentAvatar image={session?.user?.image ?? null} size="sm" />

                <div className="relative flex-1">
                  <MentionAutocomplete
                    fetchUrl={`/api/comments/users?themeId=${themeId}`}
                    query={mentionQuery}
                    visible={mentionVisible}
                    onSelect={handleReplyMentionSelect}
                    onClose={() => setMentionVisible(false)}
                    anchorRef={replyTextareaRef}
                  />
                  <textarea
                    ref={replyTextareaRef}
                    value={replyText}
                    onChange={(e) => handleReplyInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !mentionVisible) {
                        e.preventDefault();
                        handleReplySubmit();
                      }
                      if (e.key === "Escape") {
                        setReplying(false);
                        setReplyText("");
                      }
                    }}
                    rows={1}
                    placeholder="Reply"
                    className="h-9 w-full resize-none rounded-md border border-[#C8CABF] bg-[#F1F2EC] px-3 py-2 text-[13px] text-[#2E3028]
                      outline-none transition-colors placeholder:text-[#8D8F85] focus:border-[#EB9D2A]
                      dark:border-[#3A3D46] dark:bg-[#25272D] dark:text-[#EAECF6] dark:placeholder:text-[#8F93A3]"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || sendingReply}
                  className="shrink-0 p-2 text-[#C67F1D] transition-colors hover:text-[#AF6A0F] disabled:cursor-not-allowed disabled:text-[#9EA096] dark:text-[#F0B14E] dark:hover:text-[#F3C06A] dark:disabled:text-[#707585]"
                  aria-label="Envoyer la réponse"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {!comment.deleted && session?.user?.id === comment.userId && !editing && (
            <div className="relative shrink-0 self-start">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 text-[#9EA096] opacity-0 transition-all hover:text-[#23251D] group-hover:opacity-100 dark:text-[#84889A] dark:hover:text-[#EAECF6]"
                aria-label="Menu du commentaire"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-10 min-w-[150px] rounded-md border border-[#D2D3CC] bg-[#FDFDF8] py-1 shadow-lg dark:border-[#3A3D46] dark:bg-[#1E2025]">
                  <button
                    onClick={() => {
                      setEditing(true);
                      setEditText(comment.content);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#4D4F46] transition-colors hover:bg-[#ECEDE5] dark:text-[#B8BBC8] dark:hover:bg-[#2A2D35]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#D14A00] transition-colors hover:bg-[#ECEDE5] dark:hover:bg-[#2A2D35]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} themeId={themeId} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ThemeComments({ themeName }: ThemeCommentsProps) {
  const { data: session } = useSession();
  const [themeId, setThemeId] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionVisible, setMentionVisible] = useState(false);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/comments/resolve-theme?name=${encodeURIComponent(themeName)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.themeId) {
          setThemeId(data.themeId);
        } else {
          setThemeId(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setThemeId(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [themeName]);

  const loadComments = useCallback(() => {
    if (!themeId) return;

    fetch(`/api/comments?themeId=${themeId}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [themeId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleNewComment = useCallback(
    (comment: CommentData) => {
      if (comment.parentId) {
        loadComments();
        return;
      }

      setComments((previous) => {
        if (previous.some((item) => item.id === comment.id)) return previous;
        return [...previous, { ...comment, replies: [] }];
      });
      setTotal((prev) => prev + 1);
    },
    [loadComments],
  );

  useCommentStream(themeId, {
    onComment: handleNewComment,
    onEdit: loadComments,
    onDelete: loadComments,
  });

  async function handleSubmit() {
    if (!newComment.trim() || sending || !themeId) return;
    setSending(true);

    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId,
          content: newComment.trim(),
          mentions: mentionIds,
        }),
      });

      setNewComment("");
      setMentionIds([]);
      loadComments();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  function handleInputChange(value: string) {
    setNewComment(value);

    const cursorPos = textareaRef.current?.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionVisible(true);
    } else {
      setMentionVisible(false);
    }
  }

  function handleMentionSelect(user: MentionUser) {
    const cursorPos = textareaRef.current?.selectionStart ?? newComment.length;
    const textBeforeCursor = newComment.slice(0, cursorPos);
    const textAfterCursor = newComment.slice(cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);
    if (!mentionMatch) return;

    const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
    const displayName = user.displayName || user.name;
    setNewComment(`${beforeMention}@${displayName} ${textAfterCursor}`);
    setMentionIds((prev) => [...prev, user.id]);
    setMentionVisible(false);
    textareaRef.current?.focus();
  }

  if (!themeId && !loading) return null;

  return (
    <section className="mt-2">
      <h2 className="mb-4 text-[31px] font-semibold leading-none tracking-[-0.03em] text-[#23251D] dark:text-[#EAECF6]">
        Commentaires de la communauté
        {total > 0 && (
          <span className="ml-2 align-middle text-[14px] font-normal text-[#8D8F85] dark:text-[#8F93A3]">
            {total}
          </span>
        )}
      </h2>

      <div className="rounded-md border border-[#D2D3CC] bg-[#FDFDF8] dark:border-[#3A3D46] dark:bg-[#1E2025]">
        {loading ? (
          <div className="space-y-6 p-5">
            {[...Array(3)].map((_, index) => (
              <div key={`comment-skeleton-${index}`} className="flex gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#E2E4DB] dark:bg-[#2E323B]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-36 animate-pulse rounded bg-[#E2E4DB] dark:bg-[#2E323B]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#E2E4DB] dark:bg-[#2E323B]" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[#E2E4DB] dark:bg-[#2E323B]" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-[#8D8F85] dark:text-[#8F93A3]">
            Aucun commentaire pour le moment.
          </p>
        ) : (
          <div className="px-5 py-1">
            {comments.map((comment) => (
              <CommentThread key={comment.id} comment={comment} themeId={themeId!} onRefresh={loadComments} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {!session ? (
          <button
            onClick={() => {
              if (window.top !== window.self) {
                window.top!.location.href = "/api/auth/signin/discord";
              } else {
                signIn.social({ provider: "discord" });
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#C8CABF] bg-[#F1F2EC] px-3 py-2.5 text-[14px] font-medium text-[#5A5C53] transition-colors hover:bg-[#ECEDE5] dark:border-[#3A3D46] dark:bg-[#25272D] dark:text-[#B8BBC8] dark:hover:bg-[#2A2D35]"
          >
            <LogIn className="h-4 w-4" />
            Connectez-vous pour commenter
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-md border border-[#C8CABF] bg-[#F1F2EC] px-3 py-2 dark:border-[#3A3D46] dark:bg-[#25272D]">
            <CommentAvatar image={session.user?.image ?? null} size="md" />

            <div className="relative flex-1">
              <MentionAutocomplete
                fetchUrl={themeId ? `/api/comments/users?themeId=${themeId}` : ""}
                query={mentionQuery}
                visible={mentionVisible}
                onSelect={handleMentionSelect}
                onClose={() => setMentionVisible(false)}
                anchorRef={textareaRef}
              />
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !mentionVisible) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                rows={1}
                placeholder="Ask a question"
                className="h-9 w-full resize-none border-0 bg-transparent py-2 text-[14px] text-[#2E3028] outline-none placeholder:text-[#8D8F85] dark:text-[#EAECF6] dark:placeholder:text-[#8F93A3]"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || sending}
              className="shrink-0 p-2 text-[#C67F1D] transition-colors hover:text-[#AF6A0F] disabled:cursor-not-allowed disabled:text-[#9EA096] dark:text-[#F0B14E] dark:hover:text-[#F3C06A] dark:disabled:text-[#707585]"
              aria-label="Envoyer le commentaire"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
