import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { CarpLodgeGalleryViewer } from "@/components/lake-websites/templates/carp-lodge/CarpLodgeGalleryViewer";
import styles from "@/components/lake-websites/templates/carp-lodge/CarpLodge.module.css";
import { getCarpLodgeImages } from "@/components/lake-websites/templates/carp-lodge/carp-lodge-utils";

export function GallerySection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const images = getCarpLodgeImages(
    section,
    data
  );

  return (
    <section
      id={section.id}
      className={`${styles.section} ${styles.paperSection}`}
    >
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.label}>
              {section.eyebrow ||
                "Galeria"}
            </span>
            <h2>
              {section.title ||
                "Niech zdjęcia opowiedzą resztę."}
            </h2>
          </div>

          <p>
            {section.subtitle ||
              "Kliknij zdjęcie, aby zobaczyć pełny kadr."}
          </p>
        </div>

        {images.length > 0 ? (
          <>
            <CarpLodgeGalleryViewer
              images={images}
            />

            <div className={styles.galleryCaption}>
              <span>
                {data.website.siteName ||
                  data.lake.name}
              </span>
              <span>
                Zdjęcia łowiska
              </span>
            </div>
          </>
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
