import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  InteractiveRow,
  InteractiveRowIcon,
} from "@/components/ui/InteractiveRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type {
  ProfileFavourite,
  ProfileRating,
} from "@/lib/profile/profile-types";
import { formatProfileShortDate } from "@/lib/profile/profile-utils";

export function ProfileActivityGrid({
  favourites,
  ratings,
}: {
  favourites: ProfileFavourite[];
  ratings: ProfileRating[];
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Aktywność"
        title="Łowiska, które śledzisz"
        description="Ostatnio zapisane łowiska i Twoje najnowsze oceny."
        className="mb-5"
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <FavouriteLakesCard favourites={favourites} />
        <RatingsCard ratings={ratings} />
      </div>
    </section>
  );
}

function FavouriteLakesCard({
  favourites,
}: {
  favourites: ProfileFavourite[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle>Ulubione łowiska</CardTitle>

          <CardDescription>
            Ostatnie miejsca zapisane do Twojej listy.
          </CardDescription>
        </div>

        <ButtonLink href="/lowiska" variant="ghost" size="sm">
          Przeglądaj
        </ButtonLink>
      </CardHeader>

      <CardContent className="pt-3">
        {favourites.length > 0 ? (
          <div className="divide-y divide-border">
            {favourites.map((favourite) => (
              <InteractiveRow
                key={favourite.id}
                href={`/lowiska/${favourite.lake.slug}`}
                className="rounded-none px-0 first:pt-1 last:pb-1"
              >
                <InteractiveRowIcon>
                  <HeartIcon className="h-4 w-4" />
                </InteractiveRowIcon>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-text">
                    {favourite.lake.name}
                  </p>

                  <p className="mt-1 line-clamp-1 text-xs leading-5 text-text-muted">
                    {favourite.lake.fish || "Brak informacji o gatunkach"}
                  </p>
                </div>

                <Badge variant="primary" size="sm" className="shrink-0">
                  ★ {favourite.lake.rating.toFixed(1)}
                </Badge>

                <ArrowSmallRightIcon className="h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-primary-700" />
              </InteractiveRow>
            ))}
          </div>
        ) : (
          <ProfileEmptyState
            title="Brak ulubionych łowisk"
            description="Dodaj łowisko do ulubionych, a ostatnio zapisane miejsca pojawią się tutaj."
            action={
              <ButtonLink href="/lowiska" variant="outline" size="sm">
                Znajdź łowisko
              </ButtonLink>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

function RatingsCard({
  ratings,
}: {
  ratings: ProfileRating[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Moje oceny</CardTitle>

        <CardDescription>
          Ostatnio ocenione przez Ciebie łowiska.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-3">
        {ratings.length > 0 ? (
          <div className="divide-y divide-border">
            {ratings.map((rating) => (
              <InteractiveRow
                key={rating.id}
                href={`/lowiska/${rating.lake.slug}`}
                className="rounded-none px-0 first:pt-1 last:pb-1"
              >
                <InteractiveRowIcon className="bg-warning-subtle text-warning-foreground group-hover:bg-warning group-hover:text-white group-focus-visible:bg-warning group-focus-visible:text-white">
                  <StarIcon className="h-4 w-4" />
                </InteractiveRowIcon>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-text">
                    {rating.lake.name}
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    Oceniono {formatProfileShortDate(rating.updatedAt)}
                  </p>
                </div>

                <Badge variant="warning" size="sm" className="shrink-0">
                  ★ {rating.value}/5
                </Badge>

                <ArrowSmallRightIcon className="h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-primary-700" />
              </InteractiveRow>
            ))}
          </div>
        ) : (
          <ProfileEmptyState
            title="Brak ocen"
            description="Oceń pierwsze łowisko, aby Twoje ostatnie oceny były dostępne bezpośrednio z profilu."
            action={
              <ButtonLink href="/lowiska" variant="outline" size="sm">
                Przeglądaj łowiska
              </ButtonLink>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
