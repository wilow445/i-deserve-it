import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/views/SettingsView";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: schedules }, { data: subs }] = await Promise.all([
    supabase
      .from("notification_schedules")
      .select("id, category, time_of_day, enabled")
      .eq("user_id", user.id),
    supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1),
  ]);

  return (
    <SettingsView
      userId={user.id}
      email={user.email || ""}
      initialSchedules={(schedules ?? []) as never}
      initialPushEnabled={!!subs?.length}
    />
  );
}
