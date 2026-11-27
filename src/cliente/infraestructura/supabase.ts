import { createClient,type SupabaseClient } from '@supabase/supabase-js';
let client:SupabaseClient|undefined;
export function supabaseBrowser() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key||url.includes('YOUR_PROJECT')) return null;
  return client??=createClient(url,key);
}
