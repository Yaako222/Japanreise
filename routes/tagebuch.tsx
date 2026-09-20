import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Camera, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { Chip, ChipGrid } from "@/components/journal/ChipSelect";
import { VoiceField, countSentences } from "@/components/journal/VoiceField";
import { StepFrame } from "@/components/journal/StepFrame";
import { deleteOwnEntry, getTodayState, saveEntry, uploadPhoto } from "@/lib/journal.functions";
import {
  CHALLENGES,
  CREATIVE_KINDS,
  CULTURE_TOPICS,
  MOODS,
  WORD_SUGGESTIONS,
  emptyDraft,
  type EntryDraft,
} from "@/lib/journal-types";
import {
  clearDraft,
  clearRoomPin,
  getStoredRoomCode,
  getStoredRoomPin,
  loadDraft,
  saveDraft,
} from "@/lib/room-storage";

export const Route = createFileRoute("/tagebuch")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Unser Tag – BOH Japanreise" },
      {
        name: "description",
        content: "Der heutige Tagesbericht eures Zimmers: Stimmung, Erlebnisse, Erinnerungen.",
      },
      { property: "og:title", content: "Unser Tag – BOH Japanreise" },
      {
        property: "og:description",
        content: "Der heutige Tagesbericht eures Zimmers beim Kulturaustausch in Japan.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { day?: string } =>
    typeof search["day"] === "string" ? { day: search["day"] } : {},
  component: JournalPage,
});

const moodEmoji = (v: number | null) => MOODS.find((m) => m.value === v)?.emoji ?? "–";

const STEP_LABELS: Record<string, string> = {
  moodStart: "Stimmung morgens",
  moodEnd: "Stimmung jetzt",
  activities: "Was war besonders",
  memory: "Der Moment",
  memoryWhy: "Warum",
  cultureTopic: "Japan-Thema",
  cultureText: "Japan-Entdeckung",
  encounter: "Begegnung",
  encounterText: "Begegnung erzählen",
  bestPart: "Bester Teil",
  challenge: "Schwierig",
  challengeText: "Was war schwierig",
  tomorrow: "Morgen",
  words: "Drei Wörter",
  creativeKind: "Kreatives",
  creativeText: "Kreatives ausfüllen",
  photo: "Foto",
  preview: "Vorschau",
};


async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function deviceHint() {
  return (navigator.userAgent || "").slice(0, 160);
}

