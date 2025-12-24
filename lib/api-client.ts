import axios, { AxiosError, type AxiosInstance } from "axios";
import type {
  ApiResponse,
  Patient,
  AssessmentSubmission,
  AssessmentResult,
} from "./types";

const BASE_URL = "https://assessment.ksensetech.com/api";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "ak_58120fd9e7a6ad39a6f0c0c8ae8333c7e25e07fd8299ced2";

const RETRYABLE_STATUS = new Set([429, 500, 503]);
const BASE_RETRY_DELAY_MS = 500;
const MAX_RETRIES = 1;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as
      | { error?: string; message?: string; retry_after?: number }
      | undefined;

    // Provide user-friendly error messages for common cases
    if (status === 429) {
      const retryAfter = data?.retry_after ?? 5;
      return Promise.reject(
        new Error(
          `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
        )
      );
    }

    if (status === 503) {
      return Promise.reject(
        new Error("Service temporarily unavailable. Please try again later.")
      );
    }

    if (status === 500) {
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    if (!error.response) {
      return Promise.reject(
        new Error("Network error. Please check your internet connection.")
      );
    }

    const message = data?.message || data?.error || error.message;
    return Promise.reject(new Error(`API Error: ${message}`));
  }
);

function getRetryDelayMs(error: AxiosError, attempt: number): number {
  // Check Retry-After header
  const retryAfter = error.response?.headers?.["retry-after"];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) return seconds * 1000;
  }

  // Check response body
  const body = error.response?.data as { retry_after?: number } | undefined;
  if (body?.retry_after && !Number.isNaN(body.retry_after)) {
    return body.retry_after * 1000;
  }

  // Exponential backoff: 500ms, 1000ms, 2000ms
  return BASE_RETRY_DELAY_MS << (attempt - 1);
}

async function requestWithRetry<T>(
  operation: () => Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    signal?.throwIfAborted();

    try {
      return await operation();
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      if (!status || !RETRYABLE_STATUS.has(status) || attempt > MAX_RETRIES) {
        throw error;
      }

      await delay(getRetryDelayMs(axiosError, attempt));
    }
  }
}

export async function fetchPatientsPage(
  page: number = 1,
  limit: number = 5,
  signal?: AbortSignal
): Promise<ApiResponse> {
  return requestWithRetry(async () => {
    const { data } = await apiClient.get<ApiResponse>("/patients", {
      params: { page, limit },
      signal,
    });

    // Validate response structure
    if (!data?.pagination || !Array.isArray(data?.data)) {
      throw new Error("Invalid API response format");
    }

    return data;
  }, signal);
}

export async function submitAssessment(
  submission: AssessmentSubmission,
  signal?: AbortSignal
): Promise<AssessmentResult> {
  return requestWithRetry(async () => {
    const { data } = await apiClient.post<AssessmentResult>(
      "/submit-assessment",
      submission,
      { signal }
    );
    return data;
  }, signal);
}
