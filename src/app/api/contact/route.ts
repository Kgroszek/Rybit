import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  formType?: string;
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
  fisheryName?: string;
  phone?: string;
  location?: string;
  currentWebsite?: string;
  budget?: string;
  deadline?: string;
};

function getString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRow(label: string, value: string) {
  if (!value) {
    return "";
  }

  return `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; width: 180px;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
        ${escapeHtml(value).replaceAll("\n", "<br>")}
      </td>
    </tr>
  `;
}

function getFormLabel(formType: string) {
  if (formType === "website") return "Zapytanie o stronę dla łowiska";
  if (formType === "cooperation") return "Współpraca";
  return "Kontakt ogólny";
}

function buildEmailHtml(payload: Required<ContactPayload>) {
  const formLabel = getFormLabel(payload.formType);

  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden;">
        <div style="background: #2563eb; padding: 24px;">
          <p style="margin: 0; color: #bfdbfe; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">
            Rybio
          </p>
          <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 24px;">
            ${escapeHtml(formLabel)}
          </h1>
        </div>

        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${formatRow("Typ formularza", formLabel)}
            ${formatRow("Imię i nazwisko", payload.name)}
            ${formatRow("E-mail", payload.email)}
            ${formatRow("Firma / marka", payload.company)}
            ${formatRow("Temat", payload.subject)}
            ${formatRow("Nazwa łowiska", payload.fisheryName)}
            ${formatRow("Telefon", payload.phone)}
            ${formatRow("Lokalizacja", payload.location)}
            ${formatRow("Obecna strona / Facebook", payload.currentWebsite)}
            ${formatRow("Budżet", payload.budget)}
            ${formatRow("Termin", payload.deadline)}
            ${formatRow("Wiadomość", payload.message)}
          </table>
        </div>
      </div>
    </div>
  `;
}

function buildEmailText(payload: Required<ContactPayload>) {
  return `
Rybio - ${getFormLabel(payload.formType)}

Typ formularza: ${getFormLabel(payload.formType)}
Imię i nazwisko: ${payload.name}
E-mail: ${payload.email}
Firma / marka: ${payload.company}
Temat: ${payload.subject}
Nazwa łowiska: ${payload.fisheryName}
Telefon: ${payload.phone}
Lokalizacja: ${payload.location}
Obecna strona / Facebook: ${payload.currentWebsite}
Budżet: ${payload.budget}
Termin: ${payload.deadline}

Wiadomość:
${payload.message}
  `.trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    const payload: Required<ContactPayload> = {
      formType: getString(body.formType),
      name: getString(body.name),
      email: getString(body.email),
      company: getString(body.company),
      subject: getString(body.subject),
      message: getString(body.message),
      fisheryName: getString(body.fisheryName),
      phone: getString(body.phone),
      location: getString(body.location),
      currentWebsite: getString(body.currentWebsite),
      budget: getString(body.budget),
      deadline: getString(body.deadline),
    };

    if (!payload.formType) {
      return NextResponse.json(
        { message: "Brakuje typu formularza." },
        { status: 400 }
      );
    }

    if (!payload.name) {
      return NextResponse.json(
        { message: "Podaj imię i nazwisko." },
        { status: 400 }
      );
    }

    if (!payload.email || !isValidEmail(payload.email)) {
      return NextResponse.json(
        { message: "Podaj poprawny adres e-mail." },
        { status: 400 }
      );
    }

    if (!payload.message) {
      return NextResponse.json(
        { message: "Wiadomość jest wymagana." },
        { status: 400 }
      );
    }

    if (payload.formType === "website" && !payload.fisheryName) {
      return NextResponse.json(
        { message: "Podaj nazwę łowiska." },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const contactTo = process.env.CONTACT_EMAIL || "kontakt@rybio.pl";

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      return NextResponse.json(
        { message: "Brakuje konfiguracji SMTP po stronie serwera." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const formLabel = getFormLabel(payload.formType);

    await transporter.sendMail({
      from: `"Rybio" <${smtpFrom}>`,
      to: contactTo,
      replyTo: payload.email,
      subject: `[Rybio] ${formLabel} - ${
        payload.subject || payload.fisheryName || payload.name
      }`,
      text: buildEmailText(payload),
      html: buildEmailHtml(payload),
    });

    return NextResponse.json({
      message: "Wiadomość została wysłana.",
    });
  } catch (error) {
    console.error("[contact] Błąd wysyłki formularza:", error);

    return NextResponse.json(
      { message: "Nie udało się wysłać wiadomości." },
      { status: 500 }
    );
  }
}