"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "info" | "loading";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
};

type CreateToastInput = {
  title: string;
  description?: string;
  duration?: number;
};

type ToastContextValue = {
  success: (input: string | CreateToastInput) => string;
  error: (input: string | CreateToastInput) => string;
  info: (input: string | CreateToastInput) => string;
  loading: (input: string | CreateToastInput) => string;
  dismiss: (id: string) => void;
  update: (
    id: string,
    input: Partial<Omit<Toast, "id">> & {
      title?: string;
    }
  ) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4500;
const LOADING_DURATION = 999999;

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeToastInput(
  input: string | CreateToastInput,
  fallbackDuration: number
) {
  if (typeof input === "string") {
    return {
      title: input,
      duration: fallbackDuration,
    };
  }

  return {
    ...input,
    duration: input.duration ?? fallbackDuration,
  };
}

function getToastStyles(type: ToastType) {
  if (type === "success") {
    return {
      wrapper:
        "border-success-border bg-success-subtle text-success-foreground",
      icon: "bg-success text-white",
      description: "text-success-foreground/80",
    };
  }

  if (type === "error") {
    return {
      wrapper:
        "border-danger-border bg-danger-subtle text-danger-foreground",
      icon: "bg-danger text-white",
      description: "text-danger-foreground/80",
    };
  }

  if (type === "loading") {
    return {
      wrapper:
        "border-info-border bg-info-subtle text-info-foreground",
      icon: "bg-primary text-white",
      description: "text-info-foreground/80",
    };
  }

  return {
    wrapper:
      "border-border bg-surface text-text shadow-card",
    icon: "bg-navy-950 text-white",
    description: "text-text-secondary",
  };
}

function ToastIcon({ type }: { type: ToastType }) {
  const styles = getToastStyles(type);

  if (type === "loading") {
    return (
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      </span>
    );
  }

  const icon =
    type === "success" ? "✓" : type === "error" ? "!" : "i";

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${styles.icon}`}
    >
      {icon}
    </span>
  );
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      const oldTimer = timersRef.current.get(id);

      if (oldTimer) {
        clearTimeout(oldTimer);
      }

      if (duration <= 0 || duration >= LOADING_DURATION) {
        return;
      }

      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const createToast = useCallback(
    (type: ToastType, input: string | CreateToastInput) => {
      const normalized = normalizeToastInput(
        input,
        type === "loading"
          ? LOADING_DURATION
          : DEFAULT_DURATION
      );

      const id = createToastId();

      const toast: Toast = {
        id,
        type,
        title: normalized.title,
        description: normalized.description,
        duration: normalized.duration,
      };

      setToasts((current) =>
        [toast, ...current].slice(0, 5)
      );

      scheduleDismiss(
        id,
        toast.duration ?? DEFAULT_DURATION
      );

      return id;
    },
    [scheduleDismiss]
  );

  const update = useCallback(
    (
      id: string,
      input: Partial<Omit<Toast, "id">> & {
        title?: string;
      }
    ) => {
      setToasts((current) =>
        current.map((toast) => {
          if (toast.id !== id) {
            return toast;
          }

          const nextToast = {
            ...toast,
            ...input,
            duration:
              input.duration ??
              (input.type === "loading"
                ? LOADING_DURATION
                : DEFAULT_DURATION),
          };

          scheduleDismiss(
            id,
            nextToast.duration ?? DEFAULT_DURATION
          );

          return nextToast;
        })
      );
    },
    [scheduleDismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (input) =>
        createToast("success", input),
      error: (input) =>
        createToast("error", input),
      info: (input) =>
        createToast("info", input),
      loading: (input) =>
        createToast("loading", input),
      dismiss,
      update,
    }),
    [createToast, dismiss, update]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[99999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6 sm:w-full">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);

          return (
            <div
              key={toast.id}
              role="status"
              aria-live={
                toast.type === "error"
                  ? "assertive"
                  : "polite"
              }
              className={`pointer-events-auto flex gap-3 rounded-card border p-4 shadow-float backdrop-blur ${styles.wrapper}`}
            >
              <ToastIcon type={toast.type} />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold leading-5">
                  {toast.title}
                </p>

                {toast.description && (
                  <p
                    className={`mt-1 text-sm leading-5 ${styles.description}`}
                  >
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg font-bold opacity-60 transition hover:bg-white/70 hover:opacity-100"
                aria-label="Zamknij powiadomienie"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast musi być użyty wewnątrz ToastProvider."
    );
  }

  return context;
}
