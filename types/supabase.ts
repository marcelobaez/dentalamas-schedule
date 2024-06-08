export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          attended: boolean | null
          created_at: string | null
          endDate: string
          id: number
          location_id: number | null
          migrated_sp_id: string | null
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
          location_id?: number | null
          migrated_sp_id?: string | null
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
          location_id?: number | null
          migrated_sp_id?: string | null
          notes?: string | null
          patient_id?: number
          specialist_id?: number
          startDate?: string
          state_id?: number | null
          treatment_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_migrated_sp_id_fkey"
            columns: ["migrated_sp_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "appointments_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      locations: {
        Row: {
          City: string | null
          created_at: string
          id: number
          streetAddress: string | null
          title: string
          zipCode: number | null
        }
        Insert: {
          City?: string | null
          created_at?: string
          id?: number
          streetAddress?: string | null
          title: string
          zipCode?: number | null
        }
        Update: {
          City?: string | null
          created_at?: string
          id?: number
          streetAddress?: string | null
          title?: string
          zipCode?: number | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          city: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          firstName: string
          id: number
          lastName: string
          phone: string
          streetAddress: string | null
          zipCode: number | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          firstName: string
          id?: number
          lastName: string
          phone: string
          streetAddress?: string | null
          zipCode?: number | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          firstName?: string
          id?: number
          lastName?: string
          phone?: string
          streetAddress?: string | null
          zipCode?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          firstName: string | null
          id: string
          lastName: string | null
          title: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          firstName?: string | null
          id: string
          lastName?: string | null
          title?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          title?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_locations: {
        Row: {
          created_at: string
          id: number
          location_id: number
          specialist_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          location_id: number
          specialist_id: number
        }
        Update: {
          created_at?: string
          id?: number
          location_id?: number
          specialist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "specialist_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_locations_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_treatments: {
        Row: {
          created_at: string
          id: number
          specialist_id: number
          treatment_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          specialist_id: number
          treatment_id: number
        }
        Update: {
          created_at?: string
          id?: number
          specialist_id?: number
          treatment_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "specialist_treatments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_treatments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_working_days: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: number
          specialist_id: number
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: number
          specialist_id: number
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: number
          specialist_id?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_days_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      specialists: {
        Row: {
          created_at: string | null
          email: string | null
          firstName: string
          id: number
          lastName: string
          phone: string | null
          streetAddress: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          firstName: string
          id?: number
          lastName: string
          phone?: string | null
          streetAddress?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          firstName?: string
          id?: number
          lastName?: string
          phone?: string | null
          streetAddress?: string | null
          title?: string
        }
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: string
      }
      get_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: Json
      }
      get_claims: {
        Args: {
          uid: string
        }
        Returns: Json
      }
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_patients: {
        Args: Record<PropertyKey, never>
        Returns: {
          city: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          firstName: string
          id: number
          lastName: string
          phone: string
          streetAddress: string | null
          zipCode: number | null
        }[]
      }
      hello: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      search_patients: {
        Args: {
          keyword: string
        }
        Returns: {
          city: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          firstName: string
          id: number
          lastName: string
          phone: string
          streetAddress: string | null
          zipCode: number | null
        }[]
      }
      set_claim: {
        Args: {
          uid: string
          claim: string
          value: Json
        }
        Returns: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
