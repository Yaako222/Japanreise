import React, { useState, useEffect } from "react";
import {
  UserRole,
  Room,
  Participant,
  Concert,
  RehearsalNote,
  Announcement,
  DutyAssignment,
  InfoTip,
  DocumentItem,
  OutingRequest,
  ParentMessage,
  DailyReport,
} from "../types";
import {
  INITIAL_ROOMS,
  INITIAL_PARTICIPANTS,
  INITIAL_CONCERTS,
  INITIAL_REHEARSAL_NOTES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DUTIES,
  INITIAL_TIPS,
  INITIAL_DOCUMENTS,
  INITIAL_OUTING_REQUESTS,
  INITIAL_PARENT_MESSAGES,
  INITIAL_DAILY_REPORTS,
} from "../data/mockData";
import { supabase } from "../lib/supabase";
import { AppContext } from "./AppContextInstance";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem("jr_role") as UserRole) || "musician";
  });

  const [currentRoom, setCurrentRoomState] = useState<Room | null>(() => {
    const saved = localStorage.getItem("jr_current_room");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return INITIAL_ROOMS[0] || null;
  });

  const [currentParentCode, setCurrentParentCodeState] = useState<string | null>(() => {
    return localStorage.getItem("jr_parent_code") || "JP-ELT-201A";
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem("jr_accent") || "#e11d48";
  });

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem("jr_dark") === "true";
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    return localStorage.getItem("jr_notif") !== "false";
  });

  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => {
    return localStorage.getItem("jr_logged_in") === "true";
  });

  const setIsLoggedIn = (val: boolean) => {
    setIsLoggedInState(val);
    if (val) {
      localStorage.setItem("jr_logged_in", "true");
    } else {
      localStorage.removeItem("jr_logged_in");
    }
  };

  const [selectedInstrument, setSelectedInstrument] = useState<string>("Alle");

  // Main collections with localStorage cache fallback
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem("jr_rooms");
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem("jr_participants");
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS;
  });
  const [concerts, setConcerts] = useState<Concert[]>(() => {
    const saved = localStorage.getItem("jr_concerts");
    return saved ? JSON.parse(saved) : INITIAL_CONCERTS;
  });
  const [rehearsalNotes, setRehearsalNotes] = useState<RehearsalNote[]>(() => {
    const saved = localStorage.getItem("jr_rehearsal_notes");
    return saved ? JSON.parse(saved) : INITIAL_REHEARSAL_NOTES;
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem("jr_announcements");
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });
  const [duties, setDuties] = useState<DutyAssignment[]>(() => {
    const saved = localStorage.getItem("jr_duties");
    return saved ? JSON.parse(saved) : INITIAL_DUTIES;
  });
  const [tips] = useState<InfoTip[]>(INITIAL_TIPS);
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem("jr_documents");
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [outingRequests, setOutingRequests] = useState<OutingRequest[]>(() => {
    const saved = localStorage.getItem("jr_outings");
    return saved ? JSON.parse(saved) : INITIAL_OUTING_REQUESTS;
  });
  const [parentMessages, setParentMessages] = useState<ParentMessage[]>(() => {
    const saved = localStorage.getItem("jr_parent_messages");
    return saved ? JSON.parse(saved) : INITIAL_PARENT_MESSAGES;
  });
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem("jr_daily_reports");
    return saved ? JSON.parse(saved) : INITIAL_DAILY_REPORTS;
  });

  // Keep localStorage in sync
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("jr_role", newRole);
  };

  const setCurrentRoom = (room: Room | null) => {
    setCurrentRoomState(room);
    if (room) {
      localStorage.setItem("jr_current_room", JSON.stringify(room));
    } else {
      localStorage.removeItem("jr_current_room");
    }
  };

  const setCurrentParentCode = (code: string | null) => {
    setCurrentParentCodeState(code);
    if (code) {
      localStorage.setItem("jr_parent_code", code);
    } else {
      localStorage.removeItem("jr_parent_code");
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem("jr_accent", color);
    document.documentElement.style.setProperty("--accent", color);
  };

  const setIsDarkMode = (dark: boolean) => {
    setIsDarkModeState(dark);
    localStorage.setItem("jr_dark", String(dark));
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem("jr_notif", String(enabled));
  };

  // Sync color & dark mode to DOM on mount
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [accentColor, isDarkMode]);

  // Try fetching live announcements / data from Supabase if available
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const { data: dbAnnounce } = await supabase.from("announcements").select("*");
        if (dbAnnounce && dbAnnounce.length > 0) {
          setAnnouncements(dbAnnounce);
        }
      } catch {
        // Fallback to local state silently
      }
    }
    loadSupabaseData();
  }, []);

  const loginAsRoom = (roomNumber: string, pin: string) => {
    const found = rooms.find((r) => r.room_number.trim() === roomNumber.trim());
    if (!found) {
      return { success: false, message: `Zimmer ${roomNumber} nicht gefunden.` };
    }
    if (found.pin !== pin.trim()) {
      return { success: false, message: "PIN ungültig. Bitte den 4-stelligen Zimmer-PIN prüfen." };
    }
    setCurrentRoom(found);
    setRole("musician");
    setIsLoggedIn(true);
    return { success: true, message: `Angemeldet als Zimmer ${found.room_number}` };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentRoom(null);
    setCurrentParentCode(null);
  };

  const updateRoom = (
    roomId: string,
    updates: {
      room_number?: string;
      pin?: string;
      hotel_name?: string;
      floor?: number;
      notes?: string;
    },
  ) => {
    if (role !== "staff") {
      return {
        success: false,
        message: "Berechtigung verweigert: Nur Begleitpersonen dürfen Zimmernummer und PIN ändern.",
      };
    }

    if (updates.room_number !== undefined) {
      const trimmedNum = updates.room_number.trim();
      if (!trimmedNum) {
        return { success: false, message: "Die Zimmernummer darf nicht leer sein." };
      }
      const conflict = rooms.find(
        (r) => r.id !== roomId && r.room_number.toLowerCase() === trimmedNum.toLowerCase(),
      );
      if (conflict) {
        return { success: false, message: `Zimmernummer ${trimmedNum} wird bereits verwendet.` };
      }
    }

    if (updates.pin !== undefined) {
      const trimmedPin = updates.pin.trim();
      if (trimmedPin.length < 4) {
        return { success: false, message: "Der PIN muss mindestens 4 Zeichen lang sein." };
      }
    }

    let updatedCurrentRoom: Room | null = null;
    let oldRoomNumber: string | undefined;

    setRooms((prev) => {
      const nextRooms = prev.map((r) => {
        if (r.id === roomId) {
          oldRoomNumber = r.room_number;
          const merged = { ...r, ...updates };
          if (currentRoom?.id === roomId) {
            updatedCurrentRoom = merged;
          }
          return merged;
        }
        return r;
      });
      localStorage.setItem("jr_rooms", JSON.stringify(nextRooms));
      return nextRooms;
    });

    if (updatedCurrentRoom) {
      setCurrentRoom(updatedCurrentRoom);
    }

    if (updates.room_number && oldRoomNumber && updates.room_number !== oldRoomNumber) {
      setParticipants((prev) => {
        const updated = prev.map((p) => {
          if (p.room_id === roomId) {
            return { ...p };
          }
          return p;
        });
        localStorage.setItem("jr_participants", JSON.stringify(updated));
        return updated;
      });
    }

    return { success: true, message: "Zimmernummer und PIN erfolgreich aktualisiert." };
  };

  const loginAsStaff = (pin: string) => {
    const cleanPin = pin.trim().toLowerCase();
    if (
      cleanPin === "begleiter" ||
      cleanPin === "1234" ||
      cleanPin === "staff" ||
      cleanPin === "admin"
    ) {
      setRole("staff");
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const loginAsConductor = (pin: string) => {
    const cleanPin = pin.trim().toLowerCase();
    if (cleanPin === "dirigent" || cleanPin === "maestro" || cleanPin === "2026") {
      setRole("conductor");
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const loginAsParent = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const child = participants.find((p) => p.parent_access_code.toUpperCase() === cleanCode);
    if (child) {
      setCurrentParentCode(cleanCode);
      setRole("parent");
      setIsLoggedIn(true);
      return { success: true, childName: `${child.first_name} ${child.last_name}` };
    }
    return { success: false };
  };

  const requestOuting = (data: Omit<OutingRequest, "id" | "created_at" | "status">) => {
    const newRequest: OutingRequest = {
      ...data,
      id: `out_${Date.now()}`,
      created_at: "Gerade eben",
      status: "pending",
    };
    const updated = [newRequest, ...outingRequests];
    setOutingRequests(updated);
    localStorage.setItem("jr_outings", JSON.stringify(updated));
  };

  const updateOutingStatus = (id: string, status: OutingRequest["status"], reason?: string) => {
    const updated = outingRequests.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          rejection_reason: reason || null,
          rejected_at: status === "rejected" ? new Date().toISOString() : null,
        };
      }
      return item;
    });
    setOutingRequests(updated);
    localStorage.setItem("jr_outings", JSON.stringify(updated));
  };

  const markOutingReturned = (id: string) => {
    const updated = outingRequests.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: "returned" as const,
          actual_return: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }
      return item;
    });
    setOutingRequests(updated);
    localStorage.setItem("jr_outings", JSON.stringify(updated));
  };

  const addRehearsalNote = (noteData: Omit<RehearsalNote, "id" | "created_at">) => {
    const newNote: RehearsalNote = {
      ...noteData,
      id: `rn_${Date.now()}`,
      created_at: "Gerade eben",
    };
    const updated = [newNote, ...rehearsalNotes];
    setRehearsalNotes(updated);
    localStorage.setItem("jr_rehearsal_notes", JSON.stringify(updated));
  };

  const deleteRehearsalNote = (id: string) => {
    const updated = rehearsalNotes.filter((n) => n.id !== id);
    setRehearsalNotes(updated);
    localStorage.setItem("jr_rehearsal_notes", JSON.stringify(updated));
  };

  const addConcert = (concertData: Omit<Concert, "id">) => {
    const newConcert: Concert = {
      ...concertData,
      id: `c_${Date.now()}`,
    };
    const updated = [...concerts, newConcert];
    setConcerts(updated);
    localStorage.setItem("jr_concerts", JSON.stringify(updated));
  };

  const submitDailyReport = (reportData: Omit<DailyReport, "id" | "submitted_at">) => {
    const newReport: DailyReport = {
      ...reportData,
      id: `rep_${Date.now()}`,
      submitted_at: "Gerade eben",
    };
    const updated = [newReport, ...dailyReports];
    setDailyReports(updated);
    localStorage.setItem("jr_daily_reports", JSON.stringify(updated));
  };

  const toggleDutyComplete = (id: string) => {
    const updated = duties.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d));
    setDuties(updated);
    localStorage.setItem("jr_duties", JSON.stringify(updated));
  };

  const addDuty = (dutyData: Omit<DutyAssignment, "id" | "completed">) => {
    const newDuty: DutyAssignment = {
      ...dutyData,
      id: `d_${Date.now()}`,
      completed: false,
    };
    const updated = [...duties, newDuty];
    setDuties(updated);
    localStorage.setItem("jr_duties", JSON.stringify(updated));
  };

  const sendAnnouncement = (announcementData: Omit<Announcement, "id" | "created_at">) => {
    const newAnn: Announcement = {
      ...announcementData,
      id: `a_${Date.now()}`,
      created_at: "Gerade eben",
      read_by_rooms: [],
      read_by_parents: [],
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem("jr_announcements", JSON.stringify(updated));
  };

  const markAnnouncementAsRead = (id: string) => {
    const updated = announcements.map((a) => {
      if (a.id === id) {
        const reads = new Set(a.read_by_rooms || []);
        if (currentRoom) reads.add(currentRoom.room_number);
        const parentReads = new Set(a.read_by_parents || []);
        if (currentParentCode) parentReads.add(currentParentCode);
        return {
          ...a,
          read_by_rooms: Array.from(reads),
          read_by_parents: Array.from(parentReads),
        };
      }
      return a;
    });
    setAnnouncements(updated);
    localStorage.setItem("jr_announcements", JSON.stringify(updated));
  };

  const sendParentMessage = (msgData: Omit<ParentMessage, "id" | "created_at">) => {
    const newMsg: ParentMessage = {
      ...msgData,
      id: `pm_${Date.now()}`,
      created_at: "Gerade eben",
    };
    const updated = [newMsg, ...parentMessages];
    setParentMessages(updated);
    localStorage.setItem("jr_parent_messages", JSON.stringify(updated));
  };

  const answerParentMessage = (id: string, answer: string) => {
    const updated = parentMessages.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          answer,
          answered_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }
      return m;
    });
    setParentMessages(updated);
    localStorage.setItem("jr_parent_messages", JSON.stringify(updated));
  };

  const addDocument = (docData: Omit<DocumentItem, "id">) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc_${Date.now()}`,
    };
    const updated = [...documents, newDoc];
    setDocuments(updated);
    localStorage.setItem("jr_documents", JSON.stringify(updated));
  };

  const toggleCheckinOut = (participantId: string) => {
    const updated = participants.map((p) => {
      if (p.id === participantId) {
        return { ...p, checkin_out: !p.checkin_out };
      }
      return p;
    });
    setParticipants(updated);
    localStorage.setItem("jr_participants", JSON.stringify(updated));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentRoom,
        setCurrentRoom,
        currentParentCode,
        setCurrentParentCode,
        accentColor,
        setAccentColor,
        isDarkMode,
        setIsDarkMode,
        notificationsEnabled,
        setNotificationsEnabled,
        selectedInstrument,
        setSelectedInstrument,
        isLoggedIn,
        setIsLoggedIn,
        rooms,
        participants,
        concerts,
        rehearsalNotes,
        announcements,
        duties,
        tips,
        documents,
        outingRequests,
        parentMessages,
        dailyReports,
        loginAsRoom,
        logout,
        updateRoom,
        loginAsStaff,
        loginAsConductor,
        loginAsParent,
        requestOuting,
        updateOutingStatus,
        markOutingReturned,
        addRehearsalNote,
        deleteRehearsalNote,
        addConcert,
        submitDailyReport,
        toggleDutyComplete,
        addDuty,
        sendAnnouncement,
        markAnnouncementAsRead,
        sendParentMessage,
        answerParentMessage,
        addDocument,
        toggleCheckinOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
