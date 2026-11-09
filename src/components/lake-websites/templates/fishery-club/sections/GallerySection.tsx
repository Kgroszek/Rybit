import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { FisheryClubGalleryViewer } from "@/components/lake-websites/templates/fishery-club/FisheryClubGalleryViewer";
import styles from "@/components/lake-websites/templates/fishery-club/FisheryClub.module.css";
import { getFisheryClubImages } from "@/components/lake-websites/templates/fishery-club/fishery-club-utils";

export function GallerySection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const images = getFisheryClubImages(
    section,
    data
  );

  return (
    <section
      id={section.id}
      className={styles.gallerySection}
    >
      <div className={styles.container}>
        <div
          className={styles.galleryHeader}
        >
          <h2>
            {section.title ||
              "Gallery / 04"}
          </h2>

          <p>
            {section.subtitle ||
              "Kliknij dowolny kadr, aby zobaczyć zdjęcie w całości."}
          </p>
        </div>

        {images.length > 0 ? (
          <FisheryClubGalleryViewer
            images={images}
          />
        ) : (
          <p className={styles.empty}>
            Zdjęcia pojawią się po ich
            dodaniu w edytorze.
          </p>
        )}
      </div>
    </section>
  );
}
