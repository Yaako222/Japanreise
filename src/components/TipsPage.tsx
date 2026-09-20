import React, { useState } from "react";
import {
  Compass,
  ShieldAlert,
  PhoneCall,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Train,
  CreditCard,
  Building,
} from "lucide-react";
import { useApp } from "../context/useApp";

export const TipsPage: React.FC = () => {
  const { tips } = useApp();
  const [activeSection, setActiveSection] = useState<"culture" | "rules" | "emergency">("culture");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const cultureTips = tips.filter((t) => t.category === "kultur" || t.category === "essen");
  const ruleTips = tips.filter((t) => t.category === "verhalten");
  const emergencyTips = tips.filter((t) => t.category === "notfall");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Orientierung & Sicherheit</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-jp mt-1">Reiseführer & Tournee-Knigge</h2>
        <p className="text-xs text-slate-300">
          In 3 übersichtliche Bereiche gegliedert: Kultur, Verhaltensregeln und Notfallkontakte.
        </p>
      </div>

      {/* 3 Section Selector Tabs (Roadmap item 5) */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        <button
          onClick={() => setActiveSection("culture")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === "culture"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="truncate">1. Japan-Tipps</span>
        </button>

        <button
          onClick={() => setActiveSection("rules")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === "rules"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="truncate">2. Verhaltensregeln</span>
        </button>

        <button
          onClick={() => setActiveSection("emergency")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === "emergency"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="truncate">3. Notfallkontakte</span>
        </button>
      </div>

      {/* BEREICH 1: Japan-Tipps & Kultur */}
      {activeSection === "culture" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cultureTips.map((tip) => (
              <div
                key={tip.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tip.icon}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tip.title}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tip.content}
                </p>
              </div>
            ))}

            {/* Practical transport card */}
            <div className="p-5 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                <Train className="w-4 h-4" />
                <span>U-Bahn & Suica / Welcome Suica</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                In der Tokyo Metro niemals laut sprechen oder telefonieren. Rucksäcke vor die Brust
                nehmen. Jeder Musiker erhält am Flughafen seine IC-Karte, die auch in 7-Eleven und
                FamilyMart zum Bezahlen gilt!
              </p>
            </div>

            {/* Bargeld / ATM card */}
            <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                <CreditCard className="w-4 h-4" />
                <span>Bargeld & 7-Bank ATMs</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Japan ist weiterhin eine Bargeld-freundliche Gesellschaft für kleinere Tempel und
                Streetfood. Geld am besten bei den Geldautomaten in jedem 7-Eleven abheben
                (unterstützt alle gängigen deutschen Giro-/Kreditkarten).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BEREICH 2: Verhaltensregeln & Sicherheit */}
      {activeSection === "rules" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Verbindliche Tournee-Regeln für Musiker</span>
            </h3>

            <div className="space-y-3">
              {ruleTips.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{rule.icon}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rule.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rule.content}
                  </p>
                </div>
              ))}

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏨</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Hotel-Etikette & Nachtruhe
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Japanische Hotelwände sind oft hellhörig. Ab 22:00 Uhr strikte Zimmerruhe. Kein
                  Üben auf den Zimmern ohne Schalldämpfer (Blechbläser & Schlagwerk üben nur in den
                  Konzert-Einsingräumen).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎻</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Instrumenten-Sicherheit
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Instrumentenkästen niemals unbeaufsichtigt in Bahnhöfen oder auf Gehwegen
                  abstellen. Klimaanlagen im Hotel nicht direkt auf Holzinstrumente blasen lassen
                  (Trocknungsrisiko!).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BEREICH 3: Notfallkontakte (Roadmap item 5) */}
      {activeSection === "emergency" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-500" />
              <span>Notruf & Direkte Kontakte in Japan</span>
            </h3>
            <p className="text-xs text-slate-500">
              Klicken Sie auf eine Rufnummer zum direkten Anrufen oder Kopieren.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {emergencyTips.map((em) => (
                <div
                  key={em.id}
                  className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-col justify-between gap-3"
                >
                  <div>
                    <span className="text-lg block mb-1">{em.icon}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{em.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{em.content}</p>
                  </div>

                  {em.phone && (
                    <div className="flex items-center justify-between pt-3 border-t border-rose-200/60 dark:border-rose-900/60">
                      <a
                        href={`tel:${em.phone}`}
                        className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{em.phone}</span>
                      </a>
                      <button
                        onClick={() => copyToClipboard(em.phone!)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                        title="Nummer kopieren"
                      >
                        {copiedNumber === em.phone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Japanese Emergency Numbers */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-lg block mb-1">🚨</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Japanischer Notruf (Polizei)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Polizeinotruf in ganz Japan: 110 (funktioniert auch von Münztelefonen ohne
                    Geldkarte).
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <a
                    href="tel:110"
                    className="text-xs font-mono font-bold text-rose-600 hover:underline"
                  >
                    110
                  </a>
                  <button
                    onClick={() => copyToClipboard("110")}
                    className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Japanese Ambulance / Fire */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-lg block mb-1">🚑</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Feuerwehr & Rettungsdienst
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Notarzt & Krankenwagen in ganz Japan: 119. Bei medizinischen Notfällen immer
                    zuerst die Reiseleitung anrufen!
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <a
                    href="tel:119"
                    className="text-xs font-mono font-bold text-rose-600 hover:underline"
                  >
                    119
                  </a>
                  <button
                    onClick={() => copyToClipboard("119")}
                    className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
