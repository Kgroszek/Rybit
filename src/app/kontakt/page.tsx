import { ContactTabs } from "@/components/ContactTabs";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata = {
  title: "Kontakt | Rybio",
  description:
    "Skontaktuj się z Rybio. Napisz w sprawie serwisu, współpracy lub zapytaj o stworzenie strony internetowej dla łowiska.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />

      <ContactTabs />

      <PublicFooter />
    </main>
  );
}