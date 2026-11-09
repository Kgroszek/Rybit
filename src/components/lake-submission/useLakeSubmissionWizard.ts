"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  useToast,
} from "@/components/ui/ToastProvider";
import type {
  FishingMethod,
} from "@/lib/fishing-methods";
import {
  submitLakeSubmission,
} from "@/lib/lake-submission/lake-submission-client";
import {
  prepareLakeSubmissionImages,
  MAX_LAKE_SUBMISSION_IMAGES,
} from "@/lib/lake-submission/lake-submission-images";
import {
  INITIAL_LAKE_SUBMISSION_FORM,
  LAKE_SUBMISSION_STEPS,
} from "@/lib/lake-submission/lake-submission-options";
import type {
  FishRecordFormItem,
  GearRequirementFormItem,
  LakeSubmissionFeedback,
  LakeSubmissionFormErrors,
  LakeSubmissionFormState,
  LakeSubmissionImagePreview,
} from "@/lib/lake-submission/lake-submission-types";
import {
  getFirstInvalidStepIndex,
  getLakeSubmissionValidationErrors,
  mergeStepErrors,
} from "@/lib/lake-submission/lake-submission-validation";

export function useLakeSubmissionWizard() {
  const router = useRouter();
  const toast = useToast();

  const topRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<LakeSubmissionFormState>(
      INITIAL_LAKE_SUBMISSION_FORM
    );

  const [
    errors,
    setErrors,
  ] =
    useState<LakeSubmissionFormErrors>(
      {}
    );

  const [
    images,
    setImages,
  ] = useState<File[]>([]);

  const [
    fishRecords,
    setFishRecords,
  ] =
    useState<FishRecordFormItem[]>(
      []
    );

  const [
    gearRequirements,
    setGearRequirements,
  ] =
    useState<
      GearRequirementFormItem[]
    >([]);

  const [
    currentStepIndex,
    setCurrentStepIndex,
  ] = useState(0);

  const [
    maxVisitedStepIndex,
    setMaxVisitedStepIndex,
  ] = useState(0);

  const [
    feedback,
    setFeedback,
  ] =
    useState<LakeSubmissionFeedback | null>(
      null
    );

  const [
    isProcessingImages,
    setIsProcessingImages,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);

  const [
    successDialogOpen,
    setSuccessDialogOpen,
  ] = useState(false);

  const imagePreviews =
    useMemo<
      LakeSubmissionImagePreview[]
    >(
      () =>
        images.map(
          (file) => ({
            file,
            url:
              URL.createObjectURL(
                file
              ),
          })
        ),
      [images]
    );

  useEffect(() => {
    return () => {
      for (
        const preview of
        imagePreviews
      ) {
        URL.revokeObjectURL(
          preview.url
        );
      }
    };
  }, [imagePreviews]);

  const currentStep =
    LAKE_SUBMISSION_STEPS[
      currentStepIndex
    ];

  const isFirstStep =
    currentStepIndex === 0;

  const isLastStep =
    currentStepIndex ===
    LAKE_SUBMISSION_STEPS.length -
      1;

  function scrollToTop() {
    window.setTimeout(
      () => {
        topRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",
            block: "start",
          }
        );
      },
      40
    );
  }

  function scrollToFirstError() {
    window.setTimeout(
      () => {
        document
          .querySelector(
            "[data-field-error='true']"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",
            block: "center",
          });
      },
      40
    );
  }

  function updateField<
    K extends keyof LakeSubmissionFormState,
  >(
    field: K,
    value:
      LakeSubmissionFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field ===
        "isOpenAllDay" &&
      value === true
        ? {
            openingHours:
              "",
          }
        : {}),
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });

    setFeedback(null);
  }

  function toggleFishingMethod(
    method: FishingMethod,
    checked: boolean
  ) {
    updateField(
      "fishingMethods",
      checked
        ? Array.from(
            new Set([
              ...form.fishingMethods,
              method,
            ])
          )
        : form.fishingMethods.filter(
            (item) =>
              item !== method
          )
    );
  }

  function validateCurrentStep() {
    const nextErrors =
      getLakeSubmissionValidationErrors(
        form,
        currentStep.key
      );

    setErrors((current) =>
      mergeStepErrors(
        current,
        nextErrors,
        currentStep.key
      )
    );

    if (
      Object.keys(nextErrors)
        .length > 0
    ) {
      setFeedback({
        tone: "error",
        text:
          "Uzupełnij wymagane pola oznaczone poniżej.",
      });

      scrollToFirstError();
      return false;
    }

    return true;
  }

  function goToStep(
    index: number
  ) {
    if (
      isLoading ||
      isProcessingImages ||
      index >
        maxVisitedStepIndex
    ) {
      return;
    }

    setCurrentStepIndex(
      index
    );

    setFeedback(null);
    scrollToTop();
  }

  function goToNextStep() {
    if (
      isLoading ||
      isProcessingImages
    ) {
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    const nextIndex =
      Math.min(
        currentStepIndex + 1,
        LAKE_SUBMISSION_STEPS.length -
          1
      );

    setCurrentStepIndex(
      nextIndex
    );

    setMaxVisitedStepIndex(
      (current) =>
        Math.max(
          current,
          nextIndex
        )
    );

    setFeedback(null);
    scrollToTop();
  }

  function goToPreviousStep() {
    if (
      isLoading ||
      isProcessingImages
    ) {
      return;
    }

    setCurrentStepIndex(
      Math.max(
        0,
        currentStepIndex - 1
      )
    );

    setFeedback(null);
    scrollToTop();
  }

  function addFishRecord() {
    if (
      fishRecords.length >=
      30
    ) {
      return;
    }

    setFishRecords(
      (current) => [
        ...current,
        {
          id:
            crypto.randomUUID(),
          fishName: "",
          weightKg: "",
        },
      ]
    );
  }

  function updateFishRecord(
    id: string,
    field:
      | "fishName"
      | "weightKg",
    value: string
  ) {
    setFishRecords(
      (current) =>
        current.map(
          (record) =>
            record.id === id
              ? {
                  ...record,
                  [field]:
                    value,
                }
              : record
        )
    );

    setFeedback(null);
  }

  function removeFishRecord(
    id: string
  ) {
    setFishRecords(
      (current) =>
        current.filter(
          (record) =>
            record.id !== id
        )
    );
  }

  function addGearRequirement() {
    if (
      gearRequirements.length >=
      30
    ) {
      return;
    }

    setGearRequirements(
      (current) => [
        ...current,
        {
          id:
            crypto.randomUUID(),
          text: "",
        },
      ]
    );
  }

  function updateGearRequirement(
    id: string,
    value: string
  ) {
    setGearRequirements(
      (current) =>
        current.map(
          (requirement) =>
            requirement.id ===
            id
              ? {
                  ...requirement,
                  text: value,
                }
              : requirement
        )
    );

    setFeedback(null);
  }

  function removeGearRequirement(
    id: string
  ) {
    setGearRequirements(
      (current) =>
        current.filter(
          (requirement) =>
            requirement.id !==
            id
        )
    );
  }

  async function addImages(
    selectedFiles: File[]
  ) {
    if (
      selectedFiles.length === 0 ||
      isLoading ||
      isProcessingImages
    ) {
      return;
    }

    setIsProcessingImages(
      true
    );

    setFeedback(null);

    try {
      const result =
        await prepareLakeSubmissionImages(
          selectedFiles,
          MAX_LAKE_SUBMISSION_IMAGES -
            images.length
        );

      if (
        result.files.length >
        0
      ) {
        setImages(
          (current) => [
            ...current,
            ...result.files,
          ]
        );
      }

      if (
        result.messages.length >
        0
      ) {
        setFeedback({
          tone: "warning",
          text:
            result.messages.join(
              " "
            ),
        });
      }
    } finally {
      setIsProcessingImages(
        false
      );
    }
  }

  function removeImage(
    index: number
  ) {
    setImages((current) =>
      current.filter(
        (
          _,
          currentIndex
        ) =>
          currentIndex !==
          index
      )
    );

    setFeedback(null);
  }

  function clearImages() {
    setImages([]);
    setFeedback(null);
  }

  async function submit() {
    if (
      isLoading ||
      isProcessingImages
    ) {
      return;
    }

    const allErrors =
      getLakeSubmissionValidationErrors(
        form,
        "all"
      );

    if (
      Object.keys(allErrors)
        .length > 0
    ) {
      setErrors(allErrors);

      const invalidStepIndex =
        getFirstInvalidStepIndex(
          allErrors,
          LAKE_SUBMISSION_STEPS
        );

      if (
        invalidStepIndex >=
        0
      ) {
        setCurrentStepIndex(
          invalidStepIndex
        );

        setMaxVisitedStepIndex(
          (current) =>
            Math.max(
              current,
              invalidStepIndex
            )
        );
      }

      setFeedback({
        tone: "error",
        text:
          "Nie możemy jeszcze wysłać zgłoszenia. Uzupełnij wymagane pola oznaczone poniżej.",
      });

      toast.error({
        title:
          "Uzupełnij wymagane pola.",
        description:
          "Sprawdź dane oznaczone na czerwono i spróbuj ponownie.",
      });

      scrollToFirstError();
      return;
    }

    const normalizedFishRecords =
      normalizeFishRecords(
        fishRecords
      );

    if (
      !normalizedFishRecords.ok
    ) {
      setCurrentStepIndex(2);

      setMaxVisitedStepIndex(
        (current) =>
          Math.max(
            current,
            2
          )
      );

      setFeedback({
        tone: "error",
        text:
          normalizedFishRecords.message,
      });

      scrollToTop();
      return;
    }

    const normalizedGearRequirements =
      gearRequirements
        .map(
          (requirement) =>
            requirement.text.trim()
        )
        .filter(Boolean);

    setIsLoading(true);
    setUploadProgress(0);
    setFeedback(null);

    const toastId =
      toast.loading({
        title:
          "Wysyłanie zgłoszenia...",
        description:
          "Przygotowujemy dane łowiska i zdjęcia.",
      });

    try {
      const formData =
        new FormData();

      for (
        const [
          key,
          value,
        ] of Object.entries(
          form
        )
      ) {
        formData.append(
          key,
          Array.isArray(value)
            ? value.join(",")
            : String(value)
        );
      }

      formData.append(
        "fishRecords",
        JSON.stringify(
          normalizedFishRecords.records
        )
      );

      formData.append(
        "gearRequirements",
        JSON.stringify(
          normalizedGearRequirements
        )
      );

      for (
        const image of images
      ) {
        formData.append(
          "images",
          image
        );
      }

      await submitLakeSubmission(
        formData,
        setUploadProgress
      );

      toast.update(
        toastId,
        {
          type: "success",
          title:
            "Zgłoszenie zostało wysłane.",
          description:
            "Trafiło do weryfikacji administratora.",
          duration: 4500,
        }
      );

      setSuccessDialogOpen(
        true
      );

      resetWizard();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Wystąpił problem podczas wysyłania formularza. Spróbuj ponownie.";

      setFeedback({
        tone: "error",
        text: message,
      });

      toast.update(
        toastId,
        {
          type: "error",
          title:
            "Nie udało się wysłać zgłoszenia.",
          description:
            message,
          duration: 6000,
        }
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }

  function resetWizard() {
    setForm({
      ...INITIAL_LAKE_SUBMISSION_FORM,
      fishingMethods: [],
    });

    setErrors({});
    setImages([]);
    setFishRecords([]);
    setGearRequirements([]);
    setCurrentStepIndex(0);
    setMaxVisitedStepIndex(
      0
    );
    setFeedback(null);
  }

  function cancel() {
    router.push("/lowiska");
  }

  function closeSuccessDialog() {
    setSuccessDialogOpen(
      false
    );

    router.push("/lowiska");
    router.refresh();
  }

  return {
    topRef,
    form,
    errors,
    images,
    imagePreviews,
    fishRecords,
    gearRequirements,
    currentStep,
    currentStepIndex,
    maxVisitedStepIndex,
    isFirstStep,
    isLastStep,
    feedback,
    isProcessingImages,
    isLoading,
    uploadProgress,
    successDialogOpen,

    updateField,
    toggleFishingMethod,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    addFishRecord,
    updateFishRecord,
    removeFishRecord,
    addGearRequirement,
    updateGearRequirement,
    removeGearRequirement,
    addImages,
    removeImage,
    clearImages,
    submit,
    cancel,
    closeSuccessDialog,
  };
}

function normalizeFishRecords(
  records:
    FishRecordFormItem[]
):
  | {
      ok: true;
      records: Array<{
        fishName: string;
        weightKg: number;
      }>;
    }
  | {
      ok: false;
      message: string;
    } {
  const normalized: Array<{
    fishName: string;
    weightKg: number;
  }> = [];

  for (
    const record of records
  ) {
    const fishName =
      record.fishName.trim();

    const weightText =
      record.weightKg.trim();

    if (
      !fishName &&
      !weightText
    ) {
      continue;
    }

    if (
      !fishName ||
      !weightText
    ) {
      return {
        ok: false,
        message:
          "Uzupełnij zarówno gatunek, jak i wagę każdej rekordowej ryby albo usuń niekompletny wiersz.",
      };
    }

    const weightKg =
      Number(
        weightText.replace(
          ",",
          "."
        )
      );

    if (
      !Number.isFinite(
        weightKg
      ) ||
      weightKg <= 0
    ) {
      return {
        ok: false,
        message:
          "Waga rekordowej ryby musi być liczbą większą od zera.",
      };
    }

    normalized.push({
      fishName,
      weightKg,
    });
  }

  return {
    ok: true,
    records: normalized,
  };
}

export type LakeSubmissionWizardController =
  ReturnType<
    typeof useLakeSubmissionWizard
  >;
