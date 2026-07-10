import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS for server-side operations like
// image uploads. Never expose this key to the browser.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);