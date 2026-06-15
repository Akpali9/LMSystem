import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "student" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  duration_months: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  pass_score: number;
  created_at: string;
}

export interface ModuleContent {
  id: string;
  module_id: string;
  title: string;
  content_type: "video" | "document" | "text";
  content_url?: string;
  content_text?: string;
  order_index: number;
}

export interface Assignment {
  id: string;
  module_id: string;
  title: string;
  description: string;
  due_days: number;
  max_score: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: "pending_payment" | "payment_submitted" | "active" | "completed" | "expired";
  enrolled_at?: string;
  expires_at?: string;
  current_module_index: number;
  created_at: string;
  course?: Course;
}

export interface PaymentReceipt {
  id: string;
  enrollment_id: string;
  student_id: string;
  receipt_url: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  submitted_at: string;
}

export interface ModuleProgress {
  id: string;
  enrollment_id: string;
  module_id: string;
  status: "locked" | "in_progress" | "passed" | "failed";
  score?: number;
  completed_at?: string;
}

export interface StudentAssignment {
  id: string;
  assignment_id: string;
  student_id: string;
  enrollment_id: string;
  status: "pending" | "submitted" | "graded";
  submission_url?: string;
  score?: number;
  feedback?: string;
  assigned_at: string;
  submitted_at?: string;
  assignment?: Assignment;
}
