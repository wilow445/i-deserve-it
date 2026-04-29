import { createClient, REBECCA_USER_ID } from "@/lib/supabase/server";
import { SettingsView } from "@/components/views/SettingsView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createClient();

  const [{ data: schedules }, { data: subs }] = await Promise.all([
    supabase.from("notification_schedules").select("id, category, time_of_day, enabled").eq("user_id", REBECCA_USER_ID),
    supabase.from("push_subscriptions").select("id").eq("user_id", REBECCA_USER_ID).limit(1),
  ]);

  return (
    <SettingsView
      userId={REBECCA_USER_ID}
      email="beccareekie@icloud.com"
      initialSchedules={(schedules ?? []) as never}
      initialPushEnabled={!!subs?.length}
    />
  );
}
