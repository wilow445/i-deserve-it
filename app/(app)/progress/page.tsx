import { createClient, REBECCA_USER_ID } from "@/lib/supabase/server";
import { ProgressView } from "@/components/views/ProgressView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: weighIns } = await supabase
    .from("weigh_ins")
    .select("date, weight")
    .eq("user_id", REBECCA_USER_ID)
    .order("date");

  return (
    <ProgressView
      userId={REBECCA_USER_ID}
      initialWeighIns={(weighIns ?? []).map((w) => ({ date: w.date, weight: Number(w.weight) }))}
    />
  );
}
