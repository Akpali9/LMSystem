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

function CircularProgress({ value, max, size = 80, strokeWidth = 6, label, showPercentage = true }: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center">
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
          {showPercentage && (
            <span className="text-lg font-bold text-foreground">{Math.round(progress)}%</span>
          )}
          <span className="text-xs text-muted-foreground">{value}/{max}</span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground mt-2 text-center">{label}</span>
      )}
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

// ─── Student Profile Page ────────────────────────────────────────────────────

function StudentProfile({ profile, onUpdate, enrollments, progress, modules }: { 
  profile: Profile; 
  onUpdate: (updates: Partial<Profile>, avatarFile?: File) => Promise<void>;
  enrollments: Enrollment[];
  progress: ModuleProgress[];
  modules: Module[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    fetchStudentProfile();
  }, [profile.id]);

  const fetchStudentProfile = async () => {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .single();
    if (data) {
      setBio(data.bio || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setDateOfBirth(data.date_of_birth || "");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    await onUpdate({ full_name: fullName }, avatarFile || undefined);
    
    await supabase
      .from("student_profiles")
      .upsert({
        user_id: profile.id,
        bio,
        phone,
        address,
        date_of_birth: dateOfBirth || null,
        updated_at: new Date().toISOString(),
      });
    
    setIsEditing(false);
    setLoading(false);
  };

  const activeEnrollments = enrollments.filter(e => e.status === "active");
  const passedCount = progress.filter(p => p.status === "passed").length;
  const totalModules = modules.length;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your personal information and view your progress</p>
      </div>

      <Card className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar name={fullName} size="lg" src={avatarPreview || undefined} />
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                  <Camera className="w-4 h-4 text-primary" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isEditing ? "Click camera icon to change photo" : "Profile picture"}
            </p>
          </div>

          <div className="flex-1 space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Your full name"
                  required
                />
                <Input label="Email" value={profile.email} disabled />
                <Textarea label="Bio" value={bio} onChange={setBio} placeholder="Tell us about yourself..." rows={3} />
                <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="+234 XXX XXX XXXX" />
                <Textarea label="Address" value={address} onChange={setAddress} placeholder="Your address" rows={2} />
                <Input label="Date of Birth" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold text-foreground">{profile.full_name}</p>
                </div>
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="text-lg font-semibold text-foreground">{profile.email}</p>
                </div>
                {bio && (
                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="text-foreground">{bio}</p>
                  </div>
                )}
                {phone && (
                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground">{phone}</p>
                  </div>
                )}
                {address && (
                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground">{address}</p>
                  </div>
                )}
                {dateOfBirth && (
                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="text-foreground">{formatDate(dateOfBirth)}</p>
                  </div>
                )}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-foreground">{formatDate(profile.created_at)}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-6 py-2 bg-accent/15 text-accent font-medium rounded-xl hover:bg-accent/25 transition-colors flex items-center gap-2 w-fit"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Your Learning Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 flex flex-col items-center">
            <CircularProgress value={activeEnrollments.length} max={10} size={80} label="Active Courses" />
          </Card>
          <Card className="p-6 flex flex-col items-center">
            <CircularProgress value={passedCount} max={totalModules || 1} size={80} label="Modules Passed" />
          </Card>
          <Card className="p-6 flex flex-col items-center">
            <CircularProgress value={totalModules > 0 ? Math.round((passedCount / totalModules) * 100) : 0} max={100} size={80} label="Overall Progress" />
          </Card>
        </div>
      </div>

      {activeEnrollments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Courses</h2>
          <div className="space-y-4">
            {activeEnrollments.map((enrollment) => {
              const courseModules = modules.filter(m => m.course_id === enrollment.course_id);
              const passedModules = progress.filter(p => 
                p.enrollment_id === enrollment.id && p.status === "passed"
              );
              
              return (
                <Card key={enrollment.id} className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img 
                        src={enrollment.course?.thumbnail_url} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-foreground">{enrollment.course?.title}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <StatusBadge status={enrollment.status} />
                        <span className="text-xs text-muted-foreground">
                          {passedModules.length}/{courseModules.length} modules
                        </span>
                      </div>
                    </div>
                    <CircularProgress 
                      value={passedModules.length} 
                      max={courseModules.length || 1} 
                      size={70} 
                      strokeWidth={5}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Dashboard ─────────────────────────────────────────────────────────────

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
                    <div className="flex items-center gap-4">
                      <ProgressBar value={passedCount} max={totalModules || 5} className="flex-1" />
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {passedCount}/{totalModules || 5}
                      </span>
                    </div>
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
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: "", type: 'success' });

  const enrolledCourseIds = enrollments.map(e => e.course_id);
  const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
  
  const activeEnrollments = enrollments.filter(e => e.status === "active");
  const pendingEnrollments = enrollments.filter(e => e.status === "pending_payment" || e.status === "payment_submitted");

  const handleEnrollSubmit = async () => {
    if (!selectedCourse || !receiptFile) return;
    setUploading(true);
    setSubmitting(true);
    
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${profile.id}-${selectedCourse.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile);
      
      if (uploadError) {
        setSubmissionStatus({ show: true, message: "Failed to upload receipt. Please try again.", type: 'error' });
        setUploading(false);
        setSubmitting(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          student_id: profile.id,
          course_id: selectedCourse.id,
          status: "pending_payment",
          current_module_index: 0,
        })
        .select()
        .single();

      if (enrollmentError) {
        setSubmissionStatus({ show: true, message: "Failed to create enrollment. Please try again.", type: 'error' });
        setUploading(false);
        setSubmitting(false);
        return;
      }

      if (enrollment) {
        const { error: paymentError } = await supabase.from("payment_receipts").insert({
          enrollment_id: enrollment.id,
          student_id: profile.id,
          receipt_url: publicUrl,
          amount: selectedCourse.price,
          status: "pending",
        });
        
        if (paymentError) {
          setSubmissionStatus({ show: true, message: "Payment recorded but please contact admin.", type: 'error' });
        } else {
          setSubmissionStatus({ 
            show: true, 
            message: `✅ Enrollment request submitted for ${selectedCourse.title}! Your payment receipt is pending admin approval. You will be notified once approved.`, 
            type: 'success' 
          });
        }
      }

      await onEnroll(selectedCourse.id);
      
      setTimeout(() => {
        setSubmissionStatus({ show: false, message: "", type: 'success' });
      }, 5000);
      
      setShowEnroll(false);
      setSelectedCourse(null);
      setReceiptFile(null);
    } catch (error) {
      setSubmissionStatus({ show: true, message: "An error occurred. Please try again.", type: 'error' });
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_submitted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '✅ Active - You have access!';
      case 'pending_payment':
        return '⏳ Pending Payment - Please upload receipt';
      case 'payment_submitted':
        return '📤 Payment Submitted - Awaiting admin approval';
      case 'completed':
        return '🎉 Completed - Course finished';
      case 'expired':
        return '❌ Expired - Access ended';
      default:
        return status;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {submissionStatus.show && (
        <div className={cn(
          "fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg animate-in slide-in-from-top-2 max-w-[90vw] md:max-w-md",
          submissionStatus.type === 'success' ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        )}>
          <div className="flex items-center gap-3">
            {submissionStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className={cn(
              "text-sm",
              submissionStatus.type === 'success' ? "text-green-800" : "text-red-800"
            )}>
              {submissionStatus.message}
            </p>
            <button 
              onClick={() => setSubmissionStatus({ show: false, message: "", type: 'success' })}
              className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Courses
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your enrollments and track payment status.</p>
        </div>
        <button
          onClick={() => setShowEnroll(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Enroll in Course
        </button>
      </div>

      {activeEnrollments.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Active Courses ({activeEnrollments.length})
          </h2>
          <div className="space-y-4">
            {activeEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <div className="w-full sm:w-20 h-40 sm:h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img src={enrollment.course?.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                      <div>
                        <p className="font-bold text-foreground text-base md:text-lg">{enrollment.course?.title}</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                          Enrolled: {formatDate(enrollment.enrolled_at || "")} · Expires: {formatDate(enrollment.expires_at || "")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", getStatusBadgeColor(enrollment.status))}>
                          {getStatusText(enrollment.status)}
                        </span>
                      </div>
                    </div>
                    <ProgressBar value={enrollment.current_module_index + 1} max={5} className="mt-4" />
                    <p className="text-xs text-muted-foreground mt-1">Module {enrollment.current_module_index + 1} of 5</p>
                    <button
                      onClick={() => onNavigate("student-module")}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs md:text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" /> Continue Learning
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pendingEnrollments.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" /> Pending Approvals ({pendingEnrollments.length})
          </h2>
          <div className="space-y-4">
            {pendingEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-4 md:p-6 bg-yellow-50/30 border-yellow-200">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <div className="w-full sm:w-20 h-40 sm:h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img src={enrollment.course?.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                      <div>
                        <p className="font-bold text-foreground text-base md:text-lg">{enrollment.course?.title}</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                          Requested: {formatDate(enrollment.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", getStatusBadgeColor(enrollment.status))}>
                          {getStatusText(enrollment.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-100/50 rounded-lg">
                      <p className="text-sm text-yellow-800 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Your enrollment is pending admin approval. You will receive access once your payment is verified.
                      </p>
                    </div>
                    {enrollment.status === "pending_payment" && (
                      <button
                        onClick={() => {
                          setSelectedCourse(enrollment.course || null);
                          setShowEnroll(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" /> Upload Payment Receipt
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {availableCourses.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Explore Programs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {availableCourses.map((course) => (
              <div key={course.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-48 md:h-56 bg-muted overflow-hidden">
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
                <div className="p-4 md:p-5">
                  <h3 className="font-semibold text-foreground text-base md:text-lg mb-2 leading-snug">{course.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {formatNaira(course.price)}
                    </span>
                    <button
                      onClick={() => { setSelectedCourse(course); setShowEnroll(true); }}
                      className="px-4 md:px-5 py-2 md:py-2.5 bg-accent text-accent-foreground text-sm font-semibold rounded-xl hover:bg-accent/80 transition-colors"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeEnrollments.length === 0 && pendingEnrollments.length === 0 && availableCourses.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No courses available at the moment.</p>
        </Card>
      )}

      <Modal open={showEnroll} onClose={() => { setShowEnroll(false); setSelectedCourse(null); setReceiptFile(null); }} title="Enroll in a Course">
        {!selectedCourse ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">Select a course to enroll:</p>
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
              <p className="text-sm text-muted-foreground mt-1">{formatNaira(selectedCourse.price)} · {selectedCourse.duration_months} months access</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Info className="w-4 h-4" /> How it works:
              </p>
              <ol className="mt-2 space-y-1 text-sm text-blue-700">
                <li>1. Make payment to the account below</li>
                <li>2. Upload your payment receipt</li>
                <li>3. Admin will verify and activate your access within 24 hours</li>
                <li>4. You'll receive email notification once approved</li>
              </ol>
            </div>
            
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" /> Payment Details
              </p>
              <p className="text-sm text-muted-foreground">Transfer <strong>{formatNaira(selectedCourse.price)}</strong> to:</p>
              <div className="bg-card rounded-lg p-3 font-mono text-sm space-y-1 border border-border">
                <p><span className="text-muted-foreground">Bank:</span> Pruta Academy</p>
                <p><span className="text-muted-foreground">Account:</span> 0123456789</p>
                <p><span className="text-muted-foreground">Bank:</span> First Bank of Nigeria</p>
                <p><span className="text-muted-foreground">Reference:</span> {profile.id.slice(0, 8).toUpperCase()}-{selectedCourse.id.slice(0, 8).toUpperCase()}</p>
              </div>
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
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Enrollment Request</>}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Student Module Viewer ────────────────────────────────────────────────────

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
  const [progressData, setProgressData] = useState<ModuleProgress[]>([]);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizAttempted, setQuizAttempted] = useState(false);

  const currentModule = modules[selectedModuleIndex] || modules[0];
  const currentContent = moduleContents.find(c => c.module_id === currentModule?.id);

  useEffect(() => {
    if (enrollment) {
      fetchProgress();
      fetchQuizForModule();
    }
  }, [enrollment, currentModule]);

  const fetchProgress = async () => {
    if (!enrollment) return;
    const { data } = await supabase
      .from("module_progress")
      .select("*")
      .eq("enrollment_id", enrollment.id);
    if (data) setProgressData(data as ModuleProgress[]);
  };

  const fetchQuizForModule = async () => {
    if (!currentModule) return;
    setLoadingQuiz(true);
    
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("*")
      .eq("module_id", currentModule.id)
      .single();
    
    if (quiz) {
      setQuizData(quiz);
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("order_index");
      if (questions) setQuizQuestions(questions);
      
      const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quiz.id)
        .eq("student_id", profile.id)
        .eq("enrollment_id", enrollment?.id)
        .single();
      
      if (attempt) {
        setQuizAttempted(true);
        setQuizSubmitted(true);
        setQuizScore(attempt.score);
      }
    }
    setLoadingQuiz(false);
  };

  const handleModuleSelect = (index: number) => {
    const currentIndex = enrollment?.current_module_index || 0;
    if (index <= currentIndex + 1) {
      setSelectedModuleIndex(index);
      setShowQuiz(false);
      setQuizSubmitted(false);
      setQuizAnswers({});
      setQuizScore(0);
      setQuizAttempted(false);
      fetchQuizForModule();
    }
  };

  const isModuleLocked = (index: number) => {
    const currentIndex = enrollment?.current_module_index || 0;
    if (index === 0) return false;
    const prevModule = modules[index - 1];
    if (!prevModule) return false;
    const prevProgress = progressData.find(p => p.module_id === prevModule.id);
    return !(prevProgress?.status === "passed");
  };

  const isModuleCompleted = (moduleId: string) => {
    const prog = progressData.find(p => p.module_id === moduleId);
    return prog?.status === "passed";
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || quizQuestions.length === 0) return;
    
    let correct = 0;
    const answers: Record<number, number> = {};
    
    quizQuestions.forEach((q, index) => {
      const userAnswer = quizAnswers[index];
      answers[index] = userAnswer;
      if (userAnswer === q.correct_answer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    
    await supabase.from("quiz_attempts").insert({
      quiz_id: quizData.id,
      student_id: profile.id,
      enrollment_id: enrollment?.id,
      score: score,
      passed: score >= (quizData.pass_score || 70),
      answers: answers,
      completed_at: new Date().toISOString(),
    });
    
    if (score >= (quizData.pass_score || 70)) {
      await onProgressUpdate(currentModule.id, "passed", score);
    } else {
      await onProgressUpdate(currentModule.id, "failed", score);
    }
    await fetchProgress();
  };

  if (!enrollment || !currentModule) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading module...</p>
      </div>
    );
  }

  const moduleProgress = progressData.find(p => p.module_id === currentModule.id);

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-64 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-4 shrink-0 overflow-y-auto max-h-[calc(100vh-80px)]">
        <h3 className="font-semibold text-foreground mb-3 text-sm">Course Modules</h3>
        <div className="space-y-1">
          {modules.map((module, index) => {
            const isLocked = isModuleLocked(index);
            const isActive = index === selectedModuleIndex;
            const isCompleted = isModuleCompleted(module.id);
            const prog = progressData.find(p => p.module_id === module.id);
            
            return (
              <button
                key={module.id}
                onClick={() => handleModuleSelect(index)}
                disabled={isLocked}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                  isActive ? "bg-accent/20 text-accent font-medium border border-accent/30" : "text-foreground/70 hover:bg-muted",
                  isLocked && "opacity-50 cursor-not-allowed",
                  isCompleted && !isActive && "bg-green-50 text-green-700"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                  isCompleted ? "bg-green-100 text-green-600" : 
                  isActive ? "bg-accent/20 text-accent" : 
                  "bg-muted/50 text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="truncate flex-1">{module.title}</span>
                {prog?.status === "passed" && (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0.5">✓</Badge>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressData.filter(p => p.status === "passed").length}/{modules.length}</span>
          </div>
          <ProgressBar 
            value={progressData.filter(p => p.status === "passed").length} 
            max={modules.length} 
            className="mt-1" 
          />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="info">Module {selectedModuleIndex + 1} of {modules.length}</Badge>
            {moduleProgress?.status === "passed" && <Badge variant="success">✅ Passed</Badge>}
            {moduleProgress?.status === "failed" && <Badge variant="danger">❌ Failed</Badge>}
            {isModuleLocked(selectedModuleIndex) && <Badge variant="muted">🔒 Locked</Badge>}
            {quizData && <Badge variant="info">📝 Quiz: {quizData.title}</Badge>}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            {currentModule.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pass with ≥{currentModule.pass_score}% to unlock the next module.
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
          <button
            onClick={() => setShowQuiz(false)}
            className={cn(
              "px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              !showQuiz ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            📺 Content
          </button>
          {quizData && quizQuestions.length > 0 && (
            <button
              onClick={() => setShowQuiz(true)}
              className={cn(
                "px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                showQuiz ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              📝 Quiz {quizAttempted && "✅"}
            </button>
          )}
        </div>

        {!showQuiz && (
          <div className="space-y-6">
            {currentContent ? (
              <>
                {currentContent.content_type === "video" && currentContent.content_url && (
                  <SecureVideoPlayer 
                    url={currentContent.content_url} 
                    title={currentContent.title}
                    onProgress={setVideoProgress}
                  />
                )}
                
                {currentContent.content_type === "text" && currentContent.content_text && (
                  <Card className="p-4 md:p-6">
                    <h3 className="font-semibold text-foreground mb-3 text-lg">{currentContent.title}</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p className="whitespace-pre-wrap text-sm md:text-base">{currentContent.content_text}</p>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-4 md:p-6 text-center">
                <div className="py-8">
                  <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">No Content Available</h3>
                  <p className="text-sm text-muted-foreground">
                    The instructor hasn't added content for this module yet. Please check back later.
                  </p>
                </div>
              </Card>
            )}
            
            {!isModuleLocked(selectedModuleIndex) && currentContent && quizData && quizQuestions.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm"
                >
                  Take Module Quiz <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {showQuiz && (
          <div className="space-y-5">
            {isModuleLocked(selectedModuleIndex) ? (
              <Card className="p-8 text-center">
                <Lock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Module Locked</h3>
                <p className="text-sm text-muted-foreground">
                  Complete the previous module to unlock this quiz.
                </p>
              </Card>
            ) : loadingQuiz ? (
              <Card className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                <p className="text-muted-foreground mt-4">Loading quiz...</p>
              </Card>
            ) : !quizData || quizQuestions.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">No Quiz Available</h3>
                <p className="text-sm text-muted-foreground">
                  The instructor hasn't created a quiz for this module yet.
                </p>
              </Card>
            ) : (
              <Card className="p-4 md:p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground text-lg">{quizData.title}</h3>
                  {quizData.description && (
                    <p className="text-sm text-muted-foreground mt-1">{quizData.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Pass score: <span className="font-semibold text-accent">{quizData.pass_score}%</span>
                  </p>
                </div>
                
                {quizQuestions.map((q, qi) => (
                  <div key={q.id} className="mb-6 last:mb-0 border-b border-border pb-4 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-foreground mb-3">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt: string, oi: number) => {
                        const selected = quizAnswers[qi] === oi;
                        const isCorrect = oi === q.correct_answer;
                        const showCorrect = quizSubmitted && isCorrect;
                        const showWrong = quizSubmitted && selected && !isCorrect;
                        return (
                          <button
                            key={oi}
                            onClick={() => !quizSubmitted && setQuizAnswers((p) => ({ ...p, [qi]: oi }))}
                            disabled={quizSubmitted || quizAttempted}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                              quizSubmitted || quizAttempted
                                ? showCorrect ? "border-green-400 bg-green-50 text-green-800"
                                  : showWrong ? "border-red-400 bg-red-50 text-red-800"
                                  : "border-border text-muted-foreground opacity-60"
                                : selected
                                ? "border-accent bg-accent/10 text-foreground"
                                : "border-border hover:border-primary/40 text-foreground"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {(quizSubmitted || quizAttempted) && showCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {(quizSubmitted || quizAttempted) && showWrong && <XCircle className="w-4 h-4 text-red-600" />}
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {quizAttempted || quizSubmitted ? (
                  <div className={cn(
                    "mt-6 p-5 rounded-xl flex flex-col md:flex-row items-center gap-4",
                    quizScore >= (quizData.pass_score || 70) ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  )}>
                    {quizScore >= (quizData.pass_score || 70)
                      ? <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                      : <XCircle className="w-8 h-8 text-red-600 shrink-0" />}
                    <div className="flex-1 text-center md:text-left">
                      <p className={cn("font-bold text-lg", quizScore >= (quizData.pass_score || 70) ? "text-green-800" : "text-red-800")}>
                        {quizScore}% — {quizScore >= (quizData.pass_score || 70) ? "Quiz Passed! 🎉" : "Not Passed"}
                      </p>
                      <p className={cn("text-sm mt-0.5", quizScore >= (quizData.pass_score || 70) ? "text-green-700" : "text-red-700")}>
                        {quizScore >= (quizData.pass_score || 70)
                          ? "The next module has been unlocked. Great work!"
                          : `You need ${quizData.pass_score}% to pass. Review the content and try again.`}
                      </p>
                    </div>
                    {quizScore < (quizData.pass_score || 70) && (
                      <button
                        onClick={() => { 
                          setQuizSubmitted(false); 
                          setQuizAnswers({}); 
                          setQuizScore(0);
                          setQuizAttempted(false);
                          supabase
                            .from("quiz_attempts")
                            .delete()
                            .eq("quiz_id", quizData.id)
                            .eq("student_id", profile.id)
                            .eq("enrollment_id", enrollment?.id);
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Retry Quiz
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="mt-6 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                  >
                    Submit Quiz
                  </button>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
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

  const handleSubmitAssignment = async (assignmentId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${assignmentId}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("assignments")
      .upload(fileName, file);
    
    if (uploadError) {
      alert("Failed to upload assignment");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("assignments")
      .getPublicUrl(fileName);

    await supabase
      .from("student_assignments")
      .update({ status: "submitted", submission_url: publicUrl, submitted_at: new Date().toISOString() })
      .eq("id", assignmentId);
    
    fetchAssignments();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Assignments
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Your assigned work from all enrolled courses.</p>
      </div>
      <div className="space-y-4">
        {assignments.map((sa) => (
          <Card key={sa.id} className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">{sa.assignment?.title}</h3>
                  <StatusBadge status={sa.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{sa.assignment?.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
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
                    <div 
                      className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-accent transition-colors"
                      onClick={() => document.getElementById(`assignment-${sa.id}`)?.click()}
                    >
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-foreground">Click to upload your submission</p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, ZIP</p>
                    </div>
                    <input
                      id={`assignment-${sa.id}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.zip"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleSubmitAssignment(sa.id, e.target.files[0]);
                        }
                      }}
                    />
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

// ─── Student Payments (FIXED) ─────────────────────────────────────────────────

function StudentPayments({ profile }: { profile: Profile }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchPendingEnrollments();
    
    const subscription = supabase
      .channel("student-payments")
      .on("postgres_changes", 
        { 
          event: "*", 
          schema: "public", 
          table: "payment_receipts", 
          filter: `student_id=eq.${profile.id}` 
        }, 
        () => fetchPayments()
      )
      .subscribe();

    return () => { 
      subscription.unsubscribe(); 
    };
  }, [profile.id]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("payment_receipts")
        .select(`
          *,
          enrollment:enrollment_id (
            id,
            course_id,
            course:course_id (
              id,
              title,
              price
            )
          )
        `)
        .eq("student_id", profile.id)
        .order("submitted_at", { ascending: false });
      
      if (fetchError) {
        console.error("Error fetching payments:", fetchError);
        setError("Failed to load payment history");
        setLoading(false);
        return;
      }
      
      if (data) {
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while fetching payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEnrollments = async () => {
    const { data } = await supabase
      .from("enrollments")
      .select("*, course:course_id(*)")
      .eq("student_id", profile.id)
      .in("status", ["pending_payment", "payment_submitted"]);
    
    if (data) {
      setPendingEnrollments(data as Enrollment[]);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅ Approved';
      case 'pending':
        return '⏳ Pending Review';
      case 'rejected':
        return '❌ Rejected';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
          <p className="text-muted-foreground mt-4">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Payments
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your payment receipts and enrollment status.</p>
      </div>

      {pendingEnrollments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">Pending Payment Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                You have {pendingEnrollments.length} enrollment{pendingEnrollments.length > 1 ? 's' : ''} that need payment confirmation.
              </p>
              <button
                onClick={() => window.location.href = "/student-courses"}
                className="mt-2 text-sm text-yellow-800 font-medium hover:underline flex items-center gap-1"
              >
                Go to My Courses <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="p-4 md:p-6">
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
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Payment History</h2>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchPayments}
              className="mt-2 text-sm text-red-600 font-medium hover:underline"
            >
              Try Again
            </button>
          </div>
        )}

        {payments.length === 0 && !error ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center">
              <DollarSign className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No payments submitted yet.</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                When you enroll in a course, you'll be asked to upload a payment receipt here.
              </p>
              <button
                onClick={() => window.location.href = "/student-courses"}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          </Card>
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {formatNaira(p.amount)} 
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          — {p.enrollment?.course?.title || "Unknown Course"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted: {formatDate(p.submitted_at)}
                      </p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                      getStatusBadgeColor(p.status)
                    )}>
                      {getStatusText(p.status)}
                    </span>
                  </div>
                  {p.admin_notes && (
                    <div className="mt-2 p-2 bg-muted rounded-lg text-xs text-muted-foreground">
                      Admin note: {p.admin_notes}
                    </div>
                  )}
                  {p.receipt_url && (
                    <a 
                      href={p.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      <Eye className="w-3 h-3" /> View Receipt
                    </a>
                  )}
                </div>
              </div>
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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Platform overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold text-foreground mb-4 text-lg md:text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add new course", view: "admin-courses" as View, icon: Plus },
              { label: "Review payments", view: "admin-payments" as View, icon: DollarSign },
              { label: "Create assignment", view: "admin-assignments" as View, icon: ClipboardList },
              { label: "Manage students", view: "admin-students" as View, icon: Users },
              { label: "Create quiz", view: "admin-quizzes" as View, icon: HelpCircle },
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

function AdminCourses({ courses, modules, moduleContents, onCourseAdd, onCourseUpdate, onCourseDelete, onModuleAdd, onModuleDelete, onModuleContentAdd, onModuleContentDelete }: { 
  courses: Course[]; 
  modules: Record<string, Module[]>;
  moduleContents: ModuleContent[];
  onCourseAdd: (course: Omit<Course, "id" | "created_at">, thumbnailFile?: File) => Promise<void>;
  onCourseUpdate: (id: string, updates: Partial<Course>, thumbnailFile?: File) => Promise<void>;
  onCourseDelete: (id: string) => Promise<void>;
  onModuleAdd: (module: Omit<Module, "id" | "created_at">) => Promise<void>;
  onModuleDelete: (moduleId: string, courseId: string) => Promise<void>;
  onModuleContentAdd: (content: Omit<ModuleContent, "id" | "created_at">, videoFile?: File) => Promise<void>;
  onModuleContentDelete: (contentId: string) => Promise<void>;
}) {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", price: "", duration_months: "3" });
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", pass_score: "75" });
  const [contentForm, setContentForm] = useState({ title: "", content_type: "video", content_text: "" });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; title: string } | null>(null);

  const openCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({ title: "", description: "", price: "", duration_months: "3" });
    setThumbnailFile(null);
    setShowCourseModal(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      price: course.price.toString(),
      duration_months: course.duration_months.toString(),
    });
    setThumbnailFile(null);
    setShowCourseModal(true);
  };

  const handleSaveCourse = async () => {
    setLoading(true);
    if (editingCourse) {
      await onCourseUpdate(editingCourse.id, {
        title: courseForm.title,
        description: courseForm.description,
        price: parseFloat(courseForm.price),
        duration_months: parseInt(courseForm.duration_months),
      }, thumbnailFile || undefined);
    } else {
      await onCourseAdd({
        title: courseForm.title,
        description: courseForm.description,
        price: parseFloat(courseForm.price),
        duration_months: parseInt(courseForm.duration_months),
        currency: "NGN",
        is_active: true,
      }, thumbnailFile || undefined);
    }
    setShowCourseModal(false);
    setLoading(false);
  };

  const handleDeleteCourse = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    await onCourseDelete(deleteConfirm.id);
    setDeleteConfirm(null);
    setLoading(false);
  };

  const handleDeleteModule = async (moduleId: string, courseId: string) => {
    if (confirm("Are you sure you want to delete this module? All content will be lost.")) {
      await onModuleDelete(moduleId, courseId);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await onModuleContentDelete(contentId);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            Courses & Modules
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your course catalog, modules, and video content.</p>
        </div>
        <button
          onClick={openCreateCourse}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => {
          const courseModules = modules[course.id] || [];
          return (
            <Card key={course.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                <div className="w-full md:w-20 h-40 md:h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img 
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format"} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base md:text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success">{formatNaira(course.price)}</Badge>
                      <Badge variant="info">{course.duration_months}mo</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
                    <span className="text-xs text-muted-foreground">{courseModules.length} modules</span>
                    <button
                      onClick={() => { setActiveCourse(course); setShowModuleModal(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Module
                    </button>
                    <button
                      onClick={() => openEditCourse(course)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'course', id: course.id, title: course.title })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                  {courseModules.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {courseModules.map((m) => {
                        const content = moduleContents.find(c => c.module_id === m.id);
                        return (
                          <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/30 rounded-lg p-2 gap-2">
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                              {content?.content_type === "video" ? (
                                <Video className="w-3.5 h-3.5 text-accent" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-accent" />
                              )}
                              <span className="text-xs text-foreground">{m.title}</span>
                              <Badge variant="info">Pass: {m.pass_score}%</Badge>
                              {content && (
                                <Badge variant={content.content_type === "video" ? "success" : "muted"}>
                                  {content.content_type === "video" ? "🎬 Video" : "📄 Text"}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {!content && (
                                <button
                                  onClick={() => { setActiveModule(m); setShowContentModal(true); }}
                                  className="flex items-center gap-1 px-2 py-1 bg-accent/15 text-accent text-xs rounded-lg hover:bg-accent/25 transition-colors"
                                >
                                  <Video className="w-3 h-3" /> Add Video
                                </button>
                              )}
                              {content && (
                                <button
                                  onClick={() => handleDeleteContent(content.id)}
                                  className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove Content
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteModule(m.id, course.id)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={showCourseModal} onClose={() => setShowCourseModal(false)} title={editingCourse ? "Edit Course" : "Create New Course"}>
        <div className="space-y-4">
          <Input label="Course Title" value={courseForm.title} onChange={(v) => setCourseForm((p) => ({ ...p, title: v }))} placeholder="e.g. Advanced Data Science" required />
          <Textarea label="Description" value={courseForm.description} onChange={(v) => setCourseForm((p) => ({ ...p, description: v }))} placeholder="What will students learn?" required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Course Thumbnail</label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => document.getElementById("thumbnail-upload")?.click()}
            >
              {thumbnailFile ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-foreground">{thumbnailFile.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setThumbnailFile(null); }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : editingCourse ? (
                <p className="text-sm text-muted-foreground">Leave empty to keep current thumbnail</p>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload course thumbnail</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG · Recommended: 600x340px</p>
                </>
              )}
              <input
                id="thumbnail-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₦)" type="number" value={courseForm.price} onChange={(v) => setCourseForm((p) => ({ ...p, price: v }))} placeholder="50000" required />
            <Input label="Duration (months)" type="number" value={courseForm.duration_months} onChange={(v) => setCourseForm((p) => ({ ...p, duration_months: v }))} required />
          </div>
          <button
            onClick={handleSaveCourse}
            disabled={loading || !courseForm.title || !courseForm.price}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingCourse ? "Update Course" : "Create Course")}
          </button>
        </div>
      </Modal>

      <Modal open={showModuleModal} onClose={() => setShowModuleModal(false)} title={`Add Module — ${activeCourse?.title}`}>
        <div className="space-y-4">
          <Input label="Module Title" value={moduleForm.title} onChange={(v) => setModuleForm((p) => ({ ...p, title: v }))} placeholder="e.g. Python Foundations" required />
          <Textarea label="Module Description" value={moduleForm.description} onChange={(v) => setModuleForm((p) => ({ ...p, description: v }))} placeholder="Brief overview of this module..." />
          <Input label="Pass Score (%)" type="number" value={moduleForm.pass_score} onChange={(v) => setModuleForm((p) => ({ ...p, pass_score: v }))} placeholder="75" required />
          <button
            onClick={async () => {
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
            }}
            disabled={loading || !moduleForm.title}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Module"}
          </button>
        </div>
      </Modal>

      <Modal open={showContentModal} onClose={() => setShowContentModal(false)} title={`Add Content — ${activeModule?.title}`}>
        <div className="space-y-4">
          <Input label="Content Title" value={contentForm.title} onChange={(v) => setContentForm((p) => ({ ...p, title: v }))} placeholder="e.g. Introduction Video" required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Content Type</label>
            <select
              value={contentForm.content_type}
              onChange={(e) => setContentForm((p) => ({ ...p, content_type: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="video">Video (DRM Protected)</option>
              <option value="text">Text Lesson</option>
            </select>
          </div>
          {contentForm.content_type === "video" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Upload Video</label>
              <div 
                className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-accent transition-colors cursor-pointer"
                onClick={() => document.getElementById("video-upload")?.click()}
              >
                {videoFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-foreground">{videoFile.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload module video</p>
                    <p className="text-xs text-muted-foreground">MP4, MOV · Max 500MB · DRM Protected</p>
                  </>
                )}
                <input
                  id="video-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </div>
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Videos are protected - Students cannot download or share
              </p>
            </div>
          )}
          {contentForm.content_type === "text" && (
            <Textarea 
              label="Lesson Content" 
              value={contentForm.content_text} 
              onChange={(v) => setContentForm((p) => ({ ...p, content_text: v }))} 
              placeholder="Write your lesson content here..." 
              rows={6} 
              required 
            />
          )}
          <button
            onClick={async () => {
              if (!activeModule) return;
              setLoading(true);
              await onModuleContentAdd({
                module_id: activeModule.id,
                title: contentForm.title,
                content_type: contentForm.content_type as "video" | "text",
                content_text: contentForm.content_type === "text" ? contentForm.content_text : undefined,
                order_index: 0,
              }, videoFile || undefined);
              setShowContentModal(false);
              setContentForm({ title: "", content_type: "video", content_text: "" });
              setVideoFile(null);
              setLoading(false);
            }}
            disabled={loading || !contentForm.title || (contentForm.content_type === "video" && !videoFile) || (contentForm.content_type === "text" && !contentForm.content_text)}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Content"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete <strong>{deleteConfirm?.title}</strong>?
            {deleteConfirm?.type === 'course' && " This will also delete all modules and enrollments for this course."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCourse}
              className="flex-1 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Admin Students (with Card View) ─────────────────────────────────────────

function AdminStudents({ students, onSendAssignment, onViewProfile }: { 
  students: Profile[];
  onSendAssignment: (studentId: string, studentName: string, assignmentData: any) => Promise<void>;
  onViewProfile: (student: Profile) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    module_id: "",
    due_days: "7",
    max_score: "100",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentProgress, setStudentProgress] = useState<Record<string, { passed: number; total: number; enrollments: any[] }>>({});

  useEffect(() => {
    fetchCoursesAndModules();
    fetchAllStudentProgress();
  }, []);

  const fetchCoursesAndModules = async () => {
    const [coursesRes, modulesRes] = await Promise.all([
      supabase.from("courses").select("*"),
      supabase.from("modules").select("*"),
    ]);
    if (coursesRes.data) setCourses(coursesRes.data);
    if (modulesRes.data) setModules(modulesRes.data);
  };

  const fetchAllStudentProgress = async () => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, student_id, course_id, status, course:course_id(*)")
      .eq("status", "active");

    if (!enrollments) return;

    const enrollmentIds = enrollments.map(e => e.id);
    const { data: progressData } = await supabase
      .from("module_progress")
      .select("*")
      .in("enrollment_id", enrollmentIds);

    if (!progressData) return;

    const progressMap: Record<string, { passed: number; total: number; enrollments: any[] }> = {};
    
    enrollments.forEach((enrollment) => {
      const studentId = enrollment.student_id;
      const studentModules = modules.filter(m => m.course_id === enrollment.course_id);
      const total = studentModules.length;
      const passed = progressData.filter(p => p.enrollment_id === enrollment.id && p.status === "passed").length;
      
      if (!progressMap[studentId]) {
        progressMap[studentId] = { passed: 0, total: 0, enrollments: [] };
      }
      progressMap[studentId].passed += passed;
      progressMap[studentId].total += total;
      progressMap[studentId].enrollments.push(enrollment);
    });

    setStudentProgress(progressMap);
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendAssignment = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    await onSendAssignment(selectedStudent.id, selectedStudent.full_name, assignmentData);
    setShowAssignmentModal(false);
    setAssignmentData({ title: "", description: "", module_id: "", due_days: "7", max_score: "100" });
    setLoading(false);
  };

  const availableModules = modules.filter(m => m.course_id === assignmentData.module_id);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Students
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">View, manage, and track student progress.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((student) => {
          const progress = studentProgress[student.id] || { passed: 0, total: 0, enrollments: [] };
          const pct = progress.total > 0 ? Math.round((progress.passed / progress.total) * 100) : 0;
          
          return (
            <Card key={student.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar name={student.full_name} size="lg" src={student.avatar_url} />
                <h3 className="font-semibold text-foreground mt-3 text-sm">{student.full_name}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-full">{student.email}</p>
                
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="default">{student.role}</Badge>
                  <Badge variant="info">{progress.enrollments.length} courses</Badge>
                </div>
                
                <div className="mt-4 w-full">
                  <CircularProgress value={progress.passed} max={progress.total || 1} size={80} />
                  <p className="text-xs text-muted-foreground mt-2">
                    {progress.passed}/{progress.total} modules ({pct}%)
                  </p>
                </div>
                
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 w-full">
                  <button
                    onClick={() => onViewProfile(student)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </button>
                  <button
                    onClick={() => { setSelectedStudent(student); setShowAssignmentModal(true); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-accent/15 text-accent text-xs rounded-lg hover:bg-accent/25 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Assignment
                  </button>
                </div>
                
                <div className="mt-3 w-full border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">Joined {formatDate(student.created_at)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No students found.</p>
        </Card>
      )}

      <Modal open={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} title={`Send Assignment to ${selectedStudent?.full_name}`}>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-xl flex items-center gap-3">
            <Avatar name={selectedStudent?.full_name || ""} size="sm" />
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedStudent?.full_name}</p>
              <p className="text-xs text-muted-foreground">{selectedStudent?.email}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Course / Module</label>
            <select
              value={assignmentData.module_id}
              onChange={(e) => setAssignmentData(p => ({ ...p, module_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm"
            >
              <option value="">Select module...</option>
              {courses.map(course => (
                <optgroup key={course.id} label={course.title}>
                  {modules.filter(m => m.course_id === course.id).map(module => (
                    <option key={module.id} value={module.id}>{module.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <Input label="Assignment Title" value={assignmentData.title} onChange={(v) => setAssignmentData(p => ({ ...p, title: v }))} placeholder="e.g. Python Data Structures Project" required />
          <Textarea label="Instructions" value={assignmentData.description} onChange={(v) => setAssignmentData(p => ({ ...p, description: v }))} placeholder="Detailed assignment instructions..." rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Score" type="number" value={assignmentData.max_score} onChange={(v) => setAssignmentData(p => ({ ...p, max_score: v }))} placeholder="100" required />
            <Input label="Due Days" type="number" value={assignmentData.due_days} onChange={(v) => setAssignmentData(p => ({ ...p, due_days: v }))} placeholder="7" required />
          </div>
          <button
            onClick={handleSendAssignment}
            disabled={loading || !assignmentData.title || !assignmentData.module_id}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Assignment</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Admin Student Profile View ──────────────────────────────────────────────

function AdminStudentProfile({ student, onClose }: { student: Profile; onClose: () => void }) {
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    fetchStudentDetails();
  }, [student.id]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    
    const [profileRes, enrollmentsRes, modulesRes] = await Promise.all([
      supabase.from("student_profiles").select("*").eq("user_id", student.id).single(),
      supabase.from("enrollments").select("*, course:course_id(*)").eq("student_id", student.id),
      supabase.from("modules").select("*"),
    ]);
    
    if (profileRes.data) setStudentProfile(profileRes.data);
    if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data as Enrollment[]);
    if (modulesRes.data) setModules(modulesRes.data as Module[]);

    if (enrollmentsRes.data) {
      const enrollmentIds = (enrollmentsRes.data as Enrollment[]).map(e => e.id);
      if (enrollmentIds.length > 0) {
        const { data: progressData } = await supabase
          .from("module_progress")
          .select("*")
          .in("enrollment_id", enrollmentIds);
        if (progressData) setProgress(progressData as ModuleProgress[]);
      }
    }
    
    setLoading(false);
  };

  const getModuleCountForCourse = (courseId: string) => {
    return modules.filter(m => m.course_id === courseId).length;
  };

  const getPassedModules = (enrollmentId: string) => {
    return progress.filter(p => p.enrollment_id === enrollmentId && p.status === "passed").length;
  };

  if (loading) {
    return (
      <Modal open={true} onClose={onClose} title={`Student Profile: ${student.full_name}`}>
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
          <p className="text-muted-foreground mt-4">Loading student data...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={true} onClose={onClose} title={`Student Profile: ${student.full_name}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <Avatar name={student.full_name} size="lg" src={student.avatar_url} />
          <div>
            <h3 className="font-semibold text-foreground text-lg">{student.full_name}</h3>
            <p className="text-sm text-muted-foreground">{student.email}</p>
            <p className="text-xs text-muted-foreground mt-1">Member since {formatDate(student.created_at)}</p>
          </div>
        </div>
        
        {studentProfile && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Personal Information</h4>
            {studentProfile.bio && (
              <div>
                <p className="text-xs text-muted-foreground">Bio</p>
                <p className="text-sm text-foreground">{studentProfile.bio}</p>
              </div>
            )}
            {studentProfile.phone && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">{studentProfile.phone}</p>
              </div>
            )}
            {studentProfile.address && (
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">{studentProfile.address}</p>
              </div>
            )}
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Enrolled Courses & Progress</h4>
          <div className="space-y-4">
            {enrollments.map((e) => {
              const totalModules = getModuleCountForCourse(e.course_id);
              const passed = getPassedModules(e.id);
              
              return (
                <div key={e.id} className="p-4 bg-muted rounded-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                    <span className="font-semibold text-foreground">{e.course?.title}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📚 {passed}/{totalModules} modules passed</span>
                      </div>
                      <ProgressBar value={passed} max={totalModules || 1} className="mt-2" />
                    </div>
                    <CircularProgress 
                      value={passed} 
                      max={totalModules || 1} 
                      size={60} 
                      strokeWidth={4}
                      showPercentage={false}
                    />
                  </div>
                </div>
              );
            })}
            {enrollments.length === 0 && (
              <p className="text-sm text-muted-foreground">No enrolled courses</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Admin Payments ───────────────────────────────────────────────────────────

function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [viewReceipt, setViewReceipt] = useState<any | null>(null);
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
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payment_receipts")
      .select(`
        *,
        enrollment:enrollment_id (
          id,
          course_id,
          course:course_id (
            id,
            title,
            price
          )
        )
      `)
      .order("submitted_at", { ascending: false });
    
    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return;
    }
    
    if (paymentsData) {
      const paymentsWithStudents = await Promise.all(
        paymentsData.map(async (payment) => {
          let studentName = "Unknown";
          let studentEmail = "";
          
          if (payment.student_id) {
            const { data: studentData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", payment.student_id)
              .single();
            
            if (studentData) {
              studentName = studentData.full_name;
              studentEmail = studentData.email;
            }
          }
          
          return {
            ...payment,
            student_name: studentName,
            student_email: studentEmail,
            course_title: payment.enrollment?.course?.title || "Unknown Course",
          };
        })
      );
      
      setPayments(paymentsWithStudents);
    }
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setLoading(true);
    
    const { error: updateError } = await supabase
      .from("payment_receipts")
      .update({ status: action, admin_notes: notes })
      .eq("id", id);
    
    if (updateError) {
      console.error("Error updating payment:", updateError);
      alert("Failed to update payment status");
      setLoading(false);
      return;
    }
    
    if (action === "approved") {
      const payment = payments.find(p => p.id === id);
      if (payment) {
        await supabase
          .from("enrollments")
          .update({ 
            status: "active", 
            enrolled_at: new Date().toISOString(), 
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() 
          })
          .eq("id", payment.enrollment_id);
      }
    }
    
    setViewReceipt(null);
    setNotes("");
    setLoading(false);
    fetchPayments();
  };

  const pendingCount = payments.filter(p => p.status === "pending").length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Payment Approvals
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Review and approve student payment receipts.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatCard icon={Clock} label="Pending" value={pendingCount} />
        <StatCard icon={CheckCircle} label="Approved" value={payments.filter(p => p.status === "approved").length} />
        <StatCard icon={XCircle} label="Rejected" value={payments.filter(p => p.status === "rejected").length} />
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No payment receipts submitted yet.</p>
          </Card>
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{p.student_name}</p>
                      <p className="text-xs text-muted-foreground">{p.student_email}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm font-medium text-foreground mt-2">
                    Course: {p.course_title}
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {formatNaira(p.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {formatDate(p.submitted_at)}
                  </p>
                  {p.admin_notes && (
                    <div className="mt-2 p-2 bg-muted rounded-lg text-xs text-muted-foreground">
                      Admin note: {p.admin_notes}
                    </div>
                  )}
                </div>
                {p.status === "pending" && (
                  <button
                    onClick={() => setViewReceipt(p)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Review Payment Receipt">
        {viewReceipt && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="font-semibold mt-0.5">{viewReceipt.student_name}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Course</p>
                <p className="font-semibold mt-0.5">{viewReceipt.course_title}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-semibold mt-0.5 text-primary">{formatNaira(viewReceipt.amount)}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="font-semibold mt-0.5">{formatDate(viewReceipt.submitted_at)}</p>
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-6 text-center">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <a 
                href={viewReceipt.receipt_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-accent hover:underline flex items-center gap-1 mx-auto justify-center"
              >
                <Eye className="w-4 h-4" /> View Receipt Document
              </a>
            </div>
            
            <Textarea 
              label="Admin Notes (optional)" 
              value={notes} 
              onChange={setNotes} 
              placeholder="Add a note for the student (e.g., reason for approval/rejection)..." 
              rows={2} 
            />
            
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Approve & Activate Course</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Admin Assignments ────────────────────────────────────────────────────────

function AdminAssignments({ courses, modules, onCreateAssignment, onGradeAssignment }: { 
  courses: Course[];
  modules: Module[];
  onCreateAssignment: (assignmentData: any) => Promise<void>;
  onGradeAssignment: (assignmentId: string, score: number, feedback: string) => Promise<void>;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [submissions, setSubmissions] = useState<StudentAssignment[]>([]);
  const [gradeModal, setGradeModal] = useState<StudentAssignment | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });
  const [newAssignment, setNewAssignment] = useState({ 
    course_id: "", 
    module_id: "", 
    title: "", 
    description: "", 
    max_score: "100", 
    due_days: "7",
    assign_to_all: true,
    student_id: "",
  });
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchStudents();
  }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("student_assignments")
      .select("*, assignment:assignment_id(*), profiles:student_id(full_name, email)")
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false });
    if (data) setSubmissions(data as StudentAssignment[]);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "student");
    if (data) setStudents(data as Profile[]);
  };

  const handleCreateAssignment = async () => {
    setLoading(true);
    await onCreateAssignment(newAssignment);
    setShowCreate(false);
    setNewAssignment({ course_id: "", module_id: "", title: "", description: "", max_score: "100", due_days: "7", assign_to_all: true, student_id: "" });
    setLoading(false);
  };

  const handleGrade = async () => {
    if (!gradeModal) return;
    setLoading(true);
    await onGradeAssignment(gradeModal.id, parseInt(gradeForm.score), gradeForm.feedback);
    setGradeModal(null);
    setGradeForm({ score: "", feedback: "" });
    setLoading(false);
    fetchSubmissions();
  };

  const availableModules = modules.filter(m => m.course_id === newAssignment.course_id);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            Assignments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Create assignments and grade student submissions.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Pending Submissions ({submissions.length})</h2>
        {submissions.map((sa) => (
          <Card key={sa.id} className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Avatar name={sa.profiles?.full_name || sa.student_id.slice(0, 8)} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{sa.profiles?.full_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sa.assignment?.title}</p>
                {sa.submitted_at && (
                  <p className="text-xs text-muted-foreground mt-0.5">Submitted: {formatDate(sa.submitted_at)}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={sa.status} />
                <button
                  onClick={() => { setGradeModal(sa); setGradeForm({ score: "", feedback: "" }); }}
                  className="px-3 py-1.5 bg-accent/15 text-accent text-xs font-medium rounded-lg hover:bg-accent/25 transition-colors"
                >
                  Grade
                </button>
              </div>
            </div>
            {sa.submission_url && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <a href={sa.submission_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View Submission
                </a>
              </div>
            )}
          </Card>
        ))}
        {submissions.length === 0 && (
          <Card className="p-8 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No pending submissions to grade.</p>
          </Card>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Assign to</label>
            <select
              value={newAssignment.assign_to_all ? "all" : "specific"}
              onChange={(e) => setNewAssignment(p => ({ ...p, assign_to_all: e.target.value === "all" }))}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm"
            >
              <option value="all">All Students in Course</option>
              <option value="specific">Specific Student</option>
            </select>
          </div>

          {!newAssignment.assign_to_all && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Select Student</label>
              <select
                value={newAssignment.student_id}
                onChange={(e) => setNewAssignment(p => ({ ...p, student_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm"
              >
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                ))}
              </select>
            </div>
          )}

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
          
          <Input 
            label="Assignment Title" 
            value={newAssignment.title} 
            onChange={(v) => setNewAssignment(p => ({ ...p, title: v }))} 
            placeholder="e.g. Python Data Structures Project" 
            required 
          />
          
          <Textarea 
            label="Instructions" 
            value={newAssignment.description} 
            onChange={(v) => setNewAssignment(p => ({ ...p, description: v }))} 
            placeholder="Detailed assignment instructions..." 
            rows={4} 
            required 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Max Score" 
              type="number" 
              value={newAssignment.max_score} 
              onChange={(v) => setNewAssignment(p => ({ ...p, max_score: v }))} 
              placeholder="100" 
              required 
            />
            <Input 
              label="Due Days" 
              type="number" 
              value={newAssignment.due_days} 
              onChange={(v) => setNewAssignment(p => ({ ...p, due_days: v }))} 
              placeholder="7" 
              required 
            />
          </div>
          
          <button
            onClick={handleCreateAssignment}
            disabled={loading || !newAssignment.course_id || !newAssignment.module_id || !newAssignment.title}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Assignment"}
          </button>
        </div>
      </Modal>

      <Modal open={!!gradeModal} onClose={() => setGradeModal(null)} title={`Grade — ${gradeModal?.assignment?.title}`}>
        {gradeModal && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-sm font-semibold text-foreground">{gradeModal.profiles?.full_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Submitted: {gradeModal.submitted_at ? formatDate(gradeModal.submitted_at) : "—"}</p>
            </div>
            <Input 
              label={`Score (out of ${gradeModal.assignment?.max_score || 100})`} 
              type="number" 
              value={gradeForm.score} 
              onChange={(v) => setGradeForm((p) => ({ ...p, score: v }))} 
              placeholder="85" 
              required 
            />
            <Textarea 
              label="Feedback" 
              value={gradeForm.feedback} 
              onChange={(v) => setGradeForm((p) => ({ ...p, feedback: v }))} 
              placeholder="Detailed feedback for the student..." 
              rows={3} 
              required 
            />
            <button
              onClick={handleGrade}
              disabled={!gradeForm.score || !gradeForm.feedback || loading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Grade"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Admin Quizzes ────────────────────────────────────────────────────────────

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
    const { data } = await supabase.from("quizzes").select("*, module:module_id(title), module:module_id(course_id)");
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
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                  )}
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
            <p className="text-muted-foreground">No quizzes created yet. Create a quiz for each module.</p>
          </Card>
        )}
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Quiz">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Module <span className="text-destructive">*</span></label>
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
            
            <div className="space-y-3 bg-muted/30 p-3 rounded-xl">
              <Input label="Question" value={currentQuestion.question} onChange={(v) => setCurrentQuestion({ ...currentQuestion, question: v })} placeholder="Enter your question..." />
              <div className="space-y-2">
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === i}
                      onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: i })}
                      className="w-4 h-4 text-accent shrink-0"
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
                  className="text-destructive hover:text-destructive/80 p-1"
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Create Quiz (${questions.length} questions)`}
          </button>
        </div>
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
    await supabase.from("quiz_attempts").delete().eq("quiz_id", quizId);
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
          return <StudentProfile 
            profile={profile} 
            onUpdate={handleUpdateProfile} 
            enrollments={enrollments}
            progress={progress}
            modules={modules}
          />;
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
