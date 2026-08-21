import {
  AMENITY_FIELDS,
  type OwnerLakeProfileFormData,
} from "@/components/owner/profile/types";
import { ProfileAmenityCheckbox } from "@/components/owner/profile/ProfileAmenityCheckbox";
import { ProfileFormSection } from "@/components/owner/profile/ProfileFormSection";
import { ProfileSectionNav } from "@/components/owner/profile/ProfileSectionNav";
import {
  OwnerInputField,
  OwnerSelectField,
  OwnerTextareaField,
} from "@/components/owner/shared/OwnerFormField";
import { Button } from "@/components/ui/Button";
import { updateOwnerLakeProfile } from "@/lib/owner/profile-actions";

export function OwnerLakeProfileForm({
  lake,
}: {
  lake: OwnerLakeProfileFormData;
}) {
  return (
    <form
      action={updateOwnerLakeProfile}
      className="grid min-w-0 gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-start"
    >
      <input
        type="hidden"
        name="lakeId"
        value={lake.id}
      />
      <input
        type="hidden"
        name="slug"
        value={lake.slug}
      />

      <ProfileSectionNav lake={lake} />

      <div className="min-w-0 space-y-6">
        <ProfileFormSection
          id="podstawowe"
          number="01"
          title="Podstawowe informacje"
          description="Najważniejsze dane identyfikujące łowisko na publicznym profilu."
        >
          <div className="grid gap-x-6 gap-y-6 lg:grid-cols-2">
            <OwnerInputField
              label="Nazwa łowiska"
              name="name"
              defaultValue={lake.name}
              maxLength={160}
              required
            />

            <OwnerSelectField
              label="Rodzaj łowiska"
              name="ownerType"
              defaultValue={lake.ownerType}
            >
              <option value="pzw">
                PZW
              </option>
              <option value="commercial">
                Komercyjne
              </option>
            </OwnerSelectField>

            <OwnerSelectField
              label="Typ wędkowania"
              name="fishingType"
              defaultValue={
                lake.fishingType
              }
            >
              <option value="general">
                Ogólne
              </option>
              <option value="spinning">
                Spinningowe
              </option>
              <option value="carp">
                Karpiowe
              </option>
            </OwnerSelectField>

            <div className="lg:col-span-2">
              <OwnerTextareaField
                label="Opis łowiska"
                name="description"
                defaultValue={
                  lake.description
                }
                rows={7}
                maxLength={10000}
                className="min-h-44"
                required
              />
            </div>
          </div>
        </ProfileFormSection>

        <ProfileFormSection
          id="lokalizacja"
          number="02"
          title="Adres i lokalizacja"
          description="Adres jest widoczny dla użytkowników, a współrzędne decydują o położeniu pinezki na mapie."
        >
          <div className="grid gap-x-6 gap-y-6 lg:grid-cols-2">
            <OwnerInputField
              label="Ulica / miejsce"
              name="street"
              defaultValue={lake.street}
              maxLength={180}
              required
            />

            <OwnerInputField
              label="Miejscowość"
              name="city"
              defaultValue={lake.city}
              maxLength={120}
              required
            />

            <OwnerInputField
              label="Kod pocztowy"
              name="postalCode"
              defaultValue={
                lake.postalCode
              }
              maxLength={24}
              required
            />

            <OwnerInputField
              label="Województwo"
              name="voivodeship"
              defaultValue={
                lake.voivodeship
              }
              maxLength={80}
              required
            />

            <OwnerInputField
              label="Szerokość geograficzna"
              name="lat"
              defaultValue={String(
                lake.lat
              )}
              inputMode="decimal"
              required
            />

            <OwnerInputField
              label="Długość geograficzna"
              name="lng"
              defaultValue={String(
                lake.lng
              )}
              inputMode="decimal"
              required
            />
          </div>

          <div className="mt-6 rounded-control border border-primary-200 bg-primary-50 px-4 py-4">
            <p className="text-sm font-bold text-primary-800">
              Współrzędne wpływają na mapę i odległości
            </p>
            <p className="mt-1.5 text-xs leading-5 text-text-secondary">
              Zmieniaj je tylko wtedy, gdy pinezka łowiska jest ustawiona w nieprawidłowym miejscu.
            </p>
          </div>
        </ProfileFormSection>

        <ProfileFormSection
          id="akwen"
          number="03"
          title="Akwen i ryby"
          description="Parametry zbiornika i gatunki pomagają wędkarzom ocenić, czy łowisko odpowiada ich metodzie."
        >
          <div className="grid gap-x-6 gap-y-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <OwnerInputField
                label="Gatunki ryb"
                name="fish"
                defaultValue={lake.fish}
                placeholder="np. Karp, Amur, Szczupak"
                maxLength={1200}
                required
              />
              <p className="mt-2 text-xs leading-5 text-text-muted">
                Oddziel gatunki przecinkami. Lista gatunków na profilu zostanie zaktualizowana automatycznie po zapisie.
              </p>
            </div>

            <OwnerInputField
              label="Powierzchnia"
              name="area"
              defaultValue={lake.area}
              placeholder="np. 4 ha"
              maxLength={80}
            />

            <OwnerInputField
              label="Średnia głębokość"
              name="averageDepth"
              defaultValue={
                lake.averageDepth
              }
              placeholder="np. 2,5 m"
              maxLength={80}
            />

            <OwnerInputField
              label="Rodzaj dna"
              name="bottomType"
              defaultValue={
                lake.bottomType
              }
              placeholder="np. muliste, piaszczyste"
              maxLength={120}
            />

            <OwnerInputField
              label="Typ wody"
              name="waterType"
              defaultValue={
                lake.waterType
              }
              placeholder="np. staw, jezioro, żwirownia"
              maxLength={120}
            />
          </div>
        </ProfileFormSection>

        <ProfileFormSection
          id="cennik"
          number="04"
          title="Cennik i regulamin"
          description="Każdą pozycję cennika i każdą zasadę wpisz w osobnej linii."
        >
          <div className="grid gap-x-6 gap-y-6 lg:grid-cols-2">
            <OwnerTextareaField
              label="Cennik"
              name="priceListText"
              defaultValue={
                lake.priceListText
              }
              rows={8}
              maxLength={12000}
              className="min-h-48"
              placeholder="np. Zezwolenie dzienne – 50 zł"
            />

            <OwnerTextareaField
              label="Regulamin"
              name="rulesText"
              defaultValue={
                lake.rulesText
              }
              rows={8}
              maxLength={12000}
              className="min-h-48"
              placeholder="np. Obowiązuje mata karpiowa"
            />

            <OwnerInputField
              label="Link do cennika"
              name="priceListUrl"
              defaultValue={
                lake.priceListUrl
              }
              placeholder="https://..."
              maxLength={500}
            />

            <OwnerInputField
              label="Link do regulaminu"
              name="rulesUrl"
              defaultValue={
                lake.rulesUrl
              }
              placeholder="https://..."
              maxLength={500}
            />
          </div>
        </ProfileFormSection>

        <ProfileFormSection
          id="udogodnienia"
          number="05"
          title="Udogodnienia"
          description="Zaznacz wyłącznie elementy faktycznie dostępne dla wędkarzy na łowisku."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITY_FIELDS.map(
              (field) => (
                <ProfileAmenityCheckbox
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  defaultChecked={
                    lake[field.name]
                  }
                />
              )
            )}
          </div>
        </ProfileFormSection>

        <ProfileFormSection
          id="kontakt"
          number="06"
          title="Kontakt"
          description="Dane publikowane na profilu łowiska i używane przez wędkarzy do kontaktu."
        >
          <div className="grid gap-x-6 gap-y-6 lg:grid-cols-2">
            <OwnerInputField
              label="Nazwa kontaktowa"
              name="contactName"
              defaultValue={
                lake.contactName
              }
              placeholder="np. Łowisko Rybio"
              maxLength={160}
            />

            <OwnerInputField
              label="Telefon"
              name="contactPhone"
              defaultValue={
                lake.contactPhone
              }
              placeholder="np. 500 000 000"
              inputMode="tel"
              maxLength={80}
            />

            <OwnerInputField
              label="E-mail"
              name="contactEmail"
              type="email"
              defaultValue={
                lake.contactEmail
              }
              placeholder="kontakt@..."
              maxLength={160}
            />

            <OwnerInputField
              label="Strona internetowa"
              name="contactWebsite"
              defaultValue={
                lake.contactWebsite
              }
              placeholder="https://..."
              maxLength={500}
            />
          </div>
        </ProfileFormSection>

        <div className="sticky bottom-24 z-30 rounded-card border border-border bg-surface/95 p-3 shadow-float backdrop-blur-md lg:bottom-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="reset"
              variant="outline"
              className="h-12 min-h-12 sm:min-w-40"
            >
              Przywróć zapisane
            </Button>

            <Button
              type="submit"
              className="h-12 min-h-12 sm:min-w-40"
            >
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
