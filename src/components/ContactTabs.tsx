"use client";

import { useState } from "react";
import Link from "next/link";

type TabKey = "contact" | "website" | "cooperation";

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

export function ContactTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("website");

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
              Możemy przygotować stronę, która pokaże ofertę łowiska,
              zdjęcia, zasady, cennik, dojazd i dane kontaktowe w jednym
              przejrzystym miejscu.
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
          <MiniInfoCard title="Odpowiedź" description="Zwykle odpisujemy mailowo." />
          <MiniInfoCard title="Tematy" description="Konto, łowiska, błędy, sugestie." />
        </div>
      </SidePanel>

      <ContactForm
        formType="Kontakt ogólny"
        title="Wyślij wiadomość"
        description="Opisz krótko, czego dotyczy sprawa."
        buttonText="Wyślij wiadomość"
      />
    </div>
  );
}

function WebsiteContent() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-6 text-white sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">
            Strona dla łowiska
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Pokaż swoje łowisko w profesjonalny sposób
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50">
            Jeśli prowadzisz łowisko komercyjne, staw, jezioro prywatne albo
            obiekt z ofertą dla wędkarzy, możemy przygotować stronę, która
            ułatwi prezentację oferty i kontakt z klientami.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-3">
            {websiteFeatures.map((feature) => (
              <div
                key={feature}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  ✓
                </span>

                <p className="text-sm font-bold leading-6 text-slate-700">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-black text-slate-950">
              To tylko zapytanie, bez zobowiązań.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              W formularzu opisz swoje łowisko i to, czego potrzebujesz.
              Na tej podstawie łatwiej będzie przygotować propozycję zakresu
              strony.
            </p>
          </div>
        </div>
      </div>

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
        description="Napisz, jeśli interesuje Cię promocja łowiska, reklama, partnerstwo branżowe, akcja z marką wędkarską albo inna forma współpracy."
      >
        <div className="mt-6 grid gap-3">
          <MiniInfoCard
            title="Promocja łowiska"
            description="Wyróżnienia, prezentacje, treści i działania promocyjne."
          />
          <MiniInfoCard
            title="Marki wędkarskie"
            description="Partnerstwa, kampanie, konkursy i treści dla społeczności."
          />
          <MiniInfoCard
            title="Media i wydarzenia"
            description="Zawody, wydarzenia branżowe i współprace lokalne."
          />
        </div>
      </SidePanel>

      <ContactForm
        formType="Współpraca"
        title="Opisz propozycję współpracy"
        description="Napisz, kogo reprezentujesz i jaki rodzaj współpracy Cię interesuje."
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
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

      {children}
    </div>
  );
}

function ContactForm({
  formType,
  title,
  description,
  buttonText,
  showCompany = false,
}: {
  formType: string;
  title: string;
  description: string;
  buttonText: string;
  showCompany?: boolean;
}) {
  return (
    <FormShell title={title} description={description}>
      <form
        onSubmit={(event) => event.preventDefault()}
        className="space-y-4"
      >
        <input type="hidden" name="formType" value={formType} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Imię i nazwisko" name="name" />
          <FormInput label="Adres e-mail" name="email" type="email" />
        </div>

        {showCompany && (
          <FormInput label="Firma / marka opcjonalnie" name="company" />
        )}

        <FormInput label="Temat" name="subject" />

        <FormTextarea
          label="Wiadomość"
          name="message"
          placeholder="Napisz, w czym możemy pomóc..."
        />

        <ConsentCheckbox />

        <SubmitButton>{buttonText}</SubmitButton>
      </form>
    </FormShell>
  );
}

function FisheryWebsiteForm() {
  return (
    <FormShell
      title="Zapytaj o stronę dla łowiska"
      description="Uzupełnij podstawowe informacje. Im więcej napiszesz, tym łatwiej będzie ocenić zakres projektu."
    >
      <form
        onSubmit={(event) => event.preventDefault()}
        className="space-y-4"
      >
        <input type="hidden" name="formType" value="Strona dla łowiska" />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Imię i nazwisko" name="name" />
          <FormInput label="Adres e-mail" name="email" type="email" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Telefon opcjonalnie" name="phone" type="tel" />
          <FormInput label="Nazwa łowiska" name="fisheryName" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="Czy masz już stronę?"
            name="currentStatus"
            options={[
              "Nie, potrzebuję nowej strony",
              "Mam Facebooka, ale nie mam strony",
              "Mam stronę, ale chcę ją odświeżyć",
              "Nie wiem, chcę porozmawiać",
            ]}
          />

          <FormSelect
            label="Jaki zakres Cię interesuje?"
            name="websiteScope"
            options={[
              "Prosta strona wizytówkowa",
              "Strona z kilkoma podstronami",
              "Strona z formularzem zapytań",
              "Strona z rezerwacjami",
              "Nie wiem, potrzebuję doradzenia",
            ]}
          />
        </div>

        <FormInput
          label="Link do Facebooka lub obecnej strony opcjonalnie"
          name="currentWebsite"
          type="url"
          placeholder="https://..."
        />

        <FormTextarea
          label="Opisz swoje łowisko i potrzeby"
          name="message"
          placeholder="Napisz, co powinna zawierać strona: opis łowiska, cennik, regulamin, galerię, mapę, formularz, rezerwacje, SEO, zdjęcia itd."
          rows={7}
        />

        <ConsentCheckbox />

        <SubmitButton>Wyślij zapytanie o stronę</SubmitButton>
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
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
      </span>

      <input
        type={type}
        name={name}
        required={type !== "tel" && !label.includes("opcjonalnie")}
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
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
      </span>

      <textarea
        name={name}
        rows={rows}
        required
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

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
    >
      {children}
    </button>
  );
}