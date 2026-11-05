import type { Metadata } from "next";

import { StatusPage } from "@/components/public/StatusPage";

export const metadata: Metadata = {
  title: "404 — Nie znaleziono strony | Rybio",
  description:
    "Nie znaleziono strony, której szukasz. Wróć na stronę główną Rybio lub przejdź do bazy łowisk.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      eyebrow="Nie znaleziono strony"
      title="Wygląda na to, że ta ścieżka prowadzi donikąd."
      description="Adres mógł się zmienić, strona mogła zostać usunięta albo w linku znajduje się literówka. Możesz wrócić na stronę główną lub od razu przejść do bazy łowisk."
    />
  );
}
