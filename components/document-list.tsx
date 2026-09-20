import { FileText, ExternalLink } from "lucide-react";
import type { DocumentItem } from "@/lib/documents.functions";

function sizeLabel(size: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

/** Zeigt die Dokumente als antippbare Karten – öffnen in einem neuen Fenster. */
export function DocumentList({
  docs,
  loading,
  empty = "Hier ist noch nichts hinterlegt.",
}: {
  docs: DocumentItem[];
  loading?: boolean;
  empty?: string;
}) {
  if (loading) return <p className="text-sm text-muted-foreground">Einen Moment …</p>;
  if (docs.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;

  return (
    <ul className="space-y-3">
      {docs.map((d) => (
        <li key={d.id}>
          <a
            href={d.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:bg-secondary"
          >
            <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="font-display block text-base leading-tight">{d.title}</span>
              {d.description && (
                <span className="mt-1 block text-sm text-muted-foreground">{d.description}</span>
              )}
              <span className="mt-1 block text-xs text-muted-foreground">
                {d.filePath ? `Datei${d.size ? ` · ${sizeLabel(d.size)}` : ""}` : "Link"}
              </span>
            </span>
            <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </a>
        </li>
      ))}
    </ul>
  );
}
