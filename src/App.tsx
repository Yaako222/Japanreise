import React, { useState, useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/useApp";
import { Navbar } from "./components/Navbar";
import { OrchestraIntro } from "./components/OrchestraIntro";
import { SettingsModal } from "./components/SettingsModal";
import { DiaryView } from "./components/DiaryView";
import { ProgramRehearsalsView } from "./components/ProgramRehearsalsView";
import { OutingView } from "./components/OutingView";
import { RoomsView } from "./components/RoomsView";
import { DutyRosterView } from "./components/DutyRosterView";
import { TipsPage } from "./components/TipsPage";
import { DocumentsView } from "./components/DocumentsView";
import { ParentPortal } from "./components/ParentPortal";
import { StaffDashboard } from "./components/StaffDashboard";
import { ConductorDashboard } from "./components/ConductorDashboard";
import { RolePortalView } from "./components/RolePortalView";
import { Phone, ShieldCheck, Sparkles, Lock, ArrowLeft } from "lucide-react";

const MainContent: React.FC = () => {
  const { role, currentRoom, logout } = useApp();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (role === "staff") return "staff_control";
    if (role === "parent") return "eltern";
    if (role === "conductor") return "conductor_control";
    return "tagebuch";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Automatically adjust active tab when role changes
  useEffect(() => {
    if (role === "staff") {
      setActiveTab("staff_control");
    } else if (role === "parent") {
      setActiveTab("eltern");
    } else if (role === "conductor") {
      setActiveTab("conductor_control");
    } else {
      setActiveTab("tagebuch");
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 2-Second Orchestra Intro */}
      <OrchestraIntro />

      {/* Global Navigation with BOH Japanreise Branding */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Staff & Conductor Role Banners when active */}
      {role === "staff" && (
        <div className="bg-emerald-600 text-white py-2 px-4 text-xs font-semibold shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Eingeloggt als Reisebegleitung & Betreuer &middot; Volle Admin-Rechte</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("staff_control")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "staff_control"
                    ? "bg-white text-emerald-800"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                Betreuer-Zentrale öffnen
              </button>
            </div>
          </div>
        </div>
      )}

      {role === "conductor" && (
        <div className="bg-purple-700 text-white py-2 px-4 text-xs font-semibold shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>
                Eingeloggt als Dirigent &middot; Probennotizen diktieren &amp; Konzertablauf
              </span>
            </span>
            <button
              onClick={() => setActiveTab("conductor_control")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === "conductor_control"
                  ? "bg-white text-purple-900"
                  : "bg-purple-800 hover:bg-purple-900 text-white"
              }`}
            >
              Dirigenten-Pult öffnen
            </button>
          </div>
        </div>
      )}

      {role === "parent" && (
        <div className="bg-amber-600 text-white py-2 px-4 text-xs font-semibold shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>
                Eingeloggt als Elternteil &middot; Geschütztes Eltern-Portal für Reiseberichte &amp; Notfallkontakt
              </span>
            </span>
            <button
              onClick={() => setActiveTab("eltern")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === "eltern"
                  ? "bg-white text-amber-900"
                  : "bg-amber-700 hover:bg-amber-800 text-white"
              }`}
            >
              Mein Kind ansehen
            </button>
          </div>
        </div>
      )}

      {role === "musician" && currentRoom && (
        <div className="bg-slate-900 text-slate-200 py-1.5 px-4 text-xs font-medium border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Musiker-Bereich &middot;{" "}
                <strong className="text-white">Zimmer {currentRoom.room_number}</strong> (
                {currentRoom.hotel_name})
              </span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Ausgang nur in 3er-Gruppen &middot; Rückkehrzeiten einhalten
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area with RBAC Guarding */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Permission Guard for Staff Control */}
        {activeTab === "staff_control" && role !== "staff" && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Admin-Bereich geschützt
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              Die Betreuer-Zentrale erfordert Administrator-Rechte als BOH-Reisebegleiter.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab(role === "parent" ? "eltern" : role === "conductor" ? "conductor_control" : "tagebuch")}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Zurück zur Übersicht
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Als Begleiter anmelden
              </button>
            </div>
          </div>
        )}

        {/* Permission Guard for Conductor Control */}
        {activeTab === "conductor_control" && role !== "conductor" && role !== "staff" && (
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-3xl p-8 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Dirigenten-Pult geschützt
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              Dieser Bereich ist für den Dirigenten zum Diktieren von Probennotizen reserviert.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab("programm")}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Zum Programm &amp; Proben
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white"
              >
                Als Dirigent anmelden
              </button>
            </div>
          </div>
        )}

        {/* Permission Guard for Parent Portal */}
        {activeTab === "eltern" && role !== "parent" && role !== "staff" && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Eltern-Portal geschützt
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              Dieser Bereich ist exklusiv für Erziehungsberechtigte mit persönlichem Zugangscode.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab("tagebuch")}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Zurück zur Übersicht
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white"
              >
                Als Elternteil anmelden
              </button>
            </div>
          </div>
        )}

        {/* Permission Guard for Ausgang, Rooms & Putzplan (only Musician & Staff) */}
        {(activeTab === "ausgang" || activeTab === "rooms" || activeTab === "putzplan") &&
          role !== "musician" &&
          role !== "staff" && (
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-lg mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Interner Musiker- &amp; Betreuerbereich
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
                Ausgangsanmeldungen, Zimmerwechsel und Putzdienste sind ausschließlich für aktive Orchestermusiker und Betreuer bestimmt.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab(role === "parent" ? "eltern" : "conductor_control")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  Zu meinem Portal
                </button>
              </div>
            </div>
          )}

        {/* Normal Views */}
        {activeTab === "tagebuch" && (role === "musician" || role === "staff" || role === "conductor") && <DiaryView />}
        {activeTab === "programm" && <ProgramRehearsalsView />}
        {activeTab === "ausgang" && (role === "musician" || role === "staff") && <OutingView />}
        {activeTab === "rooms" && (role === "musician" || role === "staff") && <RoomsView />}
        {activeTab === "putzplan" && (role === "musician" || role === "staff") && <DutyRosterView />}
        {activeTab === "tips" && <TipsPage />}
        {activeTab === "docs" && <DocumentsView />}
        {activeTab === "eltern" && (role === "parent" || role === "staff") && <ParentPortal />}

        {/* Role-specific management views */}
        {activeTab === "staff_control" && role === "staff" && <StaffDashboard />}
        {activeTab === "conductor_control" && (role === "conductor" || role === "staff") && (
          <ConductorDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 font-display">
              BOH Japanreise 2026
            </span>
            <span>&middot;</span>
            <span>Unser Tagebuch &amp; Orchester-Begleiter</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline- &amp; Datensicher</span>
            </span>
            <a
              href="tel:+491714920192"
              className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-rose-500" />
              <span>Notfallhotline Reiseleitung</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Settings & Role Switcher Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

const AppShell: React.FC = () => {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return <RolePortalView />;
  }

  return <MainContent />;
};

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
