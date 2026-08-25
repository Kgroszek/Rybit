import assert from "node:assert/strict";
import test from "node:test";

import {
  ContactValidationError,
  WEBSITE_BUDGET_OPTIONS,
  WEBSITE_DEADLINE_OPTIONS,
  validateContactPayload,
} from "../src/lib/contact-validation";

test("akceptuje poprawny formularz kontaktowy", () => {
  const result = validateContactPayload({
    formType: "contact",
    name: "Jan Kowalski",
    email: "jan@example.com",
    subject: "Pytanie o Rybio",
    message: "Dzień dobry, mam pytanie.",
  });

  assert.equal(result.formType, "contact");
  assert.equal(result.name, "Jan Kowalski");
  assert.equal(result.email, "jan@example.com");
});

test("odrzuca nieznany formType", () => {
  assert.throws(
    () =>
      validateContactPayload({
        formType: "admin",
        name: "Jan Kowalski",
        email: "jan@example.com",
        subject: "Test",
        message: "Test",
      }),
    ContactValidationError
  );
});

test("odrzuca nieprawidłowy numer telefonu", () => {
  assert.throws(
    () =>
      validateContactPayload({
        formType: "website",
        name: "Jan Kowalski",
        email: "jan@example.com",
        fisheryName: "Łowisko Testowe",
        phone: "abc",
        location: "Mazowieckie",
        budget: WEBSITE_BUDGET_OPTIONS[0],
        deadline: WEBSITE_DEADLINE_OPTIONS[0],
        message: "Proszę o wycenę strony.",
      }),
    /Podaj poprawny numer telefonu/
  );
});

test("odrzuca URL z niedozwolonym protokołem", () => {
  assert.throws(
    () =>
      validateContactPayload({
        formType: "website",
        name: "Jan Kowalski",
        email: "jan@example.com",
        fisheryName: "Łowisko Testowe",
        location: "Mazowieckie",
        currentWebsite: "javascript:alert(1)",
        budget: WEBSITE_BUDGET_OPTIONS[0],
        deadline: WEBSITE_DEADLINE_OPTIONS[0],
        message: "Proszę o wycenę strony.",
      }),
    /Podaj poprawny adres strony/
  );
});

test("odrzuca zbyt długą wiadomość", () => {
  assert.throws(
    () =>
      validateContactPayload({
        formType: "contact",
        name: "Jan Kowalski",
        email: "jan@example.com",
        subject: "Test",
        message: "a".repeat(5001),
      }),
    /Wiadomość może mieć maksymalnie 5000 znaków/
  );
});

test("akceptuje poprawne dane formularza strony łowiska", () => {
  const result = validateContactPayload({
    formType: "website",
    name: "Jan Kowalski",
    email: "jan@example.com",
    fisheryName: "Łowisko Testowe",
    phone: "+48 600 700 800",
    location: "Mazowieckie",
    currentWebsite: "https://example.com",
    budget: WEBSITE_BUDGET_OPTIONS[1],
    deadline: WEBSITE_DEADLINE_OPTIONS[1],
    message: "Proszę o wycenę strony.",
  });

  assert.equal(result.formType, "website");
  assert.equal(result.phone, "+48 600 700 800");
});
