import { Category } from "./constants";

export interface Affirmation {
  id: string;
  text: string;
  category: Category;
  custom?: boolean;
  source?: "default" | "custom" | "ai";
}

export const DEFAULT_AFFIRMATIONS: Affirmation[] = [
  { id: "m1", text: "Bonjour ma belle. Aujourd'hui est un jour pour toi.", category: "morning" },
  { id: "m2", text: "Tu construis la femme que tu veux devenir. Brique par brique.", category: "morning" },
  { id: "m3", text: "Lève-toi. Bois un verre d'eau. Le reste suivra.", category: "morning" },
  { id: "r1", text: "Mange en pleine conscience. Pose la fourchette entre chaque bouchée.", category: "meal" },
  { id: "r2", text: "Un grand verre d'eau avant le repas. Ton estomac se calme.", category: "meal" },
  { id: "c1", text: "Hop hop hop, pas de sucre. Un smoothie myrtille à la place ?", category: "craving" },
  { id: "c2", text: "L'envie passe en 20 minutes. Bois de l'eau et reviens.", category: "craving" },
  { id: "c3", text: "5 minutes de plaisir, 2 jours de regret. Tu vaux mieux que ça.", category: "craving" },
  { id: "c4", text: "Tu as tenu six heures. Pourquoi craquer maintenant ?", category: "craving" },
  { id: "w1", text: "Vingt minutes. Juste vingt. Tu peux le faire.", category: "workout" },
  { id: "w2", text: "Tu n'as jamais regretté un workout. Jamais.", category: "workout" },
  { id: "e1", text: "Pose le téléphone. Demain commence ce soir.", category: "evening" },
  { id: "e2", text: "Un bon sommeil = un kilo de moins le mois prochain.", category: "evening" },
  { id: "e3", text: "Lis dix pages au lieu de scroller.", category: "evening" },
  { id: "g1", text: "Tu n'es pas en train de te priver. Tu choisis.", category: "general" },
  { id: "g2", text: "Ton futur toi te dit merci.", category: "general" },
  { id: "g3", text: "Chaque choix te rapproche d'elle.", category: "general" },
];
