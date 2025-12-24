import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssessment } from "../api-client";
import type { AssessmentSubmission, AssessmentResult } from "../types";

export const assessmentKeys = {
  all: ["assessment"] as const,
  submission: () => [...assessmentKeys.all, "submission"] as const,
};

/**
 * Hook to submit an assessment
 */
export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation<AssessmentResult, Error, AssessmentSubmission>({
    mutationFn: submitAssessment,
    onSuccess: () => {
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
    },
  });
}

