"use client";

import { useState } from "react";
import { Sheet } from "./Sheet";
import { CATEGORIES, type Category } from "@/lib/constants";

interface Props {
  onClose: () => void;
  onSave: (text: string, category: Category) => void;
}

export function AddAffirmationModal({ onClose, onSave }: Props) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("general");

  return (
    <Sheet onClose={onClose}>
      <div className="caps" style={{ color: "var(--rose-deep)" }}>Nouvelle phrase</div>
      <h3
        className="font-display text-[26px] mt-1 italic"
        style={{ fontWeight: 400 }}
      >
        Écris ce qui te parle.
      </h3>

      <div className="mt-6 space-y-4">
        <div>
          <label className="caps" style={{ color: "var(--ink-muted)" }}>Quand ?</label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setCategory(k as Category)}
                className="text-[11px] px-3 py-1.5 rounded-full border"
                style={{
                  background: category === k ? "var(--ink)" : "var(--surface)",
                  color: category === k ? "#FBF6F0" : "var(--ink-soft)",
                  borderColor: "var(--line)",
                  transition: "all 0.3s var(--ease-out)",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="caps" style={{ color: "var(--ink-muted)" }}>Ta phrase</label>
          <textarea
            rows={3}
            placeholder="ex. Tu n'as pas faim, tu as soif. Bois un verre d'eau."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full mt-1 rounded-2xl px-4 py-3 border outline-none text-[15px] font-display italic resize-none"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
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
          onClick={() => text.trim() && onSave(text.trim(), category)}
          disabled={!text.trim()}
          className="flex-1 py-3.5 rounded-full text-[14px] font-medium text-white disabled:opacity-50"
          style={{ background: "var(--ink)" }}
        >
          Ajouter
        </button>
      </div>
    </Sheet>
  );
}
