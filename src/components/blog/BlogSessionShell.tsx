"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import type { DashboardLayoutContext } from "@/components/dashboard/dashboard-layout-types";

type BlogSessionShellProps = {
  children: ReactNode;
  publicHeader: ReactNode;
};

type SessionState =
  | {
      status: "checking";
      context: null;
    }
  | {
      status: "public";
      context: null;
    }
  | {
      status: "authenticated";
      context: DashboardLayoutContext;
    };

export function BlogSessionShell({
  children,
  publicHeader,
}: BlogSessionShellProps) {
  const [sessionState, setSessionState] = useState<SessionState>({
    status: "checking",
    context: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function resolveLayout() {
      try {
        const response = await fetch("/api/dashboard/layout-context", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setSessionState({
            status: "public",
            context: null,
          });
          return;
        }

        const data = (await response.json()) as {
          authenticated?: boolean;
          context?: DashboardLayoutContext;
        };

        if (data.authenticated && data.context) {
          setSessionState({
            status: "authenticated",
            context: data.context,
          });
          return;
        }

        setSessionState({
          status: "public",
          context: null,
        });
      } catch {
        if (isMounted) {
          setSessionState({
            status: "public",
            context: null,
          });
        }
      }
    }

    void resolveLayout();

    return () => {
      isMounted = false;
    };
  }, []);

  if (
    sessionState.status === "authenticated" &&
    sessionState.context
  ) {
    return (
      <DashboardChrome {...sessionState.context}>
        {children}
      </DashboardChrome>
    );
  }

  /**
   * Podczas bardzo krótkiego sprawdzania sesji zostawiamy publiczny header.
   * Dzięki temu:
   * - SSR/SEO bloga zachowuje pełną publiczną nawigację,
   * - gość nie widzi pustego "flashu",
   * - zalogowany po hydratacji przechodzi do tego samego chrome co dashboard.
   */
  return (
    <div className="min-h-screen bg-background">
      {publicHeader}
      {children}
    </div>
  );
}
