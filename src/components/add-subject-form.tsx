"use client";

import { useState } from "react";
import { Plus, X, Lock, Globe } from "lucide-react";
import type { CustomSubject } from "@/lib/data";

interface AddSubjectFormProps {
  theme: string;
  onCreated: (subject: CustomSubject) => void;
}

const COMMON_TYPES = [
  "Sujet de préparation",
  "Étude de cas",
  "Note personnelle",
  "Problématique",
];

export function AddSubjectForm({ theme, onCreated }: AddSubjectFormProps) {
  const [open, setOpen] = useState(false);
  const [sujet, setSujet] = useState("");
  const [domaine, setDomaine] = useState("INFO");
  const [type, setType] = useState(COMMON_TYPES[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setSujet("");
    setDomaine("INFO");
    setType(COMMON_TYPES[0]);
    setIsPublic(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sujet.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, sujet, domaine, type, isPublic }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      onCreated(data.subject);
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
          border border-[#D2D3CC] dark:border-[#3a3b3f]
          text-[#4D4F46] dark:text-[#9EA096]
          hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f] transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter un sujet
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#23251D] dark:text-[#EAECF6]">
          Nouveau sujet dans <span className="text-[#EB9D2A]">{theme}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="p-1 rounded-md text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <label className="block">
        <span className="text-[12px] text-[#9EA096]">Sujet</span>
        <textarea
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          required
          rows={2}
          maxLength={500}
          placeholder="Quelle est votre problématique ?"
          className="w-full mt-1 px-3 py-2 text-[14px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] focus:outline-none focus:border-[#EB9D2A] resize-y"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[12px] text-[#9EA096]">Domaine</span>
          <input
            value={domaine}
            onChange={(e) => setDomaine(e.target.value)}
            maxLength={64}
            className="w-full mt-1 px-3 py-2 text-[14px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] focus:outline-none focus:border-[#EB9D2A]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] text-[#9EA096]">Type</span>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            maxLength={64}
            list="common-subject-types"
            className="w-full mt-1 px-3 py-2 text-[14px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] focus:outline-none focus:border-[#EB9D2A]"
          />
          <datalist id="common-subject-types">
            {COMMON_TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#9EA096]">Visibilité :</span>
        <button
          type="button"
          onClick={() => setIsPublic(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] rounded-md border transition-colors ${
            isPublic
              ? "border-[#EB9D2A] bg-[#EB9D2A]/10 text-[#B17816]"
              : "border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]"
          }`}
        >
          <Globe className="h-3 w-3" />
          Public
        </button>
        <button
          type="button"
          onClick={() => setIsPublic(false)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] rounded-md border transition-colors ${
            !isPublic
              ? "border-[#EB9D2A] bg-[#EB9D2A]/10 text-[#B17816]"
              : "border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]"
          }`}
        >
          <Lock className="h-3 w-3" />
          Privé
        </button>
      </div>

      {error && (
        <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting || !sujet.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
            bg-[#EB9D2A] text-white hover:bg-[#CD8407] disabled:opacity-60 transition-colors"
        >
          {submitting ? "Création…" : "Créer le sujet"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md
            text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f] transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
