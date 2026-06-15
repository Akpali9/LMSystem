import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type {
  Profile,
  Course,
  Module,
  Enrollment,
  PaymentReceipt,
  ModuleProgress,
  StudentAssignment,
  Assignment,
  ModuleContent,
} from "../lib/supabase";
import {
  BookOpen,
  GraduationCap,
  Users,
  LayoutDashboard,
  LogOut,
  Upload,
  CheckCircle,
  Clock,
  Lock,
  Play,
  FileText,
  Award,
  ChevronRight,
  X,
  Plus,
  Eye,
  Check,
  AlertCircle,
  Menu,
  Star,
  TrendingUp,
  Shield,
  Bell,
  Settings,
  Search,
  MoreVertical,
  ChevronDown,
  Mail,
  Calendar,
  DollarSign,
  Video,
  Loader2,
  ArrowRight,
  ClipboardList,
  XCircle,
  RefreshCw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type View =
  | "landing"
  | "auth"
  | "student-dashboard"
  | "student-courses"
  | "student-module"
  | "student-assignments"
  | "student-payment"
  | "admin-dashboard"
  | "admin-courses"
  | "admin-students"
  | "admin-payments"
  | "admin-assignments";

// ─── Utility ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Secure Video Player ──────────────────────────────────────────────────────

function SecureVideoPlayer({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventDefault = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "s") || (e.ctrlKey && e.key === "u")) {
        e.preventDefault();
      }
    };

    el.addEventListener("contextmenu", preventDefault);
    el.addEventListener("dragstart", preventDefault);
    document.addEventListener("keydown", preventKeys);

    return () => {
      el.removeEventListener("contextmenu", preventDefault);
      el.removeEventListener("dragstart", preventDefault);
      document.removeEventListener("keydown", preventKeys);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden bg-black select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 40%, rgba(14,42,71,0.04) 100%)",
        }}
      />
      <div className="absolute top-3 right-3 z-20 opacity-10 pointer-events-none select-none">
        <span className="text-white text-xs font-mono">PROTECTED</span>
      </div>
      <div className="aspect-video bg-gradient-to-br from-primary to-[#1a3d63] flex items-center justify-center">
        <div className="text-center text-white/80 space-y-3 pointer-events-none">
          <Video className="w-12 h-12 mx-auto opacity-60" />
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs opacity-50">Secure Streaming — Cannot be downloaded</p>
        </div>
      </div>
      <div className="bg-[#0d1117] px-4 py-3 flex items-center gap-3">
        <button className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors">
          <Play className="w-4 h-4 text-primary fill-current" />
        </button>
        <div className="flex-1 h-1 bg-white/20 rounded-full">
          <div className="w-1/3 h-full bg-accent rounded-full" />
        </div>
        <span className="text-white/60 text-xs font-mono">24:18</span>
      </div>
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-14 h-14 text-lg" };
  return (
    <div className={cn("rounded-full bg-accent flex items-center justify-center font-semibold text-primary shrink-0", sizes[size])}>
      {getInitials(name)}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "muted" }) {
  const variants = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "muted" }> = {
    active: { label: "Active", variant: "success" },
    completed: { label: "Completed", variant: "info" },
    pending_payment: { label: "Payment Pending", variant: "warning" },
    payment_submitted: { label: "Awaiting Approval", variant: "warning" },
    expired: { label: "Expired", variant: "danger" },
    approved: { label: "Approved", variant: "success" },
    pending: { label: "Pending", variant: "warning" },
    rejected: { label: "Rejected", variant: "danger" },
    passed: { label: "Passed", variant: "success" },
    failed: { label: "Failed", variant: "danger" },
    in_progress: { label: "In Progress", variant: "info" },
    locked: { label: "Locked", variant: "muted" },
    graded: { label: "Graded", variant: "success" },
    submitted: { label: "Submitted", variant: "info" },
  };
  const s = map[status] || { label: status, variant: "muted" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm", className)}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string | number; trend?: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
          {trend && <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className={cn("h-2 bg-muted rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-accent rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required, accept }: {
  label: string; type?: string; value?: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean; accept?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        accept={accept}
        className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3, required }: {
  label: string; value?: string; onChange?: (v: string) => void; placeholder?: string; rows?: number; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground resize-none"
      />
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ onAuth, courses }: { onAuth: () => void; courses: Course[] }) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              Academia
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#courses" className="hover:text-foreground transition-colors">Courses</a>
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#why" className="hover:text-foreground transition-colors">Why Us</a>
          </div>
          <button
            onClick={onAuth}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5">
            <Star className="w-3.5 h-3.5 text-accent fill-current" />
            <span className="text-xs font-semibold text-accent tracking-wide uppercase">Globally Certified Programs</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-primary leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Learn Without
            <span className="block text-accent italic">Limits.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            Structured 3-month courses taught by industry experts. Progress at your own pace, earn verified certificates, and transform your career.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Enroll Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
            >
              Browse Courses
            </button>
          </div>
          <div className="flex items-center gap-8 pt-2">
            {[["1,200+", "Students Enrolled"], ["96%", "Completion Rate"], ["4.9★", "Avg. Rating"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{v}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=500&fit=crop&auto=format"
              alt="Students learning"
              className="w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl border border-border shadow-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Module Passed!</p>
              <p className="text-xs text-muted-foreground">Score: 92/100</p>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-accent rounded-2xl shadow-xl p-4">
            <p className="text-primary text-sm font-bold">3 Month</p>
            <p className="text-primary/70 text-xs">Duration</p>
          </div>
        </div>
      </section>

      <section id="courses" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Featured Programs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Handcrafted 3-month curricula — each module unlocks only after you demonstrate mastery.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              onClick={onAuth}
            >
              <div className="relative h-40 bg-muted overflow-hidden">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm">
                    {course.duration_months} months
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground text-sm leading-snug mb-2">{course.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {formatNaira(course.price)}
                  </span>
                  <span className="text-xs text-accent font-medium flex items-center gap-1">
                    Enroll <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              How It Works
            </h2>
            <p className="text-primary-foreground/60 max-w-xl mx-auto">
              A carefully designed learning journey from enrollment to certification.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, step: "01", title: "Choose a Course", desc: "Browse and select from our curated 3-month programs." },
              { icon: DollarSign, step: "02", title: "Pay & Confirm", desc: "Make payment and upload your receipt. Admin confirms access." },
              { icon: TrendingUp, step: "03", title: "Progress Module by Module", desc: "Pass each module's assessment before the next unlocks." },
              { icon: Award, step: "04", title: "Earn Your Certificate", desc: "Complete all modules and receive your certificate via email." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-accent bg-primary border border-accent/30 rounded-full w-6 h-6 flex items-center justify-center">
                    {step[1]}
                  </span>
                </div>
                <h3 className="font-semibold text-primary-foreground">{title}</h3>
                <p className="text-sm text-primary-foreground/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              Built for Serious Learners
            </h2>
            <div className="space-y-5">
              {[
                { icon: Shield, title: "Secure Content", desc: "All videos and materials are DRM-protected. No downloads, no sharing." },
                { icon: Lock, title: "Sequential Mastery", desc: "You must pass each module before the next unlocks — no shortcuts." },
                { icon: Users, title: "Personalised Access", desc: "Each enrollment is tied to one student for 3 months exactly." },
                { icon: Award, title: "Verified Certificates", desc: "Certificates issued personally via email upon course completion." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-accent/90 transition-colors"
            >
              Start Learning Today <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&h=550&fit=crop&auto=format"
              alt="Student studying"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Academia</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 Academia LMS. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Content Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

function AuthPage({ onLogin }: { onLogin: (profile: Profile) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ensureProfile = async (userId: string, userEmail: string, userName: string) => {
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (existing) return existing;
    
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: userEmail,
        full_name: userName,
        role: userEmail === 'admin@academia.com' ? 'admin' : 'student',
      })
      .select()
      .single();
    
    return newProfile;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        if (data.user) {
          const profile = await ensureProfile(
            data.user.id,
            data.user.email!,
            data.user.user_metadata?.full_name || email.split('@')[0]
          );
          
          if (profile) {
            onLogin(profile as Profile);
          } else {
            throw new Error("Could not create or find profile");
          }
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        
        if (signUpError) throw signUpError;
        
        if (data.user) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const profile = await ensureProfile(
            data.user.id,
            data.user.email!,
            name
          );
          
          if (profile) {
            onLogin(profile as Profile);
          } else {
            throw new Error("Could not create profile");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=1000&fit=crop&auto=format"
          alt="Student in a library"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 text-white">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Academia
            </span>
          </div>
          <blockquote className="text-2xl font-medium italic leading-relaxed mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            "Education is the most powerful weapon you can use to change the world."
          </blockquote>
          <p className="text-white/60 text-sm">— Nelson Mandela</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                Academia
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {mode === "login" ? "Welcome back" : "Join Academia"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login" ? "Sign in to continue your learning journey." : "Create your account and start learning today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Input label="Full Name" value={name} onChange={setName} placeholder="John Doe" required />
            )}
            <Input label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <span className="text-accent font-semibold">{mode === "login" ? "Register" : "Sign In"}</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-xl border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Demo Credentials</p>
            <p className="text-xs text-muted-foreground"><span className="font-mono text-foreground">Admin:</span> admin@academia.com</p>
            <p className="text-xs text-muted-foreground"><span className="font-mono text-foreground">Student:</span> any email (auto-register)</p>
            <p className="text-xs text-muted-foreground mt-2">⚡ Admin users are redirected to Admin Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  profile,
  currentView,
  onNavigate,
  onLogout,
}: {
  profile: Profile;
  currentView: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const studentNav = [
    { view: "student-dashboard" as View, icon: LayoutDashboard, label: "Dashboard" },
    { view: "student-courses" as View, icon: BookOpen, label: "My Courses" },
    { view: "student-assignments" as View, icon: ClipboardList, label: "Assignments" },
    { view: "student-payment" as View, icon: DollarSign, label: "Payments" },
  ];

  const adminNav = [
    { view: "admin-dashboard" as View, icon: LayoutDashboard, label: "Dashboard" },
    { view: "admin-courses" as View, icon: BookOpen, label: "Courses & Modules" },
    { view: "admin-students" as View, icon: Users, label: "Students" },
    { view: "admin-payments" as View, icon: DollarSign, label: "Payments" },
    { view: "admin-assignments" as View, icon: ClipboardList, label: "Assignments" },
  ];

  const nav = profile.role === "admin" ? adminNav : studentNav;

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sidebar-foreground text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            Academia
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto w-7 h-7 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors", collapsed && "mx-auto ml-0")}
        >
          <Menu className="w-4 h-4 text-sidebar-foreground" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              currentView === view
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <div className={cn("flex items-center gap-3 px-3 py-2.5", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {getInitials(profile.full_name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile.full_name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate capitalize">{profile.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ profile, onNavigate, enrollments, progress }: { 
  profile: Profile; 
  onNavigate: (v: View) => void;
  enrollments: Enrollment[];
  progress: ModuleProgress[];
}) {
  const activeEnrollment = enrollments.find(e => e.status === "active");
  const passedCount = progress.filter(p => p.status === "passed").length;

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Good morning, {profile.full_name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your learning progress at a glance.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={enrollments.length} />
        <StatCard icon={CheckCircle} label="Modules Passed" value={passedCount} />
        <StatCard icon={ClipboardList} label="Assignments Due" value={0} />
        <StatCard icon={Award} label="Certificates Earned" value={activeEnrollment?.status === "completed" ? 1 : 0} />
      </div>

      {activeEnrollment && activeEnrollment.course && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                Active Course Progress
              </h2>
              <div className="flex gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={activeEnrollment.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{activeEnrollment.course.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Module {activeEnrollment.current_module_index + 1} · Expires {formatDate(activeEnrollment.expires_at || "")}
                  </p>
                  <StatusBadge status={activeEnrollment.status} />
                </div>
              </div>
              <button
                onClick={() => onNavigate("student-module")}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Continue Learning
              </button>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4 text-sm">Certificate Status</h3>
            <div className="text-center py-6">
              <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Complete all modules to receive your certificate via email.</p>
            </div>
            <ProgressBar value={passedCount} max={5} />
            <p className="text-xs text-muted-foreground text-center mt-2">{passedCount} of 5 modules passed</p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Student Courses ──────────────────────────────────────────────────────────

function StudentCourses({ profile, onNavigate, courses, enrollments, onEnroll }: { 
  profile: Profile; 
  onNavigate: (v: View) => void;
  courses: Course[];
  enrollments: Enrollment[];
  onEnroll: (courseId: string) => Promise<void>;
}) {
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const enrolledCourseIds = enrollments.map(e => e.course_id);
  const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
  const activeEnrollment = enrollments.find(e => e.status === "active");

  const handleEnrollSubmit = async () => {
    if (!selectedCourse || !receiptFile) return;
    setUploading(true);
    
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${profile.id}-${selectedCourse.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, receiptFile);
    
    if (uploadError) {
      alert("Failed to upload receipt");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    const { data: enrollment } = await supabase
      .from("enrollments")
      .insert({
        student_id: profile.id,
        course_id: selectedCourse.id,
        status: "pending_payment",
        current_module_index: 0,
      })
      .select()
      .single();

    if (enrollment) {
      await supabase.from("payment_receipts").insert({
        enrollment_id: enrollment.id,
        student_id: profile.id,
        receipt_url: publicUrl,
        amount: selectedCourse.price,
        status: "pending",
      });
    }

    await onEnroll(selectedCourse.id);
    setShowEnroll(false);
    setSelectedCourse(null);
    setReceiptFile(null);
    setUploading(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your enrollments and explore new programs.</p>
        </div>
        <button
          onClick={() => setShowEnroll(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Enroll in Course
        </button>
      </div>

      {activeEnrollment && activeEnrollment.course && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Enrollments</h2>
          <Card className="p-6">
            <div className="flex gap-5">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                <img src={activeEnrollment.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-foreground">{activeEnrollment.course.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enrolled: {formatDate(activeEnrollment.enrolled_at || "")} · Expires: {formatDate(activeEnrollment.expires_at || "")}
                    </p>
                  </div>
                  <StatusBadge status={activeEnrollment.status} />
                </div>
                <button
                  onClick={() => onNavigate("student-module")}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Continue Learning
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {availableCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Explore Programs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course) => (
              <div key={course.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="h-44 bg-muted overflow-hidden">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1 leading-snug">{course.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {formatNaira(course.price)}
                    </span>
                    <button
                      onClick={() => { setSelectedCourse(course); setShowEnroll(true); }}
                      className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-xl hover:bg-accent/80 transition-colors"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showEnroll} onClose={() => { setShowEnroll(false); setSelectedCourse(null); setReceiptFile(null); }} title="Enroll in a Course">
        {!selectedCourse ? (
          <div className="space-y-3">
            {availableCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className="w-full text-left p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all flex items-center gap-4"
              >
                <img src={c.thumbnail_url} alt="" className="w-14 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{formatNaira(c.price)} · {c.duration_months} months</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-4 bg-muted rounded-xl">
              <p className="font-semibold text-foreground">{selectedCourse.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatNaira(selectedCourse.price)} · 3 months access</p>
            </div>
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-accent" /> Payment Instructions</p>
              <p className="text-sm text-muted-foreground">Transfer <strong>{formatNaira(selectedCourse.price)}</strong> to:</p>
              <div className="bg-card rounded-lg p-3 font-mono text-sm space-y-1">
                <p><span className="text-muted-foreground">Bank:</span> First National Bank</p>
                <p><span className="text-muted-foreground">Account:</span> 0123456789</p>
                <p><span className="text-muted-foreground">Reference:</span> {profile.id.toUpperCase()}-{selectedCourse.id.toUpperCase()}</p>
              </div>
              <p className="text-xs text-muted-foreground">After payment, upload your receipt below. Admin will confirm within 24 hours.</p>
            </div>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => document.getElementById("receipt-upload")?.click()}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">{receiptFile ? receiptFile.name : "Upload Payment Receipt"}</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG · Max 10MB</p>
              <input
                id="receipt-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </div>
            <button
              onClick={handleEnrollSubmit}
              disabled={!receiptFile || uploading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Receipt & Request Enrollment"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Module Viewer ────────────────────────────────────────────────────────────

function ModuleViewer({ profile, enrollment, modules, onNavigate, onProgressUpdate }: { 
  profile: Profile;
  enrollment: Enrollment | null;
  modules: Module[];
  onNavigate: (v: View) => void;
  onProgressUpdate: (moduleId: string, status: string, score: number) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"content" | "quiz" | "assignment">("content");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);

  useEffect(() => {
    if (enrollment && modules.length > 0) {
      setCurrentModule(modules[enrollment.current_module_index] || modules[0]);
    }
  }, [enrollment, modules]);

  if (!enrollment || !currentModule) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading module...</p>
      </div>
    );
  }

  const questions = [
    { q: "Which library is used for numerical computing in Python?", opts: ["Matplotlib", "NumPy", "Seaborn", "Scikit-learn"], correct: 1 },
    { q: "What does EDA stand for?", opts: ["Extended Data Analysis", "Exploratory Data Analysis", "External Data Archive", "Efficient Data Aggregation"], correct: 1 },
    { q: "Which chart type is best for showing distribution?", opts: ["Pie chart", "Line chart", "Histogram", "Scatter plot"], correct: 2 },
    { q: "What is the primary use of pandas?", opts: ["Image processing", "Data manipulation", "Network analysis", "Web scraping"], correct: 1 },
  ];

  const score = quizSubmitted
    ? Math.round((questions.filter((q, i) => quizAnswers[i] === q.correct).length / questions.length) * 100)
    : 0;

  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    if (score >= currentModule.pass_score) {
      await onProgressUpdate(currentModule.id, "passed", score);
    } else {
      await onProgressUpdate(currentModule.id, "failed", score);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("student-courses")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          ← Back to Courses
        </button>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-1">
          <Badge variant="info">Module {enrollment.current_module_index + 1} of {modules.length}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          {currentModule.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Pass with ≥{currentModule.pass_score}% to unlock the next module.</p>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["content", "quiz", "assignment"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "content" && (
        <div className="space-y-6">
          <SecureVideoPlayer url="" title={currentModule.title} />
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Module Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{currentModule.description}</p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {["Core concepts explained", "Practical examples", "Hands-on exercises", "Best practices"].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </Card>
          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab("quiz")}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              Take Module Quiz <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="space-y-5">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-1">Module Assessment</h3>
            <p className="text-sm text-muted-foreground mb-6">Answer all questions. You need {currentModule.pass_score}% to pass and unlock the next module.</p>
            <div className="space-y-6">
              {questions.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-medium text-foreground mb-3">{qi + 1}. {q.q}</p>
                  <div className="space-y-2">
                    {q.opts.map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi;
                      const isCorrect = oi === q.correct;
                      return (
                        <button
                          key={oi}
                          onClick={() => !quizSubmitted && setQuizAnswers((p) => ({ ...p, [qi]: oi }))}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                            quizSubmitted
                              ? isCorrect ? "border-green-400 bg-green-50 text-green-800"
                                : selected ? "border-red-400 bg-red-50 text-red-800"
                                : "border-border text-muted-foreground"
                              : selected
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border hover:border-primary/40 text-foreground"
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {quizSubmitted ? (
              <div className={cn(
                "mt-6 p-5 rounded-xl flex items-center gap-4",
                score >= currentModule.pass_score ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              )}>
                {score >= currentModule.pass_score
                  ? <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                  : <XCircle className="w-8 h-8 text-red-600 shrink-0" />}
                <div>
                  <p className={cn("font-bold text-lg", score >= currentModule.pass_score ? "text-green-800" : "text-red-800")}>
                    {score}% — {score >= currentModule.pass_score ? "Module Passed! 🎉" : "Not Passed"}
                  </p>
                  <p className={cn("text-sm mt-0.5", score >= currentModule.pass_score ? "text-green-700" : "text-red-700")}>
                    {score >= currentModule.pass_score
                      ? "The next module has been unlocked. Great work!"
                      : `You need ${currentModule.pass_score}% to pass. Review the content and try again.`}
                  </p>
                </div>
                {score < currentModule.pass_score && (
                  <button
                    onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < questions.length}
                className="mt-6 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
              >
                Submit Quiz
              </button>
            )}
          </Card>
        </div>
      )}

      {activeTab === "assignment" && (
        <div className="space-y-5">
          <Card className="p-6">
            <p className="text-center text-muted-foreground py-8">Assignments will appear here when created by your instructor.</p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Student Assignments ──────────────────────────────────────────────────────

function StudentAssignments({ profile }: { profile: Profile }) {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);

  useEffect(() => {
    fetchAssignments();
    
    const subscription = supabase
      .channel("student-assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "student_assignments", filter: `student_id=eq.${profile.id}` }, 
        () => fetchAssignments())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [profile.id]);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("student_assignments")
      .select("*, assignment:assignment_id(*)")
      .eq("student_id", profile.id);
    if (data) setAssignments(data as StudentAssignment[]);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Assignments</h1>
        <p className="text-muted-foreground mt-1">Your assigned work from all enrolled courses.</p>
      </div>
      <div className="space-y-4">
        {assignments.map((sa) => (
          <Card key={sa.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{sa.assignment?.title}</h3>
                  <StatusBadge status={sa.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{sa.assignment?.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Assigned: {formatDate(sa.assigned_at)}</span>
                  {sa.submitted_at && <span>Submitted: {formatDate(sa.submitted_at)}</span>}
                  <span>Max score: {sa.assignment?.max_score}</span>
                </div>
                {sa.status === "graded" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm font-semibold text-green-800">Score: {sa.score}/{sa.assignment?.max_score}</p>
                    <p className="text-sm text-green-700 mt-0.5">{sa.feedback}</p>
                  </div>
                )}
                {sa.status === "pending" && (
                  <div className="mt-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-accent transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-foreground">Click to upload your submission</p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, ZIP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {assignments.length === 0 && (
          <Card className="p-8 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No assignments yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Student Payments ─────────────────────────────────────────────────────────

function StudentPayments({ profile }: { profile: Profile }) {
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);

  useEffect(() => {
    fetchPayments();
    
    const subscription = supabase
      .channel("student-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_receipts", filter: `student_id=eq.${profile.id}` },
        () => fetchPayments())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [profile.id]);

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payment_receipts")
      .select("*")
      .eq("student_id", profile.id);
    if (data) setPayments(data as PaymentReceipt[]);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Payments</h1>
        <p className="text-muted-foreground mt-1">Manage your payment receipts and enrollment status.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-foreground mb-4">How Payment Works</h2>
        <ol className="space-y-3">
          {[
            "Make bank transfer using the account details provided on enrollment.",
            "Upload your payment receipt (PDF or image).",
            "Admin reviews and approves within 24 hours.",
            "Course access is activated immediately upon approval.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Payment History</h2>
        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No payments submitted yet.</p>
          </Card>
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{formatNaira(p.amount)} — Receipt</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Submitted: {formatDate(p.submitted_at)}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.admin_notes && (
                <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  Admin note: {p.admin_notes}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ onNavigate, stats }: { onNavigate: (v: View) => void; stats: { students: number; courses: number; pendingPayments: number; submittedAssignments: number } }) {
  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Platform overview and quick actions.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Students" value={stats.students} />
        <StatCard icon={BookOpen} label="Active Courses" value={stats.courses} />
        <StatCard icon={DollarSign} label="Pending Payments" value={stats.pendingPayments} />
        <StatCard icon={ClipboardList} label="Open Assignments" value={stats.submittedAssignments} />
      </div>

      {stats.pendingPayments > 0 && (
        <div
          className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => onNavigate("admin-payments")}
        >
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Payment Receipts Awaiting Approval</p>
            <p className="text-sm text-amber-700">{stats.pendingPayments} student(s) are waiting for payment confirmation.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-600" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add new course", view: "admin-courses" as View, icon: Plus },
              { label: "Review payments", view: "admin-payments" as View, icon: DollarSign },
              { label: "Send assignment", view: "admin-assignments" as View, icon: ClipboardList },
              { label: "Manage students", view: "admin-students" as View, icon: Users },
            ].map(({ label, view, icon: Icon }) => (
              <button
                key={label}
                onClick={() => onNavigate(view)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all text-left text-sm font-medium"
              >
                <Icon className="w-4 h-4 text-accent" />
                {label}
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Admin Courses ────────────────────────────────────────────────────────────

function AdminCourses({ courses, modules, onCourseAdd, onModuleAdd }: { 
  courses: Course[]; 
  modules: Record<string, Module[]>;
  onCourseAdd: (course: Omit<Course, "id" | "created_at">) => Promise<void>;
  onModuleAdd: (module: Omit<Module, "id" | "created_at">) => Promise<void>;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", price: "", duration_months: "3" });
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", pass_score: "75" });
  const [loading, setLoading] = useState(false);

  const handleAddCourse = async () => {
    setLoading(true);
    await onCourseAdd({
      title: courseForm.title,
      description: courseForm.description,
      price: parseFloat(courseForm.price),
      duration_months: parseInt(courseForm.duration_months),
      currency: "NGN",
      is_active: true,
    });
    setShowModal(false);
    setCourseForm({ title: "", description: "", price: "", duration_months: "3" });
    setLoading(false);
  };

  const handleAddModule = async () => {
    if (!activeCourse) return;
    setLoading(true);
    await onModuleAdd({
      course_id: activeCourse.id,
      title: moduleForm.title,
      description: moduleForm.description,
      order_index: (modules[activeCourse.id]?.length || 0),
      pass_score: parseInt(moduleForm.pass_score),
    });
    setShowModuleModal(false);
    setModuleForm({ title: "", description: "", pass_score: "75" });
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            Courses & Modules
          </h1>
          <p className="text-muted-foreground mt-1">Manage your course catalog and module content.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => {
          const courseModules = modules[course.id] || [];
          return (
            <Card key={course.id} className="p-6">
              <div className="flex gap-5">
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success">{formatNaira(course.price)}</Badge>
                      <Badge variant="info">{course.duration_months}mo</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-muted-foreground">{courseModules.length} modules</span>
                    <button
                      onClick={() => { setActiveCourse(course); setShowModuleModal(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Module
                    </button>
                  </div>
                  {courseModules.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {courseModules.map((m) => (
                        <span key={m.id} className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-lg">
                          <BookOpen className="w-3 h-3" /> {m.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Course">
        <div className="space-y-4">
          <Input label="Course Title" value={courseForm.title} onChange={(v) => setCourseForm((p) => ({ ...p, title: v }))} placeholder="e.g. Advanced Data Science" required />
          <Textarea label="Description" value={courseForm.description} onChange={(v) => setCourseForm((p) => ({ ...p, description: v }))} placeholder="What will students learn?" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₦)" type="number" value={courseForm.price} onChange={(v) => setCourseForm((p) => ({ ...p, price: v }))} placeholder="50000" required />
            <Input label="Duration (months)" type="number" value={courseForm.duration_months} onChange={(v) => setCourseForm((p) => ({ ...p, duration_months: v }))} required />
          </div>
          <button
            onClick={handleAddCourse}
            disabled={loading || !courseForm.title || !courseForm.price}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Course"}
          </button>
        </div>
      </Modal>

      <Modal open={showModuleModal} onClose={() => setShowModuleModal(false)} title={`Add Module — ${activeCourse?.title}`}>
        <div className="space-y-4">
          <Input label="Module Title" value={moduleForm.title} onChange={(v) => setModuleForm((p) => ({ ...p, title: v }))} placeholder="e.g. Python Foundations" required />
          <Textarea label="Module Description" value={moduleForm.description} onChange={(v) => setModuleForm((p) => ({ ...p, description: v }))} placeholder="Brief overview of this module..." />
          <Input label="Pass Score (%)" type="number" value={moduleForm.pass_score} onChange={(v) => setModuleForm((p) => ({ ...p, pass_score: v }))} placeholder="75" required />
          <button
            onClick={handleAddModule}
            disabled={loading || !moduleForm.title}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Module"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Admin Students ───────────────────────────────────────────────────────────

function AdminStudents({ students }: { students: Profile[] }) {
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Students
        </h1>
        <p className="text-muted-foreground mt-1">View and manage enrolled students.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.full_name} size="sm" />
                      <p className="text-sm font-semibold text-foreground">{s.full_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{s.email}</td>
                  <td className="px-6 py-4"><Badge variant="default">{s.role}</Badge></td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{formatDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Admin Payments ───────────────────────────────────────────────────────────

function AdminPayments() {
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [viewReceipt, setViewReceipt] = useState<PaymentReceipt | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
    
    const subscription = supabase
      .channel("admin-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_receipts" }, () => fetchPayments())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchPayments = async () => {
    const { data } = await supabase.from("payment_receipts").select("*, enrollment:enrollment_id(*)");
    if (data) setPayments(data as PaymentReceipt[]);
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setLoading(true);
    await supabase
      .from("payment_receipts")
      .update({ status: action, admin_notes: notes })
      .eq("id", id);
    
    if (action === "approved") {
      const payment = payments.find(p => p.id === id);
      if (payment) {
        await supabase
          .from("enrollments")
          .update({ status: "active", enrolled_at: new Date().toISOString(), expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() })
          .eq("id", payment.enrollment_id);
      }
    }
    
    setViewReceipt(null);
    setNotes("");
    setLoading(false);
    fetchPayments();
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Payment Approvals
        </h1>
        <p className="text-muted-foreground mt-1">Review and approve student payment receipts.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Clock} label="Pending" value={payments.filter((p) => p.status === "pending").length} />
        <StatCard icon={CheckCircle} label="Approved" value={payments.filter((p) => p.status === "approved").length} />
        <StatCard icon={XCircle} label="Rejected" value={payments.filter((p) => p.status === "rejected").length} />
      </div>

      <div className="space-y-4">
        {payments.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Student ID: {p.student_id.slice(0, 8)}...</p>
                <p className="text-sm text-muted-foreground">{formatNaira(p.amount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Submitted: {formatDate(p.submitted_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                {p.status === "pending" && (
                  <button
                    onClick={() => setViewReceipt(p)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                )}
              </div>
            </div>
            {p.admin_notes && (
              <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                Note: {p.admin_notes}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal open={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Review Payment Receipt">
        {viewReceipt && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Student ID</p>
                <p className="font-semibold mt-0.5 text-xs">{viewReceipt.student_id}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-semibold mt-0.5">{formatNaira(viewReceipt.amount)}</p>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 text-center">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <a href={viewReceipt.receipt_url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-accent hover:underline flex items-center gap-1 mx-auto justify-center">
                <Eye className="w-3 h-3" /> View Receipt
              </a>
            </div>
            <Textarea label="Admin Notes (optional)" value={notes} onChange={setNotes} placeholder="Reason for approval or rejection..." rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction(viewReceipt.id, "rejected")}
                disabled={loading}
                className="py-2.5 bg-destructive/10 text-destructive border border-destructive/20 font-semibold rounded-xl hover:bg-destructive/20 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => handleAction(viewReceipt.id, "approved")}
                disabled={loading}
                className="py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Approve</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Admin Assignments ────────────────────────────────────────────────────────

function AdminAssignments() {
  const [showCreate, setShowCreate] = useState(false);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [gradeModal, setGradeModal] = useState<StudentAssignment | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });
  const [newAssignment, setNewAssignment] = useState({ course_id: "", module_id: "", title: "", description: "", max_score: "100", due_days: "7" });

  useEffect(() => {
    fetchData();
    
    const subscription = supabase
      .channel("admin-assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "student_assignments" }, () => fetchData())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchData = async () => {
    const [assignmentsRes, coursesRes, modulesRes] = await Promise.all([
      supabase.from("student_assignments").select("*, assignment:assignment_id(*)"),
      supabase.from("courses").select("*"),
      supabase.from("modules").select("*"),
    ]);
    if (assignmentsRes.data) setAssignments(assignmentsRes.data as StudentAssignment[]);
    if (coursesRes.data) setCourses(coursesRes.data as Course[]);
    if (modulesRes.data) setModules(modulesRes.data as Module[]);
  };

  const handleCreateAssignment = async () => {
    const { data: assignment } = await supabase
      .from("assignments")
      .insert({
        module_id: newAssignment.module_id,
        title: newAssignment.title,
        description: newAssignment.description,
        due_days: parseInt(newAssignment.due_days),
        max_score: parseInt(newAssignment.max_score),
      })
      .select()
      .single();

    if (assignment) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, student_id")
        .eq("course_id", newAssignment.course_id)
        .eq("status", "active");

      if (enrollments) {
        const studentAssignments = enrollments.map(e => ({
          assignment_id: assignment.id,
          student_id: e.student_id,
          enrollment_id: e.id,
          status: "pending",
        }));
        await supabase.from("student_assignments").insert(studentAssignments);
      }
    }

    setShowCreate(false);
    setNewAssignment({ course_id: "", module_id: "", title: "", description: "", max_score: "100", due_days: "7" });
    fetchData();
  };

  const handleGrade = async () => {
    if (!gradeModal) return;
    await supabase
      .from("student_assignments")
      .update({ status: "graded", score: parseInt(gradeForm.score), feedback: gradeForm.feedback })
      .eq("id", gradeModal.id);
    
    setGradeModal(null);
    setGradeForm({ score: "", feedback: "" });
    fetchData();
  };

  const availableModules = modules.filter(m => m.course_id === newAssignment.course_id);

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            Assignments
          </h1>
          <p className="text-muted-foreground mt-1">Create assignments and grade student submissions.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Student Submissions</h2>
        {assignments.map((sa) => (
          <Card key={sa.id} className="p-5">
            <div className="flex items-center gap-4">
              <Avatar name={sa.student_id.slice(0, 8)} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Student ID: {sa.student_id.slice(0, 8)}...</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sa.assignment?.title}</p>
                {sa.score !== undefined && (
                  <p className="text-xs text-green-700 font-medium mt-0.5">Score: {sa.score}/100</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={sa.status} />
                {sa.status === "submitted" && (
                  <button
                    onClick={() => { setGradeModal(sa); setGradeForm({ score: "", feedback: "" }); }}
                    className="px-3 py-1.5 bg-accent/15 text-accent text-xs font-medium rounded-lg hover:bg-accent/25 transition-colors"
                  >
                    Grade
                  </button>
                )}
              </div>
            </div>
            {sa.feedback && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                Feedback: {sa.feedback}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Course</label>
            <select
              value={newAssignment.course_id}
              onChange={(e) => setNewAssignment(p => ({ ...p, course_id: e.target.value, module_id: "" }))}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm"
            >
              <option value="">Select course...</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Module</label>
            <select
              value={newAssignment.module_id}
              onChange={(e) => setNewAssignment(p => ({ ...p, module_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm"
            >
              <option value="">Select module...</option>
              {availableModules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <Input label="Assignment Title" value={newAssignment.title} onChange={(v) => setNewAssignment(p => ({ ...p, title: v }))} placeholder="e.g. Python Data Structures Project" required />
          <Textarea label="Instructions" value={newAssignment.description} onChange={(v) => setNewAssignment(p => ({ ...p, description: v }))} placeholder="Detailed assignment instructions..." rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Score" type="number" value={newAssignment.max_score} onChange={(v) => setNewAssignment(p => ({ ...p, max_score: v }))} placeholder="100" required />
            <Input label="Due Days" type="number" value={newAssignment.due_days} onChange={(v) => setNewAssignment(p => ({ ...p, due_days: v }))} placeholder="7" required />
          </div>
          <button
            onClick={handleCreateAssignment}
            disabled={!newAssignment.course_id || !newAssignment.module_id || !newAssignment.title}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            Create Assignment
          </button>
        </div>
      </Modal>

      <Modal open={!!gradeModal} onClose={() => setGradeModal(null)} title={`Grade — ${gradeModal?.assignment?.title}`}>
        {gradeModal && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">Student ID: {gradeModal.student_id}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Submitted: {gradeModal.submitted_at ? formatDate(gradeModal.submitted_at) : "—"}</p>
            </div>
            <Input label="Score (out of 100)" type="number" value={gradeForm.score} onChange={(v) => setGradeForm((p) => ({ ...p, score: v }))} placeholder="85" required />
            <Textarea label="Feedback" value={gradeForm.feedback} onChange={(v) => setGradeForm((p) => ({ ...p, feedback: v }))} placeholder="Detailed feedback for the student..." rows={3} required />
            <button
              onClick={handleGrade}
              disabled={!gradeForm.score || !gradeForm.feedback}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
            >
              Submit Grade
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [view, setView] = useState<View>("landing");
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (userId: string, userEmail: string, userName: string) => {
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (existing) return existing;
    
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: userEmail,
        full_name: userName,
        role: userEmail === 'admin@academia.com' ? 'admin' : 'student',
      })
      .select()
      .single();
    
    return newProfile;
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await ensureProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
          );
          
          if (profile) {
            const userProfile = profile as Profile;
            setProfile(userProfile);
            setView(userProfile.role === "admin" ? "admin-dashboard" : "student-dashboard");
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await ensureProfile(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        );
        
        if (profile) {
          const userProfile = profile as Profile;
          setProfile(userProfile);
          setView(userProfile.role === "admin" ? "admin-dashboard" : "student-dashboard");
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setView("landing");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch data when profile changes
  useEffect(() => {
    if (profile) {
      fetchCourses();
      fetchModules();
      fetchEnrollments();
      if (profile.role === "admin") {
        fetchStudents();
      }
    }
  }, [profile]);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile) return;

    const coursesChannel = supabase
      .channel("courses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => fetchCourses())
      .subscribe();

    const modulesChannel = supabase
      .channel("modules-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "modules" }, () => fetchModules())
      .subscribe();

    const enrollmentsChannel = supabase
      .channel("enrollments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "enrollments" }, () => fetchEnrollments())
      .subscribe();

    return () => {
      coursesChannel.unsubscribe();
      modulesChannel.unsubscribe();
      enrollmentsChannel.unsubscribe();
    };
  }, [profile]);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").eq("is_active", true);
    if (data) setCourses(data as Course[]);
  };

  const fetchModules = async () => {
    const { data } = await supabase.from("modules").select("*");
    if (data) setModules(data as Module[]);
  };

  const fetchEnrollments = async () => {
    if (!profile) return;
    let query = supabase.from("enrollments").select("*, course:course_id(*)");
    if (profile.role === "student") {
      query = query.eq("student_id", profile.id);
    }
    const { data } = await query;
    if (data) setEnrollments(data as Enrollment[]);
  };

  const fetchProgress = async () => {
    const enrollmentIds = enrollments.map(e => e.id);
    if (enrollmentIds.length === 0) return;
    const { data } = await supabase
      .from("module_progress")
      .select("*")
      .in("enrollment_id", enrollmentIds);
    if (data) setProgress(data as ModuleProgress[]);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "student");
    if (data) setStudents(data as Profile[]);
  };

  const handleLogin = (p: Profile) => {
    setProfile(p);
    setView(p.role === "admin" ? "admin-dashboard" : "student-dashboard");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setView("landing");
  };

  const handleEnroll = async (courseId: string) => {
    await fetchEnrollments();
  };

  const handleProgressUpdate = async (moduleId: string, status: string, score: number) => {
    const enrollment = enrollments.find(e => e.status === "active");
    if (!enrollment) return;

    const existingProgress = progress.find(p => p.module_id === moduleId && p.enrollment_id === enrollment.id);
    
    if (existingProgress) {
      await supabase
        .from("module_progress")
        .update({ status, score, completed_at: status === "passed" ? new Date().toISOString() : undefined })
        .eq("id", existingProgress.id);
    } else {
      await supabase
        .from("module_progress")
        .insert({ enrollment_id: enrollment.id, module_id: moduleId, status, score });
    }

    if (status === "passed") {
      const courseModules = modules.filter(m => m.course_id === enrollment.course_id).sort((a, b) => a.order_index - b.order_index);
      const currentModuleIndex = courseModules.findIndex(m => m.id === moduleId);
      if (currentModuleIndex === enrollment.current_module_index && currentModuleIndex + 1 < courseModules.length) {
        await supabase
          .from("enrollments")
          .update({ current_module_index: currentModuleIndex + 1 })
          .eq("id", enrollment.id);
      }
    }

    await fetchProgress();
    await fetchEnrollments();
  };

  const handleAddCourse = async (course: Omit<Course, "id" | "created_at">) => {
    await supabase.from("courses").insert(course);
    await fetchCourses();
  };

  const handleAddModule = async (module: Omit<Module, "id" | "created_at">) => {
    await supabase.from("modules").insert(module);
    await fetchModules();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (view === "landing") return <LandingPage onAuth={() => setView("auth")} courses={courses} />;
  if (view === "auth") return <AuthPage onLogin={handleLogin} />;
  if (!profile) return <AuthPage onLogin={handleLogin} />;

  const modulesByCourse = modules.reduce((acc, m) => {
    if (!acc[m.course_id]) acc[m.course_id] = [];
    acc[m.course_id].push(m);
    return acc;
  }, {} as Record<string, Module[]>);

  const renderView = () => {
    if (profile.role === "admin") {
      switch (view) {
        case "admin-dashboard":
          return <AdminDashboard 
            onNavigate={setView} 
            stats={{
              students: students.length,
              courses: courses.length,
              pendingPayments: 0,
              submittedAssignments: 0,
            }} 
          />;
        case "admin-courses":
          return <AdminCourses courses={courses} modules={modulesByCourse} onCourseAdd={handleAddCourse} onModuleAdd={handleAddModule} />;
        case "admin-students":
          return <AdminStudents students={students} />;
        case "admin-payments":
          return <AdminPayments />;
        case "admin-assignments":
          return <AdminAssignments />;
        default:
          return <AdminDashboard onNavigate={setView} stats={{ students: 0, courses: 0, pendingPayments: 0, submittedAssignments: 0 }} />;
      }
    } else {
      const activeEnrollment = enrollments.find(e => e.status === "active");
      switch (view) {
        case "student-dashboard":
          return <StudentDashboard profile={profile} onNavigate={setView} enrollments={enrollments} progress={progress} />;
        case "student-courses":
          return <StudentCourses profile={profile} onNavigate={setView} courses={courses} enrollments={enrollments} onEnroll={handleEnroll} />;
        case "student-module":
          return <ModuleViewer profile={profile} enrollment={activeEnrollment || null} modules={modulesByCourse[activeEnrollment?.course_id || ""] || []} onNavigate={setView} onProgressUpdate={handleProgressUpdate} />;
        case "student-assignments":
          return <StudentAssignments profile={profile} />;
        case "student-payment":
          return <StudentPayments profile={profile} />;
        default:
          return <StudentDashboard profile={profile} onNavigate={setView} enrollments={enrollments} progress={progress} />;
      }
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar profile={profile} currentView={view} onNavigate={setView} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
}
