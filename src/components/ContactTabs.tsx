"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

type TabKey = "contact" | "website" | "cooperation";
type SubmitStatus = "idle" | "loading" | "success" | "error";

const tabs: {
  key: TabKey;
  label: string;
  description: string;
}[] = [
  {
    key: "contact",
    label: "Kontakt",
    description: "Pytania ogólne",
  },
  {
    key: "website",
    label: "Strona dla łowiska",
    description: "Zapytaj o realizację",
  },
  {
    key: "cooperation",
    label: "Współpraca",
    description: "Partnerstwa i reklama",
  },
];

const websiteFeatures = [
  "strona główna z ofertą łowiska",
  "cennik, regulamin i informacje dla wędkarzy",
  "galeria zdjęć, ryby, udogodnienia i mapa dojazdu",
  "formularz kontaktowy lub zapytanie o rezerwację",
  "podstawowe SEO pod nazwę łowiska i lokalizację",
];

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as {
      message?: string;
    };
  } catch {
    return {
      message:
        "Serwer nie zwrócił poprawnej odpowiedzi. Sprawdź terminal z npm run dev.",
    };
  }
}

export function ContactTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("contact");

  return (
    <section className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Kontakt
            </p>

            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Napisz do Rybio
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Masz pytanie dotyczące serwisu, chcesz zaproponować współpracę
              albo prowadzisz łowisko i potrzebujesz profesjonalnej strony
              internetowej? Wybierz temat i wyślij wiadomość.
            </p>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-black text-slate-950">
              Dla właścicieli łowisk
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Możemy przygotować stronę, która pokaże ofertę łowiska, zdjęcia,
              zasady, cennik, dojazd i dane kontaktowe w jednym przejrzystym
              miejscu.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white p-3 sm:p-4">
            <div className="grid gap-2 rounded-3xl bg-slate-100 p-2 md:grid-cols-3">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-2xl px-4 py-4 text-left transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    }`}
                  >
                    <span className="block text-sm font-black">
                      {tab.label}
                    </span>

                    <span
                      className={`mt-1 block text-xs font-semibold ${
                        isActive ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-7 lg:p-8">
            {activeTab === "contact" && <ContactContent />}
            {activeTab === "website" && <WebsiteContent />}
            {activeTab === "cooperation" && <CooperationContent />}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactContent() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <SidePanel
        eyebrow="Kontakt ogólny"
        title="Masz pytanie dotyczące Rybio?"
        description="Napisz do nas, jeśli chcesz zgłosić problem, zapytać o konto, działanie aplikacji, publiczną listę łowisk albo inne funkcje serwisu."
      >
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-black text-slate-950">
            Kontakt bezpośredni
          </p>

          <Link
            href="mailto:kontakt@rybio.pl"
            className="mt-2 inline-flex text-sm font-black text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            kontakt@rybio.pl
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MiniInfoCard
            title="Odpowiedź"
            description="Zwykle odpisujemy mailowo."
          />

          <MiniInfoCard
            title="Tematy"
            description="Konto, łowiska, błędy, sugestie."
          />
        </div>
      </SidePanel>

      <ContactForm
        formType="contact"
        title="Wyślij wiadomość"
        description="Opisz krótko, w czym możemy pomóc."
        buttonText="Wyślij wiadomość"
      />
    </div>
  );
}

