import { createContext } from "react";
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

export interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
  currentParentCode: string | null;
  setCurrentParentCode: (code: string | null) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  selectedInstrument: string;
  setSelectedInstrument: (inst: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;

  // Data arrays
  rooms: Room[];
  participants: Participant[];
  concerts: Concert[];
  rehearsalNotes: RehearsalNote[];
  announcements: Announcement[];
  duties: DutyAssignment[];
  tips: InfoTip[];
  documents: DocumentItem[];
  outingRequests: OutingRequest[];
  parentMessages: ParentMessage[];
  dailyReports: DailyReport[];

  // Actions
  loginAsRoom: (roomNumber: string, pin: string) => { success: boolean; message: string };
  logout: () => void;
  updateRoom: (
    roomId: string,
    updates: {
      room_number?: string;
      pin?: string;
      hotel_name?: string;
      floor?: number;
      notes?: string;
    },
  ) => { success: boolean; message: string };
  loginAsStaff: (pin: string) => boolean;
  loginAsConductor: (pin: string) => boolean;
  loginAsParent: (code: string) => { success: boolean; childName?: string };
  requestOuting: (data: Omit<OutingRequest, "id" | "created_at" | "status">) => void;
  updateOutingStatus: (id: string, status: OutingRequest["status"], reason?: string) => void;
  markOutingReturned: (id: string) => void;
  addRehearsalNote: (note: Omit<RehearsalNote, "id" | "created_at">) => void;
  deleteRehearsalNote: (id: string) => void;
  addConcert: (concert: Omit<Concert, "id">) => void;
  submitDailyReport: (report: Omit<DailyReport, "id" | "submitted_at">) => void;
  toggleDutyComplete: (id: string) => void;
  addDuty: (duty: Omit<DutyAssignment, "id" | "completed">) => void;
  sendAnnouncement: (announcement: Omit<Announcement, "id" | "created_at">) => void;
  markAnnouncementAsRead: (id: string) => void;
  sendParentMessage: (msg: Omit<ParentMessage, "id" | "created_at">) => void;
  answerParentMessage: (id: string, answer: string) => void;
  addDocument: (doc: Omit<DocumentItem, "id">) => void;
  toggleCheckinOut: (participantId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
