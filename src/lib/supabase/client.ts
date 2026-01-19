import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types' // Tes types générés

export const createClient = () => createClientComponentClient<Database>()