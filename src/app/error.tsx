"use client";

import { useEffect } from "react";

import { StatusPage } from "@/components/public/StatusPage";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      eyebrow="Błąd aplikacji"
      title="Coś poszło nie tak po naszej stronie."
      description="Nie udało się poprawnie wyświetlić tej części Rybio. Spróbuj ponownie — jeśli problem będzie się powtarzał, wróć na stronę główną lub skontaktuj się z nami."
      onRetry={reset}
    />
  );
}
