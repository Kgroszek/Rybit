"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  LakeWebsiteRenderer,
  type PublicLakeWebsiteData,
} from "@/components/lake-websites/LakeWebsiteRenderer";

export function LakeWebsiteBuilderPreviewFrame({
  initialData,
}: {
  initialData: PublicLakeWebsiteData;
}) {
  const [data, setData] =
    useState<PublicLakeWebsiteData>(
      initialData
    );

  const [
    selectedSectionId,
    setSelectedSectionId,
  ] = useState<string | null>(null);

  useEffect(() => {
    function handleMessage(
      event: MessageEvent
    ) {
      if (
        event.origin !==
        window.location.origin
      ) {
        return;
      }

      const payload = event.data as
        | {
            type?: string;
            data?: PublicLakeWebsiteData;
            selectedSectionId?: string | null;
          }
        | null;

      if (
        payload?.type ===
          "rybio:lake-builder-data" &&
        payload.data
      ) {
        setData(payload.data);
        setSelectedSectionId(
          payload.selectedSectionId ??
            null
        );
      }
    }

    function handleClick(
      event: MouseEvent
    ) {
      const target =
        event.target instanceof Element
          ? event.target
          : null;

      const section =
        target?.closest<HTMLElement>(
          "[data-lake-section-id]"
        );

      const interactive =
        target?.closest(
          "a,button,input,textarea,select"
        );

      if (section) {
        event.preventDefault();
        event.stopPropagation();

        window.parent.postMessage(
          {
            type:
              "rybio:lake-builder-section-click",
            sectionId:
              section.dataset
                .lakeSectionId ||
              null,
          },
          window.location.origin
        );

        return;
      }

      if (interactive) {
        event.preventDefault();
      }
    }

    window.addEventListener(
      "message",
      handleMessage
    );

    document.addEventListener(
      "click",
      handleClick,
      true
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );

      document.removeEventListener(
        "click",
        handleClick,
        true
      );
    };
  }, []);

  useEffect(() => {
    if (!selectedSectionId) {
      return;
    }

    const element =
      document.querySelector<HTMLElement>(
        `[data-lake-section-id="${CSS.escape(
          selectedSectionId
        )}"]`
      );

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [selectedSectionId]);

  return (
    <LakeWebsiteRenderer
      data={data}
      editorMode
      selectedSectionId={
        selectedSectionId
      }
    />
  );
}
