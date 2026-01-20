export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'moderator' | 'user'
          wallet_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'moderator' | 'user'
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'moderator' | 'user'
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          isbn: string | null
          category: string | null
          description: string | null
          cover_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          isbn?: string | null
          category?: string | null
          description?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          isbn?: string | null
          category?: string | null
          description?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          id: string
          book_id: string
          seller_id: string
          type: 'physical' | 'digital'
          price: number
          stock: number | null
          condition: 'new' | 'like_new' | 'good' | 'acceptable' | null
          allow_download: boolean | null
          digital_file_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          seller_id: string
          type: 'physical' | 'digital'
          price: number
          stock?: number | null
          condition?: 'new' | 'like_new' | 'good' | 'acceptable' | null
          allow_download?: boolean | null
          digital_file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          seller_id?: string
          type?: 'physical' | 'digital'
          price?: number
          stock?: number | null
          condition?: 'new' | 'like_new' | 'good' | 'acceptable' | null
          allow_download?: boolean | null
          digital_file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_book_id_fkey"
            columns: ["book_id"]
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          total_amount: number
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed' | 'cancelled' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          total_amount: number
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed' | 'cancelled' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          total_amount?: number
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed' | 'cancelled' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          listing_id: string
          quantity: number
          price_at_purchase: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          listing_id: string
          quantity?: number
          price_at_purchase: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          listing_id?: string
          quantity?: number
          price_at_purchase?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_listing_id_fkey"
            columns: ["listing_id"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      library_access: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          last_page_read: number
          can_download_snapshot: boolean
          purchased_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          last_page_read?: number
          can_download_snapshot?: boolean
          purchased_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          last_page_read?: number
          can_download_snapshot?: boolean
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_access_listing_id_fkey"
            columns: ["listing_id"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_access_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      wallet_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'sale' | 'purchase' | 'deposit' | 'withdrawal' | 'commission'
          reference_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'sale' | 'purchase' | 'deposit' | 'withdrawal' | 'commission'
          reference_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'sale' | 'purchase' | 'deposit' | 'withdrawal' | 'commission'
          reference_id?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'moderator' | 'user'
      product_type: 'physical' | 'digital'
      book_condition: 'new' | 'like_new' | 'good' | 'acceptable'
      order_status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed' | 'cancelled' | 'refunded'
      transaction_type: 'sale' | 'purchase' | 'deposit' | 'withdrawal' | 'commission'
    }
  }
}
