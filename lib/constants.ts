export const PLAN = {
  startDate: "2026-05-04",
  goalDate: "2026-09-01",
  startWeight: 97,
  goalWeight: 77,
  weeklyTarget: 1,
} as const;

export const WEIGH_INS_TOTAL = 17;

export const FOODS: Record<string, string[]> = {
  "Protéines": [
    "Saumon, poisson blanc",
    "Sardines",
    "Poulet",
    "Cottage cheese",
    "Œufs",
    "Lentilles",
    "Pois chiches",
  ],
  "Légumes": [
    "Tous les légumes verts",
    "Tomates",
    "Betteraves",
    "Carottes",
    "Avocat",
    "Chou-fleur",
  ],
  "Fruits": ["Fruits rouges", "Pommes", "Myrtilles", "Pastèque"],
  "Féculents (3×/sem max)": [
    "Riz",
    "Quinoa",
    "Soba",
    "Nouilles sans gluten",
    "Pain au levain",
  ],
};

export const SPORT = [
  { name: "Pilates", freq: "1× par semaine" },
  { name: "Cardio", freq: "1× par semaine" },
  { name: "Jambes — gym", freq: "1× par semaine" },
  { name: "Bras — maison", freq: "1× par semaine" },
  { name: "Marche", freq: "7 000 – 10 000 pas / jour" },
] as const;

export const REWARDS = [
  { weight: 90, name: "Massage" },
  { weight: 85, name: "Soin du visage" },
  { weight: 80, name: "Weekend en amoureux" },
  { weight: 75, name: "Nouvelle garde-robe — 500 €" },
] as const;

export type Category = "morning" | "meal" | "craving" | "workout" | "evening" | "general";

export const CATEGORIES: Record<Category, { label: string; defaultTime: string }> = {
  morning: { label: "Matin", defaultTime: "08:00" },
  meal: { label: "Repas", defaultTime: "12:00" },
  craving: { label: "Anti-fringale", defaultTime: "15:00" },
  workout: { label: "Sport", defaultTime: "17:30" },
  evening: { label: "Soir", defaultTime: "22:00" },
  general: { label: "Général", defaultTime: "—" },
};

export const SCHEDULABLE_CATEGORIES: Exclude<Category, "general">[] = [
  "morning",
  "meal",
  "craving",
  "workout",
  "evening",
];
