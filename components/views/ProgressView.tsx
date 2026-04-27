"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingDown } from "lucide-react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/Header";
import { Ornament, SectionLabel } from "@/components/ui/Ornament";
import { useAnimatedNumber } from "@/lib/hooks/use-animated-number";
import { PLAN } from "@/lib/constants";
import { fmtDate, fmtDateShort } from "@/lib/utils";
import { WeighInModal } from "@/components/modals/WeighInModal";

interface Props {
  userId: string;
  initialWeighIns: { date: string; weight: number }[];
}

export function ProgressView({ userId, initialWeighIns }: Props) {
  const supabase = createClient();
  const [weighIns, setWeighIns] = useState(initialWeighIns);
  const [showModal, setShowModal] = useState(false);

  const data = useMemo(
    () =>
      weighIns.map((w) => ({
        date: w.date,
        label: fmtDateShort(w.date),
        weight: w.weight,
      })),
    [weighIns]
  );

  const startWeight = weighIns.length ? weighIns[0].weight : PLAN.startWeight;
  const lastWeight = weighIns.length ? weighIns[weighIns.length - 1].weight : null;
  const lost = lastWeight ? Math.max(0, startWeight - lastWeight) : 0;
  const animatedLost = useAnimatedNumber(lost, 1400);
  const toGoal = lastWeight ? Math.max(0, lastWeight - PLAN.goalWeight) : null;

  async function addWeighIn(entry: { date: string; weight: number }) {
    setWeighIns((prev) => {
      const without = prev.filter((p) => p.date !== entry.date);
      return [...without, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
    await supabase
      .from("weigh_ins")
      .upsert(
        { user_id: userId, date: entry.date, weight: entry.weight },
        { onConflict: "user_id,date" }
      );
    setShowModal(false);
  }

  return (
    <>
      <Header view="progress" />
      <div className="space-y-6 pt-2 view-transition">
        <div className="anim-fade">
          <div className="caps" style={{ color: "var(--ink-muted)" }}>Mon parcours</div>
          <h1 className="font-display text-[34px] leading-[1.05] mt-1.5">
            Le <span className="italic" style={{ color: "var(--rose-deep)" }}>chemin</span> compte plus que la ligne.
          </h1>
        </div>

        <div
          className="rounded-[28px] p-6 anim-fade-2 relative overflow-hidden"
          style={{ background: "var(--ink)", color: "#FBF6F0" }}
        >
          <div className="caps" style={{ opacity: 0.6 }}>Perdu depuis le départ</div>
          <div
            className="font-display text-[64px] leading-none mt-2 flex items-baseline gap-2"
            style={{ fontVariantNumeric: "tabular-nums", fontWeight: 400 }}
          >
            <span>{lost > 0 ? animatedLost.toFixed(1) : "0"}</span>
            <span className="text-[18px] opacity-70">kg</span>
          </div>
          {toGoal !== null && lastWeight !== null && (
            <div className="text-[12px] opacity-70 mt-3">
              Plus que <span style={{ color: "var(--rose)" }}>{toGoal.toFixed(1)} kg</span> jusqu&apos;à l&apos;objectif.
            </div>
          )}
          <TrendingDown className="absolute top-6 right-6 w-5 h-5" style={{ color: "var(--rose)" }} />
        </div>

        <div className="anim-fade-3">
          <SectionLabel>Pesées</SectionLabel>
          <div
            className="rounded-2xl p-4 border"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          >
            {data.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center px-6">
                <div className="mb-3" style={{ color: "var(--rose-deep)" }}>
                  <Ornament width={28} opacity={0.4} />
                </div>
                <div className="font-display italic text-[20px] mb-2" style={{ color: "var(--ink)" }}>
                  La courbe t&apos;attend.
                </div>
                <div className="text-[13px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  Première pesée dimanche 4 mai.
                  <br />
                  17 marqueurs, 17 victoires.
                </div>
              </div>
            ) : (
              <div className="h-56 -ml-2">
                <ResponsiveContainer>
                  <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C8546B" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#C8546B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8B6F75" }} axisLine={false} tickLine={false} />
                    <YAxis
                      domain={[
                        (dataMin: number) => Math.min(PLAN.goalWeight - 1, dataMin - 1),
                        (dataMax: number) => Math.max(PLAN.startWeight + 1, dataMax + 1),
                      ]}
                      tick={{ fontSize: 10, fill: "#8B6F75" }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{ background: "#2A1316", border: "none", borderRadius: 12, fontSize: 12, color: "#FBF6F0" }}
                      labelStyle={{ color: "#FBEDF1" }}
                      formatter={(v: number) => [`${v} kg`, "Poids"]}
                    />
                    <ReferenceLine
                      y={PLAN.goalWeight}
                      stroke="#7A8F6F"
                      strokeDasharray="4 4"
                      label={{ value: `Objectif ${PLAN.goalWeight}`, fill: "#7A8F6F", fontSize: 10, position: "insideTopRight" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#C8546B"
                      strokeWidth={2.5}
                      fill="url(#grad)"
                      dot={{ r: 4, fill: "#C8546B", stroke: "#FBF6F0", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {weighIns.length > 0 && (
          <div className="anim-fade-4">
            <SectionLabel>Historique</SectionLabel>
            <div className="space-y-1.5">
              {[...weighIns].reverse().map((w, i, arr) => {
                const prev = arr[i + 1];
                const delta = prev ? w.weight - prev.weight : null;
                return (
                  <div
                    key={w.date}
                    className="rounded-2xl px-4 py-3 flex items-center justify-between border"
                    style={{ background: "var(--surface)", borderColor: "var(--line)" }}
                  >
                    <div className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
                      {fmtDate(w.date)}
                    </div>
                    <div className="flex items-baseline gap-3">
                      {delta !== null && (
                        <span
                          className="text-[12px] font-medium"
                          style={{
                            color:
                              delta < 0
                                ? "var(--sage)"
                                : delta > 0
                                ? "var(--rose)"
                                : "var(--ink-muted)",
                          }}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta.toFixed(1)}
                        </span>
                      )}
                      <span
                        className="font-display text-[20px]"
                        style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}
                      >
                        {w.weight}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-2xl py-4 px-5 flex items-center justify-center gap-2 text-white"
          style={{ background: "var(--rose)" }}
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Nouvelle pesée</span>
        </button>
      </div>

      {showModal && <WeighInModal onClose={() => setShowModal(false)} onSave={addWeighIn} />}
    </>
  );
}
