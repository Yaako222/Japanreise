import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { RoomOnly } from "@/components/room-only";
import { MusicianNav } from "@/components/musician-nav";
import { DocumentList } from "@/components/document-list";
import { listDocuments } from "@/lib/documents.functions";
import { getStoredRoomCode, getStoredRoomPin } from "@/lib/room-storage";

export const Route = createFileRoute("/dokumente")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dokumente – BOH Japanreise" },
      {
        name: "description",
        content: "Alle wichtigen Unterlagen zur Reise: PDFs, Fotos und Infoblätter zum Anschauen.",
      },
      { property: "og:title", content: "Dokumente – BOH Japanreise" },
      {
        property: "og:description",
        content: "PDFs und Fotos, die der Dirigent für alle bereitstellt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoomOnly>
      <DocumentsPage />
    </RoomOnly>
  ),
});

function DocumentsPage() {
  const load = useServerFn(listDocuments);
  const q = useQuery({
    queryKey: ["documents", "room"],
    queryFn: () =>
      load({
        data: {
          code: getStoredRoomCode() ?? undefined,
          pin: getStoredRoomPin() ?? undefined,
        },
      }),
    staleTime: 60_000,
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
      <MusicianNav />
      <div>
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Unterlagen</p>
        <h1 className="font-display mt-3 text-3xl leading-tight">Dokumente</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Zum Anschauen antippen – es öffnet sich in einem neuen Fenster.
        </p>
      </div>
      <DocumentList docs={q.data ?? []} loading={q.isLoading} />
    </main>
  );
}
