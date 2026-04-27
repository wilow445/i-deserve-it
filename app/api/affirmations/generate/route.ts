import { NextResponse } from "next/server";

const CATEGORY_CONTEXT: Record<string, string> = {
  morning: "le matin pour bien démarrer la journée",
  meal: "juste avant un repas pour manger en pleine conscience",
  craving: "vers 15h quand l'envie de sucre arrive",
  workout: "avant une séance de sport pour motiver",
  evening: "le soir pour poser le téléphone et bien dormir",
  general: "à n'importe quel moment, motivation générale",
};

export async function POST(request: Request) {
  const { category } = await request.json();
  const ctx = CATEGORY_CONTEXT[category] || CATEGORY_CONTEXT.general;

  const prompt = `Tu écris UNE seule phrase en français pour une application de bien-être appelée "I Deserve It". L'utilisatrice s'appelle Rebecca et fait un parcours de remise en forme bienveillant.

Contexte : ${ctx}.

Règles strictes :
- Une seule phrase, max 20 mots
- Ton bienveillant, complice, jamais culpabilisant
- Pas de moralisation, pas de discours sur la pesée ou les calories
- Tu peux être ferme mais toujours douce — comme une meilleure amie
- Évite "tu peux le faire" et autres clichés trop génériques
- Pas d'emoji
- Réponds UNIQUEMENT avec la phrase, sans guillemets, sans préambule`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Anthropic error", res.status, errorText);
      return NextResponse.json({ error: "ai-failed" }, { status: 500 });
    }
    const data = await res.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .trim()
      .replace(/^["«]|["»]$/g, "");
    if (!text) return NextResponse.json({ error: "empty-response" }, { status: 500 });
    return NextResponse.json({ text, category });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "exception" }, { status: 500 });
  }
}
