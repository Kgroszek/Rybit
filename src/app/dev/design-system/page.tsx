import { notFound } from "next/navigation";


import { Badge } from "@/components/ui/Badge";
import {
  Button,
  ButtonLink,
} from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { TrashIcon } from "@/components/icons/TrashIcon";

export const metadata = {
  title: "Rybio Design System",
  robots: {
    index: false,
    follow: false,
  },
};

const primaryColors = [
  ["50", "#F4F7FD"],
  ["100", "#EAF1FF"],
  ["200", "#CFDDF7"],
  ["300", "#AFC4E8"],
  ["400", "#7FA2D3"],
  ["500", "#3B6AB8"],
  ["600", "#2F5BA7"],
  ["700", "#274B8A"],
  ["800", "#1F3F73"],
  ["900", "#17315E"],
];

const accentColors = [
  ["Deep Water", "#0D1E33"],
  ["Aqua", "#20A6A4"],
  ["Success", "#39A875"],
  ["Warning", "#E7A53B"],
  ["Danger", "#D94C57"],
  ["Background", "#F7F9FC"],
  ["Text", "#101828"],
  ["Muted", "#8491A3"],
];

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-14">
        <PageHeader
          eyebrow="Rybio UI"
          title="Design System"
          description="Żywa dokumentacja kolorów, typografii i podstawowych komponentów używanych w Rybio."
          actions={
            <Badge variant="primary" size="md">
              v1.1
            </Badge>
          }
        />

        <section>
          <SectionHeader
            eyebrow="Foundation"
            title="Paleta kolorów"
            description="Primary odpowiada za interakcje. Aqua jest akcentem wodnym. Kolory statusów mają wyłącznie znaczenie semantyczne."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {primaryColors.map(([name, hex]) => (
              <div
                key={name}
                className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
              >
                <div
                  className="h-20"
                  style={{ backgroundColor: hex }}
                />
                <div className="p-3">
                  <p className="text-xs font-bold text-text">
                    Primary {name}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-text-muted">
                    {hex}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {accentColors.map(([name, hex]) => (
              <div
                key={name}
                className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
              >
                <div
                  className="h-16"
                  style={{ backgroundColor: hex }}
                />
                <div className="p-3">
                  <p className="text-xs font-bold text-text">
                    {name}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-text-muted">
                    {hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow="Typography"
            title="Manrope + Geist"
          />

          <Card className="mt-6">
            <CardContent className="space-y-8">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  Manrope / Display
                </p>
                <p className="font-display text-5xl font-extrabold tracking-[-0.045em] text-text">
                  Znajdź łowisko.
                  <br />
                  Zaplanuj wyprawę.
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  Geist / UI
                </p>
                <p className="max-w-2xl text-base leading-7 text-text-secondary">
                  Przeglądaj łowiska, przygotuj checklistę,
                  sprawdź pogodę i zachowaj wszystkie połowy
                  w jednym miejscu.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
  <SectionHeader
    eyebrow="Actions"
    title="Przyciski"
    description="Primary jest jedyną dominującą akcją. Secondary to pełnoprawna druga akcja. Outline i Ghost mają niższy priorytet. Deep Water stosujemy tylko w specjalnych kontekstach premium."
  />

  <div className="mt-6 flex flex-wrap items-center gap-3">
    <Button>
      Główna akcja
    </Button>

    <Button variant="secondary">
      Drugorzędna
    </Button>

    <Button variant="outline">
      Outline
    </Button>

    <Button variant="ghost">
      Ghost
    </Button>

    <Button variant="dark">
      Deep Water
    </Button>

    <IconButton
      label="Usuń"
      variant="danger"
      icon={<TrashIcon className="h-5 w-5" />}
    />

    <Button isLoading loadingLabel="Ładowanie…">
      Zapisz
    </Button>
  </div>

  <div className="mt-3 flex flex-wrap items-center gap-3">
    <Button size="sm">
      Small
    </Button>

    <Button size="md">
      Medium
    </Button>

    <Button size="lg">
      Large
    </Button>

    <ButtonLink
      href="/dashboard"
      variant="outline"
    >
      Button Link
    </ButtonLink>
  </div>

  <Card
    variant="subtle"
    className="mt-7 max-w-3xl"
  >
    <CardContent>
      <p className="text-sm font-bold text-text">
        Zasada dla operacji destrukcyjnych
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-text-muted">
            Lista / karta
          </p>

          <div className="mt-3 flex items-center gap-3">
            <IconButton
              label="Usuń połów"
              variant="danger"
              icon={<TrashIcon className="h-5 w-5" />}
            />

            <span className="text-sm leading-6 text-text-secondary">
              Czerwony IconButton z białą ikoną.
            </span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-text-muted">
            Dialog potwierdzający
          </p>

          <div className="mt-3">
            <Button variant="danger">
              Usuń na zawsze
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</section>
        <section>
          <SectionHeader
            eyebrow="Status"
            title="Badge"
          />

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="aqua">Aqua</Badge>
            <Badge variant="success">Opłacone</Badge>
            <Badge variant="warning">Oczekujące</Badge>
            <Badge variant="danger">Anulowane</Badge>
            <Badge variant="dark">Premium</Badge>
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow="Forms"
            title="Pola formularzy"
          />

          <Card className="mt-6 max-w-2xl">
            <CardHeader>
              <CardTitle>Dodaj łowisko</CardTitle>
              <CardDescription>
                Przykład rytmu i hierarchii formularza.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5">
              <FormField
                htmlFor="lake-name"
                label="Nazwa łowiska"
                required
              >
                <Input
                  id="lake-name"
                  placeholder="np. Łowisko Jelen"
                />
              </FormField>

              <FormField
                htmlFor="lake-type"
                label="Typ łowiska"
              >
                <Select id="lake-type" defaultValue="">
                  <option value="" disabled>
                    Wybierz typ
                  </option>
                  <option value="commercial">
                    Komercyjne
                  </option>
                  <option value="pzw">PZW</option>
                </Select>
              </FormField>

              <FormField
                htmlFor="description"
                label="Opis"
                description="Krótko opisz charakter łowiska."
              >
                <Textarea
                  id="description"
                  placeholder="Opis łowiska..."
                />
              </FormField>
            </CardContent>
          </Card>
        </section>

        <section>
  <SectionHeader
    eyebrow="Surfaces"
    title="Karty"
    description="Każdy wariant ma inną rolę: Default to standardowa powierzchnia, Subtle grupuje treści pomocnicze, a Deep Water jest premium surface dla wybranych sekcji."
  />

  <div className="mt-6 grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader>
        <CardTitle>Default</CardTitle>
        <CardDescription>
          Standardowa powierzchnia aplikacji.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <p className="text-sm leading-6">
          Używana do większości samodzielnych sekcji i modułów.
        </p>
      </CardContent>
    </Card>

    <Card variant="subtle">
      <CardHeader>
        <CardTitle>Subtle</CardTitle>
        <CardDescription>
          Spokojniejsza powierzchnia pomocnicza.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <p className="text-sm leading-6">
          Do grupowania filtrów, informacji pobocznych i mniej ważnych bloków.
        </p>
      </CardContent>
    </Card>

    <Card variant="dark">
      <CardHeader>
        <CardTitle>Deep Water</CardTitle>
        <CardDescription>
          Premium surface dla właścicieli łowisk, marketingu i wyróżnionych funkcji.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <p className="text-sm leading-6">
          Używamy oszczędnie — tylko tam, gdzie potrzebujemy mocnego,
          charakterystycznego momentu marki.
        </p>
      </CardContent>
    </Card>
  </div>
</section>

        <section>
          <SectionHeader
            eyebrow="States"
            title="Loading i empty state"
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-36 w-full" />
              </CardContent>
            </Card>

            <EmptyState
              title="Brak zapisanych wypraw"
              description="Zaplanuj pierwszą wyprawę i trzymaj w jednym miejscu checklistę, sprzęt i najważniejsze informacje."
              action={
                <Button>
                  Zaplanuj wyprawę
                </Button>
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}