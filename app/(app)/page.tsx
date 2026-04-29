import { createClient, REBECCA_USER_ID } from "@/lib/supabase/server";
import { TodayView } from "@/components/views/TodayView";
import { todayISO } from "@/lib/utils";
import type { Affirmation } from "@/lib/affirmations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const userId = REBECCA_USER_ID;
  const today = todayISO();

  const [{ data: weighIns }, { data: checkin }, { data: dailyAff }, { data: customAffs }] =
    await Promise.all([
      supabase.from("weigh_ins").select("date, weight").eq("user_id", userId).order("date"),
      supabase.from("daily_checkins").select("data").eq("user_id", userId).eq("date", today).maybeSingle(),
      supabase.from("daily_affirmation").select("affirmation_id, affirmation_text, affirmation_category").eq("user_id", userId).eq("date", today).maybeSingle(),
      supabase.from("custom_affirmations").select("id, text, category").eq("user_id", userId),
    ]);

  const dailyAffirmation: Affirmation | null = dailyAff
    ? {
        id: dailyAff.affirmation_id,
        text: dailyAff.affirmation_text,
        category: dailyAff.affirmation_category,
      }
    : null;

  const customs: Affirmation[] = (customAffs ?? []).map((a) => ({
    id: a.id,
    text: a.text,
    category: a.category,
    custom: true,
  }));

  return (
    <TodayView
      userId={userId}
      initialWeighIns={(weighIns ?? []).map((w) => ({ date: w.date, weight: Number(w.weight) }))}
      initialCheckins={(checkin?.data as Record<string, boolean>) || {}}
      initialDailyAffirmation={dailyAffirmation}
      initialCustomAffirmations={customs}
    />
  );
}
