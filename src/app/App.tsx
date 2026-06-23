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
  Unlock,
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
  | "admin-grading" 
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

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ onAuth, courses }: { onAuth: () => void; courses: Course[] }) {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#eeeeee', fontFamily: "'Poppins', sans-serif" }}>
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b rounded-b-lg" style={{ backgroundColor: '#333333', borderBottomColor: '#444444' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="https://i.postimg.cc/rm9PfbBv/PRUTALOGO-2.png" className="h-12 w-22 rounded object-contain" />
           
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#courses" className="hover:text-white transition-colors"></a>
            <a href="#how" className="hover:text-white transition-colors"></a>
            <a href="#why" className="hover:text-white transition-colors"></a>
          </div>
          <button
            onClick={onAuth}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5" style={{ backgroundColor: '#fdddce', borderColor: '#fcba9d' }}>
            <Star className="w-3.5 h-3.5 fill-current" style={{ color: '#f7530b' }} />
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#f7530b' }}>Globally Certified Programs</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1]" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Learn Without
            <span className="block italic" style={{ color: '#f7530b' }}>Limits.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-md">
            Structured 3-month courses taught by industry experts. Progress at your own pace, earn verified certificates, and transform your career.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-lg hover:opacity-90 transition-all hover:shadow-lg"
              style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
            >
              Enroll Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              style={{ backgroundColor: '#e0e0e0', color: '#333333' }}
            >
              Browse Courses
            </button>
          </div>
          <div className="flex items-center gap-8 pt-2">
            {[["1,200+", "Students Enrolled"], ["96%", "Completion Rate"], ["4.9★", "Avg. Rating"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>{v}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: '#e0e0e0' }}>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=500&fit=crop&auto=format"
              alt="Students learning"
              className="w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-xl border shadow-xl p-4 flex items-center gap-3" style={{ borderColor: '#e0e0e0' }}>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Module Passed!</p>
              <p className="text-xs text-gray-500">Score: 92/100</p>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 rounded-xl shadow-xl p-4" style={{ backgroundColor: '#f7530b' }}>
            <p className="text-white text-sm font-bold">3 Month</p>
            <p className="text-white/70 text-xs">Duration</p>
          </div>
        </div>
      </section>

      <section id="courses" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Featured Programs
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Handcrafted 3-month curricula — each module unlocks only after you demonstrate mastery.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              style={{ borderColor: '#e0e0e0' }}
              onClick={onAuth}
            >
              <div className="relative h-40 bg-gray-100 overflow-hidden">
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
                <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2">{course.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold" style={{ color: '#f7530b', fontFamily: "'Poppins', sans-serif" }}>
                    {formatNaira(course.price)}
                  </span>
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#f7530b' }}>
                    Enroll <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: '#333333' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              How It Works
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
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    <Icon className="w-7 h-7" style={{ color: '#f7530b' }} />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#f7530b', color: '#ffffff' }}>
                    {step[1]}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#fdddce' }}>
                    <Icon className="w-5 h-5" style={{ color: '#f7530b' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onAuth}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
            >
              Start Learning Today <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ borderColor: '#e0e0e0' }}>
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&h=550&fit=crop&auto=format"
              alt="Student studying"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: '#e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="https://i.postimg.cc/Qd3jCBQp/PRUTALOGO.png" alt="Pruta Academy" className="h-12 w-22 rounded object-contain" />
            
          </div>
          <p className="text-sm text-gray-500"></p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
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
            <img src="https://i.postimg.cc/rm9PfbBv/PRUTALOGO-2.png" alt="Pruta Academy" className="h-12 w-22 rounded object-contain bg-white/10 p-1" />
           
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
              <img src="https://i.postimg.cc/Qd3jCBQp/PRUTALOGO.png" alt="Pruta Academy" className="h-12 w-22 rounded object-contain" />
            
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
  
  // --- STUDENT NOTIFICATION COUNTS ---
  const [studentNewAssignmentsCount, setStudentNewAssignmentsCount] = useState(0);
  const [studentPendingPaymentsCount, setStudentPendingPaymentsCount] = useState(0);
  const [studentPendingScholarshipsCount, setStudentPendingScholarshipsCount] = useState(0);
  const [studentUnreadMessagesCount, setStudentUnreadMessagesCount] = useState(0);
  const [studentCourseChatCount, setStudentCourseChatCount] = useState(0);

  // --- ADMIN NOTIFICATION COUNTS ---
  const [adminPendingPaymentsCount, setAdminPendingPaymentsCount] = useState(0);
  const [adminPendingAssignmentsCount, setAdminPendingAssignmentsCount] = useState(0);
  const [adminPendingScholarshipsCount, setAdminPendingScholarshipsCount] = useState(0);
  const [adminPendingEnrollmentsCount, setAdminPendingEnrollmentsCount] = useState(0);
  const [adminUnreadMessagesCount, setAdminUnreadMessagesCount] = useState(0);
  const [adminCourseChatCount, setAdminCourseChatCount] = useState(0);

  // --- TRACK VIEWED NOTIFICATIONS FOR ADMIN (in-memory cache) ---
  const [adminViewed, setAdminViewed] = useState<Set<string>>(new Set());

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

  // --- STUDENT: MARK COURSE CHAT AS VIEWED ---
  const markCourseChatAsViewed = async () => {
    if (!profile) return;
    try {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      
      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map(e => e.course_id);
        
        const { error } = await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('course_id', courseIds)
          .neq('user_id', profile.id)
          .eq('read', false);
        
        if (error) {
          console.error('Error marking course chat as viewed:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // --- ADMIN: MARK COURSE CHAT AS VIEWED ---
  const markAdminCourseChatAsViewed = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('read', false);
      
      if (error) {
        console.error('Error marking admin course chat as viewed:', error);
      } else {
        setAdminViewed(prev => new Set(prev).add('admin-course-chat'));
        await fetchNotificationCounts();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // --- ADMIN: MARK PERSONAL MESSAGES AS VIEWED ---
  const markAdminChatAsViewed = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('personal_messages')
        .update({ read: true })
        .eq('receiver_id', profile.id)
        .eq('read', false);
      
      if (!error) {
        setAdminViewed(prev => new Set(prev).add('admin-chat'));
        await fetchNotificationCounts();
      }
    } catch (error) {
      console.error('Error marking admin chat as read:', error);
    }
  };
  
  // --- STUDENT: MARK ASSIGNMENTS AS VIEWED ---
  const markAssignmentsAsViewed = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('student_assignments')
        .update({ viewed_at: new Date().toISOString() })
        .eq('student_id', profile.id)
        .eq('status', 'pending')
        .is('viewed_at', null);
      
      if (!error) {
        await fetchNotificationCounts();
      }
    } catch (error) {
      console.error('Error marking assignments as viewed:', error);
    }
  };

  // --- STUDENT: MARK PAYMENTS AS VIEWED ---
  const markPaymentsAsViewed = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .update({ viewed_at: new Date().toISOString() })
        .eq('student_id', profile.id)
        .eq('status', 'pending')
        .is('viewed_at', null);
      
      if (!error) {
        await fetchNotificationCounts();
      }
    } catch (error) {
      console.error('Error marking payments as viewed:', error);
    }
  };

  // --- STUDENT: MARK SCHOLARSHIPS AS VIEWED ---
  const markScholarshipsAsViewed = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('scholarships')
        .update({ viewed_at: new Date().toISOString() })
        .eq('student_id', profile.id)
        .eq('status', 'pending')
        .is('viewed_at', null);
      
      if (!error) {
        await fetchNotificationCounts();
      }
    } catch (error) {
      console.error('Error marking scholarships as viewed:', error);
    }
  };

  // --- STUDENT: MARK MESSAGES AS READ ---
  const markMessagesAsRead = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('personal_messages')
        .update({ read: true })
        .eq('receiver_id', profile.id)
        .eq('read', false);
      
      if (!error) {
        await fetchNotificationCounts();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // --- ADMIN: MARK PAYMENTS AS VIEWED ---
  const markAdminPaymentsAsViewed = async () => {
    if (!profile) return;
    setAdminViewed(prev => new Set(prev).add('admin-payments'));
    await fetchNotificationCounts();
  };

  // --- ADMIN: MARK ASSIGNMENTS AS VIEWED ---
  const markAdminAssignmentsAsViewed = async () => {
    if (!profile) return;
    setAdminViewed(prev => new Set(prev).add('admin-assignments'));
    await fetchNotificationCounts();
  };

  // --- ADMIN: MARK SCHOLARSHIPS AS VIEWED ---
  const markAdminScholarshipsAsViewed = async () => {
    if (!profile) return;
    setAdminViewed(prev => new Set(prev).add('admin-scholarship'));
    await fetchNotificationCounts();
  };

  // --- ADMIN: MARK ENROLLMENTS AS VIEWED ---
  const markAdminEnrollmentsAsViewed = async () => {
    if (!profile) return;
    setAdminViewed(prev => new Set(prev).add('admin-students'));
    await fetchNotificationCounts();
  };

  // --- ADMIN: Should show notification? ---
  const shouldShowAdminNotification = (key: string, count: number) => {
    if (count <= 0) return false;
    return !adminViewed.has(key);
  };

  const fetchNotificationCounts = async () => {
    if (!profile) return;

    if (profile.role === 'admin') {
      // --- ADMIN NOTIFICATIONS ---
      const { count: paymentsCount } = await supabase
        .from('payment_receipts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      setAdminPendingPaymentsCount(paymentsCount || 0);

      const { count: assignmentsCount } = await supabase
        .from('student_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'submitted');
      setAdminPendingAssignmentsCount(assignmentsCount || 0);

      const { count: scholarshipsCount } = await supabase
        .from('scholarships')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      setAdminPendingScholarshipsCount(scholarshipsCount || 0);

      const { count: enrollmentsCount } = await supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending_payment', 'payment_submitted']);
      setAdminPendingEnrollmentsCount(enrollmentsCount || 0);

      const { count: messagesCount } = await supabase
        .from('personal_messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', profile.id)
        .eq('read', false);
      setAdminUnreadMessagesCount(messagesCount || 0);

      // --- ADMIN COURSE CHAT (all course chat messages) ---
      const { count: courseChatCount } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('read', false);
      setAdminCourseChatCount(courseChatCount || 0);

    } else if (profile.role === 'student') {
      // --- STUDENT NOTIFICATIONS ---
      
      // 1. NEW ASSIGNMENTS
      const { count: newAssignmentsCount } = await supabase
        .from('student_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', profile.id)
        .eq('status', 'pending')
        .is('viewed_at', null);
      setStudentNewAssignmentsCount(newAssignmentsCount || 0);

      // 2. PENDING PAYMENTS
      const { count: paymentsCount } = await supabase
        .from('payment_receipts')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', profile.id)
        .eq('status', 'pending')
        .is('viewed_at', null);
      setStudentPendingPaymentsCount(paymentsCount || 0);

      // 3. PENDING SCHOLARSHIPS
      const { count: scholarshipsCount } = await supabase
        .from('scholarships')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', profile.id)
        .eq('status', 'pending')
        .is('viewed_at', null);
      setStudentPendingScholarshipsCount(scholarshipsCount || 0);

      // 4. UNREAD PERSONAL MESSAGES
      const { count: messagesCount } = await supabase
        .from('personal_messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', profile.id)
        .eq('read', false);
      setStudentUnreadMessagesCount(messagesCount || 0);

      // 5. UNREAD COURSE CHAT MESSAGES
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', profile.id)
        .eq('status', 'active');
      
      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map(e => e.course_id);
        const { count: courseChatCount } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .in('course_id', courseIds)
          .neq('user_id', profile.id)
          .eq('read', false);
        setStudentCourseChatCount(courseChatCount || 0);
      } else {
        setStudentCourseChatCount(0);
      }
    }
  };
  
  // Handle navigation with notification clearing
  const handleNavigate = async (view: View, viewKey: string) => {
    if (profile?.role === 'student') {
      switch (viewKey) {
        case 'student-assignments':
          await markAssignmentsAsViewed();
          break;
        case 'student-payment':
          await markPaymentsAsViewed();
          break;
        case 'student-personal-messages':
          await markMessagesAsRead();
          break;
        case 'student-scholarship':
          await markScholarshipsAsViewed();
          break;
        case 'student-chat':
          await markCourseChatAsViewed();
          break;
        default:
          break;
      }
    } else if (profile?.role === 'admin') {
      switch (viewKey) {
        case 'admin-payments':
          await markAdminPaymentsAsViewed();
          break;
        case 'admin-assignments':
          await markAdminAssignmentsAsViewed();
          break;
        case 'admin-scholarship':
          await markAdminScholarshipsAsViewed();
          break;
        case 'admin-students':
          await markAdminEnrollmentsAsViewed();
          break;
        case 'admin-course-chat':
          await markAdminCourseChatAsViewed();
          break;
        case 'admin-chat':
          await markAdminChatAsViewed();
          break;
        default:
          break;
      }
    }    
    onNavigate(view);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  useEffect(() => {
    if (!profile) return;
    fetchNotificationCounts();
  }, [profile?.id]);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile) return;
    
    fetchNotificationCounts();
    
    const subscriptions = [];
    
    if (profile.role === 'admin') {
      // Admin subscriptions
      subscriptions.push(
        supabase
          .channel('admin-assignments-count')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'student_assignments' },
            () => {
              fetchNotificationCounts();
              setAdminViewed(prev => {
                const newSet = new Set(prev);
                newSet.delete('admin-assignments');
                return newSet;
              });
            }
          )
          .subscribe()
      );
      
      subscriptions.push(
        supabase
          .channel('admin-payments-count')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'payment_receipts' },
            () => {
              fetchNotificationCounts();
              setAdminViewed(prev => {
                const newSet = new Set(prev);
                newSet.delete('admin-payments');
                return newSet;
              });
            }
          )
          .subscribe()
      );
      
      subscriptions.push(
        supabase
          .channel('admin-scholarships-count')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'scholarships' },
            () => {
              fetchNotificationCounts();
              setAdminViewed(prev => {
                const newSet = new Set(prev);
                newSet.delete('admin-scholarship');
                return newSet;
              });
            }
          )
          .subscribe()
      );
      
      subscriptions.push(
        supabase
          .channel('admin-enrollments-count')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'enrollments' },
            () => {
              fetchNotificationCounts();
              setAdminViewed(prev => {
                const newSet = new Set(prev);
                newSet.delete('admin-students');
                return newSet;
              });
            }
          )
          .subscribe()
      );
      
      subscriptions.push(
        supabase
          .channel('admin-messages-count')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'personal_messages', filter: `receiver_id=eq.${profile.id}` },
            () => {
              fetchNotificationCounts();
              setAdminViewed(prev => {
                const newSet = new Set(prev);
                newSet.delete('admin-chat');
                return newSet;
              });
            }
          )
          .subscribe()
      );
      
      // Admin Course Chat subscription
      subscriptions.push(
        supabase
          .channel('admin-course-chat-count')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            () => {
              fetchNotificationCounts();
              setAdminViewed(prev => {
                const newSet = new Set(prev);
                newSet.delete('admin-course-chat');
                return newSet;
              });
            }
          )
          .subscribe()
      );
      
    } else if (profile.role === 'student') {
      // Student subscriptions
      subscriptions.push(
        supabase
          .channel('student-assignments-count')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'student_assignments', filter: `student_id=eq.${profile.id}` },
            () => fetchNotificationCounts()
          )
          .subscribe()
      );
      
      subscriptions.push(
        supabase
          .channel('student-payments-count')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'payment_receipts', filter: `student_id=eq.${profile.id}` },
            () => fetchNotificationCounts()
          )
          .subscribe()
      );
      
      subscriptions.push(
        supabase
          .channel('student-scholarships-count')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'scholarships', filter: `student_id=eq.${profile.id}` },
            () => fetchNotificationCounts()
          )
          .subscribe()
      );
      
      subscriptions.push(
        supabase
          .channel('student-messages-count')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'personal_messages', filter: `receiver_id=eq.${profile.id}` },
            () => fetchNotificationCounts()
          )
          .subscribe()
      );
      
      // Student Course Chat subscription
      subscriptions.push(
        supabase
          .channel('student-course-chat-count')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            () => fetchNotificationCounts()
          )
          .subscribe()
      );
    }
    
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [profile?.id, profile?.role]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  if (!profile) {
    return null;
  }

  // --- BUILD NAVIGATION ITEMS ---
  const studentNavItems = [];
  
  studentNavItems.push({ view: "student-dashboard" as View, icon: LayoutDashboard, label: "Dashboard", key: "student-dashboard" });
  studentNavItems.push({ view: "student-courses" as View, icon: BookOpen, label: "My Courses", key: "student-courses" });
  studentNavItems.push({ view: "student-module" as View, icon: Video, label: "Learning", key: "student-module" });
  
  // --- ASSIGNMENTS ---
  studentNavItems.push({ 
    view: "student-assignments" as View, 
    icon: ClipboardList, 
    label: "Assignments",
    key: "student-assignments",
    badge: studentNewAssignmentsCount > 0 ? studentNewAssignmentsCount : undefined
  });
  
  // --- PAYMENTS ---
  studentNavItems.push({ 
    view: "student-payment" as View, 
    icon: DollarSign, 
    label: "Payments",
    key: "student-payment",
    badge: studentPendingPaymentsCount > 0 ? studentPendingPaymentsCount : undefined
  });
  
  // --- COURSE CHAT ---
  studentNavItems.push({ 
    view: "student-chat" as View, 
    icon: MessageCircle, 
    label: "Course Chat",
    key: "student-chat",
    badge: studentCourseChatCount > 0 ? studentCourseChatCount : undefined
  });
  
  // --- PERSONAL MESSAGES ---
  studentNavItems.push({ 
    view: "student-personal-messages" as View, 
    icon: Mail, 
    label: "Admin Messages",
    key: "student-personal-messages",
    badge: studentUnreadMessagesCount > 0 ? studentUnreadMessagesCount : undefined
  });
  
  // --- SCHOLARSHIP ---
  studentNavItems.push({ 
    view: "student-scholarship" as View, 
    icon: Gift, 
    label: "Scholarship",
    key: "student-scholarship",
    badge: studentPendingScholarshipsCount > 0 ? studentPendingScholarshipsCount : undefined
  });
  
  studentNavItems.push({ view: "student-profile" as View, icon: User, label: "My Profile", key: "student-profile" });

