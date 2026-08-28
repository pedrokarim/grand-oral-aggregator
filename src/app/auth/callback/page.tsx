"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
  readAuthReturnLocation,
  useSession,
} from "@/lib/auth-client";

const MAX_ATTEMPTS = 60;

export default function AuthCallbackPage() {
  const { data: session, refetch } = useSession();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!session) return;
    const destination = readAuthReturnLocation() ?? "/";
    window.location.replace(destination);
  }, [session]);

  useEffect(() => {
    if (session) return;
    let cancelled = false;

    const waitForSession = async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        await refetch();
        if (cancelled) return;
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      if (!cancelled) setFailed(true);
    };

    void waitForSession();
    return () => {
      cancelled = true;
    };
  }, [refetch, session]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFDF8] p-6 text-[#23251D] dark:bg-[#1E1F23] dark:text-[#EAECF6]">
      <div className="w-full max-w-sm rounded-md border border-[#D2D3CC] bg-white p-6 text-center shadow-lg dark:border-[#3a3b3f] dark:bg-[#25262B]">
        {failed ? (
          <TriangleAlert className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
        ) : (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#EB9D2A]" aria-hidden="true" />
        )}
        <h1 className="mt-4 text-lg font-semibold">
          {failed ? "Connexion incomplète" : "Connexion en cours"}
        </h1>
        <p className="mt-2 text-sm text-[#73756D] dark:text-[#AEB1BE]" aria-live="polite">
          {failed
            ? "Revenez au bureau puis relancez la connexion avec Ascencia ID."
            : "Ascencia ID rattache votre profil et restaure votre bureau."}
        </p>
      </div>
    </main>
  );
}
