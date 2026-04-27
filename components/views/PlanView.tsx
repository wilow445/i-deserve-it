"use client";

import { useState } from "react";
import { Check, Heart } from "lucide-react";
import { Header } from "@/components/ui/Header";
import { Ornament } from "@/components/ui/Ornament";
import { PLAN, FOODS, SPORT, REWARDS } from "@/lib/constants";

export function PlanView({ weighIns }: { weighIns: { date: string; weight: number }[] }) {
  const [tab, setTab] = useState<"food" | "sport" | "rewards">("food");
  const tabs = [
    { id: "food", label: "Cuisine" },
    { id: "sport", label: "Sport" },
    { id: "rewards", label: "Récompenses" },
  ] as const;
  const activeIdx = tabs.findIndex((t) => t.id === tab);

  return (
    <>
      <Header view="plan" />
      <div className="space-y-6 pt-2 view-transition">
        <div className="anim-fade">
          <div className="caps" style={{ color: "var(--ink-muted)" }}>Glow Up Plan</div>
          <h1 className="font-display text-[34px] leading-[1.05] mt-1.5">
            Cap sur le <span className="italic" style={{ color: "var(--rose-deep)" }}>1ᵉʳ septembre</span>.
          </h1>
          <p className="text-[14px] mt-3 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Démarrage le 4 mai. Objectif {PLAN.goalWeight} kg pour la rentrée. Une perte saine d&apos;environ 1 kg par semaine.
          </p>
        </div>

        <div
          className="relative flex p-1.5 rounded-full border anim-fade-2"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <span
            className="absolute rounded-full"
            style={{
              top: 6,
              left: 6,
              height: "calc(100% - 12px)",
              width: `calc(${100 / tabs.length}% - ${12 / tabs.length}px)`,
              background: "var(--ink)",
              transform: `translateX(calc(${activeIdx * 100}% + ${activeIdx * (12 / tabs.length)}px))`,
              transition: "transform 0.5s var(--ease-out-quint)",
            }}
          />
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 px-3 text-[13px] font-medium relative z-10"
              style={{
                color: tab === t.id ? "#FFF" : "var(--ink-muted)",
                transition: "color 0.3s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div key={tab} className="anim-fade-3">
          <div className="view-transition">
            {tab === "food" && <FoodTab />}
            {tab === "sport" && <SportTab />}
            {tab === "rewards" && <RewardsTab weighIns={weighIns} />}
          </div>
        </div>
      </div>
    </>
  );
}

function FoodTab() {
  return (
    <div className="space-y-5">
      {Object.entries(FOODS).map(([cat, items]) => (
        <div key={cat}>
          <div className="flex items-baseline gap-3 mb-2.5">
            <span className="font-display italic text-[20px]" style={{ color: "var(--rose-deep)", fontWeight: 500 }}>
              {cat}
            </span>
            <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {items.map((it) => (
              <div
                key={it}
                className="rounded-2xl px-4 py-3 text-[13.5px] border"
                style={{ background: "var(--surface)", color: "var(--ink-soft)", borderColor: "var(--line)" }}
              >
                {it}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ color: "var(--rose-deep)" }}>
        <Ornament width={40} opacity={0.4} />
      </div>
      <div className="rounded-2xl p-5 mt-2" style={{ background: "var(--blush-soft)" }}>
        <div className="caps mb-2" style={{ color: "var(--rose-deep)" }}>Note pour toi</div>
        <p className="font-display italic text-[16px] leading-relaxed" style={{ color: "var(--ink)" }}>
          Ce ne sont pas des règles. Ce sont les aliments qui te font du bien. Le reste reste possible — juste plus rare.
        </p>
      </div>
    </div>
  );
}

function SportTab() {
  return (
    <div className="space-y-3">
      {SPORT.map((s, i) => (
        <div
          key={s.name}
          className="rounded-2xl p-5 flex items-center justify-between border"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div>
            <div className="caps" style={{ color: "var(--ink-muted)" }}>{String(i + 1).padStart(2, "0")}</div>
            <div className="font-display text-[20px] mt-1" style={{ color: "var(--ink)" }}>{s.name}</div>
          </div>
          <div className="text-right text-[12px] max-w-[40%] leading-snug" style={{ color: "var(--ink-soft)" }}>
            {s.freq}
          </div>
        </div>
      ))}
    </div>
  );
}

function RewardsTab({ weighIns }: { weighIns: { weight: number }[] }) {
  const lastWeight = weighIns.length ? weighIns[weighIns.length - 1].weight : PLAN.startWeight;
  return (
    <div className="space-y-3">
      {REWARDS.map((r) => {
        const reached = lastWeight <= r.weight;
        return (
          <div
            key={r.weight}
            className="rounded-2xl p-5 flex items-center justify-between border relative overflow-hidden"
            style={{
              borderColor: "var(--line)",
              background: reached ? "var(--blush)" : "var(--surface)",
            }}
          >
            {reached && (
              <div className="absolute top-3 right-3 caps" style={{ color: "var(--rose-deep)", fontWeight: 600 }}>
                Débloqué
              </div>
            )}
            <div>
              <div className="caps" style={{ color: "var(--ink-muted)" }}>Objectif {r.weight} kg</div>
              <div className="font-display text-[20px] mt-1 italic" style={{ color: "var(--ink)" }}>{r.name}</div>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: reached ? "var(--rose)" : "var(--blush-soft)",
                color: reached ? "#FFF" : "var(--rose-deep)",
              }}
            >
              {reached ? <Check className="w-5 h-5" /> : <Heart className="w-4 h-4" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
