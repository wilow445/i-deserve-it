"use client";

import { useState } from "react";
import { Sheet } from "./Sheet";
import { todayISO } from "@/lib/utils";

interface Props {
  onClose: () => void;
  onSave: (entry: { date: string; weight: number }) => void;
}

export function WeighInModal({ onClose, onSave }: Props) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");

  return (
    <Sheet onClose={onClose}>
      <div className="caps" style={{ color: "var(--rose-deep)" }}>Pesée</div>
      <h3
        className="font-display text-[26px] mt-1 italic"
        style={{ fontWeight: 400 }}
      >
        Note ton poids du jour.
      </h3>

      <div className="mt-6 space-y-4">
        <div>
          <label className="caps" style={{ color: "var(--ink-muted)" }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 rounded-2xl px-4 py-3.5 border outline-none text-[15px]"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          />
        </div>
        <div>
          <label className="caps" style={{ color: "var(--ink-muted)" }}>Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="ex. 96.4"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full mt-1 rounded-2xl px-4 py-3.5 border outline-none text-[28px] font-display"
            style={{
              background: "var(--surface)",
              borderColor: "var(--line)",
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-full text-[14px] font-medium border"
          style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
        >
          Annuler
        </button>
        <button
          onClick={() => {
            const w = parseFloat(weight);
            if (!w || isNaN(w)) return;
            onSave({ date, weight: w });
          }}
          disabled={!weight}
          className="flex-1 py-3.5 rounded-full text-[14px] font-medium text-white disabled:opacity-50"
          style={{ background: "var(--ink)" }}
        >
          Enregistrer
        </button>
      </div>
    </Sheet>
  );
}
