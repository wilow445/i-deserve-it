import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_AFFIRMATIONS } from "@/lib/affirmations";
import { CATEGORIES } from "@/lib/constants";

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
  time_of_day: string;
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

  const { data: schedules, error: schedErr } = await admin
    .from("notification_schedules")
    .select("*")
    .eq("enabled", true)
    .returns<Schedule[]>();

  if (schedErr) {
    console.error("schedule-fetch-failed", schedErr);
    return NextResponse.json({ error: "schedule-fetch-failed" }, { status: 500 });
  }
  if (!schedules?.length) return NextResponse.json({ checked: 0, sent: 0 });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const tolerance = 1;

  for (const sched of schedules) {
    const { date: localDate, minutes: nowMin } = nowInTimezone(sched.timezone || "Europe/Paris");
    const schedMin = timeStringToMinutes(sched.time_of_day);

    const timeMatches = Math.abs(nowMin - schedMin) <= tolerance;
    const alreadySent = sched.last_sent_date === localDate;
    if (!timeMatches || alreadySent) continue;

    const { data: customAffs } = await admin
      .from("custom_affirmations")
      .select("text, category")
      .eq("user_id", sched.user_id)
      .eq("category", sched.category);

    const pool = [
      ...DEFAULT_AFFIRMATIONS.filter((a) => a.category === sched.category),
      ...(customAffs ?? []).map((a) => ({ text: a.text, category: a.category })),
    ];
    if (pool.length === 0) {
      errors.push(`${sched.category}: empty pool`);
      continue;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", sched.user_id);

    if (!subs?.length) {
      errors.push(`${sched.category}: no subs`);
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

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        sent++;
        console.log(`✓ Sent ${sched.category} to ${s.endpoint.slice(0, 60)}`);
      } catch (err) {
        failed++;
        const e = err as { statusCode?: number; body?: string; message?: string };
        const errMsg = `${sched.category} FAILED: status=${e.statusCode} body=${e.body} msg=${e.message}`;
        console.error(errMsg);
        errors.push(errMsg);
        // Delete dead subscription
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
          console.log(`Deleted dead subscription ${s.id}`);
        }
      }
    }

    await admin
      .from("notification_schedules")
      .update({ last_sent_date: localDate })
      .eq("id", sched.id);
  }

  return NextResponse.json({ checked: schedules.length, sent, failed, errors });
}
