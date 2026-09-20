export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          room_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          room_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          id: string
          level: string
          published: boolean
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body?: string
          created_at?: string
          id?: string
          level?: string
          published?: boolean
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          id?: string
          level?: string
          published?: boolean
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      concerts: {
        Row: {
          created_at: string
          dress: string
          id: string
          meeting_at: string | null
          meeting_point: string
          notes: string
          program: string[]
          published: boolean
          sort_order: number
          starts_at: string
          title: string
          trip_id: string
          tuning_at: string | null
          updated_at: string
          venue: string
        }
        Insert: {
          created_at?: string
          dress?: string
          id?: string
          meeting_at?: string | null
          meeting_point?: string
          notes?: string
          program?: string[]
          published?: boolean
          sort_order?: number
          starts_at: string
          title: string
          trip_id: string
          tuning_at?: string | null
          updated_at?: string
          venue?: string
        }
        Update: {
          created_at?: string
          dress?: string
          id?: string
          meeting_at?: string | null
          meeting_point?: string
          notes?: string
          program?: string[]
          published?: boolean
          sort_order?: number
          starts_at?: string
          title?: string
          trip_id?: string
          tuning_at?: string | null
          updated_at?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "concerts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_entries: {
        Row: {
          activities: string[]
          best_part: string | null
          challenge: string | null
          challenge_text: string | null
          created_at: string
          creative_kind: string | null
          creative_text: string | null
          culture_text: string | null
          culture_topic: string | null
          encounter: boolean | null
          encounter_text: string | null
          id: string
          main_memory: string | null
          main_memory_why: string | null
          mood_end: number | null
          mood_start: number | null
          photo_path: string | null
          photo_paths: string[]
          room_id: string
          submitted_at: string | null
          submitted_from: string | null
          three_words: string[]
          tomorrow: string | null
          trip_day_id: string
          updated_at: string
        }
        Insert: {
          activities?: string[]
          best_part?: string | null
          challenge?: string | null
          challenge_text?: string | null
          created_at?: string
          creative_kind?: string | null
          creative_text?: string | null
          culture_text?: string | null
          culture_topic?: string | null
          encounter?: boolean | null
          encounter_text?: string | null
          id?: string
          main_memory?: string | null
          main_memory_why?: string | null
          mood_end?: number | null
          mood_start?: number | null
          photo_path?: string | null
          photo_paths?: string[]
          room_id: string
          submitted_at?: string | null
          submitted_from?: string | null
          three_words?: string[]
          tomorrow?: string | null
          trip_day_id: string
          updated_at?: string
        }
        Update: {
          activities?: string[]
          best_part?: string | null
          challenge?: string | null
          challenge_text?: string | null
          created_at?: string
          creative_kind?: string | null
          creative_text?: string | null
          culture_text?: string | null
          culture_topic?: string | null
          encounter?: boolean | null
          encounter_text?: string | null
          id?: string
          main_memory?: string | null
          main_memory_why?: string | null
          mood_end?: number | null
          mood_start?: number | null
          photo_path?: string | null
          photo_paths?: string[]
          room_id?: string
          submitted_at?: string | null
          submitted_from?: string | null
          three_words?: string[]
          tomorrow?: string | null
          trip_day_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_entries_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_entries_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          link_url: string | null
          mime: string | null
          size: number | null
          sort_order: number
          title: string
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          link_url?: string | null
          mime?: string | null
          size?: number | null
          sort_order?: number
          title: string
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          link_url?: string | null
          mime?: string | null
          size?: number | null
          sort_order?: number
          title?: string
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      duty_assignments: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          participant_id: string
          trip_day_id: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          label?: string
          participant_id: string
          trip_day_id?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          participant_id?: string
          trip_day_id?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "duty_assignments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duty_assignments_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duty_assignments_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      info_blocks: {
        Row: {
          active: boolean
          body: string
          created_at: string
          id: string
          section: string
          sort_order: number
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          section: string
          sort_order?: number
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          section?: string
          sort_order?: number
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      outing_history: {
        Row: {
          created_at: string
          day_date: string | null
          day_number: number | null
          decision_note: string
          event: string
          id: string
          leave_time: string
          member_names: string[]
          reason: string
          request_id: string | null
          return_time: string
          room_number: string
          status: string
          trip_day_id: string | null
          trip_id: string | null
        }
        Insert: {
          created_at?: string
          day_date?: string | null
          day_number?: number | null
          decision_note?: string
          event: string
          id?: string
          leave_time?: string
          member_names?: string[]
          reason?: string
          request_id?: string | null
          return_time?: string
          room_number?: string
          status?: string
          trip_day_id?: string | null
          trip_id?: string | null
        }
        Update: {
          created_at?: string
          day_date?: string | null
          day_number?: number | null
          decision_note?: string
          event?: string
          id?: string
          leave_time?: string
          member_names?: string[]
          reason?: string
          request_id?: string | null
          return_time?: string
          room_number?: string
          status?: string
          trip_day_id?: string | null
          trip_id?: string | null
        }
        Relationships: []
      }
      outing_requests: {
        Row: {
          buddy_participant_id: string
          created_at: string
          decided_at: string | null
          decision_note: string | null
          id: string
          leave_time: string
          member_ids: string[]
          reason: string | null
          requester_participant_id: string
          return_time: string
          returned_at: string | null
          room_id: string
          status: string
          trip_day_id: string
          updated_at: string
        }
        Insert: {
          buddy_participant_id: string
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          id?: string
          leave_time: string
          member_ids?: string[]
          reason?: string | null
          requester_participant_id: string
          return_time: string
          returned_at?: string | null
          room_id: string
          status?: string
          trip_day_id: string
          updated_at?: string
        }
        Update: {
          buddy_participant_id?: string
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          id?: string
          leave_time?: string
          member_ids?: string[]
          reason?: string | null
          requester_participant_id?: string
          return_time?: string
          returned_at?: string | null
          room_id?: string
          status?: string
          trip_day_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outing_requests_buddy_participant_id_fkey"
            columns: ["buddy_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outing_requests_requester_participant_id_fkey"
            columns: ["requester_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outing_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outing_requests_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_announcement_reads: {
        Row: {
          announcement_id: string
          child_name: string
          id: string
          parent_code: string
          read_at: string
        }
        Insert: {
          announcement_id: string
          child_name?: string
          id?: string
          parent_code: string
          read_at?: string
        }
        Update: {
          announcement_id?: string
          child_name?: string
          id?: string
          parent_code?: string
          read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_messages: {
        Row: {
          answer: string
          answered_at: string | null
          body: string
          child_name: string
          created_at: string
          id: string
          kind: string
          parent_code: string
          room_number: string
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          answer?: string
          answered_at?: string | null
          body: string
          child_name?: string
          created_at?: string
          id?: string
          kind?: string
          parent_code: string
          room_number?: string
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string
          answered_at?: string | null
          body?: string
          child_name?: string
          created_at?: string
          id?: string
          kind?: string
          parent_code?: string
          room_number?: string
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      participant_days: {
        Row: {
          buddy_participant_id: string | null
          created_at: string
          excused: boolean
          id: string
          note: string | null
          participant_id: string
          returned: boolean
          trip_day_id: string
          updated_at: string
        }
        Insert: {
          buddy_participant_id?: string | null
          created_at?: string
          excused?: boolean
          id?: string
          note?: string | null
          participant_id: string
          returned?: boolean
          trip_day_id: string
          updated_at?: string
        }
        Update: {
          buddy_participant_id?: string | null
          created_at?: string
          excused?: boolean
          id?: string
          note?: string | null
          participant_id?: string
          returned?: boolean
          trip_day_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_days_buddy_participant_id_fkey"
            columns: ["buddy_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_days_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_days_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          age: number | null
          boarded_out: boolean
          boarded_return: boolean
          checkin_out: boolean
          checkin_return: boolean
          created_at: string
          docs_complete: boolean
          first_name: string
          flight: string | null
          id: string
          instrument: string | null
          is_staff: boolean
          last_name: string
          note: string | null
          parent_access_code: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          room_id: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          boarded_out?: boolean
          boarded_return?: boolean
          checkin_out?: boolean
          checkin_return?: boolean
          created_at?: string
          docs_complete?: boolean
          first_name: string
          flight?: string | null
          id?: string
          instrument?: string | null
          is_staff?: boolean
          last_name: string
          note?: string | null
          parent_access_code?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          room_id?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          boarded_out?: boolean
          boarded_return?: boolean
          checkin_out?: boolean
          checkin_return?: boolean
          created_at?: string
          docs_complete?: boolean
          first_name?: string
          flight?: string | null
          id?: string
          instrument?: string | null
          is_staff?: boolean
          last_name?: string
          note?: string | null
          parent_access_code?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          room_id?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_status: {
        Row: {
          created_at: string
          id: string
          note: string
          room_id: string
          state: string
          task_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          room_id: string
          state?: string
          task_id: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          room_id?: string
          state?: string
          task_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "prep_status_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_status_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "prep_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_tasks: {
        Row: {
          active: boolean
          created_at: string
          description: string
          due_note: string
          id: string
          sort_order: number
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          due_note?: string
          id?: string
          sort_order?: number
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          due_note?: string
          id?: string
          sort_order?: number
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_messages: {
        Row: {
          audience: string
          body: string
          created_at: string
          id: string
          title: string
          url: string
        }
        Insert: {
          audience: string
          body?: string
          created_at?: string
          id?: string
          title: string
          url?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          id?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          audience: string
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_seen_at: string
          p256dh: string
          parent_code: string | null
          room_id: string | null
          user_agent: string | null
        }
        Insert: {
          audience?: string
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_seen_at?: string
          p256dh: string
          parent_code?: string | null
          room_id?: string | null
          user_agent?: string | null
        }
        Update: {
          audience?: string
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_seen_at?: string
          p256dh?: string
          parent_code?: string | null
          room_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rehearsal_notes: {
        Row: {
          created_at: string
          done: boolean
          id: string
          instruction: string
          instruments: string[]
          measures: string
          piece: string
          trip_day_id: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          instruction?: string
          instruments?: string[]
          measures?: string
          piece: string
          trip_day_id?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          instruction?: string
          instruments?: string[]
          measures?: string
          piece?: string
          trip_day_id?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehearsal_notes_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehearsal_notes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      room_access_log: {
        Row: {
          access_code: string
          attempted_at: string
          device: string | null
          id: string
          reason: string | null
          room_id: string | null
          success: boolean
        }
        Insert: {
          access_code: string
          attempted_at?: string
          device?: string | null
          id?: string
          reason?: string | null
          room_id?: string | null
          success?: boolean
        }
        Update: {
          access_code?: string
          attempted_at?: string
          device?: string | null
          id?: string
          reason?: string | null
          room_id?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "room_access_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          access_code: string
          created_at: string
          id: string
          member_one: string | null
          member_two: string | null
          nickname: string | null
          pin: string | null
          pin_set_at: string | null
          room_number: string
          trip_id: string
        }
        Insert: {
          access_code: string
          created_at?: string
          id?: string
          member_one?: string | null
          member_two?: string | null
          nickname?: string | null
          pin?: string | null
          pin_set_at?: string | null
          room_number: string
          trip_id: string
        }
        Update: {
          access_code?: string
          created_at?: string
          id?: string
          member_one?: string | null
          member_two?: string | null
          nickname?: string | null
          pin?: string | null
          pin_set_at?: string | null
          room_number?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_access: {
        Row: {
          code: string
          created_at: string
          id: string
          kind: string
          label: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff_access_log: {
        Row: {
          attempted_at: string
          code: string
          device: string | null
          id: string
          success: boolean
        }
        Insert: {
          attempted_at?: string
          code: string
          device?: string | null
          id?: string
          success: boolean
        }
        Update: {
          attempted_at?: string
          code?: string
          device?: string | null
          id?: string
          success?: boolean
        }
        Relationships: []
      }
      story_picks: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          kind: string
          trip_day_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          kind: string
          trip_day_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          kind?: string
          trip_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_picks_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "daily_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_picks_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_days: {
        Row: {
          activities: Json
          created_at: string
          day_date: string
          day_number: number
          description: string | null
          id: string
          location: string | null
          tomorrow_items: Json
          trip_id: string
        }
        Insert: {
          activities?: Json
          created_at?: string
          day_date: string
          day_number: number
          description?: string | null
          id?: string
          location?: string | null
          tomorrow_items?: Json
          trip_id: string
        }
        Update: {
          activities?: Json
          created_at?: string
          day_date?: string
          day_number?: number
          description?: string | null
          id?: string
          location?: string | null
          tomorrow_items?: Json
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          subtitle: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subtitle?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subtitle?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
