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
  Edit,
  Trash2,
  User,
  Camera,
  Send,
  Info,
  HelpCircle,
  List,
  Circle,
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
  | "student-profile"
  | "admin-dashboard"
  | "admin-courses"
  | "admin-students"
  | "admin-payments"
  | "admin-assignments"
  | "admin-student-profile"
  | "admin-quizzes";

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

// ─── Circular Progress Component ─────────────────────────────────────────────

function CircularProgress({ value, max, size = 80, strokeWidth = 6 }: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-accent transition-all duration-1000 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground">{Math.round(progress)}%</span>
        <span className="text-xs text-muted-foreground">{value}/{max}</span>
      </div>
    </div>
  );
}

// ─── Secure Video Player (DRM Protected) ─────────────────────────────────────

function SecureVideoPlayer({ url, title, onProgress }: { 
  url: string; 
  title: string;
  onProgress?: (progress: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const disableContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p' || e.key === 'c')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration > 0 && onProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      video::-webkit-media-controls-download-button {
        display: none !important;
      }
      video::-webkit-media-controls-enclosure {
        overflow: hidden;
      }
      video::-internal-media-controls-download-button {
        display: none;
      }
    `;
    document.head.appendChild(style);

    container.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableKeyboardShortcuts);
    video.addEventListener('timeupdate', handleTimeUpdate);

    const watermark = document.createElement('div');
    watermark.className = 'video-watermark';
    watermark.innerHTML = `
      <div style="position: absolute; bottom: 20px; right: 20px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; pointer-events: none; z-index: 10;">
        🔒 PROTECTED
      </div>
    `;
    container.style.position = 'relative';
    container.appendChild(watermark);

    return () => {
      container.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      document.head.removeChild(style);
      if (watermark) container.removeChild(watermark);
    };
  }, [onProgress]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden bg-black select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <div className="absolute top-3 right-3 z-20 opacity-70 pointer-events-none select-none">
        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded font-mono backdrop-blur-sm">
          🔒 PROTECTED
        </span>
      </div>
      <div className="aspect-video bg-gradient-to-br from-primary to-[#1a3d63] flex items-center justify-center">
        <video
          ref={videoRef}
          src={url}
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ name, size = "md", src }: { name: string; size?: "sm" | "md" | "lg"; src?: string }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-14 h-14 text-lg" };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", sizes[size])}
      />
    );
  }
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

function Input({ label, type = "text", value, onChange, placeholder, required, accept, disabled }: {
  label: string; type?: string; value?: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean; accept?: string; disabled?: boolean;
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
        disabled={disabled}
        className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
              Pruta Academy
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
            <span className="font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Pruta Academy</span>
          </div>
          <p className="text-sm text-muted-foreground"></p>
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
        role: userEmail === 'admin@pruta.com' ? 'admin' : 'student',
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
              Pruta Academy
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
                Pruta Academy
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {mode === "login" ? "Welcome back" : "Join Pruta Academy"}
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
            <p className="text-xs text-muted-foreground"><span className="font-mono text-foreground">Admin:</span> admin@pruta.com</p>
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
    { view: "student-module" as View, icon: Video, label: "Learning" },
    { view: "student-assignments" as View, icon: ClipboardList, label: "Assignments" },
    { view: "student-payment" as View, icon: DollarSign, label: "Payments" },
    { view: "student-profile" as View, icon: User, label: "My Profile" },
  ];

  const adminNav = [
    { view: "admin-dashboard" as View, icon: LayoutDashboard, label: "Dashboard" },
    { view: "admin-courses" as View, icon: BookOpen, label: "Courses & Modules" },
    { view: "admin-students" as View, icon: Users, label: "Students" },
    { view: "admin-payments" as View, icon: DollarSign, label: "Payments" },
    { view: "admin-assignments" as View, icon: ClipboardList, label: "Assignments" },
    { view: "admin-quizzes" as View, icon: HelpCircle, label: "Quizzes" },
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
            Pruta Academy
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
          <Avatar name={profile.full_name} size="sm" src={profile.avatar_url} />
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

// ─── Student Dashboard (with Circular Progress) ─────────────────────────────

function StudentDashboard({ profile, onNavigate, enrollments, progress, modules }: { 
  profile: Profile; 
  onNavigate: (v: View) => void;
  enrollments: Enrollment[];
  progress: ModuleProgress[];
  modules: Module[];
}) {
  const activeEnrollment = enrollments.find(e => e.status === "active");
  const pendingEnrollments = enrollments.filter(e => e.status === "pending_payment" || e.status === "payment_submitted");
  const passedCount = progress.filter(p => p.status === "passed").length;
  
  // Calculate total modules for the active course
  const totalModules = activeEnrollment ? modules.filter(m => m.course_id === activeEnrollment.course_id).length : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto">
      {pendingEnrollments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">Pending Enrollment{pendingEnrollments.length > 1 ? 's' : ''}</p>
              <p className="text-sm text-yellow-700 mt-1">
                You have {pendingEnrollments.length} enrollment{pendingEnrollments.length > 1 ? 's' : ''} awaiting payment confirmation.
              </p>
              <button
                onClick={() => onNavigate("student-courses")}
                className="mt-2 text-sm text-yellow-800 font-medium hover:underline flex items-center gap-1"
              >
                View pending enrollments <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Good morning, {profile.full_name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Here's your learning progress at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={enrollments.filter(e => e.status === "active").length} />
        <StatCard icon={CheckCircle} label="Modules Passed" value={passedCount} />
        <StatCard icon={ClipboardList} label="Assignments Due" value={0} />
        <StatCard icon={Award} label="Certificates Earned" value={activeEnrollment?.status === "completed" ? 1 : 0} />
      </div>

      {activeEnrollment && activeEnrollment.course && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <Card className="p-4 md:p-6">
              <h2 className="font-semibold text-foreground mb-4 md:mb-5 text-lg md:text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Active Course Progress
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mb-5">
                <div className="w-full md:w-24 h-32 md:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={activeEnrollment.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-base md:text-lg">{activeEnrollment.course.title}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Module {activeEnrollment.current_module_index + 1} · Expires {formatDate(activeEnrollment.expires_at || "")}
                  </p>
                  <StatusBadge status={activeEnrollment.status} />
                  <div className="mt-3">
                    <ProgressBar value={passedCount} max={totalModules || 5} />
                    <p className="text-xs text-muted-foreground mt-1">{passedCount} of {totalModules || 5} modules completed</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate("student-module")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs md:text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Continue Learning
              </button>
            </Card>
          </div>

          <div className="flex items-center justify-center">
            <Card className="p-6 w-full flex flex-col items-center">
              <h3 className="font-semibold text-foreground mb-4 text-sm text-center">Overall Progress</h3>
              <CircularProgress value={passedCount} max={totalModules || 5} size={120} />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {passedCount} of {totalModules || 5} modules passed
              </p>
              {passedCount === totalModules && totalModules > 0 && (
                <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  🎉 Course Complete!
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Module Viewer (with Sidebar and Video) ──────────────────────────

function StudentModuleViewer({ profile, enrollment, modules, moduleContents, onNavigate, onProgressUpdate }: { 
  profile: Profile;
  enrollment: Enrollment | null;
  modules: Module[];
  moduleContents: ModuleContent[];
  onNavigate: (v: View) => void;
  onProgressUpdate: (moduleId: string, status: string, score: number) => Promise<void>;
}) {
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(enrollment?.current_module_index || 0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const currentModule = modules[selectedModuleIndex] || modules[0];
  const currentContent = moduleContents.find(c => c.module_id === currentModule?.id);

  const handleModuleSelect = (index: number) => {
    if (index <= (enrollment?.current_module_index || 0) + 1) {
      setSelectedModuleIndex(index);
    }
  };

  const isModuleLocked = (index: number) => {
    const currentIndex = enrollment?.current_module_index || 0;
    return index > currentIndex + 1;
  };

  const isModuleCompleted = (moduleId: string) => {
    // Check if module is passed
    return false; // Will be implemented with quiz attempts
  };

  const questions = [
    { q: "Which library is used for numerical computing in Python?", opts: ["Matplotlib", "NumPy", "Seaborn", "Scikit-learn"], correct: 1 },
    { q: "What does EDA stand for?", opts: ["Extended Data Analysis", "Exploratory Data Analysis", "External Data Archive", "Efficient Data Aggregation"], correct: 1 },
    { q: "Which chart type is best for showing distribution?", opts: ["Pie chart", "Line chart", "Histogram", "Scatter plot"], correct: 2 },
    { q: "What is the primary use of pandas?", opts: ["Image processing", "Data manipulation", "Network analysis", "Web scraping"], correct: 1 },
  ];

  const handleSubmitQuiz = async () => {
    const correct = questions.filter((q, i) => quizAnswers[i] === q.correct).length;
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    
    if (score >= 70 && currentModule) {
      await onProgressUpdate(currentModule.id, "passed", score);
    } else if (currentModule) {
      await onProgressUpdate(currentModule.id, "failed", score);
    }
  };

  if (!enrollment || !currentModule) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading module...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Sidebar - Module List */}
      <div className="w-full md:w-64 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-4 shrink-0">
        <h3 className="font-semibold text-foreground mb-3 text-sm">Course Modules</h3>
        <div className="space-y-1">
          {modules.map((module, index) => {
            const isLocked = isModuleLocked(index);
            const isActive = index === selectedModuleIndex;
            const isCompleted = isModuleCompleted(module.id);
            
            return (
              <button
                key={module.id}
                onClick={() => handleModuleSelect(index)}
                disabled={isLocked}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left",
                  isActive ? "bg-accent/20 text-accent font-medium" : "text-foreground/70 hover:bg-muted",
                  isLocked && "opacity-50 cursor-not-allowed",
                  isCompleted && "text-green-600"
                )}
              >
                <span className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-xs shrink-0">
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="truncate">{module.title}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </div>
        
        {/* Progress Summary */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{selectedModuleIndex + 1}/{modules.length}</span>
          </div>
          <ProgressBar value={selectedModuleIndex + 1} max={modules.length} className="mt-1" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">Module {selectedModuleIndex + 1} of {modules.length}</Badge>
            <StatusBadge status="in_progress" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            {currentModule.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Pass with ≥{currentModule.pass_score}% to unlock the next module.</p>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
          {(["content", "quiz"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setShowQuiz(tab === "quiz")}
              className={cn(
                "px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                (tab === "content" && !showQuiz) || (tab === "quiz" && showQuiz)
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "content" ? "📺 Content" : "📝 Quiz"}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {!showQuiz && (
          <div className="space-y-6">
            {currentContent?.content_type === "video" && currentContent.content_url && (
              <SecureVideoPlayer 
                url={currentContent.content_url} 
                title={currentContent.title}
                onProgress={setVideoProgress}
              />
            )}
            
            {currentContent?.content_type === "text" && currentContent.content_text && (
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold text-foreground mb-3">{currentContent.title}</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap text-sm md:text-base">{currentContent.content_text}</p>
                </div>
              </Card>
            )}
            
            {!currentContent && (
              <Card className="p-4 md:p-6">
                <p className="text-center text-muted-foreground">No content available for this module yet.</p>
              </Card>
            )}
            
            <Card className="p-4 md:p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Module Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentModule.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                onClick={() => setShowQuiz(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm"
              >
                Take Module Quiz <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {showQuiz && (
          <div className="space-y-5">
            <Card className="p-4 md:p-6">
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
                  "mt-6 p-5 rounded-xl flex flex-col md:flex-row items-center gap-4",
                  quizScore >= currentModule.pass_score ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                )}>
                  {quizScore >= currentModule.pass_score
                    ? <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                    : <XCircle className="w-8 h-8 text-red-600 shrink-0" />}
                  <div className="flex-1 text-center md:text-left">
                    <p className={cn("font-bold text-lg", quizScore >= currentModule.pass_score ? "text-green-800" : "text-red-800")}>
                      {quizScore}% — {quizScore >= currentModule.pass_score ? "Module Passed! 🎉" : "Not Passed"}
                    </p>
                    <p className={cn("text-sm mt-0.5", quizScore >= currentModule.pass_score ? "text-green-700" : "text-red-700")}>
                      {quizScore >= currentModule.pass_score
                        ? "The next module has been unlocked. Great work!"
                        : `You need ${currentModule.pass_score}% to pass. Review the content and try again.`}
                    </p>
                  </div>
                  {quizScore < currentModule.pass_score && (
                    <button
                      onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); setQuizScore(0); }}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Retry
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
      </div>
    </div>
  );
}

// ─── Admin Quizzes Component ──────────────────────────────────────────────────

function AdminQuizzes({ courses, modules, onQuizCreate, onQuizDelete }: { 
  courses: Course[];
  modules: Module[];
  onQuizCreate: (quizData: any) => Promise<void>;
  onQuizDelete: (quizId: string) => Promise<void>;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passScore, setPassScore] = useState("70");
  const [questions, setQuestions] = useState<{ question: string; options: string[]; correctAnswer: number }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const { data } = await supabase.from("quizzes").select("*, module:module_id(title)");
    if (data) setQuizzes(data);
  };

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(o => o.trim())) {
      setQuestions([...questions, { ...currentQuestion }]);
      setCurrentQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateQuiz = async () => {
    if (!selectedModule || !quizTitle || questions.length === 0) return;
    setLoading(true);
    
    await onQuizCreate({
      module_id: selectedModule,
      title: quizTitle,
      description: quizDescription,
      pass_score: parseInt(passScore),
      questions: questions,
    });
    
    setShowCreateModal(false);
    setQuizTitle("");
    setQuizDescription("");
    setPassScore("70");
    setQuestions([]);
    setSelectedModule("");
    setLoading(false);
    fetchQuizzes();
  };

  const availableModules = modules.filter(m => !quizzes.some(q => q.module_id === m.id));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            Quizzes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Create and manage module quizzes.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Create Quiz
        </button>
      </div>

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const module = modules.find(m => m.id === quiz.module_id);
          const course = courses.find(c => c.id === module?.course_id);
          return (
            <Card key={quiz.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="info">{course?.title || "Unknown"} → {module?.title || "Unknown Module"}</Badge>
                    <Badge variant="success">Pass: {quiz.pass_score}%</Badge>
                  </div>
                </div>
                <button
                  onClick={() => onQuizDelete(quiz.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </Card>
          );
        })}
        {quizzes.length === 0 && (
          <Card className="p-8 text-center">
            <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No quizzes created yet.</p>
          </Card>
        )}
      </div>

      {/* Create Quiz Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Quiz">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">Select module...</option>
              {availableModules.map((m) => {
                const course = courses.find(c => c.id === m.course_id);
                return (
                  <option key={m.id} value={m.id}>
                    {course?.title} → {m.title}
                  </option>
                );
              })}
            </select>
          </div>
          
          <Input label="Quiz Title" value={quizTitle} onChange={setQuizTitle} placeholder="e.g. Module 1 Assessment" required />
          <Textarea label="Description" value={quizDescription} onChange={setQuizDescription} placeholder="Brief description of the quiz..." rows={2} />
          <Input label="Pass Score (%)" type="number" value={passScore} onChange={setPassScore} placeholder="70" required />

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-3">Questions ({questions.length})</h4>
            
            <div className="space-y-3">
              <Input label="Question" value={currentQuestion.question} onChange={(v) => setCurrentQuestion({ ...currentQuestion, question: v })} placeholder="Enter your question..." />
              <div className="space-y-2">
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === i}
                      onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: i })}
                      className="w-4 h-4 text-accent"
                    />
                    <Input label={`Option ${i + 1}`} value={opt} onChange={(v) => {
                      const newOpts = [...currentQuestion.options];
                      newOpts[i] = v;
                      setCurrentQuestion({ ...currentQuestion, options: newOpts });
                    }} placeholder={`Option ${i + 1}`} />
                  </div>
                ))}
              </div>
              <button
                onClick={addQuestion}
                disabled={!currentQuestion.question || currentQuestion.options.some(o => !o.trim())}
                className="w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors text-sm disabled:opacity-50"
              >
                Add Question
              </button>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="mt-2 p-3 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{i + 1}. {q.question}</p>
                  <p className="text-xs text-muted-foreground">Correct: {q.options[q.correctAnswer]}</p>
                </div>
                <button
                  onClick={() => removeQuestion(i)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateQuiz}
            disabled={loading || !selectedModule || !quizTitle || questions.length === 0}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Quiz"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── The rest of the components remain the same ──────────────────────────────

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [view, setView] = useState<View>("landing");
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleContents, setModuleContents] = useState<ModuleContent[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStudent, setViewingStudent] = useState<Profile | null>(null);

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
        role: userEmail === 'admin@pruta.com' ? 'admin' : 'student',
      })
      .select()
      .single();
    
    return newProfile;
  };

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

  useEffect(() => {
    if (profile) {
      fetchCourses();
      fetchModules();
      fetchModuleContents();
      fetchEnrollments();
      if (profile.role === "admin") {
        fetchStudents();
      }
    }
  }, [profile]);

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

    const moduleContentsChannel = supabase
      .channel("module-contents-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "module_contents" }, () => fetchModuleContents())
      .subscribe();

    const enrollmentsChannel = supabase
      .channel("enrollments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "enrollments" }, () => fetchEnrollments())
      .subscribe();

    return () => {
      coursesChannel.unsubscribe();
      modulesChannel.unsubscribe();
      moduleContentsChannel.unsubscribe();
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

  const fetchModuleContents = async () => {
    const { data } = await supabase.from("module_contents").select("*");
    if (data) setModuleContents(data as ModuleContent[]);
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

  const handleAddCourse = async (course: Omit<Course, "id" | "created_at">, thumbnailFile?: File) => {
    let thumbnailUrl = course.thumbnail_url || null;
    
    if (thumbnailFile) {
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `course-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, thumbnailFile);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrl;
      }
    }
    
    await supabase.from("courses").insert({
      ...course,
      thumbnail_url: thumbnailUrl,
    });
    await fetchCourses();
  };

  const handleUpdateCourse = async (id: string, updates: Partial<Course>, thumbnailFile?: File) => {
    let thumbnailUrl = updates.thumbnail_url;
    
    if (thumbnailFile) {
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `course-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, thumbnailFile);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrl;
      }
    }
    
    await supabase
      .from("courses")
      .update({ ...updates, thumbnail_url: thumbnailUrl })
      .eq("id", id);
    await fetchCourses();
  };

  const handleDeleteCourse = async (id: string) => {
    await supabase.from("modules").delete().eq("course_id", id);
    await supabase.from("courses").delete().eq("id", id);
    await fetchCourses();
  };

  const handleAddModule = async (module: Omit<Module, "id" | "created_at">) => {
    await supabase.from("modules").insert(module);
    await fetchModules();
  };

  const handleDeleteModule = async (moduleId: string, courseId: string) => {
    await supabase.from("modules").delete().eq("id", moduleId);
    await fetchModules();
  };

  const handleAddModuleContent = async (content: Omit<ModuleContent, "id" | "created_at">, videoFile?: File) => {
    let contentUrl = content.content_url;
    
    if (videoFile && content.content_type === "video") {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `module-${content.module_id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("module-videos")
        .upload(fileName, videoFile);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("module-videos")
          .getPublicUrl(fileName);
        contentUrl = publicUrl;
      }
    }
    
    await supabase.from("module_contents").insert({
      ...content,
      content_url: contentUrl,
    });
    await fetchModuleContents();
  };

  const handleDeleteModuleContent = async (contentId: string) => {
    await supabase.from("module_contents").delete().eq("id", contentId);
    await fetchModuleContents();
  };

  const handleUpdateProfile = async (updates: Partial<Profile>, avatarFile?: File) => {
    let avatarUrl = updates.avatar_url;
    
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        avatarUrl = publicUrl;
      }
    }
    
    await supabase
      .from("profiles")
      .update({ ...updates, avatar_url: avatarUrl })
      .eq("id", profile?.id);
    
    setProfile(prev => prev ? { ...prev, ...updates, avatar_url: avatarUrl } : null);
  };

  const handleSendAssignment = async (studentId: string, studentName: string, assignmentData: any) => {
    const { data: assignment } = await supabase
      .from("assignments")
      .insert({
        module_id: assignmentData.module_id,
        title: assignmentData.title,
        description: assignmentData.description,
        due_days: parseInt(assignmentData.due_days),
        max_score: parseInt(assignmentData.max_score),
      })
      .select()
      .single();

    if (assignment) {
      const moduleInfo = modules.find(m => m.id === assignmentData.module_id);
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", moduleInfo?.course_id)
        .single();

      if (enrollment) {
        await supabase.from("student_assignments").insert({
          assignment_id: assignment.id,
          student_id: studentId,
          enrollment_id: enrollment.id,
          status: "pending",
        });
      }
    }
    alert(`Assignment sent to ${studentName}`);
  };

  const handleCreateAssignment = async (assignmentData: any) => {
    const { data: assignment } = await supabase
      .from("assignments")
      .insert({
        module_id: assignmentData.module_id,
        title: assignmentData.title,
        description: assignmentData.description,
        due_days: parseInt(assignmentData.due_days),
        max_score: parseInt(assignmentData.max_score),
      })
      .select()
      .single();

    if (assignment) {
      let query = supabase
        .from("enrollments")
        .select("id, student_id")
        .eq("course_id", assignmentData.course_id)
        .eq("status", "active");

      if (!assignmentData.assign_to_all && assignmentData.student_id) {
        query = query.eq("student_id", assignmentData.student_id);
      }

      const { data: enrollments } = await query;

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
  };

  const handleGradeAssignment = async (assignmentId: string, score: number, feedback: string) => {
    await supabase
      .from("student_assignments")
      .update({ status: "graded", score, feedback })
      .eq("id", assignmentId);
  };

  const handleQuizCreate = async (quizData: any) => {
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({
        module_id: quizData.module_id,
        title: quizData.title,
        description: quizData.description,
        pass_score: quizData.pass_score,
      })
      .select()
      .single();

    if (quiz && !error) {
      const questionsWithQuizId = quizData.questions.map((q: any) => ({
        quiz_id: quiz.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
      }));
      
      await supabase.from("quiz_questions").insert(questionsWithQuizId);
    }
  };

  const handleQuizDelete = async (quizId: string) => {
    await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
    await supabase.from("quizzes").delete().eq("id", quizId);
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
          return <AdminCourses 
            courses={courses} 
            modules={modulesByCourse}
            moduleContents={moduleContents}
            onCourseAdd={handleAddCourse}
            onCourseUpdate={handleUpdateCourse}
            onCourseDelete={handleDeleteCourse}
            onModuleAdd={handleAddModule}
            onModuleDelete={handleDeleteModule}
            onModuleContentAdd={handleAddModuleContent}
            onModuleContentDelete={handleDeleteModuleContent}
          />;
        case "admin-students":
          return <AdminStudents 
            students={students} 
            onSendAssignment={handleSendAssignment}
            onViewProfile={(student) => setViewingStudent(student)}
          />;
        case "admin-payments":
          return <AdminPayments />;
        case "admin-assignments":
          return <AdminAssignments 
            courses={courses}
            modules={modules}
            onCreateAssignment={handleCreateAssignment}
            onGradeAssignment={handleGradeAssignment}
          />;
        case "admin-quizzes":
          return <AdminQuizzes 
            courses={courses}
            modules={modules}
            onQuizCreate={handleQuizCreate}
            onQuizDelete={handleQuizDelete}
          />;
        default:
          return <AdminDashboard onNavigate={setView} stats={{ students: 0, courses: 0, pendingPayments: 0, submittedAssignments: 0 }} />;
      }
    } else {
      const activeEnrollment = enrollments.find(e => e.status === "active");
      switch (view) {
        case "student-dashboard":
          return <StudentDashboard 
            profile={profile} 
            onNavigate={setView} 
            enrollments={enrollments} 
            progress={progress}
            modules={modules}
          />;
        case "student-courses":
          return <StudentCourses 
            profile={profile} 
            onNavigate={setView} 
            courses={courses} 
            enrollments={enrollments} 
            onEnroll={handleEnroll} 
          />;
        case "student-module":
          return <StudentModuleViewer 
            profile={profile} 
            enrollment={activeEnrollment || null} 
            modules={modulesByCourse[activeEnrollment?.course_id || ""] || []} 
            moduleContents={moduleContents}
            onNavigate={setView} 
            onProgressUpdate={handleProgressUpdate} 
          />;
        case "student-assignments":
          return <StudentAssignments profile={profile} />;
        case "student-payment":
          return <StudentPayments profile={profile} />;
        case "student-profile":
          return <StudentProfile profile={profile} onUpdate={handleUpdateProfile} />;
        default:
          return <StudentDashboard 
            profile={profile} 
            onNavigate={setView} 
            enrollments={enrollments} 
            progress={progress}
            modules={modules}
          />;
      }
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar profile={profile} currentView={view} onNavigate={setView} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
      {viewingStudent && (
        <AdminStudentProfile 
          student={viewingStudent} 
          onClose={() => setViewingStudent(null)} 
        />
      )}
    </div>
  );
}
