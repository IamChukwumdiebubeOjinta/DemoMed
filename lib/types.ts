// Type definitions for Healthcare API Assessment

export interface Patient {
  patient_id: string;
  name: string;
  age: number | string | null | undefined;
  gender: string;
  blood_pressure: string | null | undefined;
  temperature: number | string | null | undefined;
  visit_date: string;
  diagnosis: string;
  medications: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Metadata {
  timestamp: string;
  version: string;
  requestId: string;
}

export interface ApiResponse {
  data: Patient[];
  pagination: Pagination;
  metadata: Metadata;
}

export interface RiskScore {
  bpScore: number;
  tempScore: number;
  ageScore: number;
  totalScore: number;
  hasDataQualityIssue: boolean;
}

export interface ProcessedPatient extends Patient {
  riskScore: RiskScore;
}

export interface AssessmentSubmission {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export interface Breakdown {
  score: number;
  max: number;
  correct: number;
  submitted: number;
  matches: number;
}

export interface AssessmentResult {
  success: boolean;
  message: string;
  results: {
    score: number;
    percentage: number;
    status: string;
    breakdown: {
      high_risk: Breakdown;
      fever: Breakdown;
      data_quality: Breakdown;
    };
    feedback: {
      strengths: string[];
      issues: string[];
    };
    attempt_number: number;
    remaining_attempts: number;
    is_personal_best: boolean;
    can_resubmit: boolean;
  };
}

