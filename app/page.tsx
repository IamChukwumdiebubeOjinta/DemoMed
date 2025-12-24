"use client";

import { useMemo, useState } from "react";
import { usePatientsPage } from "@/lib/hooks/use-patients";
import { useSubmitAssessment } from "@/lib/hooks/use-assessment";
import {
  processPatients,
  generateAssessmentSubmission,
  getSummaryStats,
} from "@/lib/data-processor";
import AlertList from "@/components/AlertList";
import SubmissionStatus from "@/components/SubmissionStatus";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: pageData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = usePatientsPage(currentPage, pageSize);

  const error = queryError?.message ?? null;
  const rawPatients = pageData?.data ?? [];
  const pagination = pageData?.pagination;

  const patients = useMemo(
    () => (rawPatients.length > 0 ? processPatients(rawPatients) : []),
    [rawPatients]
  );

  const {
    mutate: submitAssessment,
    isPending: submitting,
    data: submissionResult,
    error: submissionQueryError,
    reset: resetSubmission,
  } = useSubmitAssessment();
  const submissionError = submissionQueryError?.message ?? null;

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<
    "all" | "high" | "moderate" | "low"
  >("all");
  const [sortBy, setSortBy] = useState<
    "risk-desc" | "risk-asc" | "temp-desc" | "name-asc" | "date-desc"
  >("risk-desc");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit() {
    setValidationError(null);
    resetSubmission();

    // Validate that we have patient data before submitting
    if (patients.length === 0) {
      setValidationError(
        "Cannot submit assessment: No patient data loaded. Please load patient data first."
      );
      return;
    }

    const submission = generateAssessmentSubmission(patients);

    // Validate that at least one category has data
    const hasHighRisk = submission.high_risk_patients.length > 0;
    const hasFeverPatients = submission.fever_patients.length > 0;
    const hasDataQualityIssues = submission.data_quality_issues.length > 0;

    if (!hasHighRisk && !hasFeverPatients && !hasDataQualityIssues) {
      setValidationError(
        "Cannot submit assessment: No patients identified in any category. Please verify the patient data."
      );
      return;
    }

    submitAssessment(submission);
  }

  // Check if submission is allowed
  const canSubmit = patients.length > 0 && !loading;

  const stats = patients.length > 0 ? getSummaryStats(patients) : null;
  const submission =
    patients.length > 0 ? generateAssessmentSubmission(patients) : null;

  const filteredPatients = useMemo(() => {
    let list = [...patients];

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.patient_id.toLowerCase().includes(term) ||
          p.diagnosis.toLowerCase().includes(term)
      );
    }

    if (riskFilter !== "all") {
      list = list.filter((p) => {
        const score = p.riskScore.totalScore;
        if (riskFilter === "high") return score >= 4;
        if (riskFilter === "moderate") return score >= 2 && score < 4;
        return score < 2;
      });
    }

    list.sort((a, b) => {
      if (sortBy === "risk-desc")
        return b.riskScore.totalScore - a.riskScore.totalScore;
      if (sortBy === "risk-asc")
        return a.riskScore.totalScore - b.riskScore.totalScore;
      if (sortBy === "temp-desc")
        return (Number(b.temperature) || 0) - (Number(a.temperature) || 0);
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "date-desc")
        return (
          new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
        );
      return 0;
    });

    return list;
  }, [patients, riskFilter, search, sortBy]);

  const riskBadge = (score: number) => {
    if (score >= 4)
      return {
        label: "High",
        className:
          "bg-red-50 text-red-700 ring-1 ring-red-100 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800",
      };
    if (score >= 2)
      return {
        label: "Moderate",
        className:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-700",
      };
    return {
      label: "Low",
      className:
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-700",
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold text-foreground">
            Loading patient data...
          </div>
          <div className="text-sm text-muted-foreground">
            This may take a moment
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-cyan-50 via-white to-slate-50 font-sans text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Error Banner - Non-blocking error display */}
      {error && (
        <div className="sticky top-0 z-50 border-b border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <svg
                  className="h-4 w-4 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error.includes("Rate limit")
                    ? "Rate limit exceeded"
                    : "Failed to load patients"}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {error.includes("Rate limit")
                    ? "The API is temporarily limiting requests. Please wait a moment before retrying."
                    : error}
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900">
              {loading ? "Retrying..." : "Retry"}
            </button>
          </div>
        </div>
      )}

      <header
        className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/85"
        style={{ top: error ? "52px" : "0" }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800 ring-1 ring-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-100 dark:ring-cyan-800">
                Demo
              </span>
              <p className="text-xs text-muted-foreground">
                Clinical overview • Auto-respects system theme
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              DemoMed Patient Risk Command
            </h1>
            <p className="text-sm text-muted-foreground">
              Track high-risk patients, fever cases, and data quality at a
              glance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => refetch()}
              className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700">
              Refresh data
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              title={
                !canSubmit
                  ? "Load patient data first to submit assessment"
                  : undefined
              }
              className="flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:hover:bg-cyan-400">
              {submitting ? "Submitting…" : "Submit assessment"}
            </button>
          </div>
        </div>
        {stats && (
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 pb-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total patients
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </span>
                <span className="text-xs text-muted-foreground">records</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                High risk
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-bold text-red-600 dark:text-red-300">
                  {stats.highRisk}
                </span>
                <span className="text-xs text-muted-foreground">score ≥ 4</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fever
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-300">
                  {stats.fever}
                </span>
                <span className="text-xs text-muted-foreground">≥ 99.6°F</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Data quality
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">
                  {stats.dataQuality}
                </span>
                <span className="text-xs text-muted-foreground">
                  needs review
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 pt-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-[116px]">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Filters
              </h3>
              <button
                className="text-xs text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-300"
                onClick={() => {
                  setRiskFilter("all");
                  setSearch("");
                  setSortBy("risk-desc");
                }}>
                Reset
              </button>
            </div>
            <div className="space-y-3">
              <label className="space-y-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">
                  Search by name, ID, or diagnosis
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g., flu, 1234, Jane"
                  className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm shadow-inner transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-900"
                />
              </label>

              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Risk focus
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["all", "high", "moderate", "low"] as const).map(
                    (level) => (
                      <button
                        key={level}
                        onClick={() => setRiskFilter(level)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${
                          riskFilter === level
                            ? "bg-cyan-600 text-white shadow-sm dark:bg-cyan-500"
                            : "border border-slate-200/80 bg-white text-slate-700 hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-cyan-400"
                        }`}>
                        {level}
                      </button>
                    )
                  )}
                </div>
              </div>

              <label className="space-y-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">
                  Sort
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-900">
                  <option value="risk-desc">Risk score (high → low)</option>
                  <option value="risk-asc">Risk score (low → high)</option>
                  <option value="temp-desc">Temperature (high → low)</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="date-desc">Most recent visit</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Quick guidance
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Prioritize patients with score ≥ 4.</li>
              <li>• Confirm fevers ≥ 99.6°F and recheck vitals.</li>
              <li>• Resolve data quality gaps before submission.</li>
            </ul>
          </div>
        </aside>

        <section className="space-y-6">
          {/* Empty state when no patients loaded */}
          {patients.length === 0 && !loading && (
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                No patient data available
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {error
                  ? "We couldn't load patient data. Please check your connection and try again."
                  : "Patient records will appear here once loaded."}
              </p>
              <button
                onClick={() => refetch()}
                disabled={loading}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60 dark:bg-cyan-500 dark:hover:bg-cyan-400">
                {loading ? "Loading..." : "Load patients"}
              </button>
            </div>
          )}

          {submission && (
            <div className="rounded-2xl border border-white/80 bg-white/95 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Alert lists
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Auto-generated cohorts for rapid follow-up.
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !canSubmit}
                  title={
                    !canSubmit
                      ? "Load patient data first to submit assessment"
                      : undefined
                  }
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:hover:bg-cyan-400">
                  {submitting ? "Submitting…" : "Submit assessment"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <AlertList
                  title="High-Risk Patients"
                  description="Total risk score ≥ 4"
                  patientIds={submission.high_risk_patients}
                  color="destructive"
                />
                <AlertList
                  title="Fever Patients"
                  description="Temperature ≥ 99.6°F"
                  patientIds={submission.fever_patients}
                  color="orange"
                />
                <AlertList
                  title="Data Quality Issues"
                  description="Invalid/missing data"
                  patientIds={submission.data_quality_issues}
                  color="yellow"
                />
              </div>
            </div>
          )}

          {(validationError || submissionError) && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-100">
              <div className="font-semibold">Submission error</div>
              <div>{validationError || submissionError}</div>
            </div>
          )}

          {submissionResult && <SubmissionStatus result={submissionResult} />}

          <div className="rounded-2xl border border-white/80 bg-white/95 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Patient registry
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sorted for quick triage. Use filters to focus.
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {pagination && (
                  <>
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total patients)
                  </>
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Risk
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Temp
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Blood Pressure
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Visit
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Diagnosis
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Flags
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                    {filteredPatients.map((patient) => {
                      const badge = riskBadge(patient.riskScore.totalScore);
                      return (
                        <tr
                          key={patient.patient_id}
                          className="hover:bg-cyan-50/60 dark:hover:bg-slate-800/60">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {patient.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {patient.patient_id}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                                {badge.label}
                              </span>
                              <span className="text-sm font-mono text-slate-800 dark:text-slate-100">
                                {patient.riskScore.totalScore}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Age{" "}
                              {patient.riskScore.ageScore
                                ? `+${patient.riskScore.ageScore}`
                                : "0"}
                              , BP{" "}
                              {patient.riskScore.bpScore
                                ? `+${patient.riskScore.bpScore}`
                                : "0"}
                              , Temp{" "}
                              {patient.riskScore.tempScore
                                ? `+${patient.riskScore.tempScore}`
                                : "0"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {patient.temperature ?? "N/A"}°F
                            </div>
                            {patient.riskScore.tempScore > 0 && (
                              <div className="text-xs text-amber-600 dark:text-amber-300">
                                Fever flag
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {patient.blood_pressure ?? "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {patient.visit_date}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last visit
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {patient.diagnosis}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 text-xs">
                              {patient.riskScore.totalScore >= 4 && (
                                <span className="rounded-full bg-red-50 px-2 py-1 font-semibold text-red-700 ring-1 ring-red-100 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800">
                                  High risk
                                </span>
                              )}
                              {Number(patient.temperature) >= 99.6 && (
                                <span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-700">
                                  Fever
                                </span>
                              )}
                              {patient.riskScore.hasDataQualityIssue && (
                                <span className="rounded-full bg-yellow-50 px-2 py-1 font-semibold text-yellow-800 ring-1 ring-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 dark:ring-yellow-800">
                                  Data quality
                                </span>
                              )}
                              {!patient.riskScore.hasDataQualityIssue &&
                                patient.riskScore.totalScore < 4 &&
                                Number(patient.temperature) < 99.6 && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-800">
                                    Stable
                                  </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPatients.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No patients match your filters. Try resetting or
                          adjusting search terms.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredPatients.length} of {pagination.total}{" "}
                  patients
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={!pagination.hasPrevious || loading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevious || loading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                    Previous
                  </button>
                  <span className="px-3 text-sm font-medium text-slate-900 dark:text-white">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1)
                      )
                    }
                    disabled={!pagination.hasNext || loading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={!pagination.hasNext || loading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
