"use client";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.error("SW register failed", e);
    return null;
  }
}

export async function subscribeToPush(): Promise<{
  ok: boolean;
  reason?: string;
}> {
  if (typeof window === "undefined") return { ok: false, reason: "ssr" };
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  // iOS requires the PWA to be added to home screen first
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-ignore
    window.navigator.standalone === true;
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isiOS && !isStandalone) {
    return { ok: false, reason: "ios-needs-home-screen" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  const reg = await ensureServiceWorker();
  if (!reg) return { ok: false, reason: "sw-failed" };

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
  }

  const json = sub.toJSON();
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      userAgent: navigator.userAgent,
    }),
  });

  if (!res.ok) return { ok: false, reason: "server-error" };
  return { ok: true };
}

export async function unsubscribeFromPush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
  }
}
