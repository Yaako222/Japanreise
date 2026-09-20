import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  BookOpen,
  X,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { useApp } from "../context/useApp";
import { UserRole } from "../types";

export const RolePortalView: React.FC = () => {
  const { loginAsRoom, loginAsStaff, loginAsConductor, loginAsParent } = useApp();

  const [activeModal, setActiveModal] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states - clean inputs without pre-filled hints
  const [musicianRoom, setMusicianRoom] = useState("");
  const [musicianPin, setMusicianPin] = useState("");

  const [staffPin, setStaffPin] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [conductorPin, setConductorPin] = useState("");

  const handleOpenModal = (role: UserRole) => {
    setErrorMessage(null);
    setActiveModal(role);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setErrorMessage(null);
  };

  // Login handlers
  const handleMusicianSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = loginAsRoom(musicianRoom, musicianPin);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setActiveModal(null);
    }
  };

  const handleStaffSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loginAsStaff(staffPin)) {
      setActiveModal(null);
    } else {
      setErrorMessage("Falscher Begleiter-PIN. Bitte Zugangsdaten prüfen.");
    }
  };

  const handleParentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = loginAsParent(parentCode);
    if (res.success) {
      setActiveModal(null);
    } else {
      setErrorMessage("Eltern-Code ungültig. Bitte Zugangsdaten prüfen.");
    }
  };

  const handleConductorSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loginAsConductor(conductorPin)) {
      setActiveModal(null);
    } else {
      setErrorMessage("Falscher Dirigenten-Code. Bitte Zugangsdaten prüfen.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-rose-500 selection:text-white font-sans">
      {/* Subtle atmospheric backdrop glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-950/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-950/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl relative z-10">
        {/* Header matching user's design */}
        <div className="text-left mb-8 sm:mb-10 pl-1">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] font-semibold text-slate-400 mb-2">
            KULTURAUSTAUSCH
          </p>
          <h1 className="text-4xl sm:text-5xl font-display font-medium text-white tracking-tight leading-none mb-2">
            BOH Japanreise
          </h1>
          <p className="text-2xl sm:text-3xl font-jp text-rose-500 font-normal tracking-wide">
            日本の旅
          </p>
        </div>

        {/* 4 Role Selection Cards */}
        <div className="space-y-4">
          {/* 1. Musiker */}
          <button
            type="button"
            onClick={() => handleOpenModal("musician")}
            className="group w-full text-left p-6 sm:p-7 rounded-2xl bg-[#1a233a]/80 hover:bg-[#202c48] border border-slate-700/60 hover:border-slate-500/80 transition-all duration-200 shadow-xl cursor-pointer block focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-white group-hover:text-rose-100 transition-colors mb-1.5">
              Für BOH-Musiker
            </h2>
            <p className="text-sm sm:text-[14.5px] text-slate-400 group-hover:text-slate-300 leading-relaxed font-light">
              Wichtige Infos, Regeln, Checklisten, Tagesberichte – ihr euch abmelden und
              Ankündigungen bekommen
              <span className="inline-block ml-1 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
                &rarr;
              </span>
            </p>
          </button>

          {/* 2. Begleiter / Admin */}
          <button
            type="button"
            onClick={() => handleOpenModal("staff")}
            className="group w-full text-left p-6 sm:p-7 rounded-2xl bg-[#1a233a]/80 hover:bg-[#202c48] border border-slate-700/60 hover:border-slate-500/80 transition-all duration-200 shadow-xl cursor-pointer block focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white group-hover:text-rose-100 transition-colors">
                Für BOH-Begleiter
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                Admin-Rechte
              </span>
            </div>
            <p className="text-sm sm:text-[14.5px] text-slate-400 group-hover:text-slate-300 leading-relaxed font-light">
              Programm, Checklisten und Zimmer verwalten – Abmeldungen im Blick und Ankündigungen
              senden
              <span className="inline-block ml-1 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
                &rarr;
              </span>
            </p>
          </button>

          {/* 3. Eltern */}
          <button
            type="button"
            onClick={() => handleOpenModal("parent")}
            className="group w-full text-left p-6 sm:p-7 rounded-2xl bg-[#1a233a]/80 hover:bg-[#202c48] border border-slate-700/60 hover:border-slate-500/80 transition-all duration-200 shadow-xl cursor-pointer block focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white group-hover:text-rose-100 transition-colors">
                Für Eltern
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60">
                Eltern-Portal
              </span>
            </div>
            <p className="text-sm sm:text-[14.5px] text-slate-400 group-hover:text-slate-300 leading-relaxed font-light">
              Die Berichte des Zimmers Ihres Kindes ansehen
              <span className="inline-block ml-1 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
                &rarr;
              </span>
            </p>
          </button>

          {/* 4. Dirigent */}
          <button
            type="button"
            onClick={() => handleOpenModal("conductor")}
            className="group w-full text-left p-6 sm:p-7 rounded-2xl bg-[#1a233a]/80 hover:bg-[#202c48] border border-slate-700/60 hover:border-slate-500/80 transition-all duration-200 shadow-xl cursor-pointer block focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white group-hover:text-rose-100 transition-colors">
                Für den Dirigenten
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60">
                Dirigenten-Pult
              </span>
            </div>
            <p className="text-sm sm:text-[14.5px] text-slate-400 group-hover:text-slate-300 leading-relaxed font-light">
              Probenhinweise eintragen – gesprochen oder getippt
              <span className="inline-block ml-1 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
                &rarr;
              </span>
            </p>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>BOH Blasorchester &middot; Konzerttournee Japan &middot; Rollenbasierter Zugriff</p>
        </div>
      </div>

      {/* Interactive Login Modals per Role */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131b2e] border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal: Musician */}
            {activeModal === "musician" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Musiker Zimmer-Anmeldung
                    </h3>
                    <p className="text-xs text-slate-400">
                      Zimmernummer und 4-stelligen Zimmer-PIN eingeben
                    </p>
                  </div>
                </div>

                {/* Role Rights List */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <p className="font-semibold text-rose-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Musiker-Berechtigungen:
                  </p>
                  <p>✓ Tagesberichte für das eigene Zimmer verfassen</p>
                  <p>✓ Ausgang abmelden &amp; Status in Echtzeit verfolgen</p>
                  <p>✓ Probennotizen für das eigene Instrument einsehen</p>
                  <p>✓ Zimmerbelegung, Putz- &amp; Essensplan prüfen</p>
                </div>

                <form onSubmit={handleMusicianSubmit} className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Zimmernummer:
                      </label>
                      <input
                        type="text"
                        value={musicianRoom}
                        onChange={(e) => setMusicianRoom(e.target.value)}
                        placeholder="Zimmernummer"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Zimmer-PIN:
                      </label>
                      <input
                        type="password"
                        value={musicianPin}
                        onChange={(e) => setMusicianPin(e.target.value)}
                        placeholder="4-stelliger PIN"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded-lg border border-rose-900">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>
                      {musicianRoom
                        ? `Als Zimmer ${musicianRoom} anmelden`
                        : "Als Musiker anmelden"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Modal: Staff / Begleiter (Admin) */}
            {activeModal === "staff" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      BOH-Begleiter &amp; Betreuer (Admin)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Vollzugriff auf Administration &amp; Moderation
                    </p>
                  </div>
                </div>

                {/* Admin Rights List */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <p className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Volle Admin-Rechte:
                  </p>
                  <p>✓ Ausgangsanträge prüfen, freigeben &amp; ablehnen</p>
                  <p>✓ Eil-Ankündigungen an Musiker oder Eltern senden</p>
                  <p>✓ Check-in, Boarding- &amp; Dokumentenstatus verwalten</p>
                  <p>✓ Putz- &amp; Essensdienste zuteilen &amp; prüfen</p>
                  <p>✓ Anfragen aus dem Eltern-Postfach beantworten</p>
                </div>

                <form onSubmit={handleStaffSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Betreuer-PIN oder Passwort:
                    </label>
                    <input
                      type="password"
                      value={staffPin}
                      onChange={(e) => setStaffPin(e.target.value)}
                      placeholder="Betreuer-PIN oder Passwort"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded-lg border border-rose-900">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Als Begleiter (Admin) anmelden</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Modal: Parent / Eltern */}
            {activeModal === "parent" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Eltern-Portal Zugang
                    </h3>
                    <p className="text-xs text-slate-400">
                      Persönlicher Eltern-Code für die Berichte Ihres Kindes
                    </p>
                  </div>
                </div>

                {/* Parent Rights List */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <p className="font-semibold text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Geschützte Eltern-Rechte:
                  </p>
                  <p>✓ Tagesberichte &amp; Erlebnisse des Zimmers Ihres Kindes</p>
                  <p>✓ Offizielle Eltern-Ankündigungen &amp; Tournee-Updates</p>
                  <p>✓ Direkte Fragen an die Reiseleitung senden</p>
                  <p>✓ Reiseplan, Konzertzeiten &amp; Notfallkontakte</p>
                </div>

                <form onSubmit={handleParentSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Eltern-Code (auf Einladungsschreiben):
                    </label>
                    <input
                      type="text"
                      value={parentCode}
                      onChange={(e) => setParentCode(e.target.value.toUpperCase())}
                      placeholder="Eltern-Code eingeben"
                      className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded-lg border border-rose-900">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Mit Kind verbinden &amp; Berichte öffnen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Modal: Conductor / Dirigent */}
            {activeModal === "conductor" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Dirigenten-Pult Zugang
                    </h3>
                    <p className="text-xs text-slate-400">
                      Probennotizen per Sprache oder Tastatur &amp; Konzertablauf
                    </p>
                  </div>
                </div>

                {/* Conductor Rights List */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <p className="font-semibold text-purple-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Dirigenten-Funktionen:
                  </p>
                  <p>✓ Probenhinweise für Stücke, Takte &amp; Stimmen anlegen</p>
                  <p>✓ Sprachaufnahme (Mikrofon) zur automatischen Erfassung</p>
                  <p>✓ Konzertablauf, Anspielzeiten &amp; Ablauf planen</p>
                  <p>✓ Probenfeedback für das gesamte Orchester bereitstellen</p>
                </div>

                <form onSubmit={handleConductorSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Dirigenten-PIN oder Kennwort:
                    </label>
                    <input
                      type="password"
                      value={conductorPin}
                      onChange={(e) => setConductorPin(e.target.value)}
                      placeholder="Dirigenten-PIN"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded-lg border border-rose-900">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Dirigenten-Pult entsperren</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
