"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/Header";
import { Ornament, SectionLabel } from "@/components/ui/Ornament";
import { useAnimatedNumber } from "@/lib/hooks/use-animated-number";
import { PLAN, WEIGH_INS_TOTAL, CATEGORIES, type Category } from "@/lib/constants";
import { DEFAULT_AFFIRMATIONS, type Affirmation } from "@/lib/affirmations";
import { fmtDate, todayISO, daysBetween } from "@/lib/utils";
import { WeighInModal } from "@/components/modals/WeighInModal";

interface Props {
  userId: string;
  initialWeighIns: { date: string; weight: number }[];
  initialCheckins: Record<string, boolean>;
  initialDailyAffirmation: Affirmation | null;
  initialCustomAffirmations: Affirmation[];
}

const TASKS = [
  { id: "water", label: "8 verres d'eau" },
  { id: "steps", label: "Mes pas" },
  { id: "workout", label: "Activité physique" },
  { id: "mindful", label: "Repas en conscience" },
  { id: "craving", label: "Fringale gérée" },
];

export function TodayView({
  userId,
  initialWeighIns,
  initialCheckins,
  initialDailyAffirmation,
  initialCustomAffirmations,
}: Props) {
  const supabase = createClient();
  const [weighIns, setWeighIns] = useState(initialWeighIns);
  const [checkins, setCheckins] = useState(initialCheckins);
  const [affirmation, setAffirmation] = useState<Affirmation | null>(initialDailyAffirmation);
  const [showWeighIn, setShowWeighIn] = useState(false);

  const allAffirmations = useMemo(
    () => [...DEFAULT_AFFIRMATIONS, ...initialCustomAffirmations],
    [initialCustomAffirmations]
  );

  // If no daily affirmation set yet, pick one and persist
  useEffect(() => {
    if (affirmation || allAffirmations.length === 0) return;
    const pick = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    setAffirmation(pick);
    saveDailyAffirmation(pick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveDailyAffirmation(a: Affirmation) {
    await supabase.from("daily_affirmation").upsert({
      user_id: userId,
      date: todayISO(),
      affirmation_id: a.id,
      affirmation_text: a.text,
      affirmation_category: a.category,
    });
  }

  async function refreshAffirmation() {
    if (allAffirmations.length < 2) return;
    let next = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    while (next.id === affirmation?.id) {
      next = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    }
    setAffirmation(next);
    await saveDailyAffirmation(next);
  }

  async function toggleCheckin(id: string) {
    const next = { ...checkins, [id]: !checkins[id] };
    setCheckins(next);
    await supabase.from("daily_checkins").upsert({
      user_id: userId,
      date: todayISO(),
      data: next,
    });
  }

  async function addWeighIn(entry: { date: string; weight: number }) {
    setWeighIns((prev) => {
      const without = prev.filter((p) => p.date !== entry.date);
      return [...without, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
    await supabase
      .from("weigh_ins")
      .upsert({ user_id: userId, date: entry.date, weight: entry.weight }, { onConflict: "user_id,date" });
    setShowWeighIn(false);
  }

  const today = new Date();
  const start = new Date(PLAN.startDate);
  const goal = new Date(PLAN.goalDate);
  const totalDays = daysBetween(start, goal);
  const elapsed = Math.max(0, daysBetween(start, today));
  const remaining = Math.max(0, daysBetween(today, goal));
  const started = today >= start;

  const lastWeight = weighIns.length ? weighIns[weighIns.length - 1].weight : null;
  const startWeight = weighIns.length ? weighIns[0].weight : PLAN.startWeight;
  const lost = lastWeight ? Math.max(0, startWeight - lastWeight) : 0;
  const animatedLost = useAnimatedNumber(lost, 1200);

  const greeting = (() => {
    const h = today.getHours();
    if (h < 6) return "Bonne nuit";
    if (h < 12) return "Bonjour";
    if (h < 18) return "Coucou";
    return "Bonsoir";
  })();

  return (
    <>
      <Header view="today" />
      <div className="space-y-6 pt-2 view-transition">
        <div className="anim-fade">
          <div className="caps" style={{ color: "var(--ink-muted)" }}>
            {today.toLocaleDateString("fr-FR", { weekday: "long" })} · {fmtDate(today)}
          </div>
          <h1 className="font-display text-[34px] leading-[1.05] mt-1.5" style={{ color: "var(--ink)" }}>
            {greeting}, <span className="italic" style={{ color: "var(--rose-deep)" }}>Rebecca</span>.
          </h1>
        </div>

        {/* Affirmation card */}
        <div className="anim-fade-2">
          <div
            className="relative rounded-[28px] p-7 overflow-hidden"
            style={{
              background: "linear-gradient(155deg, #FFFFFF 0%, #FBEDF1 80%, #F8E1E7 100%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 32px -16px rgba(139,45,64,0.18)",
              border: "1px solid var(--line)",
            }}
          >
            <div className="aurora" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="caps" style={{ color: "var(--rose-deep)" }}>
                  Ta phrase du jour
                </div>
                <button
                  onClick={refreshAffirmation}
                  style={{ color: "var(--rose-deep)", opacity: 0.6 }}
                  aria-label="Nouvelle phrase"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <span
                aria-hidden
                className="font-display absolute pointer-events-none"
                style={{
                  top: "14px",
                  left: "-4px",
                  fontSize: "112px",
                  lineHeight: 0.6,
                  color: "var(--rose)",
                  opacity: 0.08,
                  fontStyle: "italic",
                  fontWeight: 600,
                }}
              >
                &ldquo;
              </span>

              <p
                className="font-display text-[26px] leading-[1.18] relative z-10"
                style={{ color: "var(--ink)", fontWeight: 400 }}
              >
                {affirmation?.text || "Une nouvelle journée commence."}
              </p>

              <div className="mt-5" style={{ color: "var(--rose-deep)" }}>
                <Ornament width={28} opacity={0.35} />
              </div>
              <div
                className="caps text-center"
                style={{ color: "var(--rose-deep)", opacity: 0.7 }}
              >
                {CATEGORIES[(affirmation?.category as Category) || "general"]?.label}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="anim-fade-3 grid grid-cols-3 gap-2.5">
          <StatTile
            label={started ? "Jour" : "Démarrage dans"}
            value={started ? `${elapsed}` : `${-elapsed}`}
            unit={started ? `/ ${totalDays}` : "j"}
          />
          <StatTile
            label="Perdu"
            value={lost > 0 ? `–${animatedLost.toFixed(1)}` : "—"}
            unit="kg"
            accent
          />
          <StatTile label="Restant" value={`${remaining}`} unit="j" />
        </div>

        <JourneyStrip weighIns={weighIns} />

        {/* Check-ins */}
        <div className="anim-fade-5">
          <SectionLabel>Aujourd&apos;hui je…</SectionLabel>
          <div className="space-y-2">
            {TASKS.map((t) => (
              <CheckRow
                key={t.id}
                label={t.label}
                done={!!checkins[t.id]}
                onToggle={() => toggleCheckin(t.id)}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowWeighIn(true)}
          className="w-full rounded-2xl py-4 px-5 flex items-center justify-between"
          style={{ background: "var(--ink)", color: "#FBF6F0" }}
        >
          <div className="text-left">
            <div className="caps" style={{ opacity: 0.6 }}>Pesée</div>
            <div className="font-display text-lg italic mt-0.5">Note ton poids</div>
          </div>
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showWeighIn && (
        <WeighInModal onClose={() => setShowWeighIn(false)} onSave={addWeighIn} />
      )}
    </>
  );
}

function StatTile({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl py-4 px-3 text-center border"
      style={{
        background: accent ? "var(--blush-soft)" : "var(--surface)",
        borderColor: "var(--line)",
      }}
    >
      <div className="caps" style={{ color: "var(--ink-muted)" }}>{label}</div>
      <div className="font-display mt-1.5 leading-none">
        <span
          className="text-[26px]"
          style={{
            color: accent ? "var(--rose-deep)" : "var(--ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
        <span className="text-[12px] ml-1" style={{ color: "var(--ink-muted)" }}>{unit}</span>
      </div>
    </div>
  );
}

function CheckRow({
  label,
  done,
  onToggle,
}: {
  label: string;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full rounded-2xl py-3.5 px-4 flex items-center justify-between border"
      style={{ background: "var(--surface)", borderColor: "var(--line)" }}
    >
      <span
        className="text-[15px]"
        style={{
          color: done ? "var(--ink-muted)" : "var(--ink)",
          textDecoration: done ? "line-through" : "none",
          transition: "color 0.3s var(--ease-out)",
        }}
      >
        {label}
      </span>
      <span
        className={`check-dot ${done ? "done" : ""} w-6 h-6 rounded-full flex items-center justify-center`}
        style={{
          background: done ? "var(--sage)" : "transparent",
          border: done ? "none" : "1.5px solid var(--line)",
        }}
      >
        {done && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

function JourneyStrip({ weighIns }: { weighIns: { date: string }[] }) {
  const weighDates = useMemo(() => {
    const start = new Date(PLAN.startDate);
    return Array.from({ length: WEIGH_INS_TOTAL }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 7);
      return d.toISOString().slice(0, 10);
    });
  }, []);
  const today = todayISO();
  const doneDates = new Set(weighIns.map((w) => w.date));

  return (
    <div className="anim-fade-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="caps" style={{ color: "var(--ink-muted)" }}>Le parcours</div>
        <div className="caps" style={{ color: "var(--ink-muted)", opacity: 0.6 }}>17 semaines</div>
      </div>
      <div className="rounded-2xl px-4 py-4 border" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="flex items-center justify-between gap-1">
          {weighDates.map((date) => {
            const isPast = date <= today;
            const isDone = doneDates.has(date);
            const isToday = date === today;
            return (
              <div key={date} className="flex-1 flex items-center justify-center" title={fmtDate(date)}>
                <span
                  className="rounded-full"
                  style={{
                    width: isToday ? 8 : 5,
                    height: isToday ? 8 : 5,
                    background: isDone
                      ? "var(--rose-deep)"
                      : isToday
                      ? "var(--rose)"
                      : isPast
                      ? "var(--rose)"
                      : "transparent",
                    border: !isDone && !isPast ? "1px solid var(--line)" : "none",
                    opacity: isDone ? 1 : isPast ? 0.4 : 1,
                    transition: "all 0.4s var(--ease-out)",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--ink-muted)" }}>
          <span>4 mai</span>
          <span>31 août</span>
        </div>
      </div>
    </div>
  );
}
