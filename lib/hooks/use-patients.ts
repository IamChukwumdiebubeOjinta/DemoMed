import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchPatientsPage } from "../api-client";
import type { ApiResponse } from "../types";

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  paginated: (page: number, limit: number) =>
    [...patientKeys.all, "page", { page, limit }] as const,
};

/**
 * Hook to fetch patients with pagination (one page per request)
 */
export function usePatientsPage(page: number = 1, limit: number = 10) {
  return useQuery<ApiResponse, Error>({
    queryKey: patientKeys.paginated(page, limit),
    queryFn: () => fetchPatientsPage(page, limit),
  });
}

/**
 * Hook to fetch patients with infinite scrolling
 */
export function useInfinitePatients(limit: number = 5) {
  return useInfiniteQuery<ApiResponse, Error>({
    queryKey: [...patientKeys.lists(), "infinite", { limit }],
    queryFn: ({ pageParam }) => fetchPatientsPage(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.hasPrevious
        ? firstPage.pagination.page - 1
        : undefined,
  });
}
