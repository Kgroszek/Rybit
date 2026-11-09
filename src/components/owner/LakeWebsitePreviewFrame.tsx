"use client";

import { useEffect, useState } from "react";

import {
  LakeWebsiteRenderer,
  type PublicLakeWebsiteData,
} from "@/components/lake-websites/LakeWebsiteRenderer";

export function LakeWebsitePreviewFrame({
  initialData,
}: {
  initialData: PublicLakeWebsiteData;
}) {
  const [data, setData] =
    useState<PublicLakeWebsiteData>(initialData);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      const payload = event.data as
        | {
            type?: string;
            data?: PublicLakeWebsiteData;
          }
        | null;

      if (
        payload?.type !== "rybio:lake-website-preview" ||
        !payload.data
      ) {
        return;
      }

      setData(payload.data);
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <LakeWebsiteRenderer data={data} />;
}
