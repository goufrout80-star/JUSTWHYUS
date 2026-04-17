import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseKey) {
  // Don't crash the app — log a clear error so the rest of the site still renders.
  // eslint-disable-next-line no-console
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Set them in Vercel → Project Settings → Environment Variables, ' +
      'then redeploy. Auth/admin features will be disabled until this is fixed.',
  )
}

// Fallback to harmless placeholders so the app loads; all auth calls will fail
// with a clean error instead of the entire bundle crashing at import time.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      storageKey: 'sb-jwu-auth',
      // Prevent the 5-second navigator lock timeout that causes hangs when
      // multiple components call getSession() concurrently (React renders).
      lock: 'no-op' as 'no-op',
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
)

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const getSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}
