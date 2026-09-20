export type UserRole = "musician" | "staff" | "conductor" | "parent";

export type Instrument =
  | "Alle"
  | "Violine 1"
  | "Violine 2"
  | "Bratsche"
  | "Cello"
  | "Kontrabass"
  | "Querflöte"
  | "Oboe"
  | "Klarinette"
  | "Fagott"
  | "Horn"
  | "Trompete"
  | "Posaune"
  | "Tuba"
  | "Schlagwerk"
  | "Harfe"
  | "Klavier";

export interface Room {
  id: string;
  room_number: string;
  pin: string;
  hotel_name: string;
  floor: number;
  capacity: number;
  notes?: string;
  occupants?: Participant[];
}

export interface Participant {
  id: string;
  trip_id: string;
  room_id: string;
  first_name: string;
  last_name: string;
  instrument: string;
  age: number;
  phone: string;
  parent_name: string;
  parent_phone: string;
  parent_access_code: string;
  flight: string;
  docs_complete: boolean;
  checkin_out: boolean;
  boarded_out: boolean;
  checkin_return: boolean;
  boarded_return: boolean;
  is_staff: boolean;
  note?: string;
}

export interface OutingRequest {
  id: string;
  room_id: string;
  room_number: string;
  requester_name: string;
  scope: "full_room" | "half_room" | "custom";
  participant_names: string[];
  destination: string;
  planned_return: string;
  actual_return?: string | null;
  status: "pending" | "approved" | "rejected" | "returned";
  rejection_reason?: string | null;
  rejected_at?: string | null;
  created_at: string;
}

export interface RehearsalNote {
  id: string;
  trip_id: string;
  title: string;
  pieces: string;
  bars: string;
  target_instruments: string[];
  notes: string;
  created_at: string;
  is_urgent?: boolean;
}

export interface Concert {
  id: string;
  title: string;
  hall: string;
  city: string;
  date: string;
  time: string;
  call_time: string;
  tuning_time: string;
  dress_code: string;
  notes: string;
  pieces: { title: string; composer: string; duration: string }[];
}

export interface DailyReport {
  id: string;
  room_id: string;
  room_number: string;
  day_number: number;
  date: string;
  encounter: string;
  best_part: string;
  challenge: string;
  tomorrow: string;
  three_words: string;
  submitted_at: string;
  submitted_by?: string;
}

export interface DutyAssignment {
  id: string;
  date: string;
  duty_type: "cleaning" | "lunch" | "instrument_transport" | "night_duty";
  assigned_people: string[];
  room_number?: string;
  notes: string;
  completed: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: "normal" | "high" | "urgent";
  target_audience: "all" | "musicians" | "parents" | "staff";
  created_at: string;
  read_by_rooms?: string[];
  read_by_parents?: string[];
}

export interface ParentMessage {
  id: string;
  parent_code: string;
  child_name: string;
  room_number: string;
  kind: "question" | "idea" | "greeting";
  body: string;
  answer?: string | null;
  answered_at?: string | null;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: "noten" | "reise" | "regeln" | "notfall";
  file_url: string;
  description: string;
  target_roles: UserRole[];
}

export interface InfoTip {
  id: string;
  category: "kultur" | "regeln" | "notfall";
  title: string;
  content: string;
  icon: string;
  emergency_number?: string;
}

export interface UserSession {
  role: UserRole;
  room?: Room;
  participant?: Participant;
  parentCode?: string;
  staffName?: string;
  accentColor: string;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
}
