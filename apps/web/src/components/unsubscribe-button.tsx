"use client";

import Link from "next/link";
import { useState } from "react";

export function UnsubscribeButton({ u, t }: { u: string; t: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function stop() {
    setState("busy");
    const res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ u, t }),
    });
    setState(res.ok ? "done" : "error");
  }

  if (state === "done")
    return (
      <div role="status" className="mt-6 rounded-md bg-leaf-50 px-4 py-4 text-leaf">
        <p className="font-semibold">Scheme alerts are off.</p>
        <p className="mt-1">
          You won&apos;t get the weekly email any more. You can turn it back on from <Link href="/dashboard">My startup</Link>.
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
        {state === "busy" ? "Turning off…" : "Stop scheme alerts"}
      </button>
      {state === "error" && (
        <p role="alert" className="mt-3 text-marigold-ink">
          This link didn&apos;t work. Sign in and turn alerts off from <Link href="/dashboard">My startup</Link> instead.
        </p>
      )}
    </>
  );
}
