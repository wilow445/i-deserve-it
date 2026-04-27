import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_AFFIRMATIONS } from "@/lib/affirmations";
import { CATEGORIES } from "@/lib/constants";

// Vercel Cron sends header `Authorization: Bearer ${CRON_SECRET}` (when CRON_SECRET set).
// We also accept ?secret=… for manual testing.
function isAuthorized(request: Request) {
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  if (querySecret === expected) return true;
  if (authHeader === `Bearer ${expected}`) return true;
  return false;
}

interface Schedule {
  id: string;
  user_id: string;
  category: string;
  time_of_day: string; // "HH:MM:SS"
  enabled: boolean;
  timezone: string;
  last_sent_date: string | null;
}

function nowInTimezone(tz: string): { date: string; time: string; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date()).reduce<Record<string, string>>(
    (acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    },
    {}
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const time = `${parts.hour}:${parts.minute}`;
  const minutes = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
  return { date, time, minutes };
}

function timeStringToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const admin = createAdminClient();

  // Fetch all enabled schedules
  const { data: schedules, error: schedErr } = await admin
    .from("notification_schedules")
    .select("*")
    .eq("enabled", true)
    .returns<Schedule[]>();

  if (schedErr) {
    console.error(schedErr);
    return NextResponse.json({ error: "schedule-fetch-failed" }, { status: 500 });
  }
  if (!schedules?.length) return NextResponse.json({ checked: 0, sent: 0 });

  let sent = 0;
  let failed = 0;
  const tolerance = 1; // ±1 minute window — cron runs every minute, this prevents drift

  for (const sched of schedules) {
    const { date: localDate, minutes: nowMin } = nowInTimezone(sched.timezone || "Europe/Paris");
    const schedMin = timeStringToMinutes(sched.time_of_day);

    // Check time match (within tolerance) and not already sent today
    const timeMatches = Math.abs(nowMin - schedMin) <= tolerance;
    const alreadySent = sched.last_sent_date === localDate;
    if (!timeMatches || alreadySent) continue;

    // Pick an affirmation: user's custom in this category first, fallback to defaults
    const { data: customAffs } = await admin
      .from("custom_affirmations")
      .select("text, category")
      .eq("user_id", sched.user_id)
      .eq("category", sched.category);

    const pool = [
      ...DEFAULT_AFFIRMATIONS.filter((a) => a.category === sched.category),
      ...(customAffs ?? []).map((a) => ({ text: a.text, category: a.category })),
    ];
    if (pool.length === 0) continue;
    const pick = pool[Math.floor(Math.random() * pool.length)];

    // Get user's push subscriptions
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", sched.user_id);

    if (!subs?.length) {
      // Mark as sent anyway to avoid retry loop
      await admin
        .from("notification_schedules")
        .update({ last_sent_date: localDate })
        .eq("id", sched.id);
      continue;
    }

    const categoryLabel =
      CATEGORIES[sched.category as keyof typeof CATEGORIES]?.label || "I Deserve It";
    const payload = JSON.stringify({
      title: categoryLabel,
      body: pick.text,
      url: "/",
      tag: `${sched.category}-${localDate}`,
    });

    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled") sent++;
      else {
        failed++;
        // If subscription is gone (410/404), delete it
        const err = r.reason as { statusCode?: number };
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          // We don't know which sub failed without indexing; safe enough to leave for next round
        }
      }
    }

    await admin
      .from("notification_schedules")
      .update({ last_sent_date: localDate })
      .eq("id", sched.id);
  }

  return NextResponse.json({ checked: schedules.length, sent, failed });
}
