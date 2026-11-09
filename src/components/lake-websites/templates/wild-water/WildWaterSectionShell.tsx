import type { ReactNode } from "react";

import styles from "@/components/lake-websites/templates/wild-water/WildWater.module.css";

export function WildWaterSectionShell({
  id,
  editorMode,
  selected,
  children,
}: {
  id: string;
  editorMode: boolean;
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-lake-section-id={id}
      className={[
        styles.editorSection,
        editorMode ? styles.editorEnabled : "",
        selected ? styles.editorSelected : "",
      ].join(" ")}
    >
      {editorMode && selected ? (
        <div className={styles.editorBadge}>
          Edytowana sekcja
        </div>
      ) : null}

      {children}
    </div>
  );
}
