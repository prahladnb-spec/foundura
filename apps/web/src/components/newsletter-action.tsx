"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";

/**
 * The button on the newsletter confirm page and on the unsubscribe page for subscribers without an
 * account. A button (not the email link alone) so link scanners in mail systems can't act for the reader.
 */
export function NewsletterAction({ action, s, t: token, support }: { action: "confirm" | "stop"; s: string; t: string; support: string }) {
  const { t } = useT();
  const n = t.newsletter;
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function go() {
    setState("busy");
    const res = await fetch(action === "confirm" ? "/api/newsletter/confirm" : "/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s, t: token }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }

  if (state === "done")
    return action === "confirm" ? (
      <div role="status" className="mt-6 rounded-md bg-leaf-50 px-4 py-4 text-leaf">
        <p className="font-semibold">{n.confirmedTitle}</p>
        <p className="mt-1">{n.confirmedBody}</p>
      </div>
    ) : (
      <p role="status" className="mt-6 rounded-md bg-leaf-50 px-4 py-4 font-semibold text-leaf">{n.stopDone}</p>
    );

  const [before, after] = n.stopError.split("{email}");
  return (
    <>
      <button
        type="button"
        onClick={go}
        disabled={state === "busy"}
        className="mt-6 rounded-md bg-neel-900 px-5 py-3 font-semibold text-paper hover:bg-neel-950 disabled:opacity-50"
      >
        {action === "confirm" ? (state === "busy" ? n.confirmBusy : n.confirmButton) : state === "busy" ? n.stopBusy : n.stopButton}
      </button>
      {state === "error" && (
        <p role="alert" className="mt-3 text-marigold-ink">
          {action === "confirm" ? (
            n.confirmError
          ) : (
            <>
              {before}
              <a href={`mailto:${support}`} dir="ltr" className="underline">{support}</a>
              {after}
            </>
          )}
        </p>
      )}
    </>
  );
}
