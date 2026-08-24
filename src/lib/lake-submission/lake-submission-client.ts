import type {
  LakeSubmissionApiResponse,
} from "@/lib/lake-submission/lake-submission-types";

export function submitLakeSubmission(
  formData: FormData,
  onProgress: (
    progress: number
  ) => void
) {
  return new Promise<LakeSubmissionApiResponse>(
    (
      resolve,
      reject
    ) => {
      const request =
        new XMLHttpRequest();

      request.open(
        "POST",
        "/api/lake-submissions"
      );

      request.upload.onprogress =
        (event) => {
          if (
            !event.lengthComputable
          ) {
            return;
          }

          onProgress(
            Math.round(
              (event.loaded /
                event.total) *
                100
            )
          );
        };

      request.onload = () => {
        let data: LakeSubmissionApiResponse =
          {};

        try {
          data = JSON.parse(
            request.responseText ||
              "{}"
          ) as LakeSubmissionApiResponse;
        } catch {
          data = {};
        }

        if (
          request.status >= 200 &&
          request.status < 300
        ) {
          resolve(data);
          return;
        }

        reject(
          new Error(
            data.message ||
              "Nie udało się wysłać zgłoszenia."
          )
        );
      };

      request.onerror =
        () => {
          reject(
            new Error(
              "Wystąpił problem z połączeniem podczas wysyłania."
            )
          );
        };

      request.send(
        formData
      );
    }
  );
}
