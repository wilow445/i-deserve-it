import { NextResponse } from "next/server";
import { createClient, REBECCA_USER_ID } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { endpoint, keys, userAgent } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: REBECCA_USER_ID,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent ?? null,
      },
      { onConflict: "user_id,endpoint" }
    );

  if (error) {
    console.error("subscribe save error", error);
    return NextResponse.json({ error: "save-failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
