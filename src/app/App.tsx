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
  ChevronLeft,
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
  FileQuestion,
  MessageCircle,
  Gift,
  Sparkles,
  Rocket,
  Zap,
  Brain,
  Target,
  BarChart3,
  Globe,
  Laptop,
  Lightbulb,
} from "lucide-react";

// ─── Toast System ──────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

let toastIdCounter = 0;
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function toast({
  type = "info",
  title,
  message,
  duration = 5000,
}: {
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}) {
  const id = `toast-${++toastIdCounter}`;
  const newToast: Toast = { id, type, title, message, duration };
  toasts.push(newToast);
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, duration);
  }

  return id;
}

function ToastContainer() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-50 border-green-200";
      case "error": return "bg-red-50 border-red-200";
      case "warning": return "bg-yellow-50 border-yellow-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-800";
      case "error": return "text-red-800";
      case "warning": return "text-yellow-800";
      default: return "text-blue-800";
    }
  };

  if (toastList.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-md w-full pointer-events-none">
      {toastList.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-lg border shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300",
            getBgColor(t.type)
          )}
        >
          <div className="shrink-0 mt-0.5">{getIcon(t.type)}</div>
          <div className="flex-1 min-w-0">
            <p className={cn("font-semibold text-sm", getTextColor(t.type))}>{t.title}</p>
            <p className={cn("text-sm mt-0.5", getTextColor(t.type).replace("800", "700"))}>{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Confirmation Dialog ─────────────────────────────────────────────────────

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
}

let confirmListeners: ((dialog: ConfirmDialogState | null) => void)[] = [];

export function showConfirm({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "warning",
  onConfirm,
}: Omit<ConfirmDialogState, "open">) {
  const dialog: ConfirmDialogState = {
    open: true,
    title,
    message,
    confirmLabel,
    cancelLabel,
    type,
    onConfirm,
  };
  confirmListeners.forEach(listener => listener(dialog));
}

export function closeConfirm() {
  confirmListeners.forEach(listener => listener(null));
}

function ConfirmDialog() {
  const [dialog, setDialog] = useState<ConfirmDialogState | null>(null);

  useEffect(() => {
    const listener = (d: ConfirmDialogState | null) => {
      setDialog(d);
    };
    confirmListeners.push(listener);
    return () => {
      confirmListeners = confirmListeners.filter(l => l !== listener);
    };
  }, []);

  if (!dialog) return null;

  const getTypeStyles = () => {
    switch (dialog.type) {
      case "danger":
        return {
          bg: "bg-red-50 border-red-200",
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          button: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          icon: <AlertCircle className="w-6 h-6 text-yellow-600" />,
          button: "bg-yellow-600 hover:bg-yellow-700 text-white",
        };
      default:
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: <Info className="w-6 h-6 text-blue-600" />,
          button: "bg-blue-600 hover:bg-blue-700 text-white",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeConfirm} />
      <div className={cn("relative rounded-xl border shadow-2xl w-full max-w-md p-6", styles.bg)}>
        <div className="flex items-start gap-4">
          <div className="shrink-0">{styles.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg">{dialog.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{dialog.message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={closeConfirm}
            className="flex-1 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
          >
            {dialog.cancelLabel}
          </button>
          <button
            onClick={() => {
              dialog.onConfirm();
              closeConfirm();
            }}
            className={cn("flex-1 py-2.5 font-medium rounded-lg transition-colors", styles.button)}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  | "student-chat"
  | "student-personal-messages"
  | "student-scholarship"
  | "admin-dashboard"
  | "admin-courses"
  | "admin-students"
  | "admin-payments"
  | "admin-assignments"
  | "admin-student-profile"
  | "admin-quizzes"
  | "admin-chat"
  | "admin-scholarship";

interface Scholarship {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  course_id: string;
  course_title: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

interface ChatMessage {
  id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  message: string;
  created_at: string;
}

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

function formatTime(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
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

// ─── Phone Number Validation ──────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
];

function validatePhoneNumber(phone: string): boolean {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  const validCodes = COUNTRY_CODES.map(c => c.code);
  const hasValidCode = validCodes.some(code => clean.startsWith(code));
  if (!hasValidCode) return false;
  const codeMatch = validCodes.find(code => clean.startsWith(code));
  if (!codeMatch) return false;
  const numberPart = clean.slice(codeMatch.length);
  return numberPart.length >= 7 && /^\d+$/.test(numberPart);
}

function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  const validCodes = COUNTRY_CODES.map(c => c.code);
  const codeMatch = validCodes.find(code => clean.startsWith(code));
  if (!codeMatch) return phone;
  const numberPart = clean.slice(codeMatch.length);
  const formatted = numberPart.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  return `${codeMatch} ${formatted}`;
}

// ─── Circular Progress ──────────────────────────────────────────────────────

function CircularProgress({ value, max, size = 80, strokeWidth = 6, label, showPercentage = true, onClick }: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  onClick?: () => void;
}) {
  const safeMax = max || 1;
  const safeValue = Math.min(value || 0, safeMax);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min((safeValue / safeMax) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex flex-col items-center", onClick && "cursor-pointer")} onClick={onClick}>
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
          <span className="text-xs text-muted-foreground">{safeValue}/{safeMax}</span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground mt-2 text-center">{label}</span>
      )}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const safeMax = max || 1;
  const safeValue = Math.min(value || 0, safeMax);
  const pct = Math.min(Math.round((safeValue / safeMax) * 100), 100);
  return (
    <div className={cn("h-2 bg-gray-200 rounded-full overflow-hidden", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ backgroundColor: '#f7530b', width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Secure Video Player ─────────────────────────────────────────────────────

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
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
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
    <div className={cn("rounded-full flex items-center justify-center font-semibold shrink-0", sizes[size])} 
         style={{ backgroundColor: '#f7530b', color: '#ffffff' }}>
      {getInitials(name)}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "muted" }) {
  const variants = {
    default: { backgroundColor: '#f7530b', color: '#ffffff' },
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    muted: "bg-gray-100 text-gray-600",
  };
  
  if (variant === "default") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}>
        {children}
      </span>
    );
  }
  
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
    <div className={cn("rounded-xl border shadow-sm", className)} 
         style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0' }}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, onClick }: { icon: any; label: string; value: string | number; trend?: string; onClick?: () => void }) {
  return (
    <Card className={cn("p-6", onClick && "cursor-pointer hover:shadow-md transition-shadow")} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{value}</p>
          {trend && <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fdddce' }}>
          <Icon className="w-5 h-5" style={{ color: '#f7530b' }} />
        </div>
      </div>
    </Card>
  );
}

function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: { 
  open: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-xl border shadow-2xl w-full max-h-[90vh] overflow-y-auto", maxWidth)} style={{ borderColor: '#e0e0e0' }}>
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required, accept, disabled, className }: {
  label: string; type?: string; value?: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean; accept?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        accept={accept}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderColor: '#e0e0e0' }}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3, required }: {
  label: string; value?: string; onChange?: (v: string) => void; placeholder?: string; rows?: number; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all placeholder:text-gray-400 resize-none"
        style={{ borderColor: '#e0e0e0' }}
      />
    </div>
  );
}

