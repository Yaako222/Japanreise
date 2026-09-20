import React, { useState, useEffect } from "react";
import {
  BookHeart,
  Music,
  Footprints,
  BedDouble,
  UtensilsCrossed,
  Compass,
  FileText,
  UserCheck,
  Settings,
  ShieldCheck,
  BookOpen,
  Users,
  Clock,
  Flame,
  Phone,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/useApp";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const { role, currentRoom, currentParentCode, logout, setIsLoggedIn } = useApp();

  // Dual Tokyo / Berlin clock
  const [times, setTimes] = useState({ tokyo: "", berlin: "" });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tokyoStr = now.toLocaleTimeString("de-DE", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
      });
      const berlinStr = now.toLocaleTimeString("de-DE", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
      });
      setTimes({ tokyo: tokyoStr, berlin: berlinStr });
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter navigation items strictly by role rights
  const getNavItems = () => {
    switch (role) {
      case "staff":
        return [
          { id: "staff_control", label: "Betreuer-Zentrale", icon: ShieldCheck, badge: "Admin" },
          { id: "ausgang", label: "Abmeldungen & Ausgang", icon: Footprints },
          { id: "rooms", label: "Zimmer & Check-in", icon: BedDouble },
          { id: "putzplan", label: "Putz- & Essensplan", icon: UtensilsCrossed },
          { id: "programm", label: "Programm & Proben", icon: Music },
          { id: "tagebuch", label: "Orchester-Tagebuch", icon: BookHeart },
          { id: "docs", label: "Dokumente", icon: FileText },
          { id: "tips", label: "Reise-Guide", icon: Compass },
        ];
      case "parent":
        return [
          { id: "eltern", label: "Mein Kind & Berichte", icon: UserCheck, badge: "Eltern" },
          { id: "programm", label: "Konzertprogramm", icon: Music },
          { id: "tips", label: "Reise-Guide & Notfall", icon: Compass },
          { id: "docs", label: "Reisedokumente", icon: FileText },
        ];
      case "conductor":
        return [
          { id: "conductor_control", label: "Dirigenten-Pult", icon: Sparkles, badge: "Maestro" },
          { id: "programm", label: "Programm & Proben", icon: Music },
          { id: "tagebuch", label: "Orchester-Tagebuch", icon: BookHeart },
          { id: "tips", label: "Reise-Guide", icon: Compass },
          { id: "docs", label: "Dokumente", icon: FileText },
        ];
      case "musician":
      default:
        return [
          { id: "tagebuch", label: "Tagebuch & Bericht", icon: BookHeart, badge: "Neu" },
          { id: "programm", label: "Programm & Proben", icon: Music },
          { id: "ausgang", label: "Ausgang & Abmelden", icon: Footprints },
          { id: "rooms", label: "Mein Zimmer & Orchester", icon: BedDouble },
          { id: "putzplan", label: "Putz- & Essensplan", icon: UtensilsCrossed },
          { id: "tips", label: "Reise-Guide", icon: Compass },
          { id: "docs", label: "Dokumente", icon: FileText },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (role) {
      case "musician":
        return currentRoom ? `Zimmer ${currentRoom.room_number}` : "Musiker";
      case "staff":
        return "Begleitung (Admin)";
      case "conductor":
        return "Dirigent (Pult)";
      case "parent":
        return currentParentCode ? `Eltern (${currentParentCode})` : "Eltern-Portal";
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "musician":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900";
      case "staff":
        return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      case "conductor":
        return "bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900";
      case "parent":
        return "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    }
  };

  const getActiveTabStyle = () => {
    switch (role) {
      case "staff":
        return "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25";
      case "conductor":
        return "bg-purple-600 text-white shadow-sm shadow-purple-600/25";
      case "parent":
        return "bg-amber-600 text-white shadow-sm shadow-amber-600/25";
      case "musician":
      default:
        return "bg-rose-600 text-white shadow-sm shadow-rose-600/25";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* Top Bar: Brand & Dual Clocks */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              if (role === "staff") setActiveTab("staff_control");
              else if (role === "parent") setActiveTab("eltern");
              else if (role === "conductor") setActiveTab("conductor_control");
              else setActiveTab("tagebuch");
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <span className="text-base font-bold font-display">響</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  BOH Japanreise
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Unser Tagebuch & Orchester-Begleiter
              </p>
            </div>
          </div>

          {/* Center: Live Dual Clock (Tokyo / Berlin) */}
          <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-rose-600 font-bold">Tokyo (JST):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {times.tokyo || "19:45"}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">&middot;</span>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span>Berlin (MEZ):</span>
              <span className="font-mono">{times.berlin || "12:45"}</span>
            </div>
          </div>

          {/* Right: Role indicator, Role Switch / Logout & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className={`px-3 py-1.5 text-xs font-semibold rounded-2xl border flex items-center gap-1.5 shadow-2xs transition-all hover:opacity-90 ${getRoleBadgeColor()}`}
              title="Klicken für Rollendetails"
            >
              {role === "musician" && <Users className="w-3.5 h-3.5" />}
              {role === "staff" && <ShieldCheck className="w-3.5 h-3.5" />}
              {role === "conductor" && <BookOpen className="w-3.5 h-3.5" />}
              {role === "parent" && <UserCheck className="w-3.5 h-3.5" />}
              <span className="truncate max-w-[100px] sm:max-w-[150px]">{getRoleLabel()}</span>
            </button>

            {/* Rolle wechseln / Portal Button */}
            <button
              onClick={() => logout()}
              className="px-2.5 py-1.5 rounded-2xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Zurück zum Rollen-Portal (Abmelden)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden md:inline">Rolle wechseln</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-2xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Design & Einstellungen"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Nav Bar with Scrollable Pills */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? getActiveTabStyle()
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded-full font-bold uppercase ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
