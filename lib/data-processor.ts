import type { Patient, ProcessedPatient, AssessmentSubmission } from './types';
import { calculateRiskScore, hasFever } from './risk-scoring';

/**
 * Processes all patients and calculates risk scores
 */
export function processPatients(patients: Patient[]): ProcessedPatient[] {
  return patients.map((patient) => ({
    ...patient,
    riskScore: calculateRiskScore(patient),
  }));
}

/**
 * Generates assessment submission data from processed patients
 */
export function generateAssessmentSubmission(processedPatients: ProcessedPatient[]): AssessmentSubmission {
  const highRiskPatients: string[] = [];
  const feverPatients: string[] = [];
  const dataQualityIssues: string[] = [];

  processedPatients.forEach((patient) => {
    // High-risk patients: total risk score ≥ 4
    if (patient.riskScore.totalScore >= 4) {
      highRiskPatients.push(patient.patient_id);
    }

    // Fever patients: temperature ≥ 99.6°F
    if (hasFever(patient)) {
      feverPatients.push(patient.patient_id);
    }

    // Data quality issues: invalid/missing BP, Age, or Temp
    if (patient.riskScore.hasDataQualityIssue) {
      dataQualityIssues.push(patient.patient_id);
    }
  });

  // Sort arrays for consistent output
  return {
    high_risk_patients: highRiskPatients.sort(),
    fever_patients: feverPatients.sort(),
    data_quality_issues: dataQualityIssues.sort(),
  };
}

/**
 * Gets summary statistics for processed patients
 */
export function getSummaryStats(processedPatients: ProcessedPatient[]) {
  const total = processedPatients.length;
  const highRisk = processedPatients.filter((p) => p.riskScore.totalScore >= 4).length;
  const fever = processedPatients.filter((p) => hasFever(p)).length;
  const dataQuality = processedPatients.filter((p) => p.riskScore.hasDataQualityIssue).length;
  
  const avgRiskScore = total > 0
    ? processedPatients.reduce((sum, p) => sum + p.riskScore.totalScore, 0) / total
    : 0;

  return {
    total,
    highRisk,
    fever,
    dataQuality,
    avgRiskScore: Math.round(avgRiskScore * 100) / 100,
  };
}

