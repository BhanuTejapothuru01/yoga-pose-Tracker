function getSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key'
  )
}

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
}

export { getSupabaseKey, getSupabaseUrl }

