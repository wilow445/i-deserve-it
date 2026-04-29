import { createClient, REBECCA_USER_ID } from "@/lib/supabase/server";
import { PlanView } from "@/components/views/PlanView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlanPage() {
  const supabase = await createClient();
  const { data: weighIns } = await supabase
    .from("weigh_ins")
    .select("date, weight")
    .eq("user_id", REBECCA_USER_ID)
    .order("date");

  return (
    <PlanView
      weighIns={(weighIns ?? []).map((w) => ({ date: w.date, weight: Number(w.weight) }))}
    />
  );
}