function WebsiteContent() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <SidePanel
        eyebrow="Strona dla łowiska"
        title="Pokaż swoje łowisko w profesjonalny sposób"
        description="Jeśli prowadzisz łowisko komercyjne, staw, jezioro prywatne albo obiekt z ofertą dla wędkarzy, możemy przygotować stronę, która ułatwi prezentację oferty i kontakt z klientami."
      >
        <div className="mt-6 space-y-3">
          {websiteFeatures.map((feature) => (
            <div
              key={feature}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                ✓
              </span>

              <p className="text-sm font-semibold leading-6 text-slate-700">
                {feature}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-black text-blue-800">
            To tylko zapytanie, bez zobowiązań.
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            W formularzu opisz swoje łowisko i to, czego potrzebujesz. Na tej
            podstawie łatwiej będzie przygotować propozycję zakresu strony.
          </p>
        </div>
      </SidePanel>

      <FisheryWebsiteForm />
    </div>
  );
}

function CooperationContent() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <SidePanel
        eyebrow="Współpraca"
        title="Chcesz współpracować z Rybio?"
        description="Napisz, jeśli interesuje Cię reklama, partnerstwo, promocja łowiska, współpraca contentowa albo inna forma obecności w serwisie."
      >
        <div className="mt-6 grid gap-3">
          <MiniInfoCard
            title="Dla kogo?"
            description="Właściciele łowisk, marki, sklepy, twórcy i partnerzy branżowi."
          />

          <MiniInfoCard
            title="Zakres"
            description="Reklama, wpisy, promocje, kampanie i działania partnerskie."
          />
        </div>
      </SidePanel>

      <ContactForm
        formType="cooperation"
        title="Wyślij propozycję współpracy"
        description="Opisz, czym się zajmujesz i jaki rodzaj współpracy Cię interesuje."
        buttonText="Wyślij propozycję"
        showCompany
      />
    </div>
  );
}

function SidePanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

      {children}
    </aside>
  );
}

