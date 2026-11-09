"use client";

import {
  type FormEvent,
} from "react";

import {
  LakeSubmissionFeedbackBanner,
} from "@/components/lake-submission/LakeSubmissionFeedbackBanner";
import {
  LakeSubmissionFooter,
} from "@/components/lake-submission/LakeSubmissionFooter";
import {
  LakeSubmissionStepper,
} from "@/components/lake-submission/LakeSubmissionStepper";
import {
  LakeSubmissionSuccessDialog,
} from "@/components/lake-submission/LakeSubmissionSuccessDialog";
import {
  AmenitiesStep,
} from "@/components/lake-submission/steps/AmenitiesStep";
import {
  BasicStep,
} from "@/components/lake-submission/steps/BasicStep";
import {
  ContactStep,
} from "@/components/lake-submission/steps/ContactStep";
import {
  DetailsStep,
} from "@/components/lake-submission/steps/DetailsStep";
import {
  LocationStep,
} from "@/components/lake-submission/steps/LocationStep";
import {
  PhotosStep,
} from "@/components/lake-submission/steps/PhotosStep";
import {
  useLakeSubmissionWizard,
} from "@/components/lake-submission/useLakeSubmissionWizard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  LAKE_SUBMISSION_STEPS,
} from "@/lib/lake-submission/lake-submission-options";

export function LakeSubmissionWizard() {
  const controller =
    useLakeSubmissionWizard();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !controller.isLastStep
    ) {
      controller.goToNextStep();
    }
  }

  return (
    <>
      <div
        ref={controller.topRef}
        className="scroll-mt-6"
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]"
      >
        <div>
          <LakeSubmissionStepper
            steps={
              LAKE_SUBMISSION_STEPS
            }
            currentStepIndex={
              controller.currentStepIndex
            }
            maxVisitedStepIndex={
              controller.maxVisitedStepIndex
            }
            onStepChange={
              controller.goToStep
            }
            disabled={
              controller.isLoading ||
              controller.isProcessingImages
            }
          />
        </div>

        <div className="min-w-0 space-y-4">
          <LakeSubmissionFeedbackBanner
            feedback={
              controller.feedback
            }
          />

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                    Krok{" "}
                    {
                      controller.currentStepIndex +
                      1
                    }{" "}
                    z{" "}
                    {
                      LAKE_SUBMISSION_STEPS.length
                    }
                  </p>

                  <CardTitle className="mt-2 text-xl sm:text-2xl">
                    {
                      controller.currentStep.title
                    }
                  </CardTitle>

                  <CardDescription className="max-w-3xl">
                    {
                      controller.currentStep.description
                    }
                  </CardDescription>
                </div>

                <span className="inline-flex shrink-0 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-text-muted lg:hidden">
                  {
                    controller.currentStep.shortTitle
                  }
                </span>
              </div>
            </CardHeader>

            <CardContent className="py-6 sm:py-7">
              {controller.currentStep.key ===
                "basic" && (
                <BasicStep
                  form={
                    controller.form
                  }
                  errors={
                    controller.errors
                  }
                  updateField={
                    controller.updateField
                  }
                />
              )}

              {controller.currentStep.key ===
                "location" && (
                <LocationStep
                  form={
                    controller.form
                  }
                  errors={
                    controller.errors
                  }
                  updateField={
                    controller.updateField
                  }
                />
              )}

              {controller.currentStep.key ===
                "details" && (
                <DetailsStep
                  form={
                    controller.form
                  }
                  errors={
                    controller.errors
                  }
                  updateField={
                    controller.updateField
                  }
                  fishRecords={
                    controller.fishRecords
                  }
                  gearRequirements={
                    controller.gearRequirements
                  }
                  onAddFishRecord={
                    controller.addFishRecord
                  }
                  onUpdateFishRecord={
                    controller.updateFishRecord
                  }
                  onRemoveFishRecord={
                    controller.removeFishRecord
                  }
                  onAddGearRequirement={
                    controller.addGearRequirement
                  }
                  onUpdateGearRequirement={
                    controller.updateGearRequirement
                  }
                  onRemoveGearRequirement={
                    controller.removeGearRequirement
                  }
                />
              )}

              {controller.currentStep.key ===
                "amenities" && (
                <AmenitiesStep
                  form={
                    controller.form
                  }
                  updateField={
                    controller.updateField
                  }
                />
              )}

              {controller.currentStep.key ===
                "photos" && (
                <PhotosStep
                  imagePreviews={
                    controller.imagePreviews
                  }
                  isLoading={
                    controller.isLoading
                  }
                  isProcessingImages={
                    controller.isProcessingImages
                  }
                  onFilesSelected={
                    (
                      files
                    ) =>
                      void controller.addImages(
                        files
                      )
                  }
                  onRemoveImage={
                    controller.removeImage
                  }
                  onClearImages={
                    controller.clearImages
                  }
                />
              )}

              {controller.currentStep.key ===
                "contact" && (
                <ContactStep
                  form={
                    controller.form
                  }
                  errors={
                    controller.errors
                  }
                  updateField={
                    controller.updateField
                  }
                  imageCount={
                    controller.images.length
                  }
                  fishRecords={
                    controller.fishRecords
                  }
                  gearRequirements={
                    controller.gearRequirements
                  }
                />
              )}
            </CardContent>
          </Card>

          {controller.isLoading &&
            controller.uploadProgress >
              0 && (
              <div className="rounded-card border border-primary-200 bg-primary-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-primary-800">
                    Wysyłanie zgłoszenia
                  </p>

                  <p className="text-sm font-black text-primary-700">
                    {
                      controller.uploadProgress
                    }
                    %
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200"
                    style={{
                      width: `${controller.uploadProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-primary-700">
                  Nie zamykaj strony podczas wysyłania zdjęć.
                </p>
              </div>
            )}

          <LakeSubmissionFooter
            isFirstStep={
              controller.isFirstStep
            }
            isLastStep={
              controller.isLastStep
            }
            isLoading={
              controller.isLoading
            }
            isProcessingImages={
              controller.isProcessingImages
            }
            onCancel={
              controller.cancel
            }
            onPrevious={
              controller.goToPreviousStep
            }
            onNext={
              controller.goToNextStep
            }
            onSubmit={() =>
              void controller.submit()
            }
          />
        </div>
      </form>

      <LakeSubmissionSuccessDialog
        open={
          controller.successDialogOpen
        }
        onClose={
          controller.closeSuccessDialog
        }
      />
    </>
  );
}
