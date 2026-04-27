import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgressView } from "@/components/views/ProgressView";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: weighIns } = await supabase
    .from("weigh_ins")
    .select("date, weight")
    .eq("user_id", user.id)
    .order("date");

  return (
    <ProgressView
      userId={user.id}
      initialWeighIns={(weighIns ?? []).map((w) => ({ date: w.date, weight: Number(w.weight) }))}
    />
  );
}
