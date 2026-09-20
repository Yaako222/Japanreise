import React, { useState } from "react";
import {
  FileText,
  Download,
  FileCheck,
  BookOpen,
  Compass,
  ShieldAlert,
  Music,
  ExternalLink,
} from "lucide-react";
import { useApp } from "../context/useApp";

export const DocumentsView: React.FC = () => {
  const { documents, role } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("alle");

  const categories = [
    { id: "alle", label: "Alle Dokumente" },
    { id: "noten", label: "Noten & Stimmen", icon: Music },
    { id: "reise", label: "Reiseplan & Ablauf", icon: Compass },
    { id: "regeln", label: "Vorschriften & Knigge", icon: BookOpen },
    { id: "notfall", label: "Notfallkarten", icon: ShieldAlert },
  ];

  const filteredDocs = documents.filter((doc) => {
    // Check role permission
    if (doc.target_roles && !doc.target_roles.includes(role)) {
      return false;
    }
    if (selectedCategory === "alle") return true;
    return doc.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Tournee-Bibliothek</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Dokumente & Noten-Download
          </h2>
          <p className="text-xs text-slate-500">
            Reiseplan, Orchesterstimmen, Einreiseunterlagen & Notfallübersichten
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-rose-600 text-white font-semibold shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {doc.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {doc.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-500" />
                <span>PDF Format &middot; Offiziell freigegeben</span>
              </span>
              <button
                onClick={() => alert(`Dokument "${doc.title}" wird heruntergeladen.`)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-rose-600 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Herunterladen</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