function JournalPage() {
  const navigate = useNavigate();
  const { day: dayParam } = Route.useSearch();
  const today = useServerFn(getTodayState);
  const save = useServerFn(saveEntry);
  const upload = useServerFn(uploadPhoto);
  const removeFn = useServerFn(deleteOwnEntry);


  const [code, setCode] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<EntryDraft>(emptyDraft());
  const [customWord, setCustomWord] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [customBest, setCustomBest] = useState("");
  const [customTomorrow, setCustomTomorrow] = useState("");
  const [done, setDone] = useState<{
    dayNumber: number;
    submitted: number;
    total: number;
    avgMood: number | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = getStoredRoomCode();
    if (!stored) navigate({ to: "/" });
    else {
      setCode(stored);
      setPin(getStoredRoomPin());
    }
  }, [navigate]);

  const state = useQuery({
    queryKey: ["today", code, dayParam ?? null],
    enabled: Boolean(code),
    queryFn: () =>
      today({
        data: {
          code: code as string,
          ...(pin ? { pin } : {}),
          ...(dayParam ? { dayId: dayParam } : {}),
        },
      }),
  });

  // Ohne passende PIN kommt niemand an den Tag heran – dann zurück zur Eingabe.
  useEffect(() => {
    const data = state.data;
    if (!data || data.ok || data.reason === "no_day") return;
    clearRoomPin();
    navigate({ to: "/" });
  }, [state.data, navigate]);

  const day = state.data?.ok ? state.data.day : null;

  useEffect(() => {
    if (!day) return;
    const existing = state.data?.ok ? state.data.entry : null;
    const local = loadDraft<EntryDraft>(day.id);
    if (existing) setDraft({ ...emptyDraft(), ...existing });
    else if (local) setDraft({ ...emptyDraft(), ...local });
    const topic = (existing ?? local)?.cultureTopic ?? "";
    if (topic && !CULTURE_TOPICS.includes(topic)) setCustomTopic(topic);
    const source = existing ?? local;
    const labels = (day.activities ?? []).map((a) => `${a.emoji} ${a.label}`);
    const best = source?.bestPart ?? "";
    if (best && ![...labels, ...(source?.activities ?? [])].includes(best)) setCustomBest(best);
    const tmr = source?.tomorrow ?? "";
    if (tmr && !(day.tomorrowItems ?? []).includes(tmr)) setCustomTomorrow(tmr);
  }, [day?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (day) saveDraft(day.id, draft);
  }, [draft, day]);

  const update = (patch: Partial<EntryDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const toggle = (list: string[], value: string, max?: number) => {
    if (list.includes(value)) return list.filter((v) => v !== value);
    if (max && list.length >= max) return list;
    return [...list, value];
  };

  const activityLabels = useMemo(
    () => (day?.activities ?? []).map((a) => `${a.emoji} ${a.label}`),
    [day],
  );

  const steps = useMemo(() => {
    const list: string[] = [
      "moodStart",
      "moodEnd",
      "activities",
      "memory",
      "memoryWhy",
      "cultureTopic",
    ];
    if (draft.cultureTopic) list.push("cultureText");
    list.push("encounter");
    if (draft.encounter) list.push("encounterText");
    list.push("bestPart", "challenge");
    if (draft.challenge === "Anderes") list.push("challengeText");
    list.push("tomorrow", "words", "creativeKind");
    if (draft.creativeKind) list.push("creativeText");
    list.push("photo", "preview");
    return list;
  }, [draft.cultureTopic, draft.encounter, draft.challenge, draft.creativeKind]);

  const current = steps[Math.min(step, steps.length - 1)];
  const progress = (step + 1) / steps.length;
  const back = () => (step === 0 ? navigate({ to: "/" }) : setStep((s) => s - 1));
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const stepItems = useMemo(
    () => steps.map((key) => ({ key, label: STEP_LABELS[key] ?? key })),
    [steps],
  );


  async function removeEntry() {
    if (!code || !day) return;
    if (!confirm(`Tagesbericht von Tag ${day.dayNumber} wirklich löschen?`)) return;
    setBusy(true);
    try {
      await removeFn({ data: { code, ...(pin ? { pin } : {}), dayId: day.id } });
      clearDraft(day.id);
      setDraft(emptyDraft());
      setStep(0);
      setEditing(false);
      await state.refetch();
      toast.success("Tagesbericht gelöscht.");
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Löschen hat nicht geklappt. Bitte nochmal versuchen.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit() {

    if (!code || !day) return;
    setBusy(true);
    try {
      const result = await save({
        data: { code, ...(pin ? { pin } : {}), device: deviceHint(), dayId: day.id, ...draft },
      });
      clearDraft(day.id);
      setEditing(false);
      setDone(result);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Speichern hat nicht geklappt. Bitte nochmal versuchen.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function pickPhoto(file: File) {
    if (!code || !day) return;
    setBusy(true);
    try {
      const dataUrl = await shrinkImage(file);
      const res = await upload({
        data: { code, ...(pin ? { pin } : {}), dayId: day.id, dataUrl },
      });
      setDraft((d) => ({ ...d, photoPaths: [...(d.photoPaths ?? []), res.path] }));
      toast.success("Foto gespeichert.");
    } catch {
      toast.error("Das Foto konnte nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  }

  if (!code || state.isLoading || !day) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col justify-center gap-6 px-6 py-12 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/20">
          <Check className="size-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl">Tag {done.dayNumber} festgehalten ✓</h1>
        <p className="text-muted-foreground">
          {done.submitted} von {done.total} Zimmern haben heute erzählt.
        </p>
        {done.avgMood && (
          <p className="text-lg">
            Heute fühlt sich das Orchester so an: {moodEmoji(done.avgMood)}
          </p>
        )}
        <Button className="h-14 rounded-2xl text-base" onClick={() => navigate({ to: "/" })}>
          Fertig
        </Button>
      </div>
    );
  }

  const locked = state.data?.ok ? state.data.submitted : false;
  const canEdit = state.data?.ok ? state.data.canEdit : false;
  const savedEntry = state.data?.ok ? state.data.entry : null;

  if (locked && savedEntry && !(editing && canEdit)) {
    return (
      <div className="flex min-h-dvh flex-col gap-6 px-5 py-10">
        <div>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">
            Tag {day.dayNumber}
            {day.location ? ` · ${day.location}` : ""}
          </p>
          <h1 className="font-display mt-3 text-2xl">Dieser Tag ist festgehalten ✓</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {canEdit
              ? "Bis heute Mitternacht könnt ihr noch einmal nachbessern."
              : "Dieser Tag liegt in der Vergangenheit und ist geschlossen."}
          </p>
        </div>

        <div className="washi space-y-5 rounded-3xl p-6">
          <p className="text-3xl">
            {moodEmoji(savedEntry.moodStart)} → {moodEmoji(savedEntry.moodEnd)}
          </p>
          {savedEntry.activities.length > 0 && (
            <Section title="Unser Tag">{savedEntry.activities.join(" · ")}</Section>
          )}
          {savedEntry.mainMemory && <Section title="Der Moment">„{savedEntry.mainMemory}"</Section>}
          {savedEntry.mainMemoryWhy && <Section title="Warum">„{savedEntry.mainMemoryWhy}"</Section>}
          {savedEntry.cultureText && (
            <Section title="Japan hat uns überrascht">„{savedEntry.cultureText}"</Section>
          )}
          {savedEntry.encounterText && (
            <Section title="Begegnung">„{savedEntry.encounterText}"</Section>
          )}
          {savedEntry.bestPart && <Section title="Bester Teil">{savedEntry.bestPart}</Section>}
          {savedEntry.challengeText && (
            <Section title="Schwierig war">„{savedEntry.challengeText}"</Section>
          )}
          {savedEntry.threeWords.length > 0 && (
            <Section title="Unsere drei Wörter">
              <span className="font-display text-lg text-primary">
                {savedEntry.threeWords.join(" · ").toUpperCase()}
              </span>
            </Section>
          )}
          {savedEntry.creativeText && (
            <Section
              title={
                CREATIVE_KINDS.find((k) => k.key === savedEntry.creativeKind)?.label ?? "Erinnerung"
              }
            >
              „{savedEntry.creativeText}"
            </Section>
          )}
        </div>

        {canEdit && (
          <Button
            className="h-14 rounded-2xl text-base"
            onClick={() => {
              setStep(0);
              setEditing(true);
            }}
          >
            Noch einmal ändern
          </Button>
        )}
        <Button
          variant="secondary"
          className="h-14 rounded-2xl text-base"
          onClick={() => navigate({ to: "/" })}
        >
          Zurück zur Übersicht
        </Button>
        {canEdit && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void removeEntry()}
            className="py-2 text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Tagesbericht löschen
          </button>
        )}
      </div>
    );
  }

  const eyebrow = `Tag ${day.dayNumber}${day.location ? ` · ${day.location}` : ""}`;
  const frame = (props: Omit<Parameters<typeof StepFrame>[0], "progress" | "eyebrow" | "onBack">) => (
    <StepFrame
      progress={progress}
      eyebrow={eyebrow}
      onBack={back}
      steps={stepItems}
      stepIndex={Math.min(step, steps.length - 1)}
      onJump={(i) => setStep(i)}
      {...props}
    />
  );


  switch (current) {
    case "moodStart":
      return frame({
        question: "Wie ist euer Tag gestartet?",
        hint: "Einfach antippen – kein Text nötig.",
        onNext: next,
        nextDisabled: draft.moodStart == null,
        children: (
          <MoodPicker value={draft.moodStart} onChange={(v) => update({ moodStart: v })} />
        ),
      });

    case "moodEnd":
      return frame({
        question: "Und wie fühlt ihr euch jetzt?",
        onNext: next,
        nextDisabled: draft.moodEnd == null,
        children: <MoodPicker value={draft.moodEnd} onChange={(v) => update({ moodEnd: v })} />,
      });

    case "activities":
      return frame({
        question: "Was war heute besonders?",
        hint: "Mehrfachauswahl – tippt alles an, was passt.",
        onNext: next,
        nextDisabled: draft.activities.length === 0,
        children: (
          <>
            {(day as any)?.description ? (
              <p className="mb-4 rounded-2xl border border-border bg-card/50 px-4 py-3 text-sm whitespace-pre-line text-muted-foreground">
                {(day as any).description}
              </p>
            ) : null}
            <ChipGrid
              options={activityLabels}
              selected={draft.activities}
              onToggle={(v) => update({ activities: toggle(draft.activities, v) })}
            />
          </>
        ),
      });

    case "memory":
      return frame({
        question: "⭐ Woran werdet ihr euch erinnern?",
        hint: "Der eine Moment von heute, den ihr nicht vergessen wollt.",
        onNext: next,
        nextDisabled: countSentences(draft.mainMemory) < 3,
        children: (
          <VoiceField
            value={draft.mainMemory}
            onChange={(v) => update({ mainMemory: v })}
            placeholder="Heute ist uns passiert …"
            minSentences={3}
          />
        ),
      });

    case "memoryWhy":
      return frame({
        question: "Warum ist dieser Moment hängengeblieben?",
        hint: "Freiwillig – aber schön, wenn ihr es erzählt.",
        onNext: next,
        onSkip: () => {
          update({ mainMemoryWhy: "" });
          next();
        },
        children: (
          <VoiceField
            value={draft.mainMemoryWhy}
            onChange={(v) => update({ mainMemoryWhy: v })}
            placeholder="Weil …"
            minSentences={3}
          />
        ),
      });

    case "cultureTopic":
      return frame({
        question: "🇯🇵 Was hat euch heute an Japan überrascht?",
        hint: "Wählt ein Thema.",
        onNext: next,
        nextDisabled: !draft.cultureTopic,
        onSkip: () => {
          update({ cultureTopic: "", cultureText: "" });
          setStep((s) => s + 1);
        },
        children: (
          <div className="grid grid-cols-1 gap-2">
            {CULTURE_TOPICS.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                size="lg"
                selected={draft.cultureTopic === topic}
                onClick={() => {
                  setCustomTopic("");
                  update({ cultureTopic: draft.cultureTopic === topic ? "" : topic });
                }}
              />
            ))}
            <div className="mt-2">
              <p className="mb-1 text-xs text-muted-foreground">
                Etwas Eigenes? Stichwort hier eintippen:
              </p>
              <Input
                value={customTopic}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomTopic(v);
                  update({ cultureTopic: v.trim() });
                }}
                placeholder="z. B. Vending-Maschinen überall"
                className="rounded-2xl bg-card/70 text-base"
              />
            </div>
          </div>
        ),
      });

    case "cultureText":
      return frame({
        question: "Was ist euch aufgefallen?",
        onNext: next,
        nextDisabled: countSentences(draft.cultureText) < 3,
        children: (
          <VoiceField
            value={draft.cultureText}
            onChange={(v) => update({ cultureText: v })}
            minSentences={3}
          />
        ),
      });

    case "encounter":
      return frame({
        question: "👋 Hat jemand euren Tag besonders gemacht?",
        onNext: next,
        nextDisabled: draft.encounter == null,
        children: (
          <div className="grid grid-cols-2 gap-3">
            <Chip
              label="Ja"
              size="lg"
              selected={draft.encounter === true}
              onClick={() => update({ encounter: true })}
            />
            <Chip
              label="Heute nicht"
              size="lg"
              selected={draft.encounter === false}
              onClick={() => update({ encounter: false, encounterText: "" })}
            />
          </div>
        ),
      });

    case "encounterText":
      return frame({
        question: "Wer war das – oder was ist passiert?",
        onNext: next,
        onSkip: () => {
          update({ encounterText: "" });
          next();
        },
        children: (
          <VoiceField
            value={draft.encounterText}
            onChange={(v) => update({ encounterText: v })}
            minSentences={3}
          />
        ),
      });

    case "bestPart": {
      const bestOptions = Array.from(new Set([...draft.activities, ...activityLabels]));
      return frame({
        question: "Was war der beste Teil?",
        onNext: next,
        nextDisabled: !draft.bestPart,
        children: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {bestOptions.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  size="lg"
                  selected={draft.bestPart === a}
                  onClick={() => {
                    setCustomBest("");
                    update({ bestPart: a });
                  }}
                />
              ))}
            </div>
            <div className="space-y-1">
              <Input
                value={customBest}
                onChange={(e) => {
                  setCustomBest(e.target.value);
                  update({ bestPart: e.target.value.trim() });
                }}
                placeholder="Etwas anderes – hier eintippen"
                className="h-12 rounded-2xl bg-card/70"
              />
              <p className="text-[11px] text-muted-foreground">
                Passt nichts davon? Schreibt es einfach selbst.
              </p>
            </div>
          </div>
        ),
      });
    }

    case "challenge":
      return frame({
        question: "War heute etwas schwierig?",
        onNext: next,
        nextDisabled: !draft.challenge,
        children: (
          <div className="grid grid-cols-2 gap-2">
            {CHALLENGES.map((c) => (
              <Chip
                key={c}
                label={c}
                size="lg"
                selected={draft.challenge === c}
                onClick={() => update({ challenge: c, challengeText: "" })}
              />
            ))}
          </div>
        ),
      });

    case "challengeText":
      return frame({
        question: "Was war es?",
        onNext: next,
        onSkip: () => {
          update({ challengeText: "" });
          next();
        },
        children: (
          <VoiceField
            value={draft.challengeText}
            onChange={(v) => update({ challengeText: v })}
            minSentences={3}
          />
        ),
      });

    case "tomorrow":
      return frame({
        question: "Worauf freut ihr euch morgen?",
        onNext: next,
        nextDisabled: !draft.tomorrow,
        children: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(day.tomorrowItems ?? []).map((item) => (
                <Chip
                  key={item}
                  label={item}
                  size="lg"
                  selected={draft.tomorrow === item}
                  onClick={() => {
                    setCustomTomorrow("");
                    update({ tomorrow: item });
                  }}
                />
              ))}
            </div>
            <div className="space-y-1">
              <Input
                value={customTomorrow}
                onChange={(e) => {
                  setCustomTomorrow(e.target.value);
                  update({ tomorrow: e.target.value.trim() });
                }}
                placeholder="Etwas anderes – hier eintippen"
                className="h-12 rounded-2xl bg-card/70"
              />
              <p className="text-[11px] text-muted-foreground">
                Passt nichts davon? Schreibt es einfach selbst.
              </p>
            </div>
          </div>
        ),
      });

    case "words":
      return frame({
        question: "Heute in genau 3 Wörtern:",
        hint: `${draft.threeWords.length} von 3 gewählt`,
        onNext: next,
        nextDisabled: draft.threeWords.length !== 3,
        children: (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                ...WORD_SUGGESTIONS,
                ...draft.threeWords.filter((w) => !WORD_SUGGESTIONS.includes(w)),
              ].map((word) => (
                <Chip
                  key={word}
                  label={word}
                  selected={draft.threeWords.includes(word)}
                  onClick={() => update({ threeWords: toggle(draft.threeWords, word, 3) })}
                />
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const word = customWord.trim();
                if (!word) return;
                update({ threeWords: toggle(draft.threeWords, word, 3) });
                setCustomWord("");
              }}
            >
              <Input
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="Eigenes Wort"
                className="h-12 rounded-2xl bg-card/70"
              />
              <Button type="submit" variant="secondary" className="h-12 rounded-2xl">
                +
              </Button>
            </form>
            {draft.threeWords.length > 0 && (
              <p className="font-display text-center text-xl tracking-wide text-primary">
                {draft.threeWords.join(" · ").toUpperCase()}
              </p>
            )}
          </div>
        ),
      });

    case "creativeKind":
      return frame({
        question: "Zum Abschluss: etwas Kreatives von heute",
        hint: "Wählt eins – freiwillig, aber schön.",
        onNext: next,
        nextDisabled: !draft.creativeKind,
        onSkip: () => {
          update({ creativeKind: "", creativeText: "" });
          setStep((s) => s + 1);
        },
        children: (
          <div className="grid grid-cols-1 gap-2">
            {CREATIVE_KINDS.map((k) => (
              <Chip
                key={k.key}
                label={`${k.emoji}  ${k.label}`}
                size="lg"
                selected={draft.creativeKind === k.key}
                onClick={() => update({ creativeKind: k.key })}
              />
            ))}
          </div>
        ),
      });

    case "creativeText": {
      const kind = CREATIVE_KINDS.find((k) => k.key === draft.creativeKind);
      return frame({
        question: `${kind?.emoji ?? "✨"} ${kind?.label ?? "Erinnerung"}`,
        onNext: next,
        onSkip: () => {
          update({ creativeText: "" });
          next();
        },
        children: (
          <VoiceField
            value={draft.creativeText}
            onChange={(v) => update({ creativeText: v })}
            minSentences={3}
          />
        ),
      });
    }

    case "photo": {
      const photos = draft.photoPaths ?? [];
      return frame({
        question: "📸 Fotos, die euren Tag erzählen?",
        hint: "Freiwillig. Ihr könnt mehrere Fotos hochladen – sie sehen eure Begleitpersonen und eure Eltern.",
        onNext: next,
        onSkip: next,
        children: (
          <div className="space-y-4">
            {photos.length > 0 && (
              <ul className="space-y-2">
                {photos.map((path, i) => (
                  <li
                    key={path}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">Foto {i + 1} gespeichert ✓</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        update({ photoPaths: photos.filter((p) => p !== path) })
                      }
                    >
                      Entfernen
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <Camera className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {photos.length ? "Weiteres Foto hinzufügen" : "Foto aufnehmen oder auswählen"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={busy || photos.length >= 12}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  void (async () => {
                    for (const file of files) await pickPhoto(file);
                  })();
                }}
              />
            </label>
            <p className="text-[11px] text-muted-foreground">Bis zu 12 Fotos pro Tag.</p>
          </div>
        ),
      });
    }

    default:
      return (
        <div className="flex min-h-dvh flex-col px-5 pt-6 pb-40">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Vorschau</p>
          <div className="washi mt-4 space-y-5 rounded-3xl p-6">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
              Zimmer {state.data?.ok ? state.data.room.roomNumber : ""} · Tag {day.dayNumber}
              {day.location ? ` · ${day.location}` : ""}
            </p>
            <p className="text-3xl">
              {moodEmoji(draft.moodStart)} → {moodEmoji(draft.moodEnd)}
            </p>
            <Section title="Unser Tag">{draft.activities.join(" · ")}</Section>
            {draft.mainMemory && <Section title="Der Moment">„{draft.mainMemory}"</Section>}
            {draft.cultureText && (
              <Section title="Japan hat uns überrascht">„{draft.cultureText}"</Section>
            )}
            {draft.encounterText && <Section title="Begegnung">„{draft.encounterText}"</Section>}
            {draft.threeWords.length > 0 && (
              <Section title="Unsere drei Wörter">
                <span className="font-display text-lg text-primary">
                  {draft.threeWords.join(" · ").toUpperCase()}
                </span>
              </Section>
            )}
            {draft.creativeText && (
              <Section
                title={CREATIVE_KINDS.find((k) => k.key === draft.creativeKind)?.label ?? "Erinnerung"}
              >
                „{draft.creativeText}"
              </Section>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-0 space-y-2 bg-linear-to-t from-background via-background/95 to-transparent px-5 pt-6 pb-6">
            <Button
              size="lg"
              className="h-14 w-full rounded-2xl text-base"
              disabled={busy}
              onClick={submit}
            >
              Tag {day.dayNumber} speichern
            </Button>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex w-full items-center justify-center gap-2 py-1 text-sm text-muted-foreground"
            >
              <Pencil className="size-3.5" /> Noch etwas ändern
            </button>
          </div>
        </div>
      );
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-widest text-muted-foreground uppercase">{title}</p>
      <p className="mt-1 leading-relaxed">{children}</p>
    </div>
  );
}
