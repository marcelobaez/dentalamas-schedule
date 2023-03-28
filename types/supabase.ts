export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          attended: boolean | null
          created_at: string | null
          endDate: string
          id: number
          notes: string | null
          patient_id: number
          specialist_id: number
          startDate: string
          state_id: number | null
          treatment_id: number
          user_id: string | null
        }
        Insert: {
          attended?: boolean | null
          created_at?: string | null
          endDate: string
          id?: number
          notes?: string | null
          patient_id: number
          specialist_id: number
          startDate: string
          state_id?: number | null
          treatment_id: number
          user_id?: string | null
        }
        Update: {
          attended?: boolean | null
          created_at?: string | null
          endDate?: string
          id?: number
          notes?: string | null
          patient_id?: number
          specialist_id?: number
          startDate?: string
          state_id?: number | null
          treatment_id?: number
          user_id?: string | null
        }
      }
      appointments_states: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
      }
      patients: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          firstName: string
          id: number
          lastName: string
          phone: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          firstName: string
          id?: number
          lastName: string
          phone: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          firstName?: string
          id?: number
          lastName?: string
          phone?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
      }
      specialists: {
        Row: {
          created_at: string | null
          firstName: string
          id: number
          lastName: string
          title: string
        }
        Insert: {
          created_at?: string | null
          firstName: string
          id?: number
          lastName: string
          title: string
        }
        Update: {
          created_at?: string | null
          firstName?: string
          id?: number
          lastName?: string
          title?: string
        }
      }
      treatments: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_patients: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          created_by: string | null
          email: string | null
          firstName: string
          id: number
          lastName: string
          phone: string
        }[]
      }
      hello: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search_patients: {
        Args: {
          keyword: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          email: string | null
          firstName: string
          id: number
          lastName: string
          phone: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
