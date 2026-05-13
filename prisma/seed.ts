import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.rating.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.lakeImage.deleteMany();
  await prisma.fishSpecies.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.priceItem.deleteMany();
  await prisma.lake.deleteMany();

  await prisma.lake.create({
    data: {
      name: "Jezioro Ukiel",
      slug: "jezioro-ukiel",
      description:
        "Jezioro Ukiel to popularne łowisko w okolicy Olsztyna, cenione przez wędkarzy spinningowych oraz osoby szukające spokojnego miejsca na całodniowy wyjazd.",
      rating: 4.6,
      ownerType: "pzw",
      fishingType: "spinning",
      fish: "Szczupak, Sandacz, Okoń",
      lat: 53.7856,
      lng: 20.4031,

      street: "ul. Jeziorna 12",
      city: "Olsztyn",
      postalCode: "10-900",
      voivodeship: "warmińsko-mazurskie",

      area: "412 ha",
      averageDepth: "10,6 m",
      bottomType: "piaszczysto-muliste",
      waterType: "jezioro",

      cottages: true,
      campfire: true,
      noKill: false,
      tent: true,
      parking: true,
      pier: true,
      toilet: true,
      shop: false,
      nightFishing: true,
      boatRental: true,

      contactName: "Okręg PZW Olsztyn",
      contactPhone: "+48 000 000 000",
      contactEmail: "kontakt@pzw-olsztyn.pl",
      contactWebsite: "https://example.com",

      fishSpecies: {
        create: [
          { name: "Szczupak" },
          { name: "Sandacz" },
          { name: "Okoń" },
          { name: "Leszcz" },
        ],
      },

      priceList: {
        create: [
          { text: "Zgodnie z aktualnymi opłatami PZW" },
          { text: "Wymagane aktualne zezwolenie" },
        ],
      },

      rules: {
        create: [
          { text: "Wymagane aktualne zezwolenie na połów" },
          { text: "Obowiązuje regulamin łowiska" },
          { text: "Zakaz pozostawiania śmieci na stanowisku" },
        ],
      },

      images: {
        create: [
          { url: "/images/lakes/lake-placeholder-1.jpg" },
          { url: "/images/lakes/lake-placeholder-2.jpg" },
        ],
      },
    },
  });

  await prisma.lake.create({
    data: {
      name: "Staw Głęboczek",
      slug: "staw-gleboczek",
      description:
        "Staw Głęboczek to kameralne łowisko komercyjne nastawione głównie na spokojne zasiadki karpiowe.",
      rating: 4.2,
      ownerType: "commercial",
      fishingType: "carp",
      fish: "Karp, Lin, Karaś",
      lat: 53.79,
      lng: 20.58,

      street: "Głęboczek 8",
      city: "Barczewo",
      postalCode: "11-010",
      voivodeship: "warmińsko-mazurskie",

      area: "7 ha",
      averageDepth: "2,8 m",
      bottomType: "muliste",
      waterType: "staw",

      cottages: false,
      campfire: true,
      noKill: true,
      tent: true,
      parking: true,
      pier: false,
      toilet: true,
      shop: true,
      nightFishing: true,
      boatRental: false,

      contactName: "Łowisko Głęboczek",
      contactPhone: "+48 111 222 333",
      contactEmail: "kontakt@gleboczek.pl",
      contactWebsite: "https://example.com",

      fishSpecies: {
        create: [
          { name: "Karp" },
          { name: "Lin" },
          { name: "Karaś" },
          { name: "Amur" },
        ],
      },

      priceList: {
        create: [
          { text: "Wstęp dzienny: 40 zł" },
          { text: "Wędkowanie nocne: 70 zł" },
          { text: "Osoba towarzysząca: 10 zł" },
        ],
      },

      rules: {
        create: [
          { text: "Obowiązuje zasada No Kill dla karpia powyżej 5 kg" },
          { text: "Maty i podbieraki karpiowe są wymagane" },
          { text: "Ognisko tylko w wyznaczonych miejscach" },
        ],
      },

      images: {
        create: [
          { url: "/images/lakes/lake-placeholder-1.jpg" },
          { url: "/images/lakes/lake-placeholder-2.jpg" },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed zakończony.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });