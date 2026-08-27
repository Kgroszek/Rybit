import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { WildWaterGalleryViewer } from "@/components/lake-websites/templates/wild-water/WildWaterGalleryViewer";
import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";
import { getWildWaterImages } from "@/components/lake-websites/templates/wild-water/wild-water-utils";

export function GallerySection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const images = getWildWaterImages(
    section,
    data
  );

  return (
    <section
      id={section.id}
      className={styles.gallerySection}
    >
      <div
        className={`${styles.container} ${styles.galleryHead}`}
      >
        <div>
          <div
            className={`${styles.kicker} ${styles.kickerLight}`}
          >
            {section.eyebrow || "Galeria"}
          </div>

          <h2>
            {section.title ||
              "Miejsce w kadrach."}
          </h2>
        </div>

        <p>
          {section.subtitle ||
            "Przewiń zdjęcia w bok i kliknij wybrany kadr, aby zobaczyć go w całości."}
        </p>
      </div>

      {images.length > 0 ? (
        <WildWaterGalleryViewer
          images={images}
        />
      ) : (
        <div className={styles.container}>
          <p className={styles.emptyDark}>
            Zdjęcia pojawią się po ich
            dodaniu w edytorze.
          </p>
        </div>
      )}
    </section>
  );
}
