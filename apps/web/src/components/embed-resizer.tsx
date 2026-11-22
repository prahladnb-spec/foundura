"use client";

import { useEffect } from "react";

/** Tells the parent page (via embed.js) how tall the widget is, so the iframe never scrolls. */
export function EmbedResizer() {
  useEffect(() => {
    if (window.parent === window) return;
    const send = () =>
      window.parent.postMessage({ type: "foundura:height", height: document.documentElement.scrollHeight }, "*");
    const ro = new ResizeObserver(send);
    ro.observe(document.body);
    send();
    return () => ro.disconnect();
  }, []);
  return null;
}