// ─── Phone Input Component ──────────────────────────────────────────────────

function PhoneInput({ label, value, onChange, placeholder, required, disabled, className }: {
  label: string; value?: string; onChange?: (v: string) => void; placeholder?: string; required?: boolean; disabled?: boolean; className?: string;
}) {
  const [selectedCode, setSelectedCode] = useState("+234");
  const [number, setNumber] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (value) {
      const clean = value.replace(/[\s\-\(\)]/g, '');
      const validCodes = COUNTRY_CODES.map(c => c.code);
      const codeMatch = validCodes.find(code => clean.startsWith(code));
      if (codeMatch) {
        setSelectedCode(codeMatch);
        setNumber(clean.slice(codeMatch.length));
      } else {
        setNumber(clean);
      }
    }
  }, [value]);

  const handleNumberChange = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    setNumber(cleanNum);
    const fullNumber = `${selectedCode}${cleanNum}`;
    setIsValid(validatePhoneNumber(fullNumber));
    onChange?.(fullNumber);
  };

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
    const fullNumber = `${code}${number}`;
    setIsValid(validatePhoneNumber(fullNumber));
    onChange?.(fullNumber);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={selectedCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          disabled={disabled}
          className="px-3 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-[120px] shrink-0"
          style={{ borderColor: '#e0e0e0' }}
        >
          {COUNTRY_CODES.map(({ code, country, flag }) => (
            <option key={code} value={code}>
              {flag} {code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder || "812 345 6789"}
          required={required}
          disabled={disabled}
          className={cn(
            "flex-1 px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
            isValid ? "border-gray-300" : "border-red-500"
          )}
        />
      </div>
      {!isValid && number.length > 0 && (
        <p className="text-xs text-red-500">Please enter a valid phone number (at least 7 digits after country code)</p>
      )}
      <p className="text-xs text-gray-400">Example: {selectedCode} 812 345 6789</p>
    </div>
  );
}

// ─── Profile Completion Progress ────────────────────────────────────────────

interface ProfileCompletion {
  total: number;
  completed: number;
  percentage: number;
  items: {
    label: string;
    completed: boolean;
    field: string;
  }[];
}

function calculateProfileCompletion(profile: Profile, studentProfile?: any): ProfileCompletion {
  const items = [
    { label: "Full Name", completed: !!profile.full_name?.trim(), field: "full_name" },
    { label: "Email", completed: !!profile.email?.trim(), field: "email" },
    { label: "Phone Number", completed: !!studentProfile?.phone?.trim(), field: "phone" },
    { label: "Address", completed: !!studentProfile?.address?.trim(), field: "address" },
    { label: "Bio", completed: !!studentProfile?.bio?.trim(), field: "bio" },
    { label: "Date of Birth", completed: !!studentProfile?.date_of_birth, field: "date_of_birth" },
    { label: "Profile Picture", completed: !!profile.avatar_url, field: "avatar" },
  ];

  const completed = items.filter(i => i.completed).length;
  const total = items.length;

  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
    items,
  };
}

function ProfileCompletionBadge({ profile, studentProfile, onClick }: { 
  profile: Profile; 
  studentProfile?: any;
  onClick?: () => void;
}) {
  const completion = calculateProfileCompletion(profile, studentProfile);

  const getColor = () => {
    if (completion.percentage >= 80) return "text-green-600";
    if (completion.percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getBgColor = () => {
    if (completion.percentage >= 80) return "bg-green-100";
    if (completion.percentage >= 50) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
        completion.percentage === 100 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50/50"
      )}
      onClick={onClick}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", getBgColor(), getColor())}>
        {completion.percentage}%
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">
          Profile {completion.percentage === 100 ? "Complete ✓" : "In Progress"}
        </p>
        <p className="text-xs text-gray-500">
          {completion.completed}/{completion.total} fields filled
        </p>
      </div>
      <ProgressBar 
        value={completion.completed} 
        max={completion.total} 
        className="w-20 h-1.5"
      />
    </div>
  );
}

// ─── Toast and Confirm Provider ─────────────────────────────────────────────

function ToastAndConfirmProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}

