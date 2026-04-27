import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlanView } from "@/components/views/PlanView";

export default async function PlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: weighIns } = await supabase
    .from("weigh_ins")
    .select("date, weight")
    .eq("user_id", user.id)
    .order("date");

  return (
    <PlanView
      weighIns={(weighIns ?? []).map((w) => ({ date: w.date, weight: Number(w.weight) }))}
    />
  );
}