// ─── ADMIN NAVIGATION ────────────────────────────────────────────────────────

const adminNavItems = [];

adminNavItems.push({ view: "admin-dashboard" as View, icon: LayoutDashboard, label: "Dashboard", key: "admin-dashboard" });
adminNavItems.push({ view: "admin-courses" as View, icon: BookOpen, label: "Courses & Modules", key: "admin-courses" });

// --- ADMIN STUDENTS ---
const showStudentsBadge = shouldShowAdminNotification('admin-students', adminPendingEnrollmentsCount);
adminNavItems.push({
  view: "admin-students" as View,
  icon: Users,
  label: "Students",
  key: "admin-students",
  badge: showStudentsBadge ? adminPendingEnrollmentsCount : undefined
});

// --- ADMIN PAYMENTS ---
const showPaymentsBadge = shouldShowAdminNotification('admin-payments', adminPendingPaymentsCount);
adminNavItems.push({
  view: "admin-payments" as View,
  icon: DollarSign,
  label: "Payments",
  key: "admin-payments",
  badge: showPaymentsBadge ? adminPendingPaymentsCount : undefined
});

// --- ADMIN ASSIGNMENTS ---
const showAssignmentsBadge = shouldShowAdminNotification('admin-assignments', adminPendingAssignmentsCount);
adminNavItems.push({
  view: "admin-assignments" as View,
  icon: ClipboardList,
  label: "Assignments",
  key: "admin-assignments",
  badge: showAssignmentsBadge ? adminPendingAssignmentsCount : undefined
});
  adminNavItems.push({ 
  view: "admin-grading" as View, 
  icon: Award, 
  label: "Grading", 
  key: "admin-grading" 
});

adminNavItems.push({ view: "admin-quizzes" as View, icon: HelpCircle, label: "Quizzes", key: "admin-quizzes" });

// --- ADMIN MESSAGES (Unified - Course Chat + Student Messages) ---
const totalAdminUnreadMessages = adminCourseChatCount + adminUnreadMessagesCount;
const showAdminMessagesBadge = shouldShowAdminNotification('admin-messages', totalAdminUnreadMessages);
adminNavItems.push({
  view: "admin-chat" as View,
  icon: MessageCircle,
  label: "Messages",
  key: "admin-messages",
  badge: showAdminMessagesBadge ? totalAdminUnreadMessages : undefined
});