// ─── Landing Page with Creative Animations ──────────────────────────────────

function LandingPage({ onAuth, courses }: { onAuth: () => void; courses: Course[] }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Scroll animation trigger
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Floating particles animation
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number; delay: number }>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Animated counter for stats
  const [counters, setCounters] = useState({ students: 0, completion: 0, rating: 0 });
  
  useEffect(() => {
    const animateCounter = (target: number, setter: (val: number) => void, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setter(Math.floor(current));
      }, 16);
      
      return timer;
    };
    
    const timer1 = animateCounter(1200, (val) => setCounters(prev => ({ ...prev, students: val })));
    const timer2 = animateCounter(96, (val) => setCounters(prev => ({ ...prev, completion: val })));
    const timer3 = animateCounter(49, (val) => setCounters(prev => ({ ...prev, rating: val })));
    
    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
    };
  }, []);

  // Floating icons animation
  const floatingIcons = [
    { Icon: BookOpen, delay: 0, x: 10, y: 20 },
    { Icon: GraduationCap, delay: 1, x: 80, y: 10 },
    { Icon: Users, delay: 2, x: 90, y: 80 },
    { Icon: Award, delay: 0.5, x: 5, y: 85 },
    { Icon: Target, delay: 1.5, x: 95, y: 50 },
    { Icon: Brain, delay: 2.5, x: 50, y: 5 },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#eeeeee', fontFamily: "'Poppins', sans-serif" }}>
      {/* Animated Navbar */}
      <nav 
        className={cn(
          "sticky top-0 z-40 backdrop-blur-md border-b rounded-b-lg transition-all duration-500",
          scrolled ? "shadow-lg" : "shadow-sm"
        )}
        style={{ 
          backgroundColor: scrolled ? 'rgba(51, 51, 51, 0.95)' : '#333333', 
          borderBottomColor: '#444444' 
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="https://i.postimg.cc/NFQ2Z3RD/PRUTAICON.png" alt="Pruta Academy" className="h-9 w-9 rounded object-contain animate-pulse-slow" />
            <span className="text-xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pruta Academy
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#courses" className="hover:text-white transition-colors relative group">
              Courses
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#how" className="hover:text-white transition-colors relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#why" className="hover:text-white transition-colors relative group">
              Why Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </a>
          </div>
          <button
            onClick={onAuth}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/30"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section 
        ref={heroRef}
        className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center overflow-hidden"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 -z-5 pointer-events-none">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-orange-400/30 animate-float-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.speed * 3}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
        
        {/* Floating Icons */}
        {floatingIcons.map(({ Icon, delay, x, y }, i) => (
          <div
            key={i}
            className="absolute hidden lg:block animate-float-icon"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${delay}s`,
              transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div className="p-3 bg-white/80 rounded-2xl shadow-lg backdrop-blur-sm border border-orange-100">
              <Icon className="w-6 h-6" style={{ color: '#f7530b' }} />
            </div>
          </div>
        ))}

        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 animate-pulse-slow" style={{ backgroundColor: '#fdddce', borderColor: '#fcba9d' }}>
            <Star className="w-3.5 h-3.5 fill-current animate-spin-slow" style={{ color: '#f7530b' }} />
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#f7530b' }}>Globally Certified Programs</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] animate-fade-in-up" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Learn Without
            <span className="block italic relative" style={{ color: '#f7530b' }}>
              Limits.
              <svg className="absolute -bottom-2 left-0 w-full h-2" viewBox="0 0 100 10">
                <path d="M0,5 Q25,0 50,5 Q75,10 100,5" stroke="#f7530b" strokeWidth="2" fill="none" className="animate-draw-line"/>
              </svg>
            </span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-md animate-fade-in-up animation-delay-200">
            Structured 3-month courses taught by industry experts. Progress at your own pace, earn verified certificates, and transform your career.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-300">
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-orange-500/30 group"
              style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
            >
              Enroll Now 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-lg hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#e0e0e0', color: '#333333' }}
            >
              Browse Courses
            </button>
          </div>
          <div className="flex items-center gap-8 pt-2 animate-fade-in-up animation-delay-400">
            {[
              [`${counters.students}+`, "Students Enrolled"],
              [`${counters.completion}%`, "Completion Rate"],
              [`${counters.rating / 10}★`, "Avg. Rating"],
            ].map(([v, l]) => (
              <div key={l} className="group">
                <p className="text-2xl font-bold transition-all group-hover:scale-110 group-hover:text-orange-500" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
                  {v}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative animate-fade-in-up animation-delay-200">
          <div className="rounded-2xl overflow-hidden shadow-2xl border group" style={{ borderColor: '#e0e0e0' }}>
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=500&fit=crop&auto=format"
                alt="Students learning"
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-xl border shadow-xl p-4 flex items-center gap-3 animate-bounce-in" style={{ borderColor: '#e0e0e0' }}>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Module Passed!</p>
              <p className="text-xs text-gray-500">Score: 92/100</p>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 rounded-xl shadow-xl p-4 animate-float" style={{ backgroundColor: '#f7530b' }}>
            <p className="text-white text-sm font-bold">3 Month</p>
            <p className="text-white/70 text-xs">Duration</p>
          </div>
        </div>
      </section>

      {/* Courses Section with Stagger Animation */}
      <section id="courses" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: '#f7530b' }} />
            <span className="text-xs font-semibold text-orange-600">Featured Programs</span>
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Explore Our <span style={{ color: '#f7530b' }}>Courses</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Handcrafted 3-month curricula — each module unlocks only after you demonstrate mastery.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
              style={{ borderColor: '#e0e0e0', animationDelay: `${index * 0.1}s` }}
              onClick={onAuth}
            >
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm">
                    {course.duration_months} months
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 group-hover:text-orange-600 transition-colors">{course.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold" style={{ color: '#f7530b', fontFamily: "'Poppins', sans-serif" }}>
                    {formatNaira(course.price)}
                  </span>
                  <span className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#f7530b' }}>
                    Enroll <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section with Animated Steps */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#333333' }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-4">
              <Rocket className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400">Learning Journey</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              How It <span className="text-orange-400">Works</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A carefully designed learning journey from enrollment to certification.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, step: "01", title: "Choose a Course", desc: "Browse and select from our curated 3-month programs." },
              { icon: DollarSign, step: "02", title: "Pay & Confirm", desc: "Make payment and upload your receipt. Admin confirms access." },
              { icon: TrendingUp, step: "03", title: "Progress Module by Module", desc: "Pass each module's assessment before the next unlocks." },
              { icon: Award, step: "04", title: "Earn Your Certificate", desc: "Complete all modules and receive your certificate via email." },
            ].map(({ icon: Icon, step, title, desc }, index) => (
              <div key={step} className="text-center space-y-4 group">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto transition-all duration-500 group-hover:scale-110 group-hover:border-orange-400" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    <Icon className="w-7 h-7 transition-all duration-500 group-hover:rotate-12" style={{ color: '#f7530b' }} />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: '#f7530b', color: '#ffffff' }}>
                    {step[1]}
                  </span>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-orange-400 to-transparent -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section with Animated Cards */}
      <section id="why" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold text-orange-600">Why Choose Us</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
              Built for <span style={{ color: '#f7530b' }}>Serious</span> Learners
            </h2>
            <div className="space-y-5">
              {[
                { icon: Shield, title: "Secure Content", desc: "All videos and materials are DRM-protected. No downloads, no sharing." },
                { icon: Lock, title: "Sequential Mastery", desc: "You must pass each module before the next unlocks — no shortcuts." },
                { icon: Users, title: "Personalised Access", desc: "Each enrollment is tied to one student for 3 months exactly." },
                { icon: Award, title: "Verified Certificates", desc: "Certificates issued personally via email upon course completion." },
              ].map(({ icon: Icon, title, desc }, index) => (
                <div key={title} className="flex gap-4 group cursor-pointer" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" style={{ backgroundColor: '#fdddce' }}>
                    <Icon className="w-5 h-5 transition-all duration-300 group-hover:text-orange-700" style={{ color: '#f7530b' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/30 group"
              style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
            >
              Start Learning Today 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border group" style={{ borderColor: '#e0e0e0' }}>
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&h=550&fit=crop&auto=format"
                alt="Student studying"
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: '#e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="https://i.postimg.cc/NFQ2Z3RD/PRUTAICON.png" alt="Pruta Academy" className="h-8 w-8 rounded object-contain" />
            <span className="font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>Pruta Academy</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 Pruta Academy. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Content Protected</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          25% { transform: translate(10px, -20px); opacity: 0.6; }
          50% { transform: translate(-5px, -35px); opacity: 0.8; }
          75% { transform: translate(15px, -15px); opacity: 0.5; }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes draw-line {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); }
          60% { opacity: 1; transform: scale(1.1) translateY(-5px); }
          100% { transform: scale(1) translateY(0); }
        }
        .animate-fade-in-up { opacity: 0; animation: fade-in-up 0.8s ease forwards; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; animation-delay: 1s; }
        .animate-float-particle { animation: float-particle 8s ease-in-out infinite; }
        .animate-float-icon { animation: float-icon 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-draw-line { stroke-dasharray: 100; animation: draw-line 1.5s ease forwards; }
        .animate-bounce-in { opacity: 0; animation: bounce-in 0.8s ease forwards; animation-delay: 0.5s; }
        .group:hover .group-hover\\:translate-x-1 { transform: translateX(4px); }
        .group:hover .group-hover\\:gap-2 { gap: 0.5rem; }
        .group:hover .group-hover\\:scale-110 { transform: scale(1.1); }
        .group:hover .group-hover\\:border-orange-400 { border-color: #f7530b; }
        .group:hover .group-hover\\:rotate-12 { transform: rotate(12deg); }
        .group:hover .group-hover\\:text-orange-400 { color: #f7530b; }
        .group:hover .group-hover\\:text-orange-500 { color: #f7530b; }
        .group:hover .group-hover\\:text-orange-600 { color: #f7530b; }
        .group:hover .group-hover\\:shadow-orange-500\\/30 { --tw-shadow-color: rgba(247, 83, 11, 0.3); }
        .hover\\:shadow-orange-500\\/30:hover { --tw-shadow-color: rgba(247, 83, 11, 0.3); }
      `}</style>
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
            toast({
              type: "success",
              title: "Welcome back!",
              message: `Hello ${profile.full_name}! You've been signed in successfully.`,
            });
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
          toast({
            type: "info",
            title: "Account Created!",
            message: "Please check your email to confirm your account.",
          });
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const profile = await ensureProfile(
            data.user.id,
            data.user.email!,
            name
          );
          
          if (profile) {
            toast({
              type: "success",
              title: "Welcome to Pruta Academy!",
              message: "Your account has been set up successfully.",
            });
            onLogin(profile as Profile);
          } else {
            throw new Error("Could not create profile");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      toast({
        type: "error",
        title: "Authentication Error",
        message: err.message || "Failed to authenticate. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      
      toast({
        type: "info",
        title: "Redirecting...",
        message: "You'll be redirected to Google to complete authentication.",
      });
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
      toast({
        type: "error",
        title: "Google Auth Failed",
        message: err.message || "Failed to sign in with Google. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ backgroundColor: '#eeeeee', fontFamily: "'Poppins', sans-serif" }}>
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=1000&fit=crop&auto=format"
          alt="Student in a library"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 text-white">
          <div className="flex items-center gap-2.5 mb-8">
            <img src="https://i.postimg.cc/NFQ2Z3RD/PRUTAICON.png" alt="Pruta Academy" className="h-9 w-9 rounded object-contain bg-white/10 p-1" />
            <span className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pruta Academy
            </span>
          </div>
          <blockquote className="text-2xl font-medium italic leading-relaxed mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            "Education is the most powerful weapon you can use to change the world."
          </blockquote>
          <p className="text-white/60 text-sm">— Nelson Mandela</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <img src="https://i.postimg.cc/NFQ2Z3RD/PRUTAICON.png" alt="Pruta Academy" className="h-9 w-9 rounded object-contain" />
              <span className="text-xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
                Pruta Academy
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
              {mode === "login" ? "Welcome back" : "Join Pruta Academy"}
            </h1>
            <p className="text-gray-500">
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
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
              style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#e0e0e0' }}></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#eeeeee] px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 py-2.5 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
              style={{ borderColor: '#e0e0e0' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold" style={{ color: '#f7530b' }}>{mode === "login" ? "Register" : "Sign In"}</span>
            </button>
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
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
      } else {
        setCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUnreadCount();
      
      const subscription = supabase
        .channel('admin-unread')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'personal_messages', filter: `receiver_id=eq.${profile.id}` },
          () => fetchUnreadCount()
        )
        .subscribe();
      
      return () => subscription.unsubscribe();
    }
  }, [profile?.id]);

  const fetchUnreadCount = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('personal_messages')
      .select('id', { count: 'exact' })
      .eq('receiver_id', profile.id)
      .eq('read', false);
    setUnreadCount(data?.length || 0);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigate = (view: View) => {
    onNavigate(view);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  if (!profile) {
    return null;
  }

  const studentNav = [
    { view: "student-dashboard" as View, icon: LayoutDashboard, label: "Dashboard" },
    { view: "student-courses" as View, icon: BookOpen, label: "My Courses" },
    { view: "student-module" as View, icon: Video, label: "Learning" },
    { view: "student-assignments" as View, icon: ClipboardList, label: "Assignments" },
    { view: "student-payment" as View, icon: DollarSign, label: "Payments" },
    { view: "student-chat" as View, icon: MessageCircle, label: "Course Chat" },
    { view: "student-personal-messages" as View, icon: Mail, label: "Messages" },
    { view: "student-scholarship" as View, icon: Gift, label: "Scholarship" },
    { view: "student-profile" as View, icon: User, label: "My Profile" },
  ];

  const adminNav = [
    { view: "admin-dashboard" as View, icon: LayoutDashboard, label: "Dashboard" },
    { view: "admin-courses" as View, icon: BookOpen, label: "Courses & Modules" },
    { view: "admin-students" as View, icon: Users, label: "Students" },
    { view: "admin-payments" as View, icon: DollarSign, label: "Payments" },
    { view: "admin-assignments" as View, icon: ClipboardList, label: "Assignments" },
    { view: "admin-quizzes" as View, icon: HelpCircle, label: "Quizzes" },
    { view: "admin-chat" as View, icon: MessageCircle, label: "Chat" },
    { view: "admin-scholarship" as View, icon: Gift, label: "Scholarships" },
  ];

  const nav = profile.role === "admin" ? adminNav : studentNav;

  // ─── MOBILE SIDEBAR ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-lg shadow-lg hover:opacity-90 transition-colors flex items-center justify-center md:hidden"
          style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {!collapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
        
        <aside
          className={cn(
            "fixed top-0 left-0 h-full transition-all duration-300 z-50 shadow-2xl md:hidden",
            collapsed ? "-translate-x-full" : "translate-x-0",
            "w-72"
          )}
          style={{ backgroundColor: '#333333', borderRight: '1px solid #444444' }}
        >
          <div className="p-4 border-b flex items-center gap-3" style={{ borderBottomColor: '#444444' }}>
            <img src="https://i.postimg.cc/NFQ2Z3RD/PRUTAICON.png" alt="Pruta Academy" className="h-8 w-8 rounded object-contain" />
            <span className="font-bold text-lg flex-1 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pruta Academy
            </span>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
            {nav.map(({ view, icon: Icon, label }) => (
              <button
                key={view}
                onClick={() => handleNavigate(view)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                  currentView === view
                    ? "text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
                style={currentView === view ? { backgroundColor: '#f7530b' } : {}}
              >
                <Icon className="w-5 h-5 shrink-0" style={currentView === view ? { color: '#ffffff' } : { color: '#fcba9d' }} />
                <span>{label}</span>
                {view === "admin-chat" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t absolute bottom-0 left-0 right-0" style={{ borderTopColor: '#444444', backgroundColor: '#333333' }}>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={profile.full_name} size="sm" src={profile.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{profile.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                showConfirm({
                  title: "Sign Out",
                  message: "Are you sure you want to sign out?",
                  confirmLabel: "Sign Out",
                  type: "warning",
                  onConfirm: onLogout,
                });
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all mt-1"
            >
              <LogOut className="w-4 h-4 shrink-0" style={{ color: '#fcba9d' }} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  // ─── DESKTOP SIDEBAR ────────────────────────────────────────────────────────
  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-300 shrink-0 hidden md:flex relative",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ backgroundColor: '#333333', borderRight: '1px solid #444444' }}
    >
      <div className="p-4 border-b flex items-center gap-3" style={{ borderBottomColor: '#444444' }}>
        <img src="https://i.postimg.cc/NFQ2Z3RD/PRUTAICON.png" alt="Pruta Academy" className="h-8 w-8 rounded object-contain" />
        {!collapsed && (
          <span className="font-bold text-lg text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Pruta Academy
          </span>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              currentView === view
                ? "text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            )}
            style={currentView === view ? { backgroundColor: '#f7530b' } : {}}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" style={currentView === view ? { color: '#ffffff' } : { color: '#fcba9d' }} />
            {!collapsed && <span>{label}</span>}
            {view === "admin-chat" && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t space-y-1" style={{ borderTopColor: '#444444' }}>
        <div className={cn("flex items-center gap-3 px-3 py-2.5", collapsed && "justify-center")}>
          <Avatar name={profile.full_name} size="sm" src={profile.avatar_url} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{profile.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            showConfirm({
              title: "Sign Out",
              message: "Are you sure you want to sign out?",
              confirmLabel: "Sign Out",
              type: "warning",
              onConfirm: onLogout,
            });
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" style={{ color: '#fcba9d' }} />
          {!collapsed && "Sign Out"}
        </button>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-md hover:bg-white/10 flex items-center justify-center transition-colors hidden md:flex z-10"
        style={{ backgroundColor: '#333333', border: '1px solid #444444' }}
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
      </button>
    </aside>
  );
}

// ─── Student Assignments ──────────────────────────────────────────────────────

function StudentAssignments({ profile }: { profile: Profile }) {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAssignments();
    
    const subscription = supabase
      .channel("student-assignments")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "student_assignments", filter: `student_id=eq.${profile.id}` }, 
        () => fetchAssignments()
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [profile.id]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("student_assignments")
        .select(`
          *,
          assignment:assignment_id (
            id,
            module_id,
            title,
            description,
            due_days,
            max_score
          )
        `)
        .eq("student_id", profile.id)
        .order("assigned_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching assignments:", error);
        toast({
          type: "error",
          title: "Failed to Load",
          message: "Could not load your assignments. Please refresh.",
        });
        return;
      }
      
      if (data) {
        setAssignments(data as StudentAssignment[]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string, file: File) => {
    setUploading(prev => ({ ...prev, [assignmentId]: true }));
    setUploadProgress(prev => ({ ...prev, [assignmentId]: 0 }));

    try {
      if (!file) {
        toast({
          type: "error",
          title: "No File Selected",
          message: "Please select a file to upload.",
        });
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          type: "error",
          title: "File Too Large",
          message: "File size must be less than 10MB.",
        });
        return;
      }

      const allowedExtensions = ['pdf', 'doc', 'docx', 'zip', 'txt', 'jpg', 'jpeg', 'png'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        toast({
          type: "error",
          title: "Invalid File Type",
          message: "Please upload PDF, DOC, DOCX, ZIP, or image files only.",
        });
        return;
      }

      setUploadProgress(prev => ({ ...prev, [assignmentId]: 20 }));

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${profile.id}/${assignmentId}/${Date.now()}-${cleanFileName}`;

      setUploadProgress(prev => ({ ...prev, [assignmentId]: 40 }));

      let submissionUrl = null;
      let uploadError = null;

      try {
        const { data: uploadData, error: error } = await supabase.storage
          .from("assignments")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          uploadError = error;
          console.error("Upload error:", error);
        } else {
          setUploadProgress(prev => ({ ...prev, [assignmentId]: 70 }));
          const { data: { publicUrl } } = supabase.storage
            .from("assignments")
            .getPublicUrl(fileName);
          submissionUrl = publicUrl;
        }
      } catch (err) {
        console.error("Storage error:", err);
        uploadError = err;
      }

      setUploadProgress(prev => ({ ...prev, [assignmentId]: 80 }));

      if (!submissionUrl && file.size < 500000) {
        try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
          });
          submissionUrl = base64;
          console.log("Using base64 upload as fallback");
        } catch (base64Error) {
          console.error("Base64 conversion error:", base64Error);
        }
      }

      setUploadProgress(prev => ({ ...prev, [assignmentId]: 90 }));

      const updateData: any = {
        status: "submitted",
        submitted_at: new Date().toISOString()
      };

      if (submissionUrl) {
        updateData.submission_url = submissionUrl;
      } else {
        updateData.submission_url = `uploaded-${Date.now()}`;
        updateData.submission_data = "File uploaded successfully";
      }

      const { error: updateError } = await supabase
        .from("student_assignments")
        .update(updateData)
        .eq("id", assignmentId);
      
      if (updateError) {
        console.error("Update error:", updateError);
        toast({
          type: "error",
          title: "Submission Failed",
          message: updateError.message || "Failed to update assignment. Please try again.",
        });
        return;
      }
      
      setUploadProgress(prev => ({ ...prev, [assignmentId]: 100 }));
      
      toast({
        type: "success",
        title: "✅ Assignment Submitted!",
        message: "Your assignment has been submitted successfully.",
        duration: 4000,
      });
      
      await fetchAssignments();
      
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        type: "error",
        title: "❌ Upload Failed",
        message: error.message || "An unexpected error occurred. Please try again.",
        duration: 5000,
      });
    } finally {
      setUploading(prev => ({ ...prev, [assignmentId]: false }));
      setUploadProgress(prev => ({ ...prev, [assignmentId]: 0 }));
    }
  };

  const renderFileInput = (assignment: StudentAssignment) => {
    const isUploading = uploading[assignment.id];
    const progress = uploadProgress[assignment.id] || 0;

    if (assignment.status === 'graded') {
      return (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800">
            Score: {assignment.score}/{assignment.assignment?.max_score}
          </p>
          {assignment.feedback && (
            <p className="text-sm text-green-700 mt-1">{assignment.feedback}</p>
          )}
        </div>
      );
    }

    if (assignment.status === 'submitted') {
      return (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-sm text-yellow-800">⏳ Submitted - Awaiting grading</p>
            {assignment.submission_url && assignment.submission_url.startsWith('http') && (
              <a 
                href={assignment.submission_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Submission
              </a>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isUploading ? "cursor-default opacity-60" : "cursor-pointer hover:border-orange-400"
          )}
          style={{ 
            borderColor: isUploading ? '#e0e0e0' : '#d1d5db',
            backgroundColor: isUploading ? '#f9fafb' : 'transparent'
          }}
          onClick={() => {
            if (!isUploading) {
              document.getElementById(`assignment-${assignment.id}`)?.click();
            }
          }}
        >
          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
              <p className="text-sm font-medium text-gray-700">
                {progress < 40 ? 'Preparing upload...' :
                 progress < 70 ? 'Uploading to storage...' :
                 progress < 90 ? 'Processing...' :
                 'Finalizing submission...'}
              </p>
              <div className="w-full max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ backgroundColor: '#f7530b', width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload your submission</p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, ZIP, or images · Max 10MB
              </p>
            </>
          )}
        </div>
        <input
          id={`assignment-${assignment.id}`}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.zip,.txt,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleSubmitAssignment(assignment.id, file);
            }
            e.target.value = '';
          }}
          disabled={isUploading}
        />
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Assignments
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Submit your assignments here.</p>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">No Assignments</h3>
            <p className="text-sm text-gray-500">You don't have any assignments yet.</p>
          </Card>
        ) : (
          assignments.map((sa) => (
            <Card key={sa.id} className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#fdddce' }}>
                  <FileText className="w-5 h-5" style={{ color: '#f7530b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm md:text-base">{sa.assignment?.title}</h3>
                      {sa.assignment?.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{sa.assignment.description}</p>
                      )}
                    </div>
                    <StatusBadge status={sa.status} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Assigned: {formatDate(sa.assigned_at)}</span>
                    {sa.submitted_at && <span>Submitted: {formatDate(sa.submitted_at)}</span>}
                    <span>Max score: {sa.assignment?.max_score || 100}</span>
                  </div>

                  {renderFileInput(sa)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
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
          toast({
            type: "success",
            title: "Welcome!",
            message: `Signed in as ${userProfile.full_name}`,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setView("landing");
      }
    });

    const handleOAuthRedirect = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const profile = await ensureProfile(
          data.session.user.id,
          data.session.user.email!,
          data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0]
        );
        if (profile) {
          const userProfile = profile as Profile;
          setProfile(userProfile);
          setView(userProfile.role === "admin" ? "admin-dashboard" : "student-dashboard");
        }
      }
    };
    handleOAuthRedirect();

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
    toast({
      type: "info",
      title: "Signed Out",
      message: "You have been signed out successfully.",
    });
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
        const { error } = await supabase
          .from("enrollments")
          .update({ current_module_index: currentModuleIndex + 1 })
          .eq("id", enrollment.id);
        
        if (!error) {
          await fetchEnrollments();
          await fetchProgress();
          toast({
            type: "success",
            title: "Module Complete!",
            message: `🎉 You've passed "${courseModules[currentModuleIndex].title}"!`,
          });
        }
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

    if (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }

    if (quiz) {
      const questionsWithQuizId = quizData.questions.map((q: any) => ({
        quiz_id: quiz.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
      }));
      
      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(questionsWithQuizId);
      
      if (questionsError) {
        console.error("Error creating quiz questions:", questionsError);
        await supabase.from("quizzes").delete().eq("id", quiz.id);
        throw questionsError;
      }
    }
  };

  const handleQuizDelete = async (quizId: string) => {
    await supabase.from("quiz_attempts").delete().eq("quiz_id", quizId);
    await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
    await supabase.from("quizzes").delete().eq("id", quizId);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#eeeeee' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#f7530b' }} />
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
              students: students?.length || 0,
              courses: courses?.length || 0,
              pendingPayments: 0,
              submittedAssignments: 0,
            }} 
          />;
        case "admin-courses":
          return <AdminCourses 
            courses={courses || []} 
            modules={modulesByCourse || {}}
            moduleContents={moduleContents || []}
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
            students={students || []} 
            onSendAssignment={handleSendAssignment}
            onViewProfile={(student) => setViewingStudent(student)}
          />;
        case "admin-payments":
          return <AdminPayments />;
        case "admin-assignments":
          return <AdminAssignments 
            courses={courses || []}
            modules={modules || []}
            onCreateAssignment={handleCreateAssignment}
            onGradeAssignment={handleGradeAssignment}
          />;
        case "admin-quizzes":
          return <AdminQuizzes 
            courses={courses || []}
            modules={modules || []}
            onQuizCreate={handleQuizCreate}
            onQuizDelete={handleQuizDelete}
          />;
        case "admin-chat":
          return <AdminChat courses={courses || []} students={students || []} />;
        case "admin-scholarship":
          return <AdminScholarship />;
        default:
          return <AdminDashboard onNavigate={setView} stats={{ students: 0, courses: 0, pendingPayments: 0, submittedAssignments: 0 }} />;
      }
    } else {
      const activeEnrollment = enrollments?.find(e => e.status === "active") || null;
      switch (view) {
        case "student-dashboard":
          return <StudentDashboard 
            profile={profile} 
            onNavigate={setView} 
            enrollments={enrollments || []} 
            progress={progress || []}
            modules={modules || []}
            courses={courses || []}
          />;
        case "student-courses":
          return <StudentCourses 
            profile={profile} 
            onNavigate={setView} 
            courses={courses || []} 
            enrollments={enrollments || []} 
            onEnroll={handleEnroll} 
          />;
        case "student-module":
          return <StudentModuleViewer 
            profile={profile} 
            enrollment={activeEnrollment || null} 
            modules={modulesByCourse?.[activeEnrollment?.course_id || ""] || []} 
            moduleContents={moduleContents || []}
            onNavigate={setView} 
            onProgressUpdate={handleProgressUpdate} 
          />;
        case "student-assignments":
          return <StudentAssignments profile={profile} />;
        case "student-payment":
          return <StudentPayments profile={profile} />;
        case "student-chat":
          return <StudentChat profile={profile} courses={courses || []} enrollments={enrollments || []} />;
        case "student-personal-messages":
          return <StudentPersonalMessages profile={profile} />;
        case "student-scholarship":
          return <StudentScholarship profile={profile} courses={courses || []} />;
        case "student-profile":
          return <StudentProfile 
            profile={profile} 
            onUpdate={handleUpdateProfile} 
            enrollments={enrollments || []}
            progress={progress || []}
            modules={modules || []}
          />;
        default:
          return <StudentDashboard 
            profile={profile} 
            onNavigate={setView} 
            enrollments={enrollments || []} 
            progress={progress || []}
            modules={modules || []}
            courses={courses || []}
          />;
      }
    }
  };

  return (
    <ToastAndConfirmProvider>
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#eeeeee', fontFamily: "'Poppins', sans-serif" }}>
        <Sidebar profile={profile} currentView={view} onNavigate={setView} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {renderView()}
        </main>
        {viewingStudent && (
          <AdminStudentProfile 
            student={viewingStudent} 
            onClose={() => setViewingStudent(null)} 
          />
        )}
      </div>
    </ToastAndConfirmProvider>
  );
}

// ─── Placeholder Components ──────────────────────────────────────────────────

function AdminDashboard({ onNavigate, stats }: any) { return <div>Admin Dashboard</div>; }
function AdminCourses({ courses, modules, moduleContents, onCourseAdd, onCourseUpdate, onCourseDelete, onModuleAdd, onModuleDelete, onModuleContentAdd, onModuleContentDelete }: any) { return <div>Admin Courses</div>; }
function AdminStudents({ students, onSendAssignment, onViewProfile }: any) { return <div>Admin Students</div>; }
function AdminPayments() { return <div>Admin Payments</div>; }
function AdminAssignments({ courses, modules, onCreateAssignment, onGradeAssignment }: any) { return <div>Admin Assignments</div>; }
function AdminQuizzes({ courses, modules, onQuizCreate, onQuizDelete }: any) { return <div>Admin Quizzes</div>; }
function AdminChat({ courses, students }: any) { return <div>Admin Chat</div>; }
function AdminScholarship() { return <div>Admin Scholarship</div>; }
function AdminStudentProfile({ student, onClose }: any) { return <div>Admin Student Profile</div>; }
function StudentCourses({ profile, onNavigate, courses, enrollments, onEnroll }: any) { return <div>Student Courses</div>; }
function StudentModuleViewer({ profile, enrollment, modules, moduleContents, onNavigate, onProgressUpdate }: any) { return <div>Student Module Viewer</div>; }
function StudentPayments({ profile }: any) { return <div>Student Payments</div>; }
function StudentChat({ profile, courses, enrollments }: any) { return <div>Student Chat</div>; }
function StudentPersonalMessages({ profile }: any) { return <div>Student Personal Messages</div>; }
function StudentScholarship({ profile, courses }: any) { return <div>Student Scholarship</div>; }
function StudentDashboard({ profile, onNavigate, enrollments, progress, modules, courses }: any) { return <div>Student Dashboard</div>; }
function StudentProfile({ profile, onUpdate, enrollments, progress, modules }: any) { return <div>Student Profile</div>; }
