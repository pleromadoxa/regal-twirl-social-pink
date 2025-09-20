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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      active_calls: {
        Row: {
          call_type: string
          caller_id: string
          created_at: string
          ended_at: string | null
          id: string
          participants: Json
          room_id: string
          status: string
        }
        Insert: {
          call_type: string
          caller_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          participants?: Json
          room_id: string
          status?: string
        }
        Update: {
          call_type?: string
          caller_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          participants?: Json
          room_id?: string
          status?: string
        }
        Relationships: []
      }
      ad_analytics: {
        Row: {
          ad_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          date: string | null
          id: string
          impressions: number | null
          spent_amount: number | null
        }
        Insert: {
          ad_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          impressions?: number | null
          spent_amount?: number | null
        }
        Update: {
          ad_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          impressions?: number | null
          spent_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_analytics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "business_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generations: {
        Row: {
          created_at: string
          generation_type: string
          id: string
          prompt: string
          result: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          generation_type: string
          id?: string
          prompt: string
          result: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          generation_type?: string
          id?: string
          prompt?: string
          result?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      business_ads: {
        Row: {
          ad_type: string
          budget_amount: number
          budget_currency: string | null
          business_page_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          description: string | null
          duration_days: number
          ends_at: string | null
          id: string
          impressions: number | null
          spent_amount: number | null
          starts_at: string | null
          status: string | null
          target_countries: string[] | null
          target_product_id: string | null
          target_regions: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ad_type: string
          budget_amount: number
          budget_currency?: string | null
          business_page_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          description?: string | null
          duration_days: number
          ends_at?: string | null
          id?: string
          impressions?: number | null
          spent_amount?: number | null
          starts_at?: string | null
          status?: string | null
          target_countries?: string[] | null
          target_product_id?: string | null
          target_regions?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ad_type?: string
          budget_amount?: number
          budget_currency?: string | null
          business_page_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          ends_at?: string | null
          id?: string
          impressions?: number | null
          spent_amount?: number | null
          starts_at?: string | null
          status?: string | null
          target_countries?: string[] | null
          target_product_id?: string | null
          target_regions?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_ads_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_bookings: {
        Row: {
          booking_date: string
          business_page_id: string | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          duration_minutes: number
          id: string
          notes: string | null
          service_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          business_page_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          duration_minutes: number
          id?: string
          notes?: string | null
          service_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          business_page_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_bookings_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_earnings: {
        Row: {
          amount: number
          business_page_id: string | null
          created_at: string | null
          currency: string
          date: string | null
          description: string | null
          id: string
          reference_id: string | null
          source: string
        }
        Insert: {
          amount: number
          business_page_id?: string | null
          created_at?: string | null
          currency?: string
          date?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          source: string
        }
        Update: {
          amount?: number
          business_page_id?: string | null
          created_at?: string | null
          currency?: string
          date?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_earnings_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_invoices: {
        Row: {
          business_page_id: string | null
          client_address: string | null
          client_email: string | null
          client_name: string
          created_at: string | null
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string | null
          items: Json
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          business_page_id?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string | null
          items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          business_page_id?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string | null
          items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_invoices_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_messages: {
        Row: {
          attachments: string[] | null
          business_page_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_type: string
        }
        Insert: {
          attachments?: string[] | null
          business_page_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_type: string
        }
        Update: {
          attachments?: string[] | null
          business_page_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_messages_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_orders: {
        Row: {
          business_page_id: string | null
          created_at: string | null
          currency: string
          customer_address: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          delivery_address: string | null
          delivery_city: string | null
          delivery_country: string | null
          delivery_instructions: string | null
          delivery_name: string | null
          delivery_phone: string | null
          delivery_postal_code: string | null
          delivery_state: string | null
          id: string
          items: Json
          notes: string | null
          payment_status: string
          shipping_amount: number | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          business_page_id?: string | null
          created_at?: string | null
          currency?: string
          customer_address?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_instructions?: string | null
          delivery_name?: string | null
          delivery_phone?: string | null
          delivery_postal_code?: string | null
          delivery_state?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_status?: string
          shipping_amount?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          business_page_id?: string | null
          created_at?: string | null
          currency?: string
          customer_address?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_instructions?: string | null
          delivery_name?: string | null
          delivery_phone?: string | null
          delivery_postal_code?: string | null
          delivery_state?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_status?: string
          shipping_amount?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_orders_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_page_follows: {
        Row: {
          created_at: string
          id: string
          page_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_page_follows_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_pages: {
        Row: {
          address: string | null
          avatar_url: string | null
          banner_url: string | null
          business_type:
            | Database["public"]["Enums"]["business_type_enum"]
            | null
          created_at: string
          default_currency: string | null
          description: string | null
          email: string | null
          featured_products: Json | null
          followers_count: number | null
          id: string
          is_verified: boolean | null
          owner_id: string
          page_avatar_url: string | null
          page_banner_url: string | null
          page_name: string
          page_type: string
          phone: string | null
          shop_active: boolean | null
          shop_settings: Json | null
          shop_status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          business_type?:
            | Database["public"]["Enums"]["business_type_enum"]
            | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          email?: string | null
          featured_products?: Json | null
          followers_count?: number | null
          id?: string
          is_verified?: boolean | null
          owner_id: string
          page_avatar_url?: string | null
          page_banner_url?: string | null
          page_name: string
          page_type: string
          phone?: string | null
          shop_active?: boolean | null
          shop_settings?: Json | null
          shop_status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          business_type?:
            | Database["public"]["Enums"]["business_type_enum"]
            | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          email?: string | null
          featured_products?: Json | null
          followers_count?: number | null
          id?: string
          is_verified?: boolean | null
          owner_id?: string
          page_avatar_url?: string | null
          page_banner_url?: string | null
          page_name?: string
          page_type?: string
          phone?: string | null
          shop_active?: boolean | null
          shop_settings?: Json | null
          shop_status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      business_products: {
        Row: {
          business_page_id: string | null
          category: string | null
          created_at: string | null
          currency: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          price: number
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          business_page_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price: number
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          business_page_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_products_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_services: {
        Row: {
          booking_settings: Json | null
          business_page_id: string | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          booking_settings?: Json | null
          business_page_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_settings?: Json | null
          business_page_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_services_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      call_history: {
        Row: {
          call_status: string
          call_type: string
          caller_id: string
          conversation_id: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          recipient_id: string
          started_at: string
        }
        Insert: {
          call_status: string
          call_type: string
          caller_id: string
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recipient_id: string
          started_at?: string
        }
        Update: {
          call_status?: string
          call_type?: string
          caller_id?: string
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recipient_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "business_products"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitee_id: string
          inviter_id: string
          message: string | null
          post_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          post_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          post_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_invites_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_drafts: {
        Row: {
          collaborators: Json
          content: string
          created_at: string
          creator_id: string
          draft_data: Json
          id: string
          published_post_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          collaborators?: Json
          content?: string
          created_at?: string
          creator_id: string
          draft_data?: Json
          id?: string
          published_post_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          collaborators?: Json
          content?: string
          created_at?: string
          creator_id?: string
          draft_data?: Json
          id?: string
          published_post_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_drafts_published_post_id_fkey"
            columns: ["published_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_discussion_likes: {
        Row: {
          created_at: string
          discussion_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_discussion_likes_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "community_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_discussion_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "community_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_discussion_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_discussions: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          replies_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          replies_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          replies_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
          streak_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
          streak_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
          streak_count?: number | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees_count: number
          cover_image_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_online: boolean
          location: string | null
          max_attendees: number | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees_count?: number
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          max_attendees?: number | null
          starts_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees_count?: number
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          max_attendees?: number | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          span_config: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          span_config?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          span_config?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_saves: {
        Row: {
          game_type: string
          id: string
          save_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          game_type: string
          id?: string
          save_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          game_type?: string
          id?: string
          save_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          data: Json | null
          game_type: string
          id: string
          level: number
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          game_type: string
          id?: string
          level?: number
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          game_type?: string
          id?: string
          level?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      group_conversation_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_conversation_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_conversations: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string | null
          is_private: boolean | null
          last_message_at: string | null
          max_members: number | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          last_message_at?: string | null
          max_members?: number | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          last_message_at?: string | null
          max_members?: number | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          group_id: string | null
          id: string
          message_type: string | null
          reply_to_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          group_id?: string | null
          id?: string
          message_type?: string | null
          reply_to_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          group_id?: string | null
          id?: string
          message_type?: string | null
          reply_to_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "group_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          attachment_type: string
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          attachment_type: string
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          attachment_type?: string
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      music_likes: {
        Row: {
          created_at: string
          id: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      music_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          tracks: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          tracks?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          tracks?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          album: string | null
          artist: string
          created_at: string
          description: string | null
          duration: number | null
          file_size: number | null
          file_url: string
          genre: string | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          plays_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          album?: string | null
          artist: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_url: string
          genre?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          plays_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          album?: string | null
          artist?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_url?: string
          genre?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          plays_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_tracks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          call_id: string | null
          content: string | null
          created_at: string | null
          data: Json | null
          id: string
          message: string | null
          post_id: string | null
          read: boolean | null
          read_at: string | null
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          call_id?: string | null
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          post_id?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          call_id?: string | null
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          post_id?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "active_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      post_collaborators: {
        Row: {
          created_at: string
          id: string
          invited_at: string
          invited_by: string
          post_id: string
          responded_at: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          post_id: string
          responded_at?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          post_id?: string
          responded_at?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_collaborators_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_polls: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          options: Json
          post_id: string
          question: string
          updated_at: string
          votes_count: number
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          post_id: string
          question: string
          updated_at?: string
          votes_count?: number
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          post_id?: string
          question?: string
          updated_at?: string
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          id: string
          ip_address: unknown | null
          post_id: string
          user_agent: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          post_id: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          post_id?: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string
          id: string
          image_urls: string[] | null
          likes_count: number | null
          posted_as_page: string | null
          replies_count: number | null
          retweets_count: number | null
          sponsored_post_id: string | null
          trending_score: number | null
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes_count?: number | null
          posted_as_page?: string | null
          replies_count?: number | null
          retweets_count?: number | null
          sponsored_post_id?: string | null
          trending_score?: number | null
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes_count?: number | null
          posted_as_page?: string | null
          replies_count?: number | null
          retweets_count?: number | null
          sponsored_post_id?: string | null
          trending_score?: number | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_posted_as_page_fkey"
            columns: ["posted_as_page"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_sponsored_post_id_fkey"
            columns: ["sponsored_post_id"]
            isOneToOne: false
            referencedRelation: "sponsored_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_features: {
        Row: {
          created_at: string
          feature_description: string | null
          feature_name: string
          id: string
          is_active: boolean | null
          tier: string
        }
        Insert: {
          created_at?: string
          feature_description?: string | null
          feature_name: string
          id?: string
          is_active?: boolean | null
          tier: string
        }
        Update: {
          created_at?: string
          feature_description?: string | null
          feature_name?: string
          id?: string
          is_active?: boolean | null
          tier?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          ai_generations_limit: number | null
          ai_generations_used: number | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_verified: boolean | null
          location: string | null
          posts_count: number | null
          premium_tier: string | null
          status_reason: string | null
          status_until: string | null
          updated_at: string | null
          username: string | null
          verification_level: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          account_status?: string | null
          ai_generations_limit?: number | null
          ai_generations_used?: number | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          is_verified?: boolean | null
          location?: string | null
          posts_count?: number | null
          premium_tier?: string | null
          status_reason?: string | null
          status_until?: string | null
          updated_at?: string | null
          username?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          account_status?: string | null
          ai_generations_limit?: number | null
          ai_generations_used?: number | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          posts_count?: number | null
          premium_tier?: string | null
          status_reason?: string | null
          status_until?: string | null
          updated_at?: string | null
          username?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      reel_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          reel_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reel_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reel_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_likes: {
        Row: {
          created_at: string
          id: string
          reel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_likes_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_views: {
        Row: {
          id: string
          reel_id: string
          viewed_at: string
          viewer_id: string | null
          watch_duration: number | null
        }
        Insert: {
          id?: string
          reel_id: string
          viewed_at?: string
          viewer_id?: string | null
          watch_duration?: number | null
        }
        Update: {
          id?: string
          reel_id?: string
          viewed_at?: string
          viewer_id?: string | null
          watch_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reel_views_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reels: {
        Row: {
          comments_count: number | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      replies: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retweets: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retweets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_posts: {
        Row: {
          ad_id: string | null
          budget_amount: number
          budget_currency: string
          business_page_id: string | null
          clicks: number | null
          created_at: string | null
          duration_days: number
          ends_at: string | null
          id: string
          impressions: number | null
          post_id: string
          spent_amount: number | null
          sponsor_type: string
          starts_at: string | null
          status: string
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          ad_id?: string | null
          budget_amount?: number
          budget_currency?: string
          business_page_id?: string | null
          clicks?: number | null
          created_at?: string | null
          duration_days?: number
          ends_at?: string | null
          id?: string
          impressions?: number | null
          post_id: string
          spent_amount?: number | null
          sponsor_type: string
          starts_at?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          ad_id?: string | null
          budget_amount?: number
          budget_currency?: string
          business_page_id?: string | null
          clicks?: number | null
          created_at?: string | null
          duration_days?: number
          ends_at?: string | null
          id?: string
          impressions?: number | null
          post_id?: string
          spent_amount?: number | null
          sponsor_type?: string
          starts_at?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_posts_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "business_ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_posts_business_page_id_fkey"
            columns: ["business_page_id"]
            isOneToOne: false
            referencedRelation: "business_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          caption: string | null
          content_type: string
          content_url: string
          created_at: string
          duration: number | null
          expires_at: string
          file_size: number | null
          id: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          caption?: string | null
          content_type: string
          content_url: string
          created_at?: string
          duration?: number | null
          expires_at?: string
          file_size?: number | null
          id?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          caption?: string | null
          content_type?: string
          content_url?: string
          created_at?: string
          duration?: number | null
          expires_at?: string
          file_size?: number | null
          id?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          id: string
          status: string
          stripe_payment_intent_id: string | null
          subscription_tier: string
          transaction_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_email: string
          id?: string
          status: string
          stripe_payment_intent_id?: string | null
          subscription_tier: string
          transaction_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_tier?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_mutes: {
        Row: {
          created_at: string
          id: string
          muted_id: string
          muter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muted_id: string
          muter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          muted_id?: string
          muter_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          id: string
          is_online: boolean
          last_seen: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          allow_messages: boolean | null
          created_at: string
          discoverable: boolean | null
          email_notifications: boolean | null
          follows_notifications: boolean | null
          id: string
          likes_notifications: boolean | null
          mentions_notifications: boolean | null
          messages_notifications: boolean | null
          private_account: boolean | null
          push_notifications: boolean | null
          show_online_status: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_messages?: boolean | null
          created_at?: string
          discoverable?: boolean | null
          email_notifications?: boolean | null
          follows_notifications?: boolean | null
          id?: string
          likes_notifications?: boolean | null
          mentions_notifications?: boolean | null
          messages_notifications?: boolean | null
          private_account?: boolean | null
          push_notifications?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_messages?: boolean | null
          created_at?: string
          discoverable?: boolean | null
          email_notifications?: boolean | null
          follows_notifications?: boolean | null
          id?: string
          likes_notifications?: boolean | null
          mentions_notifications?: boolean | null
          messages_notifications?: boolean | null
          private_account?: boolean | null
          push_notifications?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_group_members: {
        Args: { creator_id: string; group_id: string; member_ids: string[] }
        Returns: undefined
      }
      calculate_trending_score: {
        Args: {
          created_at: string
          likes_count: number
          replies_count: number
          retweets_count: number
          views_count: number
        }
        Returns: number
      }
      cleanup_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_stale_presence: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          actor_id?: string
          message?: string
          post_id?: string
          type: string
          user_id: string
        }
        Returns: undefined
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_business_page_url: {
        Args: { page_id: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_group_admin: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
      update_trending_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_presence: {
        Args: { p_is_online: boolean; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      business_type_enum:
        | "e-commerce"
        | "it-services"
        | "import-export"
        | "p2p-trading"
        | "consulting"
        | "manufacturing"
        | "retail"
        | "restaurant"
        | "real-estate"
        | "healthcare"
        | "education"
        | "finance"
        | "other"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      business_type_enum: [
        "e-commerce",
        "it-services",
        "import-export",
        "p2p-trading",
        "consulting",
        "manufacturing",
        "retail",
        "restaurant",
        "real-estate",
        "healthcare",
        "education",
        "finance",
        "other",
      ],
    },
  },
} as const
