import React, { useState } from "react";
import {
  X,
  Moon,
  Sun,
  Bell,
  Palette,
  LogOut,
  Smartphone,
  CheckCircle2,
  Shield,
  Music2,
} from "lucide-react";
import { useApp } from "../context/useApp";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS = [
  { name: "Japan Rot", hex: "#e11d48" },
  { name: "Smaragdgrün", hex: "#059669" },
  { name: "Pazifikblau", hex: "#0284c7" },
  { name: "Kaiserpurpur", hex: "#7c3aed" },
  { name: "Bernstein", hex: "#d97706" },
  { name: "Indigo", hex: "#4f46e5" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    role,
    currentRoom,
    logout,
    accentColor,
    setAccentColor,
    isDarkMode,
    setIsDarkMode,
    notificationsEnabled,
    setNotificationsEnabled,
    selectedInstrument,
    setSelectedInstrument,
  } = useApp();

  const [testNotificationSent, setTestNotificationSent] = useState(false);

  if (!isOpen) return null;

  const triggerDeviceTest = () => {
    setTestNotificationSent(true);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Japanreise Orchester-App", {
        body: "Gerätetest erfolgreich: Push-Benachrichtigungen funktionieren einwandfrei!",
        icon: "🎌",
      });
    }
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const getRoleLabel = () => {
    switch (role) {
      case "staff":
        return "Begleitung & Betreuer (Admin)";
      case "conductor":
        return "Dirigent (Pult)";
      case "parent":
        return "Eltern-Portal";
      case "musician":
      default:
        return currentRoom ? `Musiker · Zimmer ${currentRoom.room_number}` : "Musiker";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="settings-dialog"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Einstellungen</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Erscheinungsbild, Instrument & Abmeldung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Accent Color Picker (Farbkreis) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Akzentfarbe (Farbkreis)
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setAccentColor(c.hex)}
                  className={`relative w-10 h-10 rounded-full transition-transform flex items-center justify-center shadow-sm ${
                    accentColor === c.hex
                      ? "scale-110 ring-4 ring-offset-2 ring-slate-300 dark:ring-slate-700"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {accentColor === c.hex && (
                    <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Instrument selection */}
          <div className="space-y-2 py-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Music2 className="w-4 h-4 text-rose-500" />
              <span>Mein Instrument (Notenfilter)</span>
            </div>
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {[
                "Alle",
                "Violine 1",
                "Violine 2",
                "Bratsche",
                "Cello",
                "Kontrabass",
                "Querflöte",
                "Oboe",
                "Klarinette",
                "Fagott",
                "Horn",
                "Trompete",
                "Posaune",
                "Tuba",
                "Schlagwerk",
                "Harfe",
                "Klavier",
              ].map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          {/* Dark / Light Mode */}
          <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Dunkelmodus</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Augenschonendes dunkles Farbschema
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Web Push Notifications & Device Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Handy-Benachrichtigungen
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ankündigungen, Proben & Ausgangsentscheidungen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={triggerDeviceTest}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-500" />
              <span>Gerätetest für hochdringliche Mitteilungen ausführen</span>
            </button>
            {testNotificationSent && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
                ✓ Test-Signal ausgelöst (Gerät ist empfangsbereit)
              </p>
            )}
          </div>

          {/* Current Authentication State & Logout */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Angemeldeter Bereich
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Aktiv
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-500" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">{getRoleLabel()}</p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Rollenwechsel und Zimmer-Anmeldungen sind aus Sicherheitsgründen nur über das
                geschützte Rollen-Portal mit PIN geschützt möglich.
              </p>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Abmelden &amp; zum Rollen-Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
