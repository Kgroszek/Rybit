"use client";

import { useState } from "react";

type AccountSettingsFormProps = {
  initialName: string;
  initialEmail: string;
};

export function AccountSettingsForm({
  initialName,
  initialEmail,
}: AccountSettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsProfileLoading(true);
    setProfileMessage("");

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setProfileMessage(data?.message || "Nie udało się zapisać danych.");
      setIsProfileLoading(false);
      return;
    }

    setProfileMessage("Dane profilu zostały zapisane.");
    setIsProfileLoading(false);
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsEmailLoading(true);
    setEmailMessage("");

    const response = await fetch("/api/account/email", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setEmailMessage(data?.message || "Nie udało się zmienić adresu e-mail.");
      setIsEmailLoading(false);
      return;
    }

    setEmailMessage(
      data?.message ||
        "Jeśli Supabase wymaga potwierdzenia, sprawdź skrzynkę e-mail."
    );

    setIsEmailLoading(false);
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsPasswordLoading(true);
    setPasswordMessage("");

    if (newPassword.length < 6) {
      setPasswordMessage("Hasło musi mieć minimum 6 znaków.");
      setIsPasswordLoading(false);
      return;
    }

    if (newPassword !== newPasswordRepeat) {
      setPasswordMessage("Podane hasła nie są takie same.");
      setIsPasswordLoading(false);
      return;
    }

    const response = await fetch("/api/account/password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setPasswordMessage(data?.message || "Nie udało się zmienić hasła.");
      setIsPasswordLoading(false);
      return;
    }

    setPasswordMessage("Hasło zostało zmienione.");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordRepeat("");
    setIsPasswordLoading(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Dane profilu</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ta nazwa będzie wykorzystywana w panelu użytkownika.
          </p>

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-5">
            <Input
              label="Nazwa użytkownika"
              value={name}
              onChange={setName}
              placeholder="np. Jakub"
            />

            {profileMessage && <Message text={profileMessage} />}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isProfileLoading}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProfileLoading ? "Zapisywanie..." : "Zapisz dane"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Zmiana adresu e-mail
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Po zmianie adresu e-mail możesz otrzymać wiadomość z linkiem
            potwierdzającym.
          </p>

          <form onSubmit={handleEmailSubmit} className="mt-5 space-y-5">
            <Input
              label="Adres e-mail"
              value={email}
              onChange={setEmail}
              placeholder="twoj@email.pl"
              type="email"
              required
            />

            {emailMessage && <Message text={emailMessage} />}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isEmailLoading}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEmailLoading ? "Zapisywanie..." : "Zmień e-mail"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Zmiana hasła</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
                Aby zmienić hasło, wpisz najpierw obecne hasło, a następnie ustaw nowe.
            </p>

            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-5">
                <Input
                label="Obecne hasło"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Wpisz obecne hasło"
                type="password"
                required
                />

                <Input
                label="Nowe hasło"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Wpisz nowe hasło"
                type="password"
                required
                />

                <Input
                label="Powtórz nowe hasło"
                value={newPasswordRepeat}
                onChange={setNewPasswordRepeat}
                placeholder="Powtórz nowe hasło"
                type="password"
                required
                />

                {passwordMessage && <Message text={passwordMessage} />}

                <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isPasswordLoading ? "Zapisywanie..." : "Zmień hasło"}
                </button>
                </div>
            </form>
            </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Twoje konto</h2>

          <div className="mt-5 space-y-4">
            <InfoRow label="Nazwa" value={name || "Nie ustawiono"} />
            <InfoRow label="E-mail" value={email || "Brak danych"} />
            <InfoRow label="Typ konta" value="Wędkarz" />
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-amber-800">Ważne</h2>

          <p className="mt-3 text-sm leading-6 text-amber-700">
            Zmiana adresu e-mail może wymagać potwierdzenia przez link wysłany
            na nowy adres. Do czasu potwierdzenia Supabase może nadal pokazywać
            poprzedni e-mail.
          </p>
        </section>
      </aside>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
      {text}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-right text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}