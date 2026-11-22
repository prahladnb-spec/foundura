"use client";

import Link from "@/components/locale-link";
import { useState } from "react";
import { useT } from "@/i18n/client";

function WithLink({ text, label }: { text: string; label: string }) {
  const [before, after] = text.split("{link}");
  return (
    <>
      {before}
      <Link href="/dashboard">{label}</Link>
      {after}
    </>
  );
}

export function UnsubscribeButton({ u, t: token }: { u: string; t: string }) {
  const { t } = useT();
  const us = t.unsub;
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function stop() {
    setState("busy");
    const res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ u, t: token }),
    });
    setState(res.ok ? "done" : "error");
  }

  if (state === "done")
    return (
      <div role="status" className="mt-6 rounded-md bg-leaf-50 px-4 py-4 text-leaf">
        <p className="font-semibold">{us.doneTitle}</p>
        <p className="mt-1">
          <WithLink text={us.doneBody} label={us.myStartup} />
        </p>
      </div>
    );

  return (
    <>
      <button
        type="button"
        onClick={stop}
        disabled={state === "busy"}
        className="mt-6 rounded-md bg-neel-900 px-5 py-3 font-semibold text-paper hover:bg-neel-950 disabled:opacity-50"
      >
        {state === "busy" ? us.busy : us.button}
      </button>
      {state === "error" && (
        <p role="alert" className="mt-3 text-marigold-ink">
          <WithLink text={us.error} label={us.myStartup} />
        </p>
      )}
    </>
  );
}
