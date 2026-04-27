import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id);

  if (!subs?.length) return NextResponse.json({ error: "no-subscriptions" }, { status: 404 });

  const payload = JSON.stringify({
    title: "I Deserve It",
    body: "Test ✨ Tu reçois bien les notifications.",
    url: "/",
  });

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return NextResponse.json({ sent: subs.length - failed, failed });
}