// --- ADMIN SCHOLARSHIPS ---
const showScholarshipBadge = shouldShowAdminNotification('admin-scholarship', adminPendingScholarshipsCount);
adminNavItems.push({
  view: "admin-scholarship" as View,
  icon: Gift,
  label: "Scholarships",
  key: "admin-scholarship",
  badge: showScholarshipBadge ? adminPendingScholarshipsCount : undefined
});
    
    const nav = profile.role === "admin" ? adminNavItems : studentNavItems;

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
            {!collapsed && (
              <span className="font-bold text-lg flex-1 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Pruta Academy
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
            {nav.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavigate(item.view, item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                  currentView === item.view
                    ? "text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
                style={currentView === item.view ? { backgroundColor: '#f7530b' } : {}}
              >
                <item.icon className="w-5 h-5 shrink-0" style={currentView === item.view ? { color: '#ffffff' } : { color: '#fcba9d' }} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
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
          <span className="font-bold text-lg flex-1 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Pruta Academy
          </span>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <button
            key={item.view}
            onClick={() => handleNavigate(item.view, item.key)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
              currentView === item.view
                ? "text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            )}
            style={currentView === item.view ? { backgroundColor: '#f7530b' } : {}}
          >
            <item.icon className="w-4.5 h-4.5 shrink-0" style={currentView === item.view ? { color: '#ffffff' } : { color: '#fcba9d' }} />
            
            {!collapsed ? (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </>
            ) : (
              item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )
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
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");

  useEffect(() => {
    const markAsViewed = async () => {
      if (!profile) return;
      try {
        const { error } = await supabase
          .from('student_assignments')
          .update({ viewed_at: new Date().toISOString() })
          .eq('student_id', profile.id)
          .eq('status', 'pending')
          .is('viewed_at', null);
        if (error) {
          console.error('Error marking assignments as viewed:', error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    markAsViewed();
    fetchAssignments();
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

  const filteredAssignments = assignments.filter(sa => {
    if (filter === "all") return true;
    return sa.status === filter;
  });

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
        title: "Assignment Submitted!",
        message: "Your assignment has been submitted successfully.",
      });
      
      await fetchAssignments();
      
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        type: "error",
        title: "Upload Failed",
        message: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setUploading(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const renderFileInput = (assignment: StudentAssignment) => {
    const isUploading = uploading[assignment.id];
    const progress = uploadProgress[assignment.id] || 0;

    if (assignment.status === 'graded') {
      return (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800">
            ✅ Grade: {assignment.score}/{assignment.assignment?.max_score || 100}
          </p>
          {assignment.feedback && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Feedback:</p>
              <p className="text-sm text-gray-600 mt-0.5">{assignment.feedback}</p>
            </div>
          )}
          {assignment.submission_url && assignment.submission_url.startsWith('http') && (
            <a 
              href={assignment.submission_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> View Your Submission
            </a>
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
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View Submission
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

  const getStatusCounts = () => {
    const total = assignments.length;
    const pending = assignments.filter(sa => sa.status === "pending").length;
    const submitted = assignments.filter(sa => sa.status === "submitted").length;
    const graded = assignments.filter(sa => sa.status === "graded").length;
    return { total, pending, submitted, graded };
  };

  const counts = getStatusCounts();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Assignments
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Submit your assignments and view feedback.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: `All (${counts.total})` },
          { key: "pending", label: `Pending (${counts.pending})` },
          { key: "submitted", label: `Submitted (${counts.submitted})` },
          { key: "graded", label: `Graded (${counts.graded})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === tab.key
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            style={filter === tab.key ? { backgroundColor: '#f7530b' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">No Assignments</h3>
            <p className="text-sm text-gray-500">
              {filter === "all" 
                ? "You don't have any assignments yet." 
                : filter === "graded" 
                  ? "You don't have any graded assignments yet." 
                  : `No ${filter} assignments.`}
            </p>
          </Card>
        ) : (
          filteredAssignments.map((sa) => (
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
                    {sa.status === "graded" && sa.graded_at && (
                      <span>Graded: {formatDate(sa.graded_at)}</span>
                    )}
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

// ─── Student Profile ──────────────────────────────────────────────────────────

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
  const [studentProfile, setStudentProfile] = useState<any>(null);

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
      setStudentProfile(data);
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
    
    try {
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
      
      await fetchStudentProfile();
      
      toast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeEnrollments = enrollments?.filter(e => e.status === "active") || [];
  const passedCount = progress?.filter(p => p.status === "passed").length || 0;
  const totalModules = modules?.length || 0;
  const completion = calculateProfileCompletion(profile, studentProfile);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          My Profile
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your personal information and view your progress</p>
      </div>

      <Card className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar name={fullName} size="lg" src={avatarPreview || undefined} />
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-colors"
                       style={{ backgroundColor: '#f7530b' }}>
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">
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
                <PhoneInput 
                  label="Phone Number" 
                  value={phone} 
                  onChange={setPhone}
                  placeholder="812 345 6789" 
                />
                <Textarea label="Address" value={address} onChange={setAddress} placeholder="Your address" rows={2} />
                <Input label="Date of Birth" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 font-medium rounded-lg hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    style={{ backgroundColor: '#e0e0e0', color: '#333333' }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-b pb-4" style={{ borderColor: '#e0e0e0' }}>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.full_name}</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: '#e0e0e0' }}>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.email}</p>
                </div>
                {bio && (
                  <div className="border-b pb-4" style={{ borderColor: '#e0e0e0' }}>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="text-gray-700">{bio}</p>
                  </div>
                )}
                {phone && (
                  <div className="border-b pb-4" style={{ borderColor: '#e0e0e0' }}>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-700">{formatPhoneNumber(phone)}</p>
                  </div>
                )}
                {address && (
                  <div className="border-b pb-4" style={{ borderColor: '#e0e0e0' }}>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-700">{address}</p>
                  </div>
                )}
                {dateOfBirth && (
                  <div className="border-b pb-4" style={{ borderColor: '#e0e0e0' }}>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-gray-700">{formatDate(dateOfBirth)}</p>
                  </div>
                )}
                <div className="pt-4">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-700">{formatDate(profile.created_at)}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-6 py-2 font-medium rounded-lg hover:opacity-80 transition-colors flex items-center gap-2 w-fit"
                  style={{ backgroundColor: '#fdddce', color: '#f7530b' }}
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <ProfileCompletionBadge 
          profile={profile} 
          studentProfile={studentProfile}
          onClick={() => {
            if (!isEditing) setIsEditing(true);
          }}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 flex flex-col items-center">
            <CircularProgress value={activeEnrollments.length} max={10} size={80} label="Active Courses" />
          </Card>
          <Card className="p-6 flex flex-col items-center">
            <CircularProgress value={passedCount} max={totalModules || 1} size={80} label="Modules Passed" onClick={() => {}} />
          </Card>
          <Card className="p-6 flex flex-col items-center">
            <CircularProgress value={totalModules > 0 ? Math.round((passedCount / totalModules) * 100) : 0} max={100} size={80} label="Overall Progress" />
          </Card>
        </div>
      </div>

      {activeEnrollments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Courses</h2>
          <div className="space-y-4">
            {activeEnrollments.map((enrollment) => {
              const courseModules = modules?.filter(m => m.course_id === enrollment.course_id) || [];
              const passedModules = progress?.filter(p => 
                p.enrollment_id === enrollment.id && p.status === "passed"
              ) || [];
              
              return (
                <Card key={enrollment.id} className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img 
                        src={enrollment.course?.thumbnail_url} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-gray-800">{enrollment.course?.title}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <StatusBadge status={enrollment.status} />
                        <span className="text-xs text-gray-500">
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

// ─── Student Dashboard ──────────────────────────────────────────────────────

function StudentDashboard({ profile, onNavigate, enrollments, progress, modules, courses }: { 
  profile: Profile; 
  onNavigate: (v: View) => void;
  enrollments: Enrollment[];
  progress: ModuleProgress[];
  modules: Module[];
  courses: Course[];
}) {
  const safeEnrollments = enrollments || [];
  const safeProgress = progress || [];
  const safeModules = modules || [];
  
  const activeEnrollment = safeEnrollments.find(e => e?.status === "active") || null;
  const pendingEnrollments = safeEnrollments.filter(e => e?.status === "pending_payment" || e?.status === "payment_submitted") || [];
  const [scholarshipApplications, setScholarshipApplications] = useState<any[]>([]);
  
  let passedCount = 0;
  let totalModulesForActiveCourse = 0;
  
  if (activeEnrollment) {
    const courseModules = safeModules.filter(m => m?.course_id === activeEnrollment?.course_id);
    totalModulesForActiveCourse = courseModules.length;
    
    passedCount = safeProgress.filter(p => 
      p?.enrollment_id === activeEnrollment?.id && 
      p?.status === "passed"
    ).length;
  }

  useEffect(() => {
    fetchScholarshipStatus();
  }, [profile.id]);

  const fetchScholarshipStatus = async () => {
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("student_id", profile.id)
      .order("submitted_at", { ascending: false });
    if (data) setScholarshipApplications(data);
  };

  const hasPendingScholarship = scholarshipApplications.some(s => s.status === "pending");
  const hasApprovedScholarship = scholarshipApplications.some(s => s.status === "approved");

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
        <p className="text-gray-500 mt-4">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Scholarship banner */}
      <div 
        className={cn(
          "p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all flex items-center gap-4",
          hasApprovedScholarship 
            ? "bg-green-50 border-green-200" 
            : hasPendingScholarship 
              ? "bg-amber-50 border-amber-200" 
              : "border-orange-200"
        )}
        style={!hasApprovedScholarship && !hasPendingScholarship ? { backgroundColor: '#fdddce' } : {}}
        onClick={() => onNavigate("student-scholarship")}
      >
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
          hasApprovedScholarship 
            ? "bg-green-100" 
            : hasPendingScholarship 
              ? "bg-amber-100" 
              : "bg-orange-100"
        )}>
          <Gift className={cn(
            "w-6 h-6",
            hasApprovedScholarship 
              ? "text-green-600" 
              : hasPendingScholarship 
                ? "text-amber-600" 
                : "text-orange-600"
          )} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">
            {hasApprovedScholarship 
              ? "🎉 Scholarship Approved!" 
              : hasPendingScholarship 
                ? "⏳ Scholarship Application Pending" 
                : "🎓 Apply for a Scholarship"}
          </p>
          <p className="text-sm text-gray-500">
            {hasApprovedScholarship 
              ? "Your scholarship has been approved. Check your email for details." 
              : hasPendingScholarship 
                ? "Your application is being reviewed by the admin." 
                : "Apply for a scholarship to get financial support for your education."}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      {pendingEnrollments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
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
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Welcome back, {profile.full_name?.split(" ")[0] || "Student"}! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Here's your learning progress at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={safeEnrollments.filter(e => e?.status === "active").length} />
        <StatCard 
          icon={CheckCircle} 
          label="Modules Passed" 
          value={passedCount} 
          onClick={() => activeEnrollment && onNavigate("student-module")}
        />
        <StatCard icon={ClipboardList} label="Assignments Due" value={0} />
        <StatCard icon={Award} label="Certificates Earned" value={activeEnrollment?.status === "completed" ? 1 : 0} />
      </div>

      {activeEnrollment && activeEnrollment.course ? (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-lg md:text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Active Course Progress
                </h2>
                <button
                  onClick={() => onNavigate("student-module")}
                  className="text-xs hover:underline flex items-center gap-1"
                  style={{ color: '#f7530b' }}
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-5">
                <div className="w-full md:w-24 h-32 md:h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img 
                    src={activeEnrollment.course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format"} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-base md:text-lg">{activeEnrollment.course.title || "Course"}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Module {activeEnrollment.current_module_index + 1 || 1} · Expires {formatDate(activeEnrollment.expires_at || "")}
                  </p>
                  <StatusBadge status={activeEnrollment.status || "active"} />
                </div>
              </div>
              <button
                onClick={() => onNavigate("student-module")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
              >
                <Play className="w-3.5 h-3.5" /> Continue Learning
              </button>
            </Card>
          </div>

          <div className="flex items-center justify-center">
            <Card className="p-6 w-full flex flex-col items-center">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm text-center">Overall Progress</h3>
              <CircularProgress 
                value={activeEnrollment.current_module_index + 1} 
                max={totalModulesForActiveCourse || 5} 
                size={120}
                onClick={() => onNavigate("student-module")}
              />
              <p className="text-xs text-gray-500 mt-3 text-center">
                {activeEnrollment.current_module_index + 1} modules passed
              </p>
                    
              {passedCount === totalModulesForActiveCourse && totalModulesForActiveCourse > 0 && (
                <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  🎉 Course Complete!
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : safeEnrollments.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">No Active Courses</h3>
          <p className="text-sm text-gray-500">
            You haven't enrolled in any courses yet. Browse our programs and start learning!
          </p>
          <button
            onClick={() => onNavigate("student-courses")}
            className="mt-4 px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            Browse Courses
          </button>
        </Card>
      ) : null}
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

  const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
  const availableCourses = courses?.filter(c => !enrolledCourseIds.includes(c.id)) || [];
  
  const activeEnrollments = enrollments?.filter(e => e.status === "active") || [];
  const pendingEnrollments = enrollments?.filter(e => e.status === "pending_payment" || e.status === "payment_submitted") || [];
  
  const otherCourses = courses?.filter(c => !enrolledCourseIds.includes(c.id)) || [];

  const handleEnrollSubmit = async () => {
    if (!selectedCourse || !receiptFile) {
      toast({
        type: "warning",
        title: "Missing Information",
        message: "Please select a course and upload a payment receipt.",
      });
      return;
    }
    
    setUploading(true);
    setSubmitting(true);
    
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${profile.id}-${selectedCourse.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile);
      
      if (uploadError) {
        toast({
          type: "error",
          title: "Upload Failed",
          message: "Failed to upload receipt. Please try again.",
        });
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
        toast({
          type: "error",
          title: "Enrollment Failed",
          message: "Failed to create enrollment. Please try again.",
        });
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
          toast({
            type: "warning",
            title: "Payment Recorded",
            message: "Payment recorded but please contact admin.",
          });
        } else {
          toast({
            type: "success",
            title: "Enrollment Submitted!",
            message: `Your enrollment for ${selectedCourse.title} is pending admin approval.`,
          });
        }
      }

      await onEnroll(selectedCourse.id);
      
      setShowEnroll(false);
      setSelectedCourse(null);
      setReceiptFile(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Error",
        message: "An error occurred. Please try again.",
      });
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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            My Courses
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your enrollments and track payment status.</p>
        </div>
        <button
          onClick={() => setShowEnroll(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto justify-center"
          style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
        >
          <Plus className="w-4 h-4" /> Enroll in Course
        </button>
      </div>

      {activeEnrollments.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Active Courses ({activeEnrollments.length})
          </h2>
          <div className="space-y-4">
            {activeEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <div className="w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={enrollment.course?.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                      <div>
                        <p className="font-bold text-gray-800 text-base md:text-lg">{enrollment.course?.title}</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
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
                    <p className="text-xs text-gray-500 mt-1">Module {enrollment.current_module_index + 1} of 5</p>
                    <button
                      onClick={() => onNavigate("student-module")}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
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
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" /> Pending Approvals ({pendingEnrollments.length})
          </h2>
          <div className="space-y-4">
            {pendingEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-4 md:p-6 bg-yellow-50/30 border-yellow-200">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <div className="w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={enrollment.course?.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                      <div>
                        <p className="font-bold text-gray-800 text-base md:text-lg">{enrollment.course?.title}</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
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
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
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

      {otherCourses.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Explore Other Programs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {otherCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ borderColor: '#e0e0e0' }}>
                <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden">
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
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg mb-2 leading-snug">{course.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-bold" style={{ color: '#f7530b', fontFamily: "'Poppins', sans-serif" }}>
                      {formatNaira(course.price)}
                    </span>
                    <button
                      onClick={() => { setSelectedCourse(course); setShowEnroll(true); }}
                      className="px-4 md:px-5 py-2 md:py-2.5 text-sm font-semibold rounded-lg hover:opacity-80 transition-colors"
                      style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
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

      {activeEnrollments.length === 0 && pendingEnrollments.length === 0 && otherCourses.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No courses available at the moment.</p>
        </Card>
      )}

      <Modal open={showEnroll} onClose={() => { setShowEnroll(false); setSelectedCourse(null); setReceiptFile(null); }} title="Enroll in a Course">
        {!selectedCourse ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-3">Select a course to enroll:</p>
            {otherCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className="w-full text-left p-4 rounded-lg border hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center gap-4" style={{ borderColor: '#e0e0e0' }}
              >
                <img src={c.thumbnail_url} alt="" className="w-14 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500">{formatNaira(c.price)} · {c.duration_months} months</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-800">{selectedCourse.title}</p>
              <p className="text-sm text-gray-500 mt-1">{formatNaira(selectedCourse.price)} · {selectedCourse.duration_months} months access</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
            
            <div className="p-4 border rounded-lg space-y-2" style={{ backgroundColor: '#fdddce', borderColor: '#fcba9d' }}>
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: '#f7530b' }} /> Payment Details
              </p>
              <p className="text-sm text-gray-600">Transfer <strong style={{ color: '#f7530b' }}>{formatNaira(selectedCourse.price)}</strong> to:</p>
              <div className="bg-white rounded-lg p-3 font-mono text-sm space-y-1 border" style={{ borderColor: '#e0e0e0' }}>
                <p><span className="text-gray-500">Bank:</span> Pruta Academy</p>
                <p><span className="text-gray-500">Account:</span> 0123456789</p>
                <p><span className="text-gray-500">Bank:</span> First Bank of Nigeria</p>
                <p><span className="text-gray-500">Reference:</span> {profile.id.slice(0, 8).toUpperCase()}-{selectedCourse.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
            
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer" style={{ borderColor: '#e0e0e0' }}
              onClick={() => document.getElementById("receipt-upload")?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">{receiptFile ? receiptFile.name : "Upload Payment Receipt"}</p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG · Max 10MB</p>
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
              className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Enrollment Request</>}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Student Chat ──────────────────────────────────────────────────────────

function StudentChat({ profile, courses, enrollments }: { profile: Profile; courses: Course[]; enrollments: Enrollment[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCourseList, setShowCourseList] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeEnrollments = enrollments.filter(e => e.status === "active");
  const enrolledCourses = courses.filter(c => activeEnrollments.some(e => e.course_id === c.id));

  useEffect(() => {
    if (selectedCourseId) {
      fetchMessages();
      
      const markAsRead = async () => {
        try {
          const { error } = await supabase
            .from('chat_messages')
            .update({ read: true })
            .eq('course_id', selectedCourseId)
            .neq('user_id', profile.id)
            .eq('read', false);
          if (error) {
            console.error('Error marking messages as read:', error);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      markAsRead();
      
      const subscription = supabase
        .channel(`chat-${selectedCourseId}`)
        .on("postgres_changes", 
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `course_id=eq.${selectedCourseId}` },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (isMobile && enrolledCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(enrolledCourses[0].id);
      setShowCourseList(false);
    }
  }, [isMobile, enrolledCourses]);

  const fetchMessages = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("course_id", selectedCourseId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCourseId || sending) return;
    setSending(true);
    
    const { error } = await supabase.from("chat_messages").insert({
      course_id: selectedCourseId,
      user_id: profile.id,
      user_name: profile.full_name,
      user_avatar: profile.avatar_url,
      message: newMessage.trim(),
    });
    
    if (!error) {
      setNewMessage("");
      fetchMessages();
    }
    setSending(false);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (isMobile) {
      setShowCourseList(false);
    }
  };

  const handleBackToCourses = () => {
    setShowCourseList(true);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Mobile chat view
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-[#eeeeee]" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="p-4 bg-white border-b shadow-sm sticky top-0 z-10" style={{ borderColor: '#e0e0e0' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!showCourseList && (
                <button
                  onClick={handleBackToCourses}
                  className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h1 className="text-lg font-bold text-gray-800">
                {showCourseList ? "Course Chat" : selectedCourse?.title || "Chat"}
              </h1>
            </div>
            {!showCourseList && (
              <button
                onClick={handleBackToCourses}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {showCourseList ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {enrolledCourses.length === 0 && (
              <Card className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active courses yet.</p>
                <p className="text-xs text-gray-400 mt-1">Enroll in a course to join the chat.</p>
              </Card>
            )}
            {enrolledCourses.map((course) => (
              <Card
                key={course.id}
                className="p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => handleCourseSelect(course.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img 
                      src={course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format"} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{course.title}</p>
                    <p className="text-xs text-gray-500">Tap to join chat</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f7530b' }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No messages yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start gap-2 max-w-[85%]",
                      msg.user_id === profile.id ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <Avatar name={msg.user_name} size="sm" src={msg.user_avatar} />
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      msg.user_id === profile.id
                        ? "text-white"
                        : "bg-gray-100 text-gray-800"
                    )}
                    style={msg.user_id === profile.id ? { backgroundColor: '#f7530b' } : {}}
                    >
                      <p className="text-xs font-medium opacity-70">{msg.user_name}</p>
                      <p className="mt-0.5 break-words">{msg.message}</p>
                      <p className="text-xs opacity-50 mt-1">{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t flex gap-2 bg-white" style={{ borderColor: '#e0e0e0' }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 hover:opacity-90 transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop chat view
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Course Chat
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Connect with other students in your courses.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 h-[calc(100%-80px)]">
        <div className="md:col-span-1 bg-white rounded-xl border p-4 overflow-y-auto" style={{ borderColor: '#e0e0e0' }}>
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Your Courses</h3>
          <div className="space-y-2">
            {enrolledCourses.length === 0 && (
              <p className="text-xs text-gray-500">No active courses yet.</p>
            )}
            {enrolledCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg text-sm transition-all",
                  selectedCourseId === course.id
                    ? "border" : "hover:bg-gray-50 text-gray-600"
                )}
                style={selectedCourseId === course.id ? { backgroundColor: '#fdddce', borderColor: '#fcba9d', color: '#f7530b' } : {}}
              >
                <p className="font-medium truncate">{course.title}</p>
                <p className="text-xs text-gray-500">Click to chat</p>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 bg-white rounded-xl border flex flex-col" style={{ borderColor: '#e0e0e0' }}>
          {!selectedCourseId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Select a course to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b" style={{ borderColor: '#e0e0e0' }}>
                <p className="font-semibold text-gray-800">
                  {courses.find(c => c.id === selectedCourseId)?.title || "Course Chat"}
                </p>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f7530b' }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-3 max-w-[80%]",
                        msg.user_id === profile.id ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <Avatar name={msg.user_name} size="sm" src={msg.user_avatar} />
                      <div className={cn(
                        "p-3 rounded-lg text-sm",
                        msg.user_id === profile.id
                          ? "text-white"
                          : "bg-gray-100 text-gray-800"
                      )}
                      style={msg.user_id === profile.id ? { backgroundColor: '#f7530b' } : {}}
                      >
                        <p className="text-xs font-medium opacity-70">{msg.user_name}</p>
                        <p className="mt-0.5">{msg.message}</p>
                        <p className="text-xs opacity-50 mt-1">{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t flex gap-3" style={{ borderColor: '#e0e0e0' }}>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Student Personal Messages ────────────────────────────────────────────

function StudentPersonalMessages({ profile }: { profile: Profile }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (profile) {
      const markAsRead = async () => {
        try {
          const { error } = await supabase
            .from('personal_messages')
            .update({ read: true })
            .eq('receiver_id', profile.id)
            .eq('read', false);
          
          if (error) {
            console.error('Error marking messages as read:', error);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      markAsRead();
      fetchMessages();
    }
  }, [profile?.id]);
  
  const fetchMessages = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from("personal_messages")
      .select("*")
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data);
      await supabase
        .from("personal_messages")
        .update({ read: true })
        .eq('receiver_id', profile.id);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !profile) return;
    setSending(true);
    
    const { data: admin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (!admin) {
      toast({
        type: "error",
        title: "No Admin Found",
        message: "Unable to send message. No admin available.",
      });
      setSending(false);
      return;
    }

    const { error } = await supabase.from("personal_messages").insert({
      sender_id: profile.id,
      receiver_id: admin.id,
      message: newMessage.trim(),
    });
    
    if (!error) {
      setNewMessage("");
      fetchMessages();
      toast({
        type: "success",
        title: "Message Sent",
        message: "Your message has been sent to the admin.",
      });
    } else {
      toast({
        type: "error",
        title: "Failed to Send",
        message: "Could not send message. Please try again.",
      });
    }
    setSending(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-100px)]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Messages
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Chat with the admin directly.</p>
      </div>

      <div className="bg-white rounded-xl border flex flex-col h-[calc(100%-80px)]" style={{ borderColor: '#e0e0e0' }}>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f7530b' }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No messages yet.</p>
              <p className="text-xs mt-1">Send a message to the admin for support.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 max-w-[80%]",
                  msg.sender_id === profile?.id ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <Avatar 
                  name={msg.sender_id === profile?.id ? profile?.full_name || "You" : "Admin"} 
                  size="sm" 
                />
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  msg.sender_id === profile?.id
                    ? "text-white"
                    : "bg-gray-100 text-gray-800"
                )}
                style={msg.sender_id === profile?.id ? { backgroundColor: '#f7530b' } : {}}
                >
                  <p className="text-xs font-medium opacity-70">
                    {msg.sender_id === profile?.id ? "You" : "Admin"}
                  </p>
                  <p className="mt-0.5">{msg.message}</p>
                  <p className="text-xs opacity-50 mt-1">{formatTime(msg.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t flex gap-3" style={{ borderColor: '#e0e0e0' }}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message admin..."
            className="flex-1 px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Scholarship ───────────────────────────────────────────────────

function StudentScholarship({ profile, courses }: { profile: Profile; courses: Course[] }) {
  const [applications, setApplications] = useState<Scholarship[]>([]);
  const [showApply, setShowApply] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [reason, setReason] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const markAsViewed = async () => {
      if (!profile) return;
      try {
        const { error } = await supabase
          .from('scholarships')
          .update({ viewed_at: new Date().toISOString() })
          .eq('student_id', profile.id)
          .eq('status', 'pending')
          .is('viewed_at', null);
        if (error) {
          console.error('Error marking scholarships as viewed:', error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    markAsViewed();
    fetchApplications();
  }, [profile.id]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("student_id", profile.id)
      .order("submitted_at", { ascending: false });
    if (data) setApplications(data as Scholarship[]);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!selectedCourse || !reason || !phone) {
      toast({
        type: "warning",
        title: "Missing Information",
        message: "Please fill in all fields.",
      });
      return;
    }

    if (!validatePhoneNumber(phone)) {
      toast({
        type: "error",
        title: "Invalid Phone",
        message: "Please enter a valid phone number with country code.",
      });
      return;
    }

    setSubmitting(true);
    const course = courses.find(c => c.id === selectedCourse);
    
    const { error } = await supabase.from("scholarships").insert({
      student_id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: phone,
      course_id: selectedCourse,
      course_title: course?.title || "",
      reason: reason,
      status: "pending",
    });

    if (!error) {
      toast({
        type: "success",
        title: "Application Submitted",
        message: "Your scholarship application has been submitted successfully!",
      });
      setShowApply(false);
      setSelectedCourse("");
      setReason("");
      setPhone("");
      fetchApplications();
    } else {
      toast({
        type: "error",
        title: "Submission Failed",
        message: "Failed to submit application. Please try again.",
      });
    }
    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-50 border-green-200";
      case "rejected": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-amber-600 bg-amber-50 border-amber-200";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Scholarships
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Apply for financial support for your education.</p>
        </div>
        <button
          onClick={() => setShowApply(true)}
          className="px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
        >
          <Plus className="w-4 h-4" /> Apply for Scholarship
        </button>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">No Applications</h3>
            <p className="text-sm text-gray-500">
              You haven't applied for any scholarships yet.
            </p>
            <button
              onClick={() => setShowApply(true)}
              className="mt-4 px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
            >
              Apply Now
            </button>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{app.course_title}</p>
                  <p className="text-sm text-gray-500 mt-1">{app.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {formatDate(app.submitted_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    getStatusColor(app.status)
                  )}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  {app.status === "approved" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {app.status === "rejected" && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
              {app.admin_notes && (
                <div className="mt-3 p-3 bg-gray-100 rounded-lg text-sm text-gray-500">
                  <p className="font-medium">Admin Note:</p>
                  <p>{app.admin_notes}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply for Scholarship">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📝 Apply for a scholarship to get financial support for your chosen course.
              Your application will be reviewed by the admin.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Select Course <span className="text-red-500">*</span></label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
            >
              <option value="">Select a course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title} - {formatNaira(c.price)}</option>
              ))}
            </select>
          </div>

          <PhoneInput
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            placeholder="812 345 6789"
            required
          />

          <Textarea
            label="Why do you need a scholarship?"
            value={reason}
            onChange={setReason}
            placeholder="Explain why you need financial support and how this course will help you..."
            rows={4}
            required
          />

          <button
            onClick={handleApply}
            disabled={submitting || !selectedCourse || !reason || !phone}
            className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Application
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Student Module Viewer ──────────────────────────────────────────────────

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
  const [activeTab, setActiveTab] = useState<"content" | "quiz" | "exam">("content");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [progressData, setProgressData] = useState<ModuleProgress[]>([]);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizAttempted, setQuizAttempted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(enrollment);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [quizRefreshKey, setQuizRefreshKey] = useState(0);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>([]);
  const [manualCompleteLoading, setManualCompleteLoading] = useState(false);

  useEffect(() => {
    if (enrollment) {
      fetchStudentAssignments();
    }
  }, [enrollment]);

  const fetchStudentAssignments = async () => {
    if (!enrollment) return;
    const { data } = await supabase
      .from("student_assignments")
      .select("*, assignment:assignment_id(*)")
      .eq("student_id", profile.id)
      .eq("enrollment_id", enrollment.id);
    if (data) setStudentAssignments(data as StudentAssignment[]);
  };

  useEffect(() => {
    if (enrollment) {
      setCurrentEnrollment(enrollment);
      setSelectedModuleIndex(enrollment.current_module_index || 0);
      fetchProgress();
      fetchQuizForModule();
    }
  }, [enrollment, quizRefreshKey]);

  useEffect(() => {
    if (enrollment) {
      const refreshInterval = setInterval(() => {
        fetchEnrollmentData();
      }, 3000);
      return () => clearInterval(refreshInterval);
    }
  }, [enrollment]);

  const fetchEnrollmentData = async () => {
    if (!enrollment) return;
    const { data } = await supabase
      .from("enrollments")
      .select("*, course:course_id(*)")
      .eq("id", enrollment.id)
      .single();
    if (data) {
      setCurrentEnrollment(data as Enrollment);
      if (data.current_module_index !== selectedModuleIndex && !isAdvancing) {
        setSelectedModuleIndex(data.current_module_index);
        setTimeout(() => fetchQuizForModule(), 100);
      }
    }
  };

  const fetchProgress = async () => {
    if (!enrollment) return;
    const { data } = await supabase
      .from("module_progress")
      .select("*")
      .eq("enrollment_id", enrollment.id);
    if (data) setProgressData(data as ModuleProgress[]);
  };

  const fetchQuizForModule = async () => {
    if (!currentModule) {
      setLoadingQuiz(false);
      setQuizData(null);
      setQuizQuestions([]);
      return;
    }
    
    setLoadingQuiz(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizScore(0);
    setQuizAttempted(false);
    
    try {
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("module_id", currentModule.id)
        .maybeSingle();
      
      if (quizError) {
        console.error("Error fetching quiz:", quizError);
        setQuizData(null);
        setQuizQuestions([]);
        setLoadingQuiz(false);
        return;
      }
      
      if (quiz) {
        setQuizData(quiz);
        
        const { data: questions, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.id)
          .order("order_index", { ascending: true });
        
        if (questionsError) {
          console.error("Error fetching quiz questions:", questionsError);
          setQuizQuestions([]);
          setLoadingQuiz(false);
          return;
        } else if (questions && questions.length > 0) {
          setQuizQuestions(questions);
        } else {
          setQuizQuestions([]);
          setLoadingQuiz(false);
          return;
        }
        
        const { data: attempt, error: attemptError } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("quiz_id", quiz.id)
          .eq("student_id", profile.id)
          .eq("enrollment_id", enrollment?.id)
          .maybeSingle();
        
        if (attemptError) {
          console.error("Error fetching quiz attempt:", attemptError);
        } else if (attempt) {
          setQuizAttempted(true);
          setQuizSubmitted(true);
          setQuizScore(attempt.score);
        }
      } else {
        setQuizData(null);
        setQuizQuestions([]);
      }
    } catch (error) {
      console.error("Error in fetchQuizForModule:", error);
      setQuizData(null);
      setQuizQuestions([]);
    }
    setLoadingQuiz(false);
  };

  const canPassModule = async (moduleId: string): Promise<{ canPass: boolean; score: number; reason: string }> => {
    const existingProgress = progressData.find(p => p.module_id === moduleId);
    if (existingProgress?.status === "passed") {
      return { canPass: true, score: existingProgress.score || 100, reason: "Already passed" };
    }

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("id")
      .eq("module_id", moduleId)
      .maybeSingle();

    if (quiz) {
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("id")
        .eq("quiz_id", quiz.id)
        .limit(1);
      
      if (questions && questions.length > 0) {
        const { data: attempt } = await supabase
          .from("quiz_attempts")
          .select("score, passed")
          .eq("quiz_id", quiz.id)
          .eq("student_id", profile.id)
          .eq("enrollment_id", enrollment?.id)
          .maybeSingle();
        
        if (attempt && attempt.passed) {
          return { canPass: true, score: attempt.score, reason: "Quiz passed" };
        }
        return { canPass: false, score: 0, reason: "Quiz not passed yet" };
      }
    }

    const moduleAssignments = studentAssignments.filter(
      sa => sa.assignment?.module_id === moduleId
    );
    
    const gradedAssignment = moduleAssignments.find(sa => sa.status === "graded");
    if (gradedAssignment && gradedAssignment.score && gradedAssignment.score >= 50) {
      return { 
        canPass: true, 
        score: Math.round((gradedAssignment.score / (gradedAssignment.assignment?.max_score || 100)) * 100),
        reason: "Assignment graded and passed" 
      };
    }

    const submittedAssignments = moduleAssignments.filter(sa => sa.status === "submitted");
    if (submittedAssignments.length > 0) {
      return { canPass: false, score: 0, reason: "Assignment submitted, awaiting grading" };
    }

    return { canPass: false, score: 0, reason: "Complete the quiz or assignment to pass this module" };
  };

  const handleModuleSelect = (index: number) => {
    const currentIndex = currentEnrollment?.current_module_index || 0;
    if (index <= currentIndex + 1) {
      if (index === currentIndex + 1) {
        const prevModule = modules?.[index - 1];
        if (prevModule) {
          const prevProgress = progressData.find(p => p.module_id === prevModule.id);
          if (prevProgress?.status !== "passed") {
            toast({
              type: "warning",
              title: "Module Locked",
              message: "Complete the previous module first!",
            });
            return;
          }
        }
      }
      
      setIsAdvancing(true);
      setSelectedModuleIndex(index);
      setActiveTab("content");
      setQuizSubmitted(false);
      setQuizAnswers({});
      setQuizScore(0);
      setQuizAttempted(false);
      setTimeout(() => {
        fetchQuizForModule();
        setIsAdvancing(false);
      }, 200);
    }
  };

  const isModuleLocked = (index: number) => {
    const currentIndex = currentEnrollment?.current_module_index || 0;
    if (index === 0) return false;
    const prevModule = modules?.[index - 1];
    if (!prevModule) return false;
    const prevProgress = progressData.find(p => p.module_id === prevModule.id);
    if (prevProgress && prevProgress.status !== "passed") return true;
    if (!prevProgress) return true;
    if (index > currentIndex + 1) return true;
    return false;
  };

  const isModuleCompleted = (moduleId: string) => {
    const prog = progressData.find(p => p.module_id === moduleId);
    return prog?.status === "passed";
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || quizQuestions.length === 0) return;
    setSubmittingQuiz(true);
    
    try {
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
      
      const { error: attemptError } = await supabase.from("quiz_attempts").insert({
        quiz_id: quizData.id,
        student_id: profile.id,
        enrollment_id: enrollment?.id,
        score: score,
        passed: score >= (quizData.pass_score || 70),
        answers: answers,
        completed_at: new Date().toISOString(),
      });
      
      if (attemptError) {
        console.error("Error saving quiz attempt:", attemptError);
        toast({
          type: "error",
          title: "Submission Failed",
          message: "Failed to save your quiz attempt. Please try again.",
        });
        setSubmittingQuiz(false);
        return;
      }
      
      if (score >= (quizData.pass_score || 70)) {
        toast({
          type: "success",
          title: "🎉 Quiz Passed!",
          message: `You scored ${score}%! Module unlocked.`,
        });
        await onProgressUpdate(currentModule.id, "passed", score);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await fetchEnrollmentData();
        await fetchProgress();
        
        const { data: updatedEnrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("id", enrollment?.id)
          .single();
        
        if (updatedEnrollment) {
          const newIndex = updatedEnrollment.current_module_index;
          if (newIndex > selectedModuleIndex && newIndex < modules.length) {
            toast({
              type: "info",
              title: "Next Module Unlocked!",
              message: `Moving to "${modules[newIndex]?.title}"...`,
            });
            setTimeout(() => {
              setIsAdvancing(true);
              setSelectedModuleIndex(newIndex);
              setActiveTab("content");
              setQuizSubmitted(false);
              setQuizAnswers({});
              setQuizScore(0);
              setQuizAttempted(false);
              fetchQuizForModule();
              setTimeout(() => setIsAdvancing(false), 300);
            }, 2000);
          }
        }
        setQuizAttempted(true);
      } else {
        toast({
          type: "error",
          title: "Quiz Failed",
          message: `You scored ${score}%. Need ${quizData.pass_score}% to pass. Try again!`,
        });
        await onProgressUpdate(currentModule.id, "failed", score);
        await fetchProgress();
        setQuizAttempted(true);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        type: "error",
        title: "Submission Failed",
        message: "An error occurred. Please try again.",
      });
    }
    setSubmittingQuiz(false);
  };

  const handleManualComplete = async () => {
    if (!currentModule) return;
    setManualCompleteLoading(true);
    
    try {
      const result = await canPassModule(currentModule.id);
      
      if (result.canPass) {
        toast({
          type: "success",
          title: "Module Complete!",
          message: `You scored ${result.score}% on this module.`,
        });
        await onProgressUpdate(currentModule.id, "passed", result.score);
        await fetchEnrollmentData();
        await fetchProgress();
        
        const { data: updatedEnrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("id", enrollment?.id)
          .single();
        
        if (updatedEnrollment && updatedEnrollment.current_module_index > selectedModuleIndex) {
          toast({
            type: "info",
            title: "Next Module Unlocked!",
            message: `Moving to "${modules[updatedEnrollment.current_module_index]?.title}"...`,
          });
          setTimeout(() => {
            setIsAdvancing(true);
            setSelectedModuleIndex(updatedEnrollment.current_module_index);
            setActiveTab("content");
            setTimeout(() => setIsAdvancing(false), 300);
          }, 500);
        }
      } else {
        toast({
          type: "warning",
          title: "Cannot Complete Module",
          message: result.reason || "Complete the quiz or assignment to pass this module.",
        });
      }
    } catch (error) {
      console.error("Error in manual complete:", error);
      toast({
        type: "error",
        title: "Action Failed",
        message: "Failed to complete module. Please try again.",
      });
    }
    setManualCompleteLoading(false);
  };

  const currentModule = modules?.[selectedModuleIndex] || modules?.[0] || null;
  const currentContent = moduleContents?.find(c => c.module_id === currentModule?.id) || null;
  const moduleProgress = progressData.find(p => p.module_id === currentModule?.id);

  const hasGradedAssignment = studentAssignments.some(
    sa => sa.assignment?.module_id === currentModule?.id && sa.status === "graded"
  );

  const hasPassedQuiz = quizAttempted && quizScore >= (quizData?.pass_score || 70);

  const canCompleteModule = hasPassedQuiz || hasGradedAssignment;

  if (!enrollment || !currentModule) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
        <p className="text-gray-500 mt-4">Loading module...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full md:w-64 bg-gray-100/30 border-b md:border-b-0 md:border-r p-4 shrink-0 overflow-y-auto max-h-[calc(100vh-80px)]" style={{ borderColor: '#e0e0e0' }}>
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Course Modules</h3>
        <div className="space-y-1">
          {modules?.map((module, index) => {
            const isLocked = isModuleLocked(index);
            const isActive = index === selectedModuleIndex;
            const isCompleted = isModuleCompleted(module.id);
            const prog = progressData.find(p => p.module_id === module.id);
            const isNext = index === (currentEnrollment?.current_module_index || 0) + 1;
            
            return (
              <button
                key={module.id}
                onClick={() => handleModuleSelect(index)}
                disabled={isLocked}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                  isActive ? "border font-medium" : "text-gray-600 hover:bg-gray-100",
                  isLocked && "opacity-50 cursor-not-allowed",
                  isCompleted && !isActive && "bg-green-50 text-green-700",
                  isNext && !isActive && !isCompleted && !isLocked && "border-l-2 border-orange-300 bg-orange-50/30"
                )}
                style={isActive ? { backgroundColor: '#fdddce', borderColor: '#fcba9d', color: '#f7530b' } : {}}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                  isCompleted ? "bg-green-100 text-green-600" : 
                  isActive ? "text-orange-600" : 
                  "bg-gray-200 text-gray-500"
                )}
                style={isActive ? { backgroundColor: '#fcba9d' } : {}}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="truncate flex-1">{module.title}</span>
                {isCompleted && (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0.5">✓</Badge>
                )}
                {isNext && !isCompleted && !isLocked && (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">Next</Badge>
                )}
                {prog?.status === "failed" && (
                  <Badge variant="danger" className="text-[10px] px-1.5 py-0.5">✗</Badge>
                )}
                {!isLocked && quizData && quizQuestions.length > 0 && (
                  <Badge variant="info" className="text-[10px] px-1.5 py-0.5">📝</Badge>
                )}
                {hasGradedAssignment && isCompleted && (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0.5">📋</Badge>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#e0e0e0' }}>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{progressData.filter(p => p.status === "passed").length}/{modules?.length || 0}</span>
          </div>
          <ProgressBar 
            value={progressData.filter(p => p.status === "passed").length} 
            max={modules?.length || 1} 
            className="mt-1" 
          />
        </div>
        
        <div className="mt-3 text-xs text-gray-500 border-t pt-3 space-y-1" style={{ borderColor: '#e0e0e0' }}>
          <p>Module {selectedModuleIndex + 1} of {modules?.length || 0}</p>
          <p style={{ color: '#f7530b' }}>✓ Pass quiz OR complete assignment</p>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="info">Module {selectedModuleIndex + 1} of {modules?.length || 0}</Badge>
            {moduleProgress?.status === "passed" && <Badge variant="success">✅ Passed</Badge>}
            {moduleProgress?.status === "failed" && <Badge variant="danger">❌ Failed</Badge>}
            {isModuleLocked(selectedModuleIndex) && <Badge variant="muted">🔒 Locked</Badge>}
            {quizData && quizQuestions.length > 0 && <Badge variant="info">📝 Quiz: {quizData.title}</Badge>}
            {hasGradedAssignment && moduleProgress?.status === "passed" && <Badge variant="success">📋 Assignment Passed</Badge>}
            {!quizData && !hasGradedAssignment && moduleProgress?.status !== "passed" && (
              <Badge variant="warning">⚠️ No Quiz - Complete Assignment</Badge>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            {currentModule.title}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {quizData && quizQuestions.length > 0 
              ? `Pass with ≥${currentModule.pass_score}% to unlock the next module.` 
              : "Complete the assignment to unlock the next module."}
          </p>
          {hasGradedAssignment && (
            <p className="text-sm text-green-600 mt-1">
              ✅ You have a graded assignment for this module!
            </p>
          )}
          {!quizData && !hasGradedAssignment && moduleProgress?.status !== "passed" && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ This module has no quiz. You must complete and pass the assignment.
            </p>
          )}
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("content")}
            className={cn(
              "px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-2",
              activeTab === "content" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Video className="w-4 h-4" /> Content
          </button>
          {quizData && quizQuestions.length > 0 && !isModuleLocked(selectedModuleIndex) && (
            <button
              onClick={() => setActiveTab("quiz")}
              className={cn(
                "px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-2",
                activeTab === "quiz" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <FileQuestion className="w-4 h-4" /> Quiz {quizAttempted && quizScore >= (quizData?.pass_score || 70) ? "✅" : quizAttempted ? "❌" : ""}
            </button>
          )}
          <button
            onClick={() => setActiveTab("exam")}
            className={cn(
              "px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-2",
              activeTab === "exam" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700",
              isModuleLocked(selectedModuleIndex) && "opacity-50 cursor-not-allowed"
            )}
            disabled={isModuleLocked(selectedModuleIndex)}
          >
            <Award className="w-4 h-4" /> Exam
          </button>
          <button
            onClick={() => {
              setQuizRefreshKey(prev => prev + 1);
              setActiveTab("quiz");
              toast({
                type: "info",
                title: "Refreshing Quiz",
                message: "Loading latest quiz data...",
              });
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-500 hover:text-gray-700 hover:bg-white/50 flex items-center gap-1"
            title="Refresh quiz data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeTab === "content" && (
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
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">{currentContent.title}</h3>
                    <div className="prose prose-sm max-w-none text-gray-500">
                      <p className="whitespace-pre-wrap text-sm md:text-base">{currentContent.content_text}</p>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-4 md:p-6 text-center">
                <div className="py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">No Content Available</h3>
                  <p className="text-sm text-gray-500">
                    The instructor hasn't added content for this module yet. Please check back later.
                  </p>
                </div>
              </Card>
            )}
            
            {!isModuleLocked(selectedModuleIndex) && currentContent && moduleProgress?.status !== "passed" && (
              <div className="flex justify-end">
                <button
                  onClick={handleManualComplete}
                  disabled={!canCompleteModule || manualCompleteLoading}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors text-sm",
                    canCompleteModule 
                      ? "text-white hover:opacity-90" 
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  )}
                  style={canCompleteModule ? { backgroundColor: '#f7530b' } : {}}
                >
                  {manualCompleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {canCompleteModule 
                    ? "Mark as Complete" 
                    : quizData && quizQuestions.length > 0 
                      ? "Take the quiz to complete" 
                      : "Complete assignment to pass"}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="space-y-5">
            {isModuleLocked(selectedModuleIndex) ? (
              <Card className="p-8 text-center">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Module Locked</h3>
                <p className="text-sm text-gray-500">
                  Complete the previous module to unlock this quiz.
                </p>
              </Card>
            ) : loadingQuiz ? (
              <Card className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
                <p className="text-gray-500 mt-4">Loading quiz...</p>
              </Card>
            ) : !quizData || quizQuestions.length === 0 ? (
              <Card className="p-8 text-center">
                <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">No Quiz Available</h3>
                <p className="text-sm text-gray-500">
                  This module doesn't have a quiz. Complete the assignment to pass.
                </p>
                {hasGradedAssignment && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">✅ Your assignment has been graded and passed!</p>
                    <button
                      onClick={handleManualComplete}
                      className="mt-2 px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#f7530b' }}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" /> Mark Module Complete
                    </button>
                  </div>
                )}
                {!hasGradedAssignment && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">⏳ Complete the assignment to pass this module.</p>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-4 md:p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 text-lg">{quizData.title}</h3>
                  {quizData.description && (
                    <p className="text-sm text-gray-500 mt-1">{quizData.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Pass score: <span className="font-semibold" style={{ color: '#f7530b' }}>{quizData.pass_score}%</span>
                    {quizQuestions.length > 0 && ` · ${quizQuestions.length} questions`}
                  </p>
                </div>
                
                {quizQuestions.map((q, qi) => (
                  <div key={q.id} className="mb-6 last:mb-0 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: '#e0e0e0' }}>
                    <p className="text-sm font-medium text-gray-800 mb-3">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options && q.options.map((opt: string, oi: number) => {
                        const selected = quizAnswers[qi] === oi;
                        const isCorrect = oi === q.correct_answer;
                        const showCorrect = quizSubmitted && isCorrect;
                        const showWrong = quizSubmitted && selected && !isCorrect;
                        return (
                          <button
                            key={oi}
                            onClick={() => !quizSubmitted && !quizAttempted && setQuizAnswers((p) => ({ ...p, [qi]: oi }))}
                            disabled={quizSubmitted || quizAttempted || submittingQuiz}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                              quizSubmitted || quizAttempted
                                ? showCorrect ? "border-green-400 bg-green-50 text-green-800"
                                  : showWrong ? "border-red-400 bg-red-50 text-red-800"
                                  : "border-gray-200 text-gray-500 opacity-60"
                                : selected
                                ? "border-orange-400 text-gray-800"
                                : "border-gray-200 hover:border-orange-300 text-gray-700"
                            )}
                            style={selected && !quizSubmitted && !quizAttempted ? { backgroundColor: '#fdddce' } : {}}
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
                    "mt-6 p-5 rounded-lg flex flex-col md:flex-row items-center gap-4",
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
                        onClick={async () => { 
                          setQuizSubmitted(false); 
                          setQuizAnswers({}); 
                          setQuizScore(0);
                          setQuizAttempted(false);
                          await supabase
                            .from("quiz_attempts")
                            .delete()
                            .eq("quiz_id", quizData.id)
                            .eq("student_id", profile.id)
                            .eq("enrollment_id", enrollment?.id);
                          const existingProgress = progressData.find(p => p.module_id === currentModule.id);
                          if (existingProgress) {
                            await supabase
                              .from("module_progress")
                              .update({ status: "in_progress", score: null })
                              .eq("id", existingProgress.id);
                          }
                          await fetchProgress();
                          await fetchEnrollmentData();
                          setQuizRefreshKey(prev => prev + 1);
                          toast({
                            type: "info",
                            title: "Quiz Reset",
                            message: "You can retry the quiz now.",
                          });
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Retry Quiz
                      </button>
                    )}
                    {quizScore >= (quizData.pass_score || 70) && (
                      <button
                        onClick={() => {
                          const nextIndex = selectedModuleIndex + 1;
                          if (nextIndex < modules.length) {
                            handleModuleSelect(nextIndex);
                          } else {
                            toast({
                              type: "success",
                              title: "🎉 Course Complete!",
                              message: "You've completed all modules!",
                            });
                            onNavigate("student-courses");
                          }
                        }}
                        className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: '#f7530b' }}
                      >
                        {selectedModuleIndex + 1 < modules.length ? "Next Module →" : "Back to Courses"}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length || submittingQuiz}
                    className="mt-6 w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                  >
                    {submittingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Quiz"}
                  </button>
                )}
              </Card>
            )}
          </div>
        )}

        {activeTab === "exam" && (
          <div className="space-y-5">
            {isModuleLocked(selectedModuleIndex) ? (
              <Card className="p-8 text-center">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Module Locked</h3>
                <p className="text-sm text-gray-500">
                  Complete the previous module to access the exam.
                </p>
              </Card>
            ) : (
              <Card className="p-4 md:p-6">
                <div className="text-center py-8">
                  <Award className="w-16 h-16 mx-auto mb-4" style={{ color: '#f7530b' }} />
                  <h3 className="text-xl font-semibold text-gray-800">Module Exam</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                    {moduleProgress?.status === "passed" ? (
                      "✅ You have already passed this module! Great job!"
                    ) : (
                      canCompleteModule 
                        ? "🎉 You've passed the quiz or assignment! You can now complete this module."
                        : "Complete the module quiz or assignment to unlock the exam."
                    )}
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-700">Content Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {moduleProgress?.status === "passed" || canCompleteModule ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="text-sm text-gray-700">
                          {moduleProgress?.status === "passed" || canCompleteModule ? "Quiz/Assignment Passed" : "Quiz/Assignment Pending"}
                        </span>
                      </div>
                    </div>
                    
                    {moduleProgress?.status === "passed" ? (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                        <p className="text-sm text-green-800 text-center">
                          🎉 You have successfully completed this module!
                          {selectedModuleIndex + 1 < modules.length && " Ready to move to the next module?"}
                        </p>
                        {selectedModuleIndex + 1 < modules.length && (
                          <button
                            onClick={() => handleModuleSelect(selectedModuleIndex + 1)}
                            className="mt-3 w-full px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                            style={{ backgroundColor: '#f7530b' }}
                          >
                            Next Module →
                          </button>
                        )}
                      </div>
                    ) : canCompleteModule ? (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                        <p className="text-sm text-green-800 text-center">
                          🎉 You've passed the quiz or assignment!
                        </p>
                        <button
                          onClick={handleManualComplete}
                          disabled={manualCompleteLoading}
                          className="mt-3 w-full px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                          style={{ backgroundColor: '#f7530b' }}
                        >
                          {manualCompleteLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Complete Module →"}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                        <p className="text-sm text-yellow-800 text-center">
                          ⏳ Complete the module quiz or assignment to unlock the exam.
                        </p>
                        {quizData && quizQuestions.length > 0 && (
                          <button
                            onClick={() => setActiveTab("quiz")}
                            className="mt-3 w-full px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                            style={{ backgroundColor: '#f7530b' }}
                          >
                            Take Quiz
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Student Payments ─────────────────────────────────────────────────────────

function StudentPayments({ profile }: { profile: Profile }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    const markAsViewed = async () => {
      if (!profile) return;
      try {
        const { error } = await supabase
          .from('payment_receipts')
          .update({ viewed_at: new Date().toISOString() })
          .eq('student_id', profile.id)
          .eq('status', 'pending')
          .is('viewed_at', null);
        if (error) {
          console.error('Error marking payments as viewed:', error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    markAsViewed();
    fetchPayments();
    fetchPendingEnrollments();
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
          <p className="text-gray-500 mt-4">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Payments
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your payment receipts and enrollment status.</p>
      </div>

      {pendingEnrollments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">Pending Payment Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                You have {pendingEnrollments.length} enrollment{pendingEnrollments.length > 1 ? 's' : ''} that need payment confirmation.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="p-4 md:p-6">
        <h2 className="font-semibold text-gray-800 mb-4">How Payment Works</h2>
        <ol className="space-y-3">
          {[
            "Make bank transfer using the account details provided on enrollment.",
            "Upload your payment receipt (PDF or image).",
            "Admin reviews and approves within 24 hours.",
            "Course access is activated immediately upon approval.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#f7530b' }}>{i + 1}</span>
              <p className="text-sm text-gray-500">{step}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Payment History</h2>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
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
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No payments submitted yet.</p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                When you enroll in a course, you'll be asked to upload a payment receipt here.
              </p>
              <button
                onClick={() => window.location.href = "/student-courses"}
                className="mt-4 px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
              >
                Browse Courses
              </button>
            </div>
          </Card>
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#fdddce' }}>
                  <FileText className="w-5 h-5" style={{ color: '#f7530b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {formatNaira(p.amount)} 
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          — {p.enrollment?.course?.title || "Unknown Course"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
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
                    <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs text-gray-500">
                      Admin note: {p.admin_notes}
                    </div>
                  )}
                  {p.receipt_url && (
                    <a 
                      href={p.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs hover:underline"
                      style={{ color: '#f7530b' }}
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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Platform overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard icon={Users} label="Total Students" value={stats.students} />
        <StatCard icon={BookOpen} label="Active Courses" value={stats.courses} />
        <StatCard icon={DollarSign} label="Pending Payments" value={stats.pendingPayments} />
        <StatCard icon={ClipboardList} label="Open Assignments" value={stats.submittedAssignments} />
      </div>

      {stats.pendingPayments > 0 && (
        <div
          className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
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
          <h2 className="font-semibold text-gray-800 mb-4 text-lg md:text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add new course", view: "admin-courses" as View, icon: Plus },
              { label: "Review payments", view: "admin-payments" as View, icon: DollarSign },
              { label: "Create assignment", view: "admin-assignments" as View, icon: ClipboardList },
              { label: "Manage students", view: "admin-students" as View, icon: Users },
              { label: "Create quiz", view: "admin-quizzes" as View, icon: HelpCircle },
              { label: "View scholarships", view: "admin-scholarship" as View, icon: Gift },
            ].map(({ label, view, icon: Icon }) => (
              <button
                key={label}
                onClick={() => onNavigate(view)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border hover:border-orange-400 hover:bg-orange-50 transition-all text-left text-sm font-medium" style={{ borderColor: '#e0e0e0' }}
              >
                <Icon className="w-4 h-4" style={{ color: '#f7530b' }} />
                {label}
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
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
    try {
      if (editingCourse) {
        await onCourseUpdate(editingCourse.id, {
          title: courseForm.title,
          description: courseForm.description,
          price: parseFloat(courseForm.price),
          duration_months: parseInt(courseForm.duration_months),
        }, thumbnailFile || undefined);
        toast({
          type: "success",
          title: "Course Updated",
          message: `"${courseForm.title}" has been updated.`,
        });
      } else {
        await onCourseAdd({
          title: courseForm.title,
          description: courseForm.description,
          price: parseFloat(courseForm.price),
          duration_months: parseInt(courseForm.duration_months),
          currency: "NGN",
          is_active: true,
        }, thumbnailFile || undefined);
        toast({
          type: "success",
          title: "Course Created",
          message: `"${courseForm.title}" has been created.`,
        });
      }
      setShowCourseModal(false);
    } catch (error) {
      toast({
        type: "error",
        title: "Operation Failed",
        message: "Failed to save course. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      await onCourseDelete(deleteConfirm.id);
      toast({
        type: "success",
        title: "Course Deleted",
        message: `"${deleteConfirm.title}" has been deleted.`,
      });
      setDeleteConfirm(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Delete Failed",
        message: "Failed to delete course. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string, courseId: string) => {
    showConfirm({
      title: "Delete Module",
      message: "Are you sure you want to delete this module? All content will be lost.",
      confirmLabel: "Delete",
      type: "danger",
      onConfirm: async () => {
        await onModuleDelete(moduleId, courseId);
        toast({
          type: "success",
          title: "Module Deleted",
          message: "Module has been deleted.",
        });
      },
    });
  };

  const handleDeleteContent = async (contentId: string) => {
    showConfirm({
      title: "Delete Content",
      message: "Are you sure you want to delete this content?",
      confirmLabel: "Delete",
      type: "danger",
      onConfirm: async () => {
        await onModuleContentDelete(contentId);
        toast({
          type: "success",
          title: "Content Deleted",
          message: "Content has been removed.",
        });
      },
    });
  };

  const uploadVideoInChunks = async (file: File, moduleId: string, onProgress: (progress: number) => void) => {
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileExt = file.name.split('.').pop();
    const fileName = `module-${moduleId}-${Date.now()}.${fileExt}`;
    
    let uploadedChunks = 0;
    let startTime = Date.now();

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);
      
      const { error } = await supabase.storage
        .from('module-videos')
        .upload(fileName, chunk, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      uploadedChunks++;
      const progress = Math.round((uploadedChunks / totalChunks) * 100);
      onProgress(progress);
      
      const elapsed = (Date.now() - startTime) / 1000;
      const uploadedMB = (uploadedChunks * CHUNK_SIZE) / (1024 * 1024);
      const speed = uploadedMB / elapsed;
      setUploadSpeed(`${speed.toFixed(1)} MB/s`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('module-videos')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const uploadVideoDirect = async (file: File, moduleId: string, onProgress: (progress: number) => void) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `module-${moduleId}-${Date.now()}.${fileExt}`;
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 95) {
        onProgress(progress);
      }
    }, 200);
    
    const { error } = await supabase.storage
      .from('module-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });
    
    clearInterval(interval);
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    onProgress(100);
    const { data: { publicUrl } } = supabase.storage
      .from('module-videos')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleVideoUpload = async (file: File, moduleId: string) => {
    setUploadProgress(0);
    setUploadSpeed("");
    
    try {
      let videoUrl;
      
      if (file.size > 50 * 1024 * 1024) {
        videoUrl = await uploadVideoInChunks(file, moduleId, (progress) => {
          setUploadProgress(progress);
        });
      } else {
        videoUrl = await uploadVideoDirect(file, moduleId, (progress) => {
          setUploadProgress(progress);
        });
      }
      
      return videoUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Courses & Modules
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your course catalog, modules, and video content.</p>
        </div>
        <button
          onClick={openCreateCourse}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto justify-center"
          style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
        >
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      <div className="space-y-4">
        {courses?.map((course) => {
          const courseModules = modules?.[course.id] || [];
          return (
            <Card key={course.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                <div className="w-full md:w-20 h-40 md:h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img 
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format"} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base md:text-lg">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success">{formatNaira(course.price)}</Badge>
                      <Badge variant="info">{course.duration_months}mo</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
                    <span className="text-xs text-gray-500">{courseModules.length} modules</span>
                    <button
                      onClick={() => { setActiveCourse(course); setShowModuleModal(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
                        const content = moduleContents?.find(c => c.module_id === m.id);
                        return (
                          <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-100/30 rounded-lg p-2 gap-2">
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                              {content?.content_type === "video" ? (
                                <Video className="w-3.5 h-3.5" style={{ color: '#f7530b' }} />
                              ) : (
                                <FileText className="w-3.5 h-3.5" style={{ color: '#f7530b' }} />
                              )}
                              <span className="text-xs text-gray-700">{m.title}</span>
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
                                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:opacity-80 transition-colors"
                                  style={{ backgroundColor: '#fdddce', color: '#f7530b' }}
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
            <label className="block text-sm font-medium text-gray-700">Course Thumbnail</label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer" style={{ borderColor: '#e0e0e0' }}
              onClick={() => document.getElementById("thumbnail-upload")?.click()}
            >
              {thumbnailFile ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">{thumbnailFile.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setThumbnailFile(null); }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : editingCourse ? (
                <p className="text-sm text-gray-500">Leave empty to keep current thumbnail</p>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload course thumbnail</p>
                  <p className="text-xs text-gray-400">JPG, PNG · Recommended: 600x340px</p>
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
            className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
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
              try {
                await onModuleAdd({
                  course_id: activeCourse.id,
                  title: moduleForm.title,
                  description: moduleForm.description,
                  order_index: (modules?.[activeCourse.id]?.length || 0),
                  pass_score: parseInt(moduleForm.pass_score),
                });
                toast({
                  type: "success",
                  title: "Module Added",
                  message: `"${moduleForm.title}" has been added.`,
                });
                setShowModuleModal(false);
                setModuleForm({ title: "", description: "", pass_score: "75" });
              } catch (error) {
                toast({
                  type: "error",
                  title: "Failed",
                  message: "Failed to add module. Please try again.",
                });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !moduleForm.title}
            className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Module"}
          </button>
        </div>
      </Modal>

      <Modal open={showContentModal} onClose={() => setShowContentModal(false)} title={`Add Content — ${activeModule?.title}`}>
        <div className="space-y-4">
          <Input label="Content Title" value={contentForm.title} onChange={(v) => setContentForm((p) => ({ ...p, title: v }))} placeholder="e.g. Introduction Video" required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Content Type</label>
            <select
              value={contentForm.content_type}
              onChange={(e) => setContentForm((p) => ({ ...p, content_type: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
            >
              <option value="video">Video (DRM Protected - Up to 500MB)</option>
              <option value="text">Text Lesson</option>
            </select>
          </div>
          {contentForm.content_type === "video" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Upload Video (Max 500MB)</label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer" style={{ borderColor: '#e0e0e0' }}
                onClick={() => document.getElementById("video-upload")?.click()}
              >
                {videoFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">{videoFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); setUploadProgress(0); }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload module video</p>
                    <p className="text-xs text-gray-400">MP4, MOV · Max 500MB · DRM Protected</p>
                    <p className="text-xs text-amber-600 mt-1">Large files are uploaded in chunks for reliability</p>
                  </>
                )}
                <input
                  id="video-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 500 * 1024 * 1024) {
                      setVideoFile(file);
                      setUploadProgress(0);
                    } else if (file) {
                      toast({
                        type: "error",
                        title: "File Too Large",
                        message: "File size exceeds 500MB limit. Please select a smaller file.",
                      });
                    }
                  }}
                />
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Uploading...</span>
                    <span>{uploadSpeed}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ backgroundColor: '#f7530b', width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500">{uploadProgress}% complete</p>
                </div>
              )}
              {uploadProgress === 100 && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" /> Upload complete!
                </div>
              )}
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
              
              let videoUrl = null;
              if (videoFile && contentForm.content_type === "video") {
                try {
                  videoUrl = await handleVideoUpload(videoFile, activeModule.id);
                } catch (error) {
                  toast({
                    type: "error",
                    title: "Upload Failed",
                    message: "Failed to upload video. Please try again.",
                  });
                  setLoading(false);
                  return;
                }
              }
              
              try {
                await onModuleContentAdd({
                  module_id: activeModule.id,
                  title: contentForm.title,
                  content_type: contentForm.content_type as "video" | "text",
                  content_text: contentForm.content_type === "text" ? contentForm.content_text : undefined,
                  content_url: videoUrl,
                  order_index: 0,
                }, videoFile || undefined);
                
                toast({
                  type: "success",
                  title: "Content Added",
                  message: `"${contentForm.title}" has been added.`,
                });
                
                setShowContentModal(false);
                setContentForm({ title: "", content_type: "video", content_text: "" });
                setVideoFile(null);
                setUploadProgress(0);
              } catch (error) {
                toast({
                  type: "error",
                  title: "Failed",
                  message: "Failed to add content. Please try again.",
                });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !contentForm.title || (contentForm.content_type === "video" && !videoFile) || (contentForm.content_type === "text" && !contentForm.content_text)}
            className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Content"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{deleteConfirm?.title}</strong>?
            {deleteConfirm?.type === 'course' && " This will also delete all modules and enrollments for this course."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCourse}
              className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Admin Students ───────────────────────────────────────────────────────────

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

  const filtered = students?.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSendAssignment = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    await onSendAssignment(selectedStudent.id, selectedStudent.full_name, assignmentData);
    toast({
      type: "success",
      title: "Assignment Sent",
      message: `Assignment sent to ${selectedStudent.full_name}`,
    });
    setShowAssignmentModal(false);
    setAssignmentData({ title: "", description: "", module_id: "", due_days: "7", max_score: "100" });
    setLoading(false);
  };

  const availableModules = modules.filter(m => m.course_id === assignmentData.module_id);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Students
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">View, manage, and track student progress.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
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
                <h3 className="font-semibold text-gray-800 mt-3 text-sm">{student.full_name}</h3>
                <p className="text-xs text-gray-500 truncate max-w-full">{student.email}</p>
                
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="default">{student.role}</Badge>
                  <Badge variant="info">{progress.enrollments.length} courses</Badge>
                </div>
                
                <div className="mt-4 w-full">
                  <CircularProgress value={progress.passed} max={progress.total || 1} size={80} />
                  <p className="text-xs text-gray-500 mt-2">
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
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:opacity-80 transition-colors"
                    style={{ backgroundColor: '#fdddce', color: '#f7530b' }}
                  >
                    <Send className="w-3.5 h-3.5" /> Send Assignment
                  </button>
                </div>
                
                <div className="mt-3 w-full border-t pt-3" style={{ borderColor: '#e0e0e0' }}>
                  <p className="text-xs text-gray-500">Joined {formatDate(student.created_at)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No students found.</p>
        </Card>
      )}

      <Modal open={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} title={`Send Assignment to ${selectedStudent?.full_name}`}>
        <div className="space-y-4">
          <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-3">
            <Avatar name={selectedStudent?.full_name || ""} size="sm" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{selectedStudent?.full_name}</p>
              <p className="text-xs text-gray-500">{selectedStudent?.email}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Course / Module</label>
            <select
              value={assignmentData.module_id}
              onChange={(e) => setAssignmentData(p => ({ ...p, module_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
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
            className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
          <p className="text-gray-500 mt-4">Loading student data...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={true} onClose={onClose} title={`Student Profile: ${student.full_name}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: '#e0e0e0' }}>
          <Avatar name={student.full_name} size="lg" src={student.avatar_url} />
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{student.full_name}</h3>
            <p className="text-sm text-gray-500">{student.email}</p>
            <p className="text-xs text-gray-500 mt-1">Member since {formatDate(student.created_at)}</p>
          </div>
        </div>
        
        {studentProfile && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 text-sm">Personal Information</h4>
            {studentProfile.bio && (
              <div>
                <p className="text-xs text-gray-500">Bio</p>
                <p className="text-sm text-gray-700">{studentProfile.bio}</p>
              </div>
            )}
            {studentProfile.phone && (
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-700">{formatPhoneNumber(studentProfile.phone)}</p>
              </div>
            )}
            {studentProfile.address && (
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm text-gray-700">{studentProfile.address}</p>
              </div>
            )}
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Enrolled Courses & Progress</h4>
          <div className="space-y-4">
            {enrollments.map((e) => {
              const totalModules = getModuleCountForCourse(e.course_id);
              const passed = getPassedModules(e.id);
              
              return (
                <div key={e.id} className="p-4 bg-gray-100 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                    <span className="font-semibold text-gray-800">{e.course?.title}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
              <p className="text-sm text-gray-500">No enrolled courses</p>
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
    const markAsViewed = async () => {
      // For admin, we just refresh the count
    };
    
    markAsViewed();
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
      toast({
        type: "error",
        title: "Action Failed",
        message: "Failed to update payment status. Please try again.",
      });
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
        
        toast({
          type: "success",
          title: "Payment Approved",
          message: "Course access has been granted to the student.",
        });
      }
    } else {
      toast({
        type: "info",
        title: "Payment Rejected",
        message: "The payment has been rejected. Please add a note for the student.",
      });
    }
    
    setViewReceipt(null);
    setNotes("");
    setLoading(false);
    fetchPayments();
  };

  const pendingCount = payments.filter(p => p.status === "pending").length;
 return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Payment Approvals
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Review and approve student payment receipts.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatCard icon={Clock} label="Pending" value={pendingCount} />
        <StatCard icon={CheckCircle} label="Approved" value={payments.filter(p => p.status === "approved").length} />
        <StatCard icon={XCircle} label="Rejected" value={payments.filter(p => p.status === "rejected").length} />
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payment receipts submitted yet.</p>
          </Card>
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#fdddce' }}>
                  <FileText className="w-5 h-5" style={{ color: '#f7530b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{p.student_name}</p>
                      <p className="text-xs text-gray-500">{p.student_email}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    Course: {p.course_title}
                  </p>
                  <p className="text-lg font-bold mt-1" style={{ color: '#f7530b' }}>
                    {formatNaira(p.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {formatDate(p.submitted_at)}
                  </p>
                  {p.admin_notes && (
                    <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs text-gray-500">
                      Admin note: {p.admin_notes}
                    </div>
                  )}
                </div>
                {p.status === "pending" && (
                  <button
                    onClick={() => setViewReceipt(p)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg hover:opacity-90 transition-colors flex items-center gap-1.5 shrink-0"
                    style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
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
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-500">Student</p>
                <p className="font-semibold mt-0.5 text-gray-800">{viewReceipt.student_name}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-500">Course</p>
                <p className="font-semibold mt-0.5 text-gray-800">{viewReceipt.course_title}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-semibold mt-0.5" style={{ color: '#f7530b' }}>{formatNaira(viewReceipt.amount)}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="font-semibold mt-0.5 text-gray-800">{formatDate(viewReceipt.submitted_at)}</p>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <a 
                href={viewReceipt.receipt_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm hover:underline flex items-center gap-1 mx-auto justify-center"
                style={{ color: '#f7530b' }}
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
                onClick={() => {
                  showConfirm({
                    title: "Reject Payment",
                    message: "Are you sure you want to reject this payment?",
                    confirmLabel: "Reject",
                    type: "danger",
                    onConfirm: () => handleAction(viewReceipt.id, "rejected"),
                  });
                }}
                disabled={loading}
                className="py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => {
                  showConfirm({
                    title: "Approve Payment",
                    message: "Are you sure you want to approve this payment? This will activate the course for the student.",
                    confirmLabel: "Approve",
                    type: "info",
                    onConfirm: () => handleAction(viewReceipt.id, "approved"),
                  });
                }}
                disabled={loading}
                className="py-2.5 text-white font-semibold rounded-lg hover:opacity-90 transition-colors text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: '#f7530b' }}
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
  const [gradingLoading, setGradingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "graded" | "all">("pending");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSubmissions();
    fetchStudents();
    
    // Real-time subscription for new submissions
    const subscription = supabase
      .channel("admin-assignments")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "student_assignments" },
        () => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [refreshKey]);

  const fetchSubmissions = async () => {
    setLoading(true);
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
            max_score,
            module:module_id (
              id,
              title,
              course_id,
              course:course_id (
                id,
                title
              )
            )
          ),
          profiles:student_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order("submitted_at", { ascending: false, nullsLast: true })
        .order("assigned_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching submissions:", error);
        toast({
          type: "error",
          title: "Failed to Load",
          message: "Could not load submissions. Please refresh.",
        });
        return;
      }
      
      if (data) {
        setSubmissions(data as StudentAssignment[]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("role", "student");
      if (data) setStudents(data as Profile[]);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const getFilteredSubmissions = () => {
    if (activeTab === "all") return submissions;
    if (activeTab === "pending") {
      return submissions.filter(sa => sa.status === "pending" || sa.status === "submitted");
    }
    return submissions.filter(sa => sa.status === activeTab);
  };

  const getStatusCounts = () => {
    const pending = submissions.filter(sa => sa.status === "pending" || sa.status === "submitted").length;
    const graded = submissions.filter(sa => sa.status === "graded").length;
    const total = submissions.length;
    return { pending, graded, total };
  };

  const counts = getStatusCounts();

  const handleCreateAssignment = async () => {
    setLoading(true);
    try {
      await onCreateAssignment(newAssignment);
      toast({
        type: "success",
        title: "Assignment Created",
        message: `"${newAssignment.title}" has been assigned.`,
      });
      setShowCreate(false);
      setNewAssignment({ 
        course_id: "", 
        module_id: "", 
        title: "", 
        description: "", 
        max_score: "100", 
        due_days: "7", 
        assign_to_all: true, 
        student_id: "" 
      });
      await fetchSubmissions();
    } catch (error) {
      toast({
        type: "error",
        title: "Failed",
        message: "Failed to create assignment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!gradeModal) return;
    
    const scoreNum = parseInt(gradeForm.score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      toast({
        type: "warning",
        title: "Invalid Score",
        message: "Please enter a valid score.",
      });
      return;
    }
    
    const maxScore = gradeModal.assignment?.max_score || 100;
    if (scoreNum > maxScore) {
      toast({
        type: "warning",
        title: "Score Exceeds Maximum",
        message: `Score cannot exceed ${maxScore}.`,
      });
      return;
    }

    if (!gradeForm.feedback.trim()) {
      toast({
        type: "warning",
        title: "Feedback Required",
        message: "Please provide feedback for the student.",
      });
      return;
    }

    setGradingLoading(true);
    
    try {
      await onGradeAssignment(gradeModal.id, scoreNum, gradeForm.feedback);
      
      toast({
        type: "success",
        title: "Assignment Graded!",
        message: `Score: ${scoreNum}/${maxScore}`,
      });
      
      setGradeModal(null);
      setGradeForm({ score: "", feedback: "" });
      
      // Refresh the list after grading
      await fetchSubmissions();
      
    } catch (error) {
      console.error("Error grading assignment:", error);
      toast({
        type: "error",
        title: "Grading Failed",
        message: "Failed to grade assignment. Please try again.",
      });
    } finally {
      setGradingLoading(false);
    }
  };

  const availableModules = modules.filter(m => m.course_id === newAssignment.course_id);
  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Assignment Grading
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Review and grade student assignment submissions.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto justify-center"
          style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Grading</p>
            <p className="text-2xl font-bold" style={{ color: '#f7530b' }}>{counts.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Graded</p>
            <p className="text-2xl font-bold text-green-600">{counts.graded}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-800">{counts.total}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-2" style={{ borderColor: '#e0e0e0' }}>
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "pending"
              ? "text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          style={activeTab === "pending" ? { backgroundColor: '#f7530b' } : {}}
        >
          <Clock className="w-4 h-4" />
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => setActiveTab("graded")}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "graded"
              ? "text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          style={activeTab === "graded" ? { backgroundColor: '#10b981' } : {}}
        >
          <CheckCircle className="w-4 h-4" />
          Graded ({counts.graded})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "all"
              ? "text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          style={activeTab === "all" ? { backgroundColor: '#6b7280' } : {}}
        >
          <ClipboardList className="w-4 h-4" />
          All ({counts.total})
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
            <p className="text-gray-500 mt-4">Loading submissions...</p>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 text-lg mb-2">No Assignments Found</h3>
            <p className="text-sm text-gray-500">
              {activeTab === "pending" 
                ? "All assignments have been graded! 🎉" 
                : activeTab === "graded" 
                  ? "No graded assignments yet." 
                  : "No assignments available."}
            </p>
          </Card>
        ) : (
          filteredSubmissions.map((sa) => (
            <Card key={sa.id} className="p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <Avatar 
                  name={sa.profiles?.full_name || "Unknown"} 
                  size="lg" 
                  src={sa.profiles?.avatar_url} 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-800 text-base">
                      {sa.profiles?.full_name || "Unknown Student"}
                    </p>
                    <Badge variant="muted" className="text-xs">
                      {sa.profiles?.email || ""}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-700 text-sm mt-1">
                    {sa.assignment?.title || "Untitled Assignment"}
                  </p>
                  {sa.assignment?.module?.title && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Module: {sa.assignment.module.title} 
                      {sa.assignment.module.course?.title && ` · Course: ${sa.assignment.module.course.title}`}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>📅 Submitted: {sa.submitted_at ? formatDate(sa.submitted_at) : "N/A"}</span>
                    <span>📋 Max Score: {sa.assignment?.max_score || 100}</span>
                    {sa.status === "graded" && sa.score !== undefined && sa.score !== null && (
                      <Badge variant="success">
                        Score: {sa.score}/{sa.assignment?.max_score || 100}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <StatusBadge status={sa.status} />
                  
                  {sa.status === "submitted" && (
                    <button
                      onClick={() => { 
                        setGradeModal(sa); 
                        setGradeForm({ 
                          score: "", 
                          feedback: "" 
                        }); 
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                      style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                    >
                      <Edit className="w-4 h-4" /> Grade
                    </button>
                  )}
                  
                  {sa.submission_url && sa.submission_url.startsWith('http') && (
                    <a 
                      href={sa.submission_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Submission
                    </a>
                  )}
                </div>
              </div>
              
              {sa.status === "graded" && sa.feedback && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Feedback:
                  </p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{sa.feedback}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Assignment Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Assignment">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Assign to</label>
            <select
              value={newAssignment.assign_to_all ? "all" : "specific"}
              onChange={(e) => setNewAssignment(p => ({ ...p, assign_to_all: e.target.value === "all" }))}
              className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
            >
              <option value="all">All Students in Course</option>
              <option value="specific">Specific Student</option>
            </select>
          </div>

          {!newAssignment.assign_to_all && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Select Student</label>
              <select
                value={newAssignment.student_id}
                onChange={(e) => setNewAssignment(p => ({ ...p, student_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
              >
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              value={newAssignment.course_id}
              onChange={(e) => setNewAssignment(p => ({ ...p, course_id: e.target.value, module_id: "" }))}
              className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
            >
              <option value="">Select course...</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Module</label>
            <select
              value={newAssignment.module_id}
              onChange={(e) => setNewAssignment(p => ({ ...p, module_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
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
            className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Create Assignment
          </button>
        </div>
      </Modal>

      {/* Grade Modal */}
      <Modal open={!!gradeModal} onClose={() => setGradeModal(null)} title="Grade Assignment" maxWidth="max-w-2xl">
        {gradeModal && (
          <div className="space-y-5">
            {/* Student Info */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar name={gradeModal.profiles?.full_name || "Student"} size="lg" src={gradeModal.profiles?.avatar_url} />
                <div>
                  <p className="text-lg font-semibold text-gray-800">{gradeModal.profiles?.full_name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{gradeModal.profiles?.email || ""}</p>
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="border rounded-lg p-4" style={{ borderColor: '#e0e0e0' }}>
              <h3 className="font-semibold text-gray-800">{gradeModal.assignment?.title}</h3>
              {gradeModal.assignment?.description && (
                <p className="text-sm text-gray-500 mt-1">{gradeModal.assignment.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                <span>📅 Submitted: {gradeModal.submitted_at ? formatDate(gradeModal.submitted_at) : "—"}</span>
                {gradeModal.submitted_at && (
                  <span>🕐 {formatTime(gradeModal.submitted_at)}</span>
                )}
                <span>📋 Max Score: {gradeModal.assignment?.max_score || 100}</span>
              </div>
            </div>

            {/* Submission Preview */}
            {gradeModal.submission_url && gradeModal.submission_url.startsWith('http') && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <a 
                  href={gradeModal.submission_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Student's Submission
                </a>
              </div>
            )}
            
            {/* Grade Form */}
            <div className="space-y-4 border-t pt-4" style={{ borderColor: '#e0e0e0' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Score (out of {gradeModal.assignment?.max_score || 100}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))}
                  placeholder={`Enter score (0-${gradeModal.assignment?.max_score || 100})`}
                  className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                  style={{ borderColor: '#e0e0e0' }}
                  min="0"
                  max={gradeModal.assignment?.max_score || 100}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter a number between 0 and {gradeModal.assignment?.max_score || 100}</p>
              </div>
              
              <Textarea 
                label="Feedback" 
                value={gradeForm.feedback} 
                onChange={(v) => setGradeForm((p) => ({ ...p, feedback: v }))} 
                placeholder="Provide detailed feedback for the student..." 
                rows={4} 
                required 
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGradeModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGrade}
                disabled={!gradeForm.score || !gradeForm.feedback || gradingLoading}
                className={cn(
                  "flex-1 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
                  !gradeForm.score || !gradeForm.feedback || gradingLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "hover:opacity-90"
                )}
                style={!gradeForm.score || !gradeForm.feedback || gradingLoading ? {} : { backgroundColor: '#f7530b', color: '#ffffff' }}
              >
                {gradingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Submit Grade
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
// Add these functions in the App component

const handleGradeModule = async (studentId: string, moduleId: string, score: number, feedback: string) => {
  try {
    // First, find the enrollment for this student and module
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", studentId)
      .eq("status", "active");
    
    if (!enrollments || enrollments.length === 0) {
      throw new Error("No active enrollment found for this student");
    }
    
    // Check if module progress exists
    const { data: existingProgress } = await supabase
      .from("module_progress")
      .select("*")
      .eq("enrollment_id", enrollments[0].id)
      .eq("module_id", moduleId)
      .maybeSingle();
    
    const status = score >= 70 ? "passed" : "failed";
    
    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from("module_progress")
        .update({
          status,
          score,
          completed_at: status === "passed" ? new Date().toISOString() : undefined,
        })
        .eq("id", existingProgress.id);
      
      if (error) throw error;
    } else {
      // Create new progress
      const { error } = await supabase
        .from("module_progress")
        .insert({
          enrollment_id: enrollments[0].id,
          module_id: moduleId,
          status,
          score,
          completed_at: status === "passed" ? new Date().toISOString() : undefined,
        });
      
      if (error) throw error;
    }
    
    // If passed, update enrollment current module index
    if (status === "passed") {
      const { data: moduleData } = await supabase
        .from("modules")
        .select("order_index, course_id")
        .eq("id", moduleId)
        .single();
      
      if (moduleData) {
        const { data: allModules } = await supabase
          .from("modules")
          .select("id, order_index")
          .eq("course_id", moduleData.course_id)
          .order("order_index", { ascending: true });
        
        if (allModules) {
          const currentIndex = allModules.findIndex(m => m.id === moduleId);
          const nextModule = allModules[currentIndex + 1];
          
          if (nextModule) {
            await supabase
              .from("enrollments")
              .update({ current_module_index: currentIndex + 1 })
              .eq("id", enrollments[0].id);
          }
        }
      }
    }
    
    toast({
      type: "success",
      title: "Module Graded",
      message: `Score of ${score}% recorded for this module.`,
    });
    
  } catch (error) {
    console.error("Error grading module:", error);
    throw error;
  }
};
// ─── Admin Grading ────────────────────────────────────────────────────────────

function AdminGrading({ courses, modules, students, onGradeModule, onGradeAssignment }: { 
  courses: Course[];
  modules: Module[];
  students: Profile[];
  onGradeModule: (studentId: string, moduleId: string, score: number, feedback: string) => Promise<void>;
  onGradeAssignment: (assignmentId: string, score: number, feedback: string) => Promise<void>;
}) {
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [studentData, setStudentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradeModal, setGradeModal] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "graded">("all");

  useEffect(() => {
    if (students.length > 0) {
      fetchAllStudentData();
    }
  }, [students, modules]);

  const fetchAllStudentData = async () => {
    setLoading(true);
    try {
      const studentDataArray = [];
      
      for (const student of students) {
        // Get enrollments with course data
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select(`
            id,
            course_id,
            current_module_index,
            course:course_id (
              id,
              title
            )
          `)
          .eq("student_id", student.id)
          .eq("status", "active");
        
        if (!enrollments || enrollments.length === 0) continue;
        
        const enrollmentData = await Promise.all(
          enrollments.map(async (enrollment) => {
            // Get modules for this course
            const courseModules = modules.filter(m => m.course_id === enrollment.course_id);
            
            // Get module progress
            const { data: progressData } = await supabase
              .from("module_progress")
              .select("*")
              .eq("enrollment_id", enrollment.id);
            
            // Get assignments for this enrollment
            const { data: assignments } = await supabase
              .from("student_assignments")
              .select(`
                *,
                assignment:assignment_id (
                  id,
                  title,
                  max_score,
                  module_id
                )
              `)
              .eq("enrollment_id", enrollment.id);
            
            // Get quiz attempts
            const { data: quizAttempts } = await supabase
              .from("quiz_attempts")
              .select("*")
              .eq("enrollment_id", enrollment.id);
            
            // Build modules with progress, assignments, and quizzes
            const modulesWithData = await Promise.all(
              courseModules.map(async (module) => {
                const progress = progressData?.find(p => p.module_id === module.id);
                
                // Find assignment for this module
                const assignmentData = assignments?.find(
                  a => a.assignment?.module_id === module.id
                );
                
                // Find quiz for this module
                const { data: quiz } = await supabase
                  .from("quizzes")
                  .select("*")
                  .eq("module_id", module.id)
                  .maybeSingle();
                
                let quizAttempt = null;
                if (quiz) {
                  quizAttempt = quizAttempts?.find(
                    a => a.quiz_id === quiz.id
                  );
                }
                
                return {
                  id: module.id,
                  title: module.title,
                  pass_score: module.pass_score || 70,
                  progress: progress ? {
                    id: progress.id,
                    status: progress.status,
                    score: progress.score || 0,
                    completed_at: progress.completed_at,
                  } : undefined,
                  assignment: assignmentData ? {
                    id: assignmentData.assignment.id,
                    title: assignmentData.assignment.title,
                    max_score: assignmentData.assignment.max_score || 100,
                    submitted_at: assignmentData.submitted_at,
                    student_assignment: {
                      id: assignmentData.id,
                      status: assignmentData.status,
                      score: assignmentData.score,
                      feedback: assignmentData.feedback,
                      submitted_at: assignmentData.submitted_at,
                    }
                  } : undefined,
                  quiz: quiz ? {
                    id: quiz.id,
                    title: quiz.title,
                    pass_score: quiz.pass_score || 70,
                    attempt: quizAttempt ? {
                      score: quizAttempt.score,
                      passed: quizAttempt.passed,
                      completed_at: quizAttempt.completed_at,
                    } : undefined
                  } : undefined
                };
              })
            );
            
            return {
              id: enrollment.id,
              course_id: enrollment.course_id,
              course_title: enrollment.course?.title || "Unknown Course",
              current_module_index: enrollment.current_module_index || 0,
              modules: modulesWithData,
            };
          })
        );
        
        studentDataArray.push({
          id: student.id,
          full_name: student.full_name,
          email: student.email,
          avatar_url: student.avatar_url,
          enrollments: enrollmentData,
        });
      }
      
      setStudentData(studentDataArray);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        type: "error",
        title: "Failed to Load",
        message: "Could not load student data. Please refresh.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeModule = async () => {
    if (!gradeModal) return;
    
    const scoreNum = parseInt(gradeForm.score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      toast({
        type: "warning",
        title: "Invalid Score",
        message: "Please enter a valid score.",
      });
      return;
    }
    
    if (scoreNum > gradeModal.maxScore) {
      toast({
        type: "warning",
        title: "Score Exceeds Maximum",
        message: `Score cannot exceed ${gradeModal.maxScore}.`,
      });
      return;
    }
    
    if (!gradeForm.feedback.trim()) {
      toast({
        type: "warning",
        title: "Feedback Required",
        message: "Please provide feedback for the student.",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      if (gradeModal.type === "module") {
        await onGradeModule(
          gradeModal.studentId,
          gradeModal.moduleId,
          scoreNum,
          gradeForm.feedback
        );
      } else if (gradeModal.type === "assignment" && gradeModal.assignmentId) {
        await onGradeAssignment(
          gradeModal.assignmentId,
          scoreNum,
          gradeForm.feedback
        );
      }
      
      toast({
        type: "success",
        title: "Grade Submitted!",
        message: `Grade of ${scoreNum}/${gradeModal.maxScore} has been recorded.`,
      });
      
      setGradeModal(null);
      setGradeForm({ score: "", feedback: "" });
      await fetchAllStudentData();
    } catch (error) {
      console.error("Error grading:", error);
      toast({
        type: "error",
        title: "Grading Failed",
        message: "Failed to submit grade. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredStudents = () => {
    let filtered = studentData;
    
    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter((s: any) => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter((s: any) => 
        s.enrollments.some((e: any) => e.course_id === selectedCourse)
      );
    }
    
    // Filter by grading status
    if (activeTab === "pending") {
      filtered = filtered.filter((s: any) => {
        return s.enrollments.some((e: any) => 
          e.modules.some((m: any) => 
            m.progress?.status !== "passed" && 
            (m.assignment?.student_assignment?.status === "submitted" || 
             m.quiz?.attempt?.passed === false)
          )
        );
      });
    } else if (activeTab === "graded") {
      filtered = filtered.filter((s: any) => {
        return s.enrollments.some((e: any) => 
          e.modules.some((m: any) => 
            m.progress?.status === "passed" ||
            m.assignment?.student_assignment?.status === "graded"
          )
        );
      });
    }
    
    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const openGradeModal = (
    studentId: string,
    studentName: string,
    moduleId: string,
    moduleTitle: string,
    type: "module" | "assignment",
    maxScore: number,
    currentScore?: number,
    feedback?: string,
    assignmentId?: string
  ) => {
    setGradeModal({
      studentId,
      studentName,
      moduleId,
      moduleTitle,
      type,
      maxScore,
      currentScore,
      feedback,
      assignmentId,
    });
    setGradeForm({
      score: currentScore?.toString() || "",
      feedback: feedback || "",
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
          Manual Grading
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Manually grade student modules and assignments.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400"
              style={{ borderColor: '#e0e0e0' }}
            />
          </div>
        </div>
        
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400"
          style={{ borderColor: '#e0e0e0' }}
        >
          <option value="all">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2" style={{ borderColor: '#e0e0e0' }}>
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-5 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "all"
              ? "text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          style={activeTab === "all" ? { backgroundColor: '#6b7280' } : {}}
        >
          All Students
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-5 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "pending"
              ? "text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          style={activeTab === "pending" ? { backgroundColor: '#f7530b' } : {}}
        >
          Pending Grading
        </button>
        <button
          onClick={() => setActiveTab("graded")}
          className={cn(
            "px-5 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "graded"
              ? "text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          style={activeTab === "graded" ? { backgroundColor: '#10b981' } : {}}
        >
          Graded
        </button>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#f7530b' }} />
          <p className="text-gray-500 mt-4">Loading student data...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 text-lg mb-2">No Students Found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm ? "No students match your search criteria." : "No students enrolled in courses yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredStudents.map((student: any) => (
            <Card key={student.id} className="p-4 md:p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={student.full_name} size="lg" src={student.avatar_url} />
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{student.full_name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </div>
              
              {student.enrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="mt-4 border-t pt-4" style={{ borderColor: '#e0e0e0' }}>
                  <h4 className="font-semibold text-gray-700 text-sm mb-3">
                    {enrollment.course_title}
                  </h4>
                  <div className="space-y-4">
                    {enrollment.modules.map((module: any) => (
                      <div key={module.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{module.title}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>Pass: {module.pass_score}%</span>
                              {module.progress && (
                                <Badge variant={module.progress.status === "passed" ? "success" : "warning"}>
                                  {module.progress.status === "passed" ? `✅ Passed (${module.progress.score}%)` : `⏳ ${module.progress.status}`}
                                </Badge>
                              )}
                              {module.quiz?.attempt && (
                                <Badge variant={module.quiz.attempt.passed ? "success" : "danger"}>
                                  Quiz: {module.quiz.attempt.score}%
                                </Badge>
                              )}
                              {module.assignment?.student_assignment && (
                                <Badge variant={
                                  module.assignment.student_assignment.status === "graded" ? "success" :
                                  module.assignment.student_assignment.status === "submitted" ? "info" : "muted"
                                }>
                                  Assignment: {module.assignment.student_assignment.status}
                                  {module.assignment.student_assignment.score !== undefined && 
                                    ` (${module.assignment.student_assignment.score}/${module.assignment.max_score})`
                                  }
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!module.progress?.status || module.progress.status !== "passed" ? (
                              <button
                                onClick={() => openGradeModal(
                                  student.id,
                                  student.full_name,
                                  module.id,
                                  module.title,
                                  "module",
                                  100,
                                  module.progress?.score,
                                  module.progress?.status === "failed" ? "Previous attempt failed. Please review the material and try again." : "",
                                )}
                                className="px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                                style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                              >
                                <Edit className="w-4 h-4" /> Grade Module
                              </button>
                            ) : (
                              <Badge variant="success">✅ Completed</Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Assignment Grade Button */}
                        {module.assignment?.student_assignment && 
                         module.assignment.student_assignment.status !== "graded" && (
                          <div className="mt-3 pt-3 border-t" style={{ borderColor: '#e0e0e0' }}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Assignment: {module.assignment.title}
                                </p>
                                {module.assignment.submitted_at && (
                                  <p className="text-xs text-gray-500">
                                    Submitted: {formatDate(module.assignment.submitted_at)}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => openGradeModal(
                                  student.id,
                                  student.full_name,
                                  module.id,
                                  module.assignment.title,
                                  "assignment",
                                  module.assignment.max_score,
                                  module.assignment.student_assignment?.score,
                                  module.assignment.student_assignment?.feedback,
                                  module.assignment.student_assignment?.id
                                )}
                                className="px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                                style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                              >
                                <Edit className="w-4 h-4" /> Grade Assignment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {/* Grade Modal */}
      <Modal open={!!gradeModal} onClose={() => setGradeModal(null)} title="Grade Module/Assignment" maxWidth="max-w-2xl">
        {gradeModal && (
          <div className="space-y-5">
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar name={gradeModal.studentName} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-gray-800">{gradeModal.studentName}</p>
                  <p className="text-sm text-gray-500">
                    {gradeModal.type === "module" ? "Module" : "Assignment"}: {gradeModal.moduleTitle}
                  </p>
                  {gradeModal.currentScore !== undefined && (
                    <p className="text-sm text-gray-500">
                      Current Score: {gradeModal.currentScore}/{gradeModal.maxScore}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Score (out of {gradeModal.maxScore}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))}
                  placeholder={`Enter score (0-${gradeModal.maxScore})`}
                  className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                  style={{ borderColor: '#e0e0e0' }}
                  min="0"
                  max={gradeModal.maxScore}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter a number between 0 and {gradeModal.maxScore}</p>
              </div>
              
              <Textarea 
                label="Feedback" 
                value={gradeForm.feedback} 
                onChange={(v) => setGradeForm((p) => ({ ...p, feedback: v }))} 
                placeholder="Provide detailed feedback for the student..." 
                rows={4} 
                required 
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGradeModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGradeModule}
                disabled={!gradeForm.score || !gradeForm.feedback || submitting}
                className={cn(
                  "flex-1 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
                  !gradeForm.score || !gradeForm.feedback || submitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "hover:opacity-90"
                )}
                style={!gradeForm.score || !gradeForm.feedback || submitting ? {} : { backgroundColor: '#f7530b', color: '#ffffff' }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Submit Grade
              </button>
            </div>
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*");
      
      if (quizzesError) {
        console.error("Error fetching quizzes:", quizzesError);
        setError("Failed to load quizzes: " + quizzesError.message);
        setLoading(false);
        return;
      }
      
      if (quizzesData && quizzesData.length > 0) {
        const moduleIds = quizzesData.map(q => q.module_id).filter(Boolean);
        let modulesData: any[] = [];
        
        if (moduleIds.length > 0) {
          const { data: modulesResult } = await supabase
            .from("modules")
            .select("id, title, course_id")
            .in("id", moduleIds);
          if (modulesResult) modulesData = modulesResult;
        }
        
        const quizzesWithModules = quizzesData.map(quiz => ({
          ...quiz,
          module: modulesData.find(m => m.id === quiz.module_id)
        }));
        
        setQuizzes(quizzesWithModules);
      } else {
        setQuizzes([]);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
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
    if (!selectedModule || !quizTitle || questions.length === 0) {
      toast({
        type: "warning",
        title: "Missing Information",
        message: "Please fill in all required fields and add at least one question.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await onQuizCreate({
        module_id: selectedModule,
        title: quizTitle,
        description: quizDescription,
        pass_score: parseInt(passScore),
        questions: questions,
      });
      
      toast({
        type: "success",
        title: "Quiz Created",
        message: `"${quizTitle}" has been created with ${questions.length} questions.`,
      });
      
      setShowCreateModal(false);
      setQuizTitle("");
      setQuizDescription("");
      setPassScore("70");
      setQuestions([]);
      setSelectedModule("");
      setLoading(false);
      fetchQuizzes();
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        type: "error",
        title: "Failed",
        message: "Failed to create quiz. Please try again.",
      });
      setLoading(false);
    }
  };

  const handleQuizDelete = async (quizId: string) => {
    showConfirm({
      title: "Delete Quiz",
      message: "Are you sure you want to delete this quiz? All questions and attempts will be lost.",
      confirmLabel: "Delete",
      type: "danger",
      onConfirm: async () => {
        await onQuizDelete(quizId);
        toast({
          type: "success",
          title: "Quiz Deleted",
          message: "Quiz has been deleted.",
        });
        fetchQuizzes();
      },
    });
  };

  const availableModules = modules.filter(m => !quizzes.some(q => q.module_id === m.id));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Quizzes
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Create and manage module quizzes.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto justify-center"
          style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
        >
          <Plus className="w-4 h-4" /> Create Quiz
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchQuizzes}
            className="mt-2 text-sm text-red-600 font-medium hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const module = modules.find(m => m.id === quiz.module_id);
          const course = courses.find(c => c.id === module?.course_id);
          return (
            <Card key={quiz.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="info">{course?.title || "Unknown"} → {module?.title || "Unknown Module"}</Badge>
                    <Badge variant="success">Pass: {quiz.pass_score}%</Badge>
                    <Badge variant="default">{quiz.module_id ? "Has Questions" : "No Questions"}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => handleQuizDelete(quiz.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </Card>
          );
        })}
        {quizzes.length === 0 && !error && (
          <Card className="p-8 text-center">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No quizzes created yet. Create a quiz for each module.</p>
          </Card>
        )}
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Quiz">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Module <span className="text-red-500">*</span></label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
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
            {availableModules.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">All modules already have quizzes. Create a module first if needed.</p>
            )}
          </div>
          
          <Input label="Quiz Title" value={quizTitle} onChange={setQuizTitle} placeholder="e.g. Module 1 Assessment" required />
          <Textarea label="Description" value={quizDescription} onChange={setQuizDescription} placeholder="Brief description of the quiz..." rows={2} />
          <Input label="Pass Score (%)" type="number" value={passScore} onChange={setPassScore} placeholder="70" required />

          <div className="border-t pt-4" style={{ borderColor: '#e0e0e0' }}>
            <h4 className="font-semibold text-gray-800 mb-3">Questions ({questions.length})</h4>
            
            <div className="space-y-3 bg-gray-100/30 p-3 rounded-lg">
              <Input label="Question" value={currentQuestion.question} onChange={(v) => setCurrentQuestion({ ...currentQuestion, question: v })} placeholder="Enter your question..." />
              <div className="space-y-2">
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === i}
                      onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: i })}
                      className="w-4 h-4 shrink-0" style={{ accentColor: '#f7530b' }}
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
                className="w-full py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
              >
                Add Question
              </button>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="mt-2 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{i + 1}. {q.question}</p>
                  <p className="text-xs text-gray-500">Correct: {q.options[q.correctAnswer]}</p>
                </div>
                <button
                  onClick={() => removeQuestion(i)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateQuiz}
            disabled={loading || !selectedModule || !quizTitle || questions.length === 0}
            className="w-full py-3 font-semibold rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50"
            style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Create Quiz (${questions.length} questions)`}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Admin Chat (Unified) ────────────────────────────────────────────────────────────

function AdminChat({ courses, students }: { courses: Course[]; students: Profile[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [personalMessages, setPersonalMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [chatType, setChatType] = useState<"course" | "personal">("course");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showList, setShowList] = useState(true);
  const [unreadCourseCount, setUnreadCourseCount] = useState(0);
  const [unreadPersonalCount, setUnreadPersonalCount] = useState(0);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch unread counts
  const fetchUnreadCounts = async () => {
    if (!profile) return;
    
    // Course chat unread
    const { count: courseCount } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);
    setUnreadCourseCount(courseCount || 0);

    // Personal messages unread
    const { count: personalCount } = await supabase
      .from('personal_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', profile.id)
      .eq('read', false);
    setUnreadPersonalCount(personalCount || 0);
  };

  // Auto-select on mobile
  useEffect(() => {
    if (isMobile) {
      if (chatType === "course" && courses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courses[0].id);
        setShowList(false);
      }
      if (chatType === "personal" && students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
        setShowList(false);
      }
    }
  }, [isMobile, chatType, courses, students]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin")
        .limit(1)
        .single();
      if (data) {
        setProfile(data as Profile);
        fetchUnreadCounts();
      }
    };
    fetchProfile();

    // Subscribe to new messages
    const courseSubscription = supabase
      .channel('admin-course-messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => fetchUnreadCounts()
      )
      .subscribe();

    const personalSubscription = supabase
      .channel('admin-personal-messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'personal_messages', filter: `receiver_id=eq.${profile?.id || ''}` },
        () => fetchUnreadCounts()
      )
      .subscribe();

    return () => {
      courseSubscription.unsubscribe();
      personalSubscription.unsubscribe();
    };
  }, [profile?.id]);

  useEffect(() => {
    if (selectedCourseId && chatType === "course") {
      fetchMessages();
      
      const markAsRead = async () => {
        try {
          const { error } = await supabase
            .from('chat_messages')
            .update({ read: true })
            .eq('course_id', selectedCourseId)
            .eq('read', false);
          
          if (!error) {
            fetchUnreadCounts();
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      markAsRead();
      
      const subscription = supabase
        .channel(`admin-chat-${selectedCourseId}`)
        .on("postgres_changes", 
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `course_id=eq.${selectedCourseId}` },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedCourseId, chatType]);

  useEffect(() => {
    if (selectedStudentId && chatType === "personal" && profile?.id) {
      fetchPersonalMessages();
      
      const markAsRead = async () => {
        try {
          const { error } = await supabase
            .from('personal_messages')
            .update({ read: true })
            .eq('receiver_id', profile.id)
            .eq('sender_id', selectedStudentId)
            .eq('read', false);
          
          if (!error) {
            fetchUnreadCounts();
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      markAsRead();
      
      const subscription = supabase
        .channel(`personal-chat-${selectedStudentId}`)
        .on("postgres_changes", 
          { event: "INSERT", schema: "public", table: "personal_messages", 
            filter: `sender_id=eq.${selectedStudentId},receiver_id=eq.${profile.id}` },
          () => fetchPersonalMessages()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedStudentId, chatType, profile?.id]);

  const fetchMessages = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("course_id", selectedCourseId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
    setLoading(false);
  };

  const fetchPersonalMessages = async () => {
    if (!selectedStudentId || !profile?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("personal_messages")
      .select("*")
      .or(`and(sender_id.eq.${selectedStudentId},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${selectedStudentId})`)
      .order("created_at", { ascending: true });
    if (data) {
      setPersonalMessages(data);
      await supabase
        .from("personal_messages")
        .update({ read: true })
        .eq('receiver_id', profile.id)
        .eq('sender_id', selectedStudentId);
      fetchUnreadCounts();
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    
    if (chatType === "course" && selectedCourseId) {
      const adminName = "Admin";
      const { error } = await supabase.from("chat_messages").insert({
        course_id: selectedCourseId,
        user_id: "admin",
        user_name: adminName,
        user_avatar: null,
        message: newMessage.trim(),
      });
      if (!error) {
        setNewMessage("");
        fetchMessages();
        toast({
          type: "success",
          title: "Message Sent",
          message: "Your message has been sent to the course chat.",
        });
      }
    } else if (chatType === "personal" && selectedStudentId && profile?.id) {
      const { error } = await supabase.from("personal_messages").insert({
        sender_id: profile.id,
        receiver_id: selectedStudentId,
        message: newMessage.trim(),
      });
      if (!error) {
        setNewMessage("");
        fetchPersonalMessages();
        toast({
          type: "success",
          title: "Message Sent",
          message: "Your message has been sent to the student.",
        });
      }
    }
    setSending(false);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const totalUnread = unreadCourseCount + unreadPersonalCount;

  // Mobile chat view for admin
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-[#eeeeee]" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="p-4 bg-white border-b shadow-sm sticky top-0 z-10" style={{ borderColor: '#e0e0e0' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!showList && (
                <button
                  onClick={() => setShowList(true)}
                  className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h1 className="text-lg font-bold text-gray-800">
                {showList ? "Messages" : 
                  chatType === "course" ? selectedCourse?.title || "Course Chat" :
                  selectedStudent?.full_name || "Student Chat"}
                {!showList && totalUnread > 0 && (
                  <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </h1>
            </div>
            {!showList && (
              <button
                onClick={() => setShowList(true)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {showList ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => { setChatType("course"); setSelectedStudentId(null); }}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  chatType === "course" ? "text-white" : "bg-white text-gray-700 border"
                )}
                style={chatType === "course" ? { backgroundColor: '#f7530b' } : { borderColor: '#e0e0e0' }}
              >
                Course Chat
                {unreadCourseCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCourseCount > 9 ? '9+' : unreadCourseCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setChatType("personal"); setSelectedCourseId(null); }}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  chatType === "personal" ? "text-white" : "bg-white text-gray-700 border"
                )}
                style={chatType === "personal" ? { backgroundColor: '#f7530b' } : { borderColor: '#e0e0e0' }}
              >
                Student Messages
                {unreadPersonalCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadPersonalCount > 9 ? '9+' : unreadPersonalCount}
                  </span>
                )}
              </button>
            </div>

            {chatType === "course" ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 px-1">Select a course:</p>
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    onClick={() => { setSelectedCourseId(course.id); setShowList(false); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={course.thumbnail_url || ""} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{course.title}</p>
                        <p className="text-xs text-gray-500">Tap to chat</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Card>
                ))}
                {courses.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No courses available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 px-1">Select a student:</p>
                {students.map((student) => (
                  <Card
                    key={student.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    onClick={() => { setSelectedStudentId(student.id); setShowList(false); }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={student.full_name} size="sm" src={student.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{student.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{student.email}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Card>
                ))}
                {students.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No students available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f7530b' }} />
                </div>
              ) : chatType === "course" ? (
                messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No messages yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-2 max-w-[85%]",
                        msg.user_id === "admin" ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <Avatar name={msg.user_name} size="sm" src={msg.user_avatar} />
                      <div className={cn(
                        "p-3 rounded-lg text-sm",
                        msg.user_id === "admin"
                          ? "text-white"
                          : "bg-gray-100 text-gray-800"
                      )}
                      style={msg.user_id === "admin" ? { backgroundColor: '#f7530b' } : {}}
                      >
                        <p className="text-xs font-medium opacity-70">{msg.user_name}</p>
                        <p className="mt-0.5 break-words">{msg.message}</p>
                        <p className="text-xs opacity-50 mt-1">{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                personalMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No messages yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Send a message to this student</p>
                  </div>
                ) : (
                  personalMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-2 max-w-[85%]",
                        msg.sender_id === profile?.id ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <Avatar 
                        name={msg.sender_id === profile?.id ? "Admin" : selectedStudent?.full_name || "Student"} 
                        size="sm" 
                      />
                      <div className={cn(
                        "p-3 rounded-lg text-sm",
                        msg.sender_id === profile?.id
                          ? "text-white"
                          : "bg-gray-100 text-gray-800"
                      )}
                      style={msg.sender_id === profile?.id ? { backgroundColor: '#f7530b' } : {}}
                      >
                        <p className="text-xs font-medium opacity-70">
                          {msg.sender_id === profile?.id ? "Admin" : selectedStudent?.full_name || "Student"}
                        </p>
                        <p className="mt-0.5 break-words">{msg.message}</p>
                        <p className="text-xs opacity-50 mt-1">{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            <div className="p-3 border-t flex gap-2 bg-white" style={{ borderColor: '#e0e0e0' }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={chatType === "course" ? "Reply as Admin..." : `Message ${selectedStudent?.full_name || "student"}...`}
                className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 hover:opacity-90 transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop chat view
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
              Messages
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Monitor course discussions and message students personally.</p>
          </div>
          {totalUnread > 0 && (
            <Badge variant="warning">{totalUnread} Unread</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setChatType("course"); setSelectedStudentId(null); }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
            chatType === "course" ? "text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          )}
          style={chatType === "course" ? { backgroundColor: '#f7530b' } : {}}
        >
          Course Chat
          {unreadCourseCount > 0 && (
            <span className="ml-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {unreadCourseCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setChatType("personal"); setSelectedCourseId(null); }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
            chatType === "personal" ? "text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          )}
          style={chatType === "personal" ? { backgroundColor: '#f7530b' } : {}}
        >
          Student Messages
          {unreadPersonalCount > 0 && (
            <span className="ml-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {unreadPersonalCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6 h-[calc(100%-120px)]">
        <div className="md:col-span-1 bg-white rounded-xl border p-4 overflow-y-auto" style={{ borderColor: '#e0e0e0' }}>
          {chatType === "course" ? (
            <>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Courses</h3>
              <div className="space-y-2">
                {courses.length === 0 && (
                  <p className="text-xs text-gray-500">No courses available.</p>
                )}
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg text-sm transition-all",
                      selectedCourseId === course.id
                        ? "border" : "hover:bg-gray-50 text-gray-600"
                    )}
                    style={selectedCourseId === course.id ? { backgroundColor: '#fdddce', borderColor: '#fcba9d', color: '#f7530b' } : {}}
                  >
                    <p className="font-medium truncate">{course.title}</p>
                    <p className="text-xs text-gray-500">Click to view chat</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Students</h3>
              <div className="space-y-2">
                {students.length === 0 && (
                  <p className="text-xs text-gray-500">No students available.</p>
                )}
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-2",
                      selectedStudentId === student.id
                        ? "border" : "hover:bg-gray-50 text-gray-600"
                    )}
                    style={selectedStudentId === student.id ? { backgroundColor: '#fdddce', borderColor: '#fcba9d', color: '#f7530b' } : {}}
                  >
                    <Avatar name={student.full_name} size="sm" src={student.avatar_url} />
                    <span className="font-medium truncate flex-1">{student.full_name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-3 bg-white rounded-xl border flex flex-col" style={{ borderColor: '#e0e0e0' }}>
          {chatType === "course" ? (
            !selectedCourseId ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Select a course to view messages</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b" style={{ borderColor: '#e0e0e0' }}>
                  <p className="font-semibold text-gray-800">
                    {courses.find(c => c.id === selectedCourseId)?.title || "Course Chat"}
                  </p>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f7530b' }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start gap-3 max-w-[80%]",
                          msg.user_id === "admin" ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <Avatar name={msg.user_name} size="sm" src={msg.user_avatar} />
                        <div className={cn(
                          "p-3 rounded-lg text-sm",
                          msg.user_id === "admin"
                            ? "text-white"
                            : "bg-gray-100 text-gray-800"
                        )}
                        style={msg.user_id === "admin" ? { backgroundColor: '#f7530b' } : {}}
                        >
                          <p className="text-xs font-medium opacity-70">{msg.user_name}</p>
                          <p className="mt-0.5">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">{formatTime(msg.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t flex gap-3" style={{ borderColor: '#e0e0e0' }}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Reply as Admin..."
                    className="flex-1 px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )
          ) : (
            !selectedStudentId ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Select a student to message personally</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: '#e0e0e0' }}>
                  <Avatar name={selectedStudent?.full_name || "Student"} size="sm" src={selectedStudent?.avatar_url} />
                  <div>
                    <p className="font-semibold text-gray-800">{selectedStudent?.full_name || "Student"}</p>
                    <p className="text-xs text-gray-500">{selectedStudent?.email}</p>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f7530b' }} />
                    </div>
                  ) : personalMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet.</p>
                      <p className="text-xs mt-1">Send a message to this student</p>
                    </div>
                  ) : (
                    personalMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start gap-3 max-w-[80%]",
                          msg.sender_id === profile?.id ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <Avatar 
                          name={msg.sender_id === profile?.id ? "Admin" : selectedStudent?.full_name || "Student"} 
                          size="sm" 
                        />
                        <div className={cn(
                          "p-3 rounded-lg text-sm",
                          msg.sender_id === profile?.id
                            ? "text-white"
                            : "bg-gray-100 text-gray-800"
                        )}
                        style={msg.sender_id === profile?.id ? { backgroundColor: '#f7530b' } : {}}
                        >
                          <p className="text-xs font-medium opacity-70">
                            {msg.sender_id === profile?.id ? "Admin" : selectedStudent?.full_name || "Student"}
                          </p>
                          <p className="mt-0.5">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">{formatTime(msg.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t flex gap-3" style={{ borderColor: '#e0e0e0' }}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={`Message ${selectedStudent?.full_name || "student"}...`}
                    className="flex-1 px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400" style={{ borderColor: '#e0e0e0' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Scholarship ─────────────────────────────────────────────────────

function AdminScholarship() {
  const [applications, setApplications] = useState<Scholarship[]>([]);
  const [selectedApp, setSelectedApp] = useState<Scholarship | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
    
    const subscription = supabase
      .channel("admin-scholarships")
      .on("postgres_changes", { event: "*", schema: "public", table: "scholarships" }, () => fetchApplications())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (data) setApplications(data as Scholarship[]);
    setLoading(false);
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("scholarships")
      .update({ 
        status: action, 
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null
      })
      .eq("id", id);

    if (!error) {
      toast({
        type: "success",
        title: `Application ${action}`,
        message: `Scholarship application has been ${action}.`,
      });
      setSelectedApp(null);
      setAdminNotes("");
      fetchApplications();
    } else {
      toast({
        type: "error",
        title: "Action Failed",
        message: "Failed to update application. Please try again.",
      });
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#333333', fontFamily: "'Poppins', sans-serif" }}>
            Scholarship Applications
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Review and manage student scholarship applications.</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning">{pendingCount} Pending</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Clock} label="Pending" value={pendingCount} />
        <StatCard icon={CheckCircle} label="Approved" value={applications.filter(a => a.status === "approved").length} />
        <StatCard icon={XCircle} label="Rejected" value={applications.filter(a => a.status === "rejected").length} />
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No scholarship applications yet.</p>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar name={app.full_name} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-800">{app.full_name}</p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-2"><span className="font-medium">Course:</span> {app.course_title}</p>
                  <p className="text-sm text-gray-500 mt-1">{app.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {formatDate(app.submitted_at)}
                  </p>
                  {app.admin_notes && (
                    <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs text-gray-500">
                      Admin note: {app.admin_notes}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    app.status === "approved" ? "text-green-600 bg-green-50 border-green-200" :
                    app.status === "rejected" ? "text-red-600 bg-red-50 border-red-200" :
                    "text-amber-600 bg-amber-50 border-amber-200"
                  )}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  {app.status === "pending" && (
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 text-xs rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#f7530b', color: '#ffffff' }}
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Review Scholarship Application">
        {selectedApp && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={selectedApp.full_name} size="md" />
                <div>
                  <p className="font-semibold text-gray-800">{selectedApp.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedApp.email}</p>
                </div>
              </div>
              <p className="text-sm"><span className="font-medium">Course:</span> {selectedApp.course_title}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {formatPhoneNumber(selectedApp.phone)}</p>
              <div className="p-3 bg-white rounded-lg border" style={{ borderColor: '#e0e0e0' }}>
                <p className="text-sm font-medium mb-1">Reason:</p>
                <p className="text-sm text-gray-500">{selectedApp.reason}</p>
              </div>
            </div>

            <Textarea
              label="Admin Notes"
              value={adminNotes}
              onChange={setAdminNotes}
              placeholder="Add notes about this application..."
              rows={3}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  showConfirm({
                    title: "Reject Application",
                    message: `Are you sure you want to reject ${selectedApp.full_name}'s scholarship application?`,
                    confirmLabel: "Reject",
                    type: "danger",
                    onConfirm: () => handleAction(selectedApp.id, "rejected"),
                  });
                }}
                className="py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => {
                  showConfirm({
                    title: "Approve Application",
                    message: `Are you sure you want to approve ${selectedApp.full_name}'s scholarship application?`,
                    confirmLabel: "Approve",
                    type: "info",
                    onConfirm: () => handleAction(selectedApp.id, "approved"),
                  });
                }}
                className="py-2.5 text-white font-semibold rounded-lg hover:opacity-90 transition-colors text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: '#f7530b' }}
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
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
  try {
    const { error } = await supabase
      .from("student_assignments")
      .update({ 
        status: "graded", 
        score, 
        feedback,
        graded_at: new Date().toISOString()
      })
      .eq("id", assignmentId);
    
    if (error) {
      console.error("Error grading assignment:", error);
      throw error;
    }
    
    toast({
      type: "success",
      title: "Assignment Graded",
      message: "The assignment has been graded successfully.",
    });
    
    // Refresh the assignments list
    await fetchEnrollments();
    
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
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

  // ─── Fetch progress ──────────────────────────────────────────────────────
  const fetchProgress = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("module_progress")
      .select("*")
      .eq("student_id", profile.id);
    if (data) setProgress(data as ModuleProgress[]);
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
          case "admin-grading":
  return <AdminGrading 
    courses={courses || []}
    modules={modules || []}
    students={students || []}
    onGradeModule={handleGradeModule}
    onGradeAssignment={handleGradeAssignment}
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
