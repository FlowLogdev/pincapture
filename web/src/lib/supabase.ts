import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cookie-based client (not plain supabase-js's localStorage-based client) so
// this shares the exact same session as middleware.ts and the server routes
// (createServerClient / createSupabaseServerClient), which all read the
// sb-*-auth-token cookies. A mismatched client here means signOut(),
// getSession(), and getUser() silently operate on an empty session that's
// disconnected from the real cookie-based login.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Guide = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  share_token: string;
  step_count?: number;
  has_video?: boolean;
  video_count?: number;
  video_download_url?: string | null;
  last_recorded_at?: string;
  archived_at?: string | null;
  trashed_at?: string | null;
  deleted_at?: string | null;
  archive_month?: string | null;
  state_month?: string | null;
};

export type Step = {
  id: string;
  guide_id: string;
  step_number: number;
  title: string;
  description: string | null;
  type: "click" | "type" | "navigate" | "select" | "screenshot" | "video";
  screenshot_url: string | null;
  annotated_screenshot_url: string | null;
  annotation_rect: { x: number; y: number; w: number; h: number } | null;
  click_x: number | null;
  click_y: number | null;
  element_rect: object | null;
  source_url: string | null;
  created_at: string;
};