function ContactForm({
  formType,
  title,
  description,
  buttonText,
  showCompany = false,
}: {
  formType: "contact" | "cooperation";
  title: string;
  description: string;
  buttonText: string;
  showCompany?: boolean;
}) {
  const toast = useToast();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;

    setStatus("loading");
    setMessage("");

    const toastId = toast.loading({
      title:
        formType === "cooperation"
          ? "Wysyłanie propozycji..."
          : "Wysyłanie wiadomości...",
      description: "Proszę czekać, trwa wysyłanie formularza.",
    });

    const formData = new FormData(formElement);

    const payload = {
      formType,
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      company: String(formData.get("company") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        const errorMessage =
          data.message || "Nie udało się wysłać wiadomości.";

        setStatus("error");
        setMessage(errorMessage);

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się wysłać formularza.",
          description: errorMessage,
          duration: 6000,
        });

        return;
      }

      formElement.reset();
      setStatus("success");
      setMessage("Dziękujemy. Wiadomość została wysłana.");

      toast.update(toastId, {
        type: "success",
        title: "Wiadomość została wysłana.",
        description: "Dziękujemy za kontakt. Odpowiemy mailowo.",
        duration: 4500,
      });
    } catch {
      const errorMessage =
        "Wystąpił problem z wysyłką. Spróbuj ponownie za chwilę.";

      setStatus("error");
      setMessage(errorMessage);

      toast.update(toastId, {
        type: "error",
        title: "Nie udało się wysłać formularza.",
        description: errorMessage,
        duration: 6000,
      });
    }
  }

  return (
    <FormShell title={title} description={description}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {showCompany && (
          <FormInput
            label="Firma / marka"
            name="company"
            placeholder="np. Nazwa firmy, łowiska lub marki"
            required={false}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Imię i nazwisko"
            name="name"
            placeholder="Jak możemy się do Ciebie zwracać?"
          />

          <FormInput
            label="Adres e-mail"
            name="email"
            type="email"
            placeholder="kontakt@example.pl"
          />
        </div>

        <FormInput
          label="Temat wiadomości"
          name="subject"
          placeholder="Krótko opisz temat wiadomości"
        />

        <FormTextarea
          label="Wiadomość"
          name="message"
          placeholder="Napisz, w czym możemy pomóc..."
          rows={6}
        />

        <ConsentCheckbox />

        <SubmitFeedback status={status} message={message} />

        <SubmitButton disabled={status === "loading"}>
          {status === "loading" ? "Wysyłanie..." : buttonText}
        </SubmitButton>
      </form>
    </FormShell>
  );
}

function FisheryWebsiteForm() {
  const toast = useToast();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;

    setStatus("loading");
    setMessage("");

    const toastId = toast.loading({
      title: "Wysyłanie zapytania...",
      description: "Proszę czekać, trwa wysyłanie formularza.",
    });

    const formData = new FormData(formElement);

    const payload = {
      formType: "website",
      fisheryName: String(formData.get("fisheryName") || ""),
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      location: String(formData.get("location") || ""),
      currentWebsite: String(formData.get("currentWebsite") || ""),
      budget: String(formData.get("budget") || ""),
      deadline: String(formData.get("deadline") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        const errorMessage = data.message || "Nie udało się wysłać zapytania.";

        setStatus("error");
        setMessage(errorMessage);

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się wysłać zapytania.",
          description: errorMessage,
          duration: 6000,
        });

        return;
      }

      formElement.reset();
      setStatus("success");
      setMessage("Dziękujemy. Zapytanie zostało wysłane.");

      toast.update(toastId, {
        type: "success",
        title: "Zapytanie zostało wysłane.",
        description: "Dziękujemy. Odpowiemy mailowo.",
        duration: 4500,
      });
    } catch {
      const errorMessage =
        "Wystąpił problem z wysyłką. Spróbuj ponownie za chwilę.";

      setStatus("error");
      setMessage(errorMessage);

      toast.update(toastId, {
        type: "error",
        title: "Nie udało się wysłać zapytania.",
        description: errorMessage,
        duration: 6000,
      });
    }
  }

  return (
    <FormShell
      title="Zapytaj o stronę dla łowiska"
      description="Uzupełnij podstawowe informacje. Im więcej napiszesz, tym łatwiej będzie ocenić zakres projektu."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Nazwa łowiska"
          name="fisheryName"
          placeholder="np. Łowisko Karp Max"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Imię i nazwisko"
            name="name"
            placeholder="Osoba kontaktowa"
          />

          <FormInput
            label="Adres e-mail"
            name="email"
            type="email"
            placeholder="kontakt@example.pl"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Telefon"
            name="phone"
            type="tel"
            placeholder="+48 000 000 000"
            required={false}
          />

          <FormInput
            label="Lokalizacja łowiska"
            name="location"
            placeholder="np. woj. mazowieckie, okolice Siedlec"
          />
        </div>

        <FormInput
          label="Obecna strona lub Facebook"
          name="currentWebsite"
          type="url"
          placeholder="https://..."
          required={false}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="Planowany budżet"
            name="budget"
            options={[
              "Nie wiem, potrzebuję wyceny",
              "do 2000 zł",
              "2000–4000 zł",
              "4000–7000 zł",
              "powyżej 7000 zł",
            ]}
          />

          <FormSelect
            label="Termin realizacji"
            name="deadline"
            options={[
              "Jak najszybciej",
              "W ciągu miesiąca",
              "W ciągu 2–3 miesięcy",
              "Nie mam konkretnego terminu",
            ]}
          />
        </div>

        <FormTextarea
          label="Opisz swoje łowisko i potrzeby"
          name="message"
          placeholder="Napisz, co powinna zawierać strona: opis łowiska, cennik, regulamin, galerię, mapę, formularz, rezerwacje, SEO, zdjęcia itd."
          rows={7}
        />

        <ConsentCheckbox />

        <SubmitFeedback status={status} message={message} />

        <SubmitButton disabled={status === "loading"}>
          {status === "loading" ? "Wysyłanie..." : "Wyślij zapytanie o stronę"}
        </SubmitButton>
      </form>
    </FormShell>
  );
}

function FormShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Formularz
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

function MiniInfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function FormTextarea({
  label,
  name,
  placeholder,
  rows = 5,
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function FormSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
        <span className="ml-1 text-red-500">*</span>
      </span>

      <select
        name={name}
        required
        defaultValue=""
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >
        <option value="" disabled>
          Wybierz opcję
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ConsentCheckbox() {
  return (
    <label className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium leading-5 text-slate-600">
      <input
        type="checkbox"
        required
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
      />

      <span>
        Wyrażam zgodę na kontakt w celu obsługi wiadomości oraz akceptuję{" "}
        <Link
          href="/polityka-prywatnosci"
          className="font-black text-blue-600 transition hover:text-blue-700 hover:underline"
        >
          politykę prywatności
        </Link>
        .
      </span>
    </label>
  );
}

function SubmitFeedback({
  status,
  message,
}: {
  status: SubmitStatus;
  message: string;
}) {
  if (status === "idle" || status === "loading" || !message) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}

function SubmitButton({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}