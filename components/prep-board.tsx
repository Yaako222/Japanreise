import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CircleDashed, Clock3 } from "lucide-react";
import { prepOverview, setPrepStatus, type PrepState } from "@/lib/prep.functions";

const STATES: { value: PrepState; label: string; icon: typeof Check }[] = [
  { value: "offen", label: "Offen", icon: CircleDashed },
  { value: "dabei", label: "Dran", icon: Clock3 },
  { value: "fertig", label: "Fertig", icon: Check },
];

const STATE_STYLE: Record<PrepState, string> = {
  offen: "border-border bg-card/60 text-muted-foreground",
  dabei: "border-primary/50 bg-primary/10 text-foreground",
  fertig: "border-primary bg-primary/20 text-foreground",
};

/**
 * Vorbereitungsliste: jedes Zimmer trägt seinen eigenen Stand ein,
 * Begleitung und Dirigent dürfen für alle Zimmer eintragen.
 */
export function PrepBoard({
  auth,
  onDeleteTask,
}: {
  auth?: { code: string; pin: string } | null;
  onDeleteTask?: (id: string) => void;
}) {
  const load = useServerFn(prepOverview);
  const save = useServerFn(setPrepStatus);
  const queryClient = useQueryClient();
  const [openTask, setOpenTask] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["prep", auth?.code ?? "leader"],
    queryFn: () => load({ data: auth ? { code: auth.code, pin: auth.pin } : {} }),
    staleTime: 15_000,
  });

  const mutation = useMutation({
    mutationFn: (vars: { taskId: string; roomId: string; state: PrepState; note: string }) =>
      save({ data: { ...vars, ...(auth ? { code: auth.code, pin: auth.pin } : {}) } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prep"] }),
  });

  const data = q.data;
  const statusMap = useMemo(() => {
    const map = new Map<string, { state: PrepState; note: string; updatedBy: string }>();
    for (const s of data?.statuses ?? [])
      map.set(`${s.taskId}:${s.roomId}`, { state: s.state, note: s.note, updatedBy: s.updatedBy });
    return map;
  }, [data]);

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Einen Moment …</p>;
  if (!data || data.tasks.length === 0)
    return <p className="text-sm text-muted-foreground">Es ist noch nichts einzutragen.</p>;

  const myRoom = data.rooms.find((r) => r.id === data.myRoomId) ?? null;

  return (
    <div className="space-y-4">
      {data.tasks.map((task) => {
        const done = data.rooms.filter(
          (r) => statusMap.get(`${task.id}:${r.id}`)?.state === "fertig",
        ).length;
        const open = openTask === task.id;
        return (
          <section key={task.id} className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-base leading-tight">{task.title}</h3>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                )}
                {task.dueNote && (
                  <p className="mt-1 text-xs text-muted-foreground">{task.dueNote}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                  {done}/{data.rooms.length}
                </span>
                {onDeleteTask && (
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>

            {myRoom && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">
                  Euer Zimmer {myRoom.roomNumber}
                  {myRoom.names.length > 0 ? ` · ${myRoom.names.join(", ")}` : ""}
                </p>
                <StateRow
                  value={statusMap.get(`${task.id}:${myRoom.id}`)?.state ?? "offen"}
                  note={statusMap.get(`${task.id}:${myRoom.id}`)?.note ?? ""}
                  busy={mutation.isPending}
                  onChange={(state, note) =>
                    mutation.mutate({ taskId: task.id, roomId: myRoom.id, state, note })
                  }
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpenTask(open ? null : task.id)}
              className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {open ? "Alle Zimmer ausblenden" : "Alle Zimmer anzeigen"}
            </button>

            {open && (
              <ul className="mt-3 space-y-2">
                {data.rooms.map((room) => {
                  const current = statusMap.get(`${task.id}:${room.id}`);
                  const editable = data.canEditAll || room.id === data.myRoomId;
                  return (
                    <li key={room.id} className="rounded-xl border border-border bg-background/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm">
                          Zimmer {room.roomNumber}
                          {room.names.length > 0 && (
                            <span className="text-muted-foreground"> · {room.names.join(", ")}</span>
                          )}
                        </p>
                        {!editable && (
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATE_STYLE[current?.state ?? "offen"]}`}
                          >
                            {STATES.find((s) => s.value === (current?.state ?? "offen"))?.label}
                          </span>
                        )}
                      </div>
                      {editable ? (
                        <StateRow
                          value={current?.state ?? "offen"}
                          note={current?.note ?? ""}
                          busy={mutation.isPending}
                          onChange={(state, note) =>
                            mutation.mutate({ taskId: task.id, roomId: room.id, state, note })
                          }
                        />
                      ) : (
                        current?.note && (
                          <p className="mt-1 text-xs text-muted-foreground">{current.note}</p>
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StateRow({
  value,
  note,
  busy,
  onChange,
}: {
  value: PrepState;
  note: string;
  busy: boolean;
  onChange: (state: PrepState, note: string) => void;
}) {
  const [text, setText] = useState(note);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        {STATES.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={busy}
            onClick={() => onChange(s.value, text)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-60 ${
              value === s.value ? STATE_STYLE[s.value] : "border-border bg-card/60 hover:bg-secondary"
            }`}
          >
            <s.icon className="size-3.5" /> {s.label}
          </button>
        ))}
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text !== note && onChange(value, text)}
        placeholder="Kurze Notiz (freiwillig)"
        className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary"
      />
    </div>
  );
}
