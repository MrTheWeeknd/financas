"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

type ToastStatus = "loading" | "success" | "error";

type Toast = {
  id: number;
  message: string;
  status: ToastStatus;
};

type ToastContextValue = {
  show: (message: string, status: ToastStatus) => number;
  update: (id: number, message: string, status: ToastStatus) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, status: ToastStatus) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { id, message, status }]);

      if (status !== "loading") {
        window.setTimeout(() => dismiss(id), 3500);
      }

      return id;
    },
    [dismiss],
  );

  const update = useCallback(
    (id: number, message: string, status: ToastStatus) => {
      setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, message, status } : toast)));

      if (status !== "loading") {
        window.setTimeout(() => dismiss(id), 3500);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, update, dismiss }), [show, update, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(360px,calc(100vw-32px))] gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast precisa ser usado dentro de ToastProvider.");
  }

  return context;
}

function ToastItem({ toast }: { toast: Toast }) {
  const iconClass = "h-5 w-5 shrink-0";
  const tone = {
    loading: "border-[var(--outline-variant)] bg-white text-[var(--on-surface)]",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-[var(--error)]",
  }[toast.status];

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${tone}`}>
      {toast.status === "loading" ? <LoaderCircle className={`${iconClass} animate-spin`} /> : null}
      {toast.status === "success" ? <CheckCircle2 className={iconClass} /> : null}
      {toast.status === "error" ? <XCircle className={iconClass} /> : null}
      <span>{toast.message}</span>
    </div>
  );
}
