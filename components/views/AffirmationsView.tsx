"use client";

import { useState } from "react";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/Header";
import { CATEGORIES, type Category } from "@/lib/constants";
import { DEFAULT_AFFIRMATIONS, type Affirmation } from "@/lib/affirmations";
import { AddAffirmationModal } from "@/components/modals/AddAffirmationModal";

interface CustomAff {
  id: string;
  text: string;
  category: Category;
}

interface Props {
  userId: string;
  initialCustom: CustomAff[];
}

export function AffirmationsView({ userId, initialCustom }: Props) {
  const supabase = createClient();
  const [custom, setCustom] = useState<CustomAff[]>(initialCustom);
  const [filter, setFilter] = useState<string>("all");
  const [genCategory, setGenCategory] = useState<Category>("craving");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ text: string; category: Category } | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const allList = [
    ...DEFAULT_AFFIRMATIONS.map((a) => ({ ...a, custom: false })),
    ...custom.map((a) => ({ ...a, custom: true })),
  ];
  const filtered =
    filter === "all"
      ? allList
      : filter === "custom"
      ? allList.filter((a) => a.custom)
      : allList.filter((a) => a.category === filter);

  async function generate() {
    setGenerating(true);
    setGenerated(null);
    setGenError(null);
    try {
      const res = await fetch("/api/affirmations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: genCategory }),
      });
      const data = await res.json();
      if (!res.ok || !data.text) throw new Error(data.error || "fail");
      setGenerated({ text: data.text, category: genCategory });
    } catch {
      setGenError("Impossible de générer pour l'instant.");
    } finally {
      setGenerating(false);
    }
  }

  async function saveGenerated() {
    if (!generated) return;
    const { data, error } = await supabase
      .from("custom_affirmations")
      .insert({
        user_id: userId,
        text: generated.text,
        category: generated.category,
        source: "ai",
      })
      .select()
      .single();
    if (!error && data) {
      setCustom((prev) => [...prev, { id: data.id, text: data.text, category: data.category }]);
    }
    setGenerated(null);
  }

  async function addCustom(text: string, category: Category) {
    const { data, error } = await supabase
      .from("custom_affirmations")
      .insert({ user_id: userId, text, category, source: "custom" })
      .select()
      .single();
    if (!error && data) {
      setCustom((prev) => [...prev, { id: data.id, text: data.text, category: data.category }]);
    }
    setShowAdd(false);
  }

  async function deleteCustom(id: string) {
    setCustom((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("custom_affirmations").delete().eq("id", id);
  }

  return (
    <>
      <Header view="affirmations" />
      <div className="space-y-5 pt-2 view-transition">
        <div className="anim-fade">
          <div className="caps" style={{ color: "var(--ink-muted)" }}>Bibliothèque</div>
          <h1 className="font-display text-[34px] leading-[1.05] mt-1.5">
            Tes mots, <span className="italic" style={{ color: "var(--rose-deep)" }}>tes ancres</span>.
          </h1>
        </div>

        <div
          className="rounded-[28px] p-5 anim-fade-2 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2A1316 0%, #3D1A1F 100%)", color: "#FBF6F0" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "var(--rose)" }} />
            <span className="caps" style={{ opacity: 0.7 }}>Génère avec l&apos;IA</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setGenCategory(k as Category)}
                className="text-[11px] px-3 py-1.5 rounded-full"
                style={{
                  background: genCategory === k ? "var(--rose)" : "rgba(255,255,255,0.08)",
                  color: genCategory === k ? "#FFF" : "rgba(251,246,240,0.7)",
                  transition: "background 0.3s var(--ease-out)",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {generated ? (
            <div className="space-y-3">
              <p className="font-display text-[20px] italic leading-snug">&ldquo;{generated.text}&rdquo;</p>
              <div className="flex gap-2">
                <button
                  onClick={saveGenerated}
                  className="flex-1 py-2.5 rounded-full text-white text-[13px] font-medium"
                  style={{ background: "var(--rose)" }}
                >
                  Garder
                </button>
                <button
                  onClick={generate}
                  disabled={generating}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-medium border"
                  style={{ borderColor: "rgba(251,246,240,0.2)", color: "#FBF6F0" }}
                >
                  {generating ? "..." : "Une autre"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={generate}
              disabled={generating}
              className="w-full py-3 rounded-full text-white text-[14px] font-medium flex items-center justify-center gap-2"
              style={{ background: "var(--rose)" }}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>L&apos;IA réfléchit…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Génère une phrase</span>
                </>
              )}
            </button>
          )}
          {genError && <div className="text-[11px] mt-2" style={{ color: "var(--rose)" }}>{genError}</div>}
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 anim-fade-3">
          {[
            { k: "all", l: "Toutes" },
            { k: "custom", l: "Mes phrases" },
            ...Object.entries(CATEGORIES).map(([k, v]) => ({ k, l: v.label })),
          ].map((c) => (
            <button
              key={c.k}
              onClick={() => setFilter(c.k)}
              className="text-[12px] px-3.5 py-2 rounded-full whitespace-nowrap border"
              style={{
                background: filter === c.k ? "var(--ink)" : "var(--surface)",
                color: filter === c.k ? "#FBF6F0" : "var(--ink-soft)",
                borderColor: "var(--line)",
                transition: "all 0.3s var(--ease-out)",
              }}
            >
              {c.l}
            </button>
          ))}
        </div>

        <div className="space-y-2 anim-fade-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl p-4 border flex items-start justify-between gap-3"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              <div className="flex-1">
                <div className="caps mb-1" style={{ color: "var(--rose-deep)" }}>
                  {CATEGORIES[a.category as Category]?.label}{" "}
                  {a.custom && <span style={{ color: "var(--ink-muted)" }}>· perso</span>}
                </div>
                <p className="font-display text-[15px] leading-snug" style={{ color: "var(--ink)" }}>{a.text}</p>
              </div>
              {a.custom && (
                <button onClick={() => deleteCustom(a.id)} style={{ color: "var(--ink-muted)" }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="w-full rounded-2xl py-4 px-5 flex items-center justify-center gap-2 border-2 border-dashed"
          style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium text-[14px]">Écris ta propre phrase</span>
        </button>
      </div>

      {showAdd && <AddAffirmationModal onClose={() => setShowAdd(false)} onSave={addCustom} />}
    </>
  );
}
