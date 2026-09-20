import React, { useState } from "react";
import {
  BedDouble,
  Search,
  ArrowUpDown,
  Users,
  KeyRound,
  Check,
  Building2,
  Lock,
  ShieldCheck,
  Edit3,
  X,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { useApp } from "../context/useApp";
import { Room } from "../types";

export const RoomsView: React.FC = () => {
  const { rooms, participants, currentRoom, role, loginAsRoom, updateRoom } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"room" | "name">("room");

  // State for Switch Room Modal (requires Zimmernummer + PIN)
  const [switchRoomTarget, setSwitchRoomTarget] = useState<Room | null>(null);
  const [switchRoomNumber, setSwitchRoomNumber] = useState("");
  const [switchPin, setSwitchPin] = useState("");
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState<string | null>(null);

  // State for Staff Room & PIN Editor Modal (Begleitperson only)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editPin, setEditPin] = useState("");
  const [editFloor, setEditFloor] = useState<number>(2);
  const [editHotel, setEditHotel] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [staffToast, setStaffToast] = useState<string | null>(null);

  // Get occupants for each room
  const roomsWithOccupants = rooms.map((r) => {
    const occupants = participants
      .filter((p) => p.room_id === r.id)
      .sort((a, b) => a.last_name.localeCompare(b.last_name));
    return {
      ...r,
      occupants,
    };
  });

  // Filter based on search query
  const query = (searchQuery || "").toLowerCase();
  const filteredRooms = roomsWithOccupants.filter((r) => {
    const matchRoom = (r.room_number || "").includes(searchQuery);
    const matchHotel = (r.hotel_name || "").toLowerCase().includes(query);
    const matchOccupant = (r.occupants || []).some((p) =>
      `${p.first_name || ""} ${p.last_name || ""} ${p.instrument || ""}`
        .toLowerCase()
        .includes(query),
    );
    return matchRoom || matchHotel || matchOccupant;
  });

  // Sorting
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === "room") {
      return a.room_number.localeCompare(b.room_number, undefined, { numeric: true });
    } else {
      const nameA = a.occupants[0]?.last_name || "Z";
      const nameB = b.occupants[0]?.last_name || "Z";
      return nameA.localeCompare(nameB);
    }
  });

  // Open switch room modal
  const openSwitchModal = (room: Room) => {
    setSwitchRoomTarget(room);
    setSwitchRoomNumber(room.room_number);
    setSwitchPin("");
    setSwitchError(null);
    setSwitchSuccess(null);
  };

  // Handle room switch form submit
  const handleSwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchRoomNumber.trim() || !switchPin.trim()) {
      setSwitchError("Bitte Zimmernummer und Zimmer-PIN eingeben.");
      return;
    }

    const res = loginAsRoom(switchRoomNumber.trim(), switchPin.trim());
    if (res.success) {
      setSwitchSuccess(res.message);
      setSwitchError(null);
      setTimeout(() => {
        setSwitchRoomTarget(null);
        setSwitchSuccess(null);
      }, 1000);
    } else {
      setSwitchError(res.message);
    }
  };

  // Open staff edit modal
  const openStaffEditModal = (room: Room) => {
    if (role !== "staff") return;
    setEditingRoom(room);
    setEditRoomNumber(room.room_number);
    setEditPin(room.pin);
    setEditFloor(room.floor);
    setEditHotel(room.hotel_name);
    setEditNotes(room.notes || "");
    setEditError(null);
  };

  // Handle staff edit save
  const handleStaffSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    if (!editRoomNumber.trim()) {
      setEditError("Zimmernummer darf nicht leer sein.");
      return;
    }

    if (editPin.trim().length < 4) {
      setEditError("Der Zimmer-PIN muss mindestens 4 Zeichen lang sein.");
      return;
    }

    const res = updateRoom(editingRoom.id, {
      room_number: editRoomNumber.trim(),
      pin: editPin.trim(),
      floor: Number(editFloor) || 1,
      hotel_name: editHotel.trim(),
      notes: editNotes.trim(),
    });

    if (res.success) {
      setStaffToast(`Zimmer ${editRoomNumber.trim()} und PIN erfolgreich aktualisiert.`);
      setEditingRoom(null);
      setTimeout(() => setStaffToast(null), 4000);
    } else {
      setEditError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {staffToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{staffToast}</span>
          </div>
          <button
            onClick={() => setStaffToast(null)}
            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <BedDouble className="w-4 h-4" />
            <span>Zimmerbelegung & Unterkünfte</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Zimmeransicht & Mitbewohner
          </h2>
          <p className="text-xs text-slate-500">
            Zimmerwechsel erfordert Zimmernummer und PIN &middot; PIN-Änderung nur durch
            Begleitpersonen
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Name oder Zimmer suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={() => setSortBy(sortBy === "room" ? "name" : "room")}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Sortieren: {sortBy === "room" ? "Zimmer-Nr." : "Nachnamen"}</span>
          </button>
        </div>
      </div>

      {/* Security Info Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
        <Lock className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-800 dark:text-slate-100">
            Geschützte Zimmer-Zuordnung:
          </span>{" "}
          Ein Wechsel in ein anderes Zimmer ist nur mit der jeweiligen Zimmernummer und dem
          4-stelligen Zimmer-PIN möglich.
          {role === "staff" ? (
            <span className="block mt-1 font-medium text-emerald-700 dark:text-emerald-400">
              ✓ Als Begleitperson haben Sie die Berechtigung, Zimmernummern und PINs zu verwalten.
            </span>
          ) : (
            <span className="block mt-1 text-slate-500 dark:text-slate-400">
              Zimmernummern und PINs können ausschließlich von der Reisebegleitung geändert werden.
            </span>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRooms.map((room) => {
          const isMyRoom = currentRoom?.id === room.id;
          return (
            <div
              key={room.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isMyRoom
                  ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-md ring-2 ring-rose-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow"
              }`}
            >
              <div className="space-y-3">
                {/* Room top info */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      Zimmer {room.room_number}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Etage {room.floor}
                    </span>
                  </div>

                  {isMyRoom && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Mein Zimmer</span>
                    </span>
                  )}
                </div>

                {/* Hotel name */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{room.hotel_name}</span>
                </div>

                {/* Staff PIN Badge (ONLY visible to Begleitperson) */}
                {role === "staff" && (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold">Zimmer-PIN:</span>
                      <span className="font-mono font-bold tracking-wider">{room.pin}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold uppercase">
                      Begleiter
                    </span>
                  </div>
                )}

                {/* Occupants list */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Users className="w-3 h-3" />
                    <span>Bewohner ({room.occupants.length}):</span>
                  </div>
                  {room.occupants.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {p.first_name} {p.last_name}
                      </span>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        {p.instrument}
                      </span>
                    </div>
                  ))}
                  {room.occupants.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-1">Keine Bewohner zugewiesen</p>
                  )}
                </div>

                {room.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-1">{room.notes}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {/* Staff Edit Room & PIN Button (ONLY Begleitperson can change) */}
                {role === "staff" && (
                  <button
                    onClick={() => openStaffEditModal(room)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Zimmer &amp; PIN ändern</span>
                  </button>
                )}

                {/* Switch Room Button (Requires Zimmernummer + PIN) */}
                {isMyRoom ? (
                  <div className="w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Aktuell ausgewähltes Zimmer</span>
                  </div>
                ) : (
                  <button
                    onClick={() => openSwitchModal(room)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    <span>In dieses Zimmer wechseln (PIN)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Switch Room Modal (Requires Zimmernummer AND Zimmer-PIN) */}
      {switchRoomTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Zimmerwechsel bestätigen
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Zimmernummer und 4-stelliger PIN erforderlich
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSwitchRoomTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSwitchSubmit} className="p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                Sie wechseln in das Zimmer{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {switchRoomTarget.room_number}
                </span>{" "}
                ({switchRoomTarget.hotel_name}). Bitte geben Sie zur Autorisierung die Zimmernummer
                und den Zimmer-PIN ein.
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Zimmernummer
                </label>
                <input
                  type="text"
                  value={switchRoomNumber}
                  onChange={(e) => setSwitchRoomNumber(e.target.value)}
                  placeholder="Zimmernummer"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  4-stelliger Zimmer-PIN
                </label>
                <input
                  type="password"
                  value={switchPin}
                  onChange={(e) => setSwitchPin(e.target.value)}
                  placeholder="Zimmer-PIN eingeben"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                  required
                />
              </div>

              {switchError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{switchError}</span>
                </div>
              )}

              {switchSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{switchSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSwitchRoomTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Zimmerwechsel durchführen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Room & PIN Editor Modal (Begleitperson only) */}
      {editingRoom && role === "staff" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Zimmer &amp; PIN verwalten (Begleitperson)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Zimmernummer und PIN können nur von Begleitpersonen geändert werden
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRoom(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStaffSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Zimmernummer
                  </label>
                  <input
                    type="text"
                    value={editRoomNumber}
                    onChange={(e) => setEditRoomNumber(e.target.value)}
                    placeholder="z. B. 201"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Zimmer-PIN (mind. 4 Zeichen)
                  </label>
                  <input
                    type="text"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    placeholder="z. B. 2010"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Etage
                  </label>
                  <input
                    type="number"
                    value={editFloor}
                    onChange={(e) => setEditFloor(Number(e.target.value))}
                    min={1}
                    max={50}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Hotel-Name
                  </label>
                  <input
                    type="text"
                    value={editHotel}
                    onChange={(e) => setEditHotel(e.target.value)}
                    placeholder="Hotel-Name"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Zimmer-Notiz / Kategorie
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="z. B. Streicherzimmer Violine 1"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zimmer &amp; PIN speichern</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
