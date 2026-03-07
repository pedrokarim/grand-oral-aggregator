"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Send, LogIn, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import { useSession, signIn } from "@/lib/auth-client";
import { useChatStream, type ChatMessage } from "@/hooks/use-chat-stream";
import { MentionAutocomplete, type MentionUser } from "./mention-autocomplete";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderContent(content: string, mentions: string[]) {
  if (mentions.length === 0) return content;

  // Match @username patterns and style them
  return content.split(/(@\S+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="bg-[#EB9D2A]/20 text-[#EB9D2A] rounded px-0.5">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionVisible, setMentionVisible] = useState(false);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open]);

  // SSE stream
  const handleNewMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleEdit = useCallback((msg: ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
  }, []);

  const handleDelete = useCallback((data: { id: number }) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === data.id ? { ...m, deleted: true, content: "" } : m)),
    );
  }, []);

  useChatStream({ onMessage: handleNewMessage, onEdit: handleEdit, onDelete: handleDelete });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && !mentionVisible) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose, mentionVisible]);

  // Send message
  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim(), mentions: mentionIds }),
      });
      setInput("");
      setMentionIds([]);
      textareaRef.current?.focus();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  // Mention detection
  function handleInputChange(value: string) {
    setInput(value);

    // Check if we're in a mention context
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
    const cursorPos = textareaRef.current?.selectionStart ?? input.length;
    const textBeforeCursor = input.slice(0, cursorPos);
    const textAfterCursor = input.slice(cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);

    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
      const displayName = user.displayName || user.name;
      const newValue = `${beforeMention}@${displayName} ${textAfterCursor}`;
      setInput(newValue);
      setMentionIds((prev) => [...prev, user.id]);
    }
    setMentionVisible(false);
    textareaRef.current?.focus();
  }

  // Edit / Delete actions
  async function handleEditSave(messageId: number) {
    if (!editText.trim()) return;
    try {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, content: editText.trim() }),
      });
    } catch {
      // ignore
    }
    setEditingId(null);
    setEditText("");
  }

  async function handleDeleteMessage(messageId: number) {
    try {
      await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
    } catch {
      // ignore
    }
    setMenuOpenId(null);
  }

  // Auto-resize textarea
  function handleTextareaInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-[calc(32px+1rem)] right-4 h-[calc(100vh-2rem-32px)] w-80
            rounded-lg border border-[#BFC1B7] dark:border-[#3a3b3f]
            bg-[#FDFDF8] dark:bg-[#1E1F23] shadow-2xl
            flex flex-col overflow-hidden z-[9999]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E7E0] dark:border-[#2a2b2f]">
            <h2 className="text-[13px] font-semibold text-[#23251D] dark:text-[#EAECF6]">
              Chat
            </h2>
            <button
              onClick={onClose}
              className="p-0.5 text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors cursor-default"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-20 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
                      <div className="h-3 w-full rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-[13px] text-[#9EA096] text-center py-8">
                Aucun message. Soyez le premier !
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="group flex gap-2">
                  {msg.user.image ? (
                    <img src={msg.user.image} alt="" className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#4D4F46] shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[13px] font-semibold text-[#23251D] dark:text-[#EAECF6] truncate">
                        {msg.user.displayName || msg.user.name}
                      </span>
                      <span className="text-[11px] text-[#9EA096] shrink-0">
                        {formatTime(msg.createdAt)}
                      </span>
                      {msg.editedAt && !msg.deleted && (
                        <span className="text-[10px] text-[#9EA096] italic">(modifié)</span>
                      )}
                    </div>
                    {msg.deleted ? (
                      <p className="text-[13px] italic text-[#9EA096]">[Message supprimé]</p>
                    ) : editingId === msg.id ? (
                      <div className="mt-1">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleEditSave(msg.id);
                            }
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditText("");
                            }
                          }}
                          rows={1}
                          className="w-full resize-none rounded-md border border-[#EB9D2A] bg-transparent px-2 py-1 text-[13px]
                            text-[#23251D] dark:text-[#EAECF6] focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => handleEditSave(msg.id)}
                            className="p-1 text-[#EB9D2A] hover:text-[#d08a1e] transition-colors cursor-default"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditText(""); }}
                            className="p-1 text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors cursor-default"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#4D4F46] dark:text-[#9EA096] break-words">
                        {renderContent(msg.content, msg.mentions)}
                      </p>
                    )}
                  </div>

                  {/* Action menu for own messages */}
                  {!msg.deleted && session?.user?.id === msg.userId && editingId !== msg.id && (
                    <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === msg.id ? null : msg.id)}
                        className="p-1 text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors cursor-default"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      {menuOpenId === msg.id && (
                        <div className="absolute right-0 top-6 z-10 min-w-[120px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] shadow-lg py-1">
                          <button
                            onClick={() => {
                              setEditingId(msg.id);
                              setEditText(msg.content);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] transition-colors cursor-default"
                          >
                            <Pencil className="w-3 h-3" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] transition-colors cursor-default"
                          >
                            <Trash2 className="w-3 h-3" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-[#E5E7E0] dark:border-[#2a2b2f] px-3 py-2">
            {!session ? (
              <button
                onClick={() => signIn.social({ provider: "discord" })}
                className="w-full flex items-center justify-center gap-2 py-2 text-[13px] font-medium
                  text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6]
                  border border-[#D2D3CC] dark:border-[#3a3b3f] rounded-md
                  hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
                  transition-colors cursor-default"
              >
                <LogIn className="w-3.5 h-3.5" />
                Connectez-vous pour discuter
              </button>
            ) : (
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <MentionAutocomplete
                    fetchUrl="/api/chat/users"
                    query={mentionQuery}
                    visible={mentionVisible}
                    onSelect={handleMentionSelect}
                    onClose={() => setMentionVisible(false)}
                    anchorRef={textareaRef}
                  />
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onInput={handleTextareaInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !mentionVisible) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Écrire un message..."
                    rows={1}
                    className="w-full resize-none rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f]
                      bg-transparent px-2.5 py-1.5 text-[13px]
                      text-[#23251D] dark:text-[#EAECF6]
                      placeholder:text-[#9EA096]
                      focus:outline-none focus:border-[#EB9D2A]
                      transition-colors"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="p-1.5 text-[#EB9D2A] hover:text-[#d08a1e] disabled:text-[#9EA096] disabled:opacity-50 transition-colors cursor-default shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
