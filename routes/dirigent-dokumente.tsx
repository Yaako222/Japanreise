import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentList } from "@/components/document-list";
import { deleteDocument, listDocuments, saveDocument } from "@/lib/documents.functions";

export const Route = createFileRoute("/dirigent-dokumente")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dokumente verwalten – BOH Japanreise" },
      { name: "description", content: "Der Dirigent stellt hier PDFs und Fotos für alle bereit." },
      { property: "og:title", content: "Dokumente verwalten – BOH Japanreise" },
      { property: "og:description", content: "PDFs, Fotos und Links für die Reise bereitstellen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConductorDocuments,
});

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

function ConductorDocuments() {
  const load = useServerFn(listDocuments);
  const save = useServerFn(saveDocument);
  const remove = useServerFn(deleteDocument);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const q = useQuery({
    queryKey: ["documents", "conductor"],
    queryFn: () => load({ data: {} }),
    staleTime: 30_000,
  });

  const reset = () => {
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const add = useMutation({
    mutationFn: async () => {
      const dataUrl = file ? await readFile(file) : undefined;
      return save({
        data: {
          title: title.trim(),
          description,
          linkUrl,
          ...(dataUrl && file ? { dataUrl, fileName: file.name } : {}),
        },
      });
    },
    onSuccess: () => {
      toast.success("Dokument ist für alle sichtbar.");
      reset();
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: Error) => toast.error(e.message || "Das hat nicht geklappt."),
  });

  const drop = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Gelöscht.");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => toast.error("Löschen hat nicht geklappt."),
  });

  const docs = q.data ?? [];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <Link
        to="/dirigent"
        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="size-3.5" /> Zurück zum Probenbereich
      </Link>

      <div>
        <h1 className="font-display text-3xl leading-tight">Dokumente</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          PDF oder Foto hochladen – Musiker und Begleitpersonen sehen es sofort. Alternativ könnt
          ihr auch nur einen Link hinterlegen.
        </p>
      </div>

      <form
        className="washi space-y-4 rounded-3xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="doc-title">Titel</Label>
          <Input
            id="doc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 160))}
            placeholder="z. B. Konzertprogramm Kyoto"
            className="bg-background/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-desc">Kurze Erklärung (freiwillig)</Label>
          <Textarea
            id="doc-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 600))}
            className="bg-background/40"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-file">Datei (PDF oder Foto, bis 25 MB)</Label>
          <Input
            id="doc-file"
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="bg-background/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-link">oder ein Link (z. B. Google Drive)</Label>
          <Input
            id="doc-link"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value.slice(0, 600))}
            placeholder="https://…"
            className="bg-background/40"
          />
        </div>
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl"
          disabled={add.isPending || !title.trim() || (!file && !linkUrl.trim())}
        >
          <Upload className="size-4" /> {add.isPending ? "Lade hoch …" : "Bereitstellen"}
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Bereitgestellt</h2>
        <DocumentList docs={docs} loading={q.isLoading} />
        {docs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {docs.map((d) => (
              <Button
                key={d.id}
                size="sm"
                variant="ghost"
                disabled={drop.isPending}
                onClick={() => {
                  if (confirm(`„${d.title}“ löschen?`)) drop.mutate(d.id);
                }}
              >
                <Trash2 className="size-4" /> {d.title}
              </Button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
