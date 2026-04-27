import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TodayView } from "@/components/views/TodayView";
import { todayISO } from "@/lib/utils";
import type { Affirmation } from "@/lib/affirmations";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = todayISO();

  const [{ data: weighIns }, { data: checkin }, { data: dailyAff }, { data: customAffs }] =
    await Promise.all([
      supabase.from("weigh_ins").select("date, weight").eq("user_id", user.id).order("date"),
      supabase
        .from("daily_checkins")
        .select("data")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("daily_affirmation")
        .select("affirmation_id, affirmation_text, affirmation_category")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("custom_affirmations")
        .select("id, text, category")
        .eq("user_id", user.id),
    ]);

  const dailyAffirmation: Affirmation | null = dailyAff
    ? {
        id: dailyAff.affirmation_id,
        text: dailyAff.affirmation_text,
        category: dailyAff.affirmation_category as Affirmation["category"],
      }
    : null;

  const customs: Affirmation[] = (customAffs ?? []).map((a) => ({
    id: a.id,
    text: a.text,
    category: a.category as Affirmation["category"],
    custom: true,
  }));

  return (
    <TodayView
      userId={user.id}
      initialWeighIns={(weighIns ?? []).map((w) => ({ date: w.date, weight: Number(w.weight) }))}
      initialCheckins={(checkin?.data as Record<string, boolean>) || {}}
      initialDailyAffirmation={dailyAffirmation}
      initialCustomAffirmations={customs}
    />
  );
}
