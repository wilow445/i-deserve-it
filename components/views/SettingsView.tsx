"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2, AlertCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/Header";
import { Ornament, SectionLabel } from "@/components/ui/Ornament";
import { CATEGORIES, SCHEDULABLE_CATEGORIES, type Category } from "@/lib/constants";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push";

interface Schedule {
  id: string;
  category: Exclude<Category, "general">;
  time_of_day: string;
  enabled: boolean;
}

interface Props {
  userId: string;
  email: string;
  initialSchedules: Schedule[];
  initialPushEnabled: boolean;
}

export function SettingsView({
  userId,
  email,
  initialSchedules,
  initialPushEnabled,
}: Props) {
  const supabase = createClient();
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    SCHEDULABLE_CATEGORIES.map(
      (cat) =>
        initialSchedules.find((s) => s.category === cat) || {
          id: "",
          category: cat,
          time_of_day: CATEGORIES[cat].defaultTime + ":00",
          enabled: true,
        }
    )
  );
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function updateSchedule(
    category: Schedule["category"],
    patch: Partial<Pick<Schedule, "time_of_day" | "enabled">>
  ) {
    setSavingId(category);
    setSchedules((prev) =>
      prev.map((s) => (s.category === category ? { ...s, ...patch } : s))
    );

    const current = schedules.find((s) => s.category === category)!;
    const next = { ...current, ...patch };

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
    const { data, error } = await supabase
      .from("notification_schedules")
      .upsert(
        {
          user_id: userId,
          category: next.category,
          time_of_day: next.time_of_day,
          enabled: next.enabled,
          timezone: tz,
        },
        { onConflict: "user_id,category" }
      )
      .select()
      .single();

    if (!error && data) {
      setSchedules((prev) =>
        prev.map((s) => (s.category === category ? { ...s, id: data.id } : s))
      );
    }
    setSavingId(null);
  }

  async function handleEnablePush() {
    setPushBusy(true);
    setPushError(null);
    const result = await subscribeToPush();
    setPushBusy(false);
    if (result.ok) {
      setPushEnabled(true);
    } else {
      const msg: Record<string, string> = {
        denied: "Notifications refusées dans les réglages du navigateur.",
        unsupported: "Ton navigateur ne supporte pas les notifications.",
        "ios-needs-home-screen":
          "Sur iPhone : ajoute d'abord l'app à l'écran d'accueil (bouton Partager → Sur l'écran d'accueil), puis reviens activer ici.",
        "sw-failed": "Le service worker n'a pas pu démarrer.",
        "server-error": "Erreur serveur, réessaie.",
      };
      setPushError(msg[result.reason || ""] || "Une erreur est survenue.");
    }
  }

  async function handleDisablePush() {
    setPushBusy(true);
    await unsubscribeFromPush();
    await supabase.from("push_subscriptions").delete().eq("user_id", userId);
    setPushEnabled(false);
    setPushBusy(false);
  }

  async function sendTest() {
    setTestSending(true);
    setTestResult(null);
    const res = await fetch("/api/push/test", { method: "POST" });
    const data = await res.json();
    setTestSending(false);
    if (res.ok && data.sent > 0) {
      setTestResult("Envoyée. Regarde tes notifs.");
    } else {
      setTestResult(data.error === "no-subscriptions" ? "Active d'abord les notifications." : "Échec de l'envoi.");
    }
    setTimeout(() => setTestResult(null), 4000);
  }

  return (
    <>
      <Header view="settings" />
      <div className="space-y-6 pt-2 view-transition">
        <div className="anim-fade">
          <div className="caps" style={{ color: "var(--ink-muted)" }}>Réglages</div>
          <h1 className="font-display text-[34px] leading-[1.05] mt-1.5">
            Tes <span className="italic" style={{ color: "var(--rose-deep)" }}>rituels</span>.
          </h1>
        </div>

        <div className="anim-fade-2">
          <SectionLabel>Notifications</SectionLabel>
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-display text-[18px] italic" style={{ color: "var(--ink)" }}>
                  {pushEnabled ? "Activées sur cet appareil" : "Pas encore activées"}
                </div>
                <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {pushEnabled
                    ? "Tu recevras tes affirmations aux horaires choisis ci-dessous."
                    : "Active pour recevoir tes phrases du jour aux moments-clés."}
                </p>
              </div>
              <button
                onClick={pushEnabled ? handleDisablePush : handleEnablePush}
                disabled={pushBusy}
                className="rounded-full px-4 py-2 text-[12px] font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{
                  background: pushEnabled ? "var(--blush-soft)" : "var(--ink)",
                  color: pushEnabled ? "var(--rose-deep)" : "#FBF6F0",
                }}
              >
                {pushBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : pushEnabled ? (
                  <BellOff className="w-3.5 h-3.5" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                <span>{pushEnabled ? "Désactiver" : "Activer"}</span>
              </button>
            </div>

            {pushError && (
              <div
                class
