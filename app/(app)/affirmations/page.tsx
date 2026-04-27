import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AffirmationsView } from "@/components/views/AffirmationsView";
import type { Category } from "@/lib/constants";

export default async function AffirmationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: customs } = await supabase
    .from("custom_affirmations")
    .select("id, text, category")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AffirmationsView
      userId={user.id}
      initialCustom={(customs ?? []).map((a) => ({
        id: a.id,
        text: a.text,
        category: a.category as Category,
      }))}
    />
  );
}
