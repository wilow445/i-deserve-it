import { createClient, REBECCA_USER_ID } from "@/lib/supabase/server";
import { AffirmationsView } from "@/components/views/AffirmationsView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AffirmationsPage() {
  const supabase = await createClient();
  const { data: customs } = await supabase
    .from("custom_affirmations")
    .select("id, text, category")
    .eq("user_id", REBECCA_USER_ID)
    .order("created_at", { ascending: false });

  return (
    <AffirmationsView
      userId={REBECCA_USER_ID}
      initialCustom={(customs ?? []).map((a) => ({
        id: a.id,
        text: a.text,
        category: a.category,
      }))}
    />
  );
}
