import type { Patient, RiskScore } from './types';

/**
 * Parses blood pressure string and extracts systolic and diastolic values
 * Handles edge cases like "150/", "/90", "INVALID", null, undefined
 */
function parseBloodPressure(bp: string | null | undefined): { systolic: number | null; diastolic: number | null } {
  if (!bp || typeof bp !== 'string') {
    return { systolic: null, diastolic: null };
  }

  const trimmed = bp.trim();
  
  // Check for invalid strings
  if (trimmed === '' || 
      trimmed.toUpperCase() === 'INVALID' || 
      trimmed.toUpperCase() === 'N/A' ||
      trimmed.toUpperCase() === 'NULL' ||
      /[^0-9/]/.test(trimmed)) {
    return { systolic: null, diastolic: null };
  }

  const parts = trimmed.split('/');
  
  if (parts.length !== 2) {
    return { systolic: null, diastolic: null };
  }

  const systolic = parts[0].trim() === '' ? null : parseInt(parts[0].trim(), 10);
  const diastolic = parts[1].trim() === '' ? null : parseInt(parts[1].trim(), 10);

  // Validate parsed numbers
  if (systolic !== null && (isNaN(systolic) || systolic < 0 || systolic > 300)) {
    return { systolic: null, diastolic: null };
  }
  if (diastolic !== null && (isNaN(diastolic) || diastolic < 0 || diastolic > 200)) {
    return { systolic: null, diastolic: null };
  }

  return { systolic, diastolic };
}

/**
 * Calculates blood pressure risk score
 * Normal (Systolic <120 AND Diastolic <80): 1 point
 * Elevated (Systolic 120-129 AND Diastolic <80): 2 points
 * Stage 1 (Systolic 130-139 OR Diastolic 80-89): 3 points
 * Stage 2 (Systolic ≥140 OR Diastolic ≥90): 4 points
 * Invalid/Missing: 0 points
 */
function calculateBPRisk(bp: string | null | undefined): { score: number; isValid: boolean } {
  const { systolic, diastolic } = parseBloodPressure(bp);

  // Invalid if either value is missing
  if (systolic === null || diastolic === null) {
    return { score: 0, isValid: false };
  }

  // Determine risk stage for each value
  let systolicStage = 0;
  let diastolicStage = 0;

  // Systolic stages
  if (systolic < 120) {
    systolicStage = 1; // Normal
  } else if (systolic >= 120 && systolic <= 129) {
    systolicStage = 2; // Elevated
  } else if (systolic >= 130 && systolic <= 139) {
    systolicStage = 3; // Stage 1
  } else {
    systolicStage = 4; // Stage 2
  }

  // Diastolic stages
  if (diastolic < 80) {
    diastolicStage = 1; // Normal
  } else if (diastolic >= 80 && diastolic <= 89) {
    diastolicStage = 3; // Stage 1
  } else {
    diastolicStage = 4; // Stage 2
  }

  // Use the higher risk stage
  const riskStage = Math.max(systolicStage, diastolicStage);

  return { score: riskStage, isValid: true };
}

/**
 * Parses temperature and converts to number
 * Handles edge cases like "TEMP_ERROR", non-numeric, null, undefined
 */
function parseTemperature(temp: number | string | null | undefined): number | null {
  if (temp === null || temp === undefined) {
    return null;
  }

  if (typeof temp === 'number') {
    // Validate reasonable range
    if (isNaN(temp) || temp < 90 || temp > 110) {
      return null;
    }
    return temp;
  }

  if (typeof temp === 'string') {
    const trimmed = temp.trim();
    
    // Check for invalid strings
    if (trimmed === '' || 
        trimmed.toUpperCase() === 'TEMP_ERROR' || 
        trimmed.toUpperCase() === 'INVALID' ||
        trimmed.toUpperCase() === 'N/A' ||
        trimmed.toUpperCase() === 'NULL') {
      return null;
    }

    const parsed = parseFloat(trimmed);
    if (isNaN(parsed) || parsed < 90 || parsed > 110) {
      return null;
    }
    return parsed;
  }

  return null;
}

/**
 * Calculates temperature risk score
 * Normal (≤99.5°F): 0 points
 * Low Fever (99.6-100.9°F): 1 point
 * High Fever (≥101°F): 2 points
 * Invalid/Missing: 0 points
 */
function calculateTemperatureRisk(temp: number | string | null | undefined): { score: number; isValid: boolean; value: number | null } {
  const temperature = parseTemperature(temp);

  if (temperature === null) {
    return { score: 0, isValid: false, value: null };
  }

  if (temperature <= 99.5) {
    return { score: 0, isValid: true, value: temperature };
  } else if (temperature >= 99.6 && temperature <= 100.9) {
    return { score: 1, isValid: true, value: temperature };
  } else {
    return { score: 2, isValid: true, value: temperature };
  }
}

/**
 * Parses age and converts to number
 * Handles edge cases like non-numeric strings, null, undefined
 */
function parseAge(age: number | string | null | undefined): number | null {
  if (age === null || age === undefined) {
    return null;
  }

  if (typeof age === 'number') {
    if (isNaN(age) || age < 0 || age > 150) {
      return null;
    }
    return age;
  }

  if (typeof age === 'string') {
    const trimmed = age.trim();
    
    if (trimmed === '' || 
        trimmed.toUpperCase() === 'UNKNOWN' ||
        trimmed.toUpperCase() === 'N/A' ||
        trimmed.toUpperCase() === 'NULL') {
      return null;
    }

    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 150) {
      return null;
    }
    return parsed;
  }

  return null;
}

/**
 * Calculates age risk score
 * Under 40 (<40 years): 1 point
 * 40-65 (40-65 years, inclusive): 1 point
 * Over 65 (>65 years): 2 points
 * Invalid/Missing: 0 points
 */
function calculateAgeRisk(age: number | string | null | undefined): { score: number; isValid: boolean } {
  const ageValue = parseAge(age);

  if (ageValue === null) {
    return { score: 0, isValid: false };
  }

  if (ageValue < 40) {
    return { score: 1, isValid: true };
  } else if (ageValue >= 40 && ageValue <= 65) {
    return { score: 1, isValid: true };
  } else {
    return { score: 2, isValid: true };
  }
}

/**
 * Calculates complete risk score for a patient
 */
export function calculateRiskScore(patient: Patient): RiskScore {
  const bpRisk = calculateBPRisk(patient.blood_pressure);
  const tempRisk = calculateTemperatureRisk(patient.temperature);
  const ageRisk = calculateAgeRisk(patient.age);

  const totalScore = bpRisk.score + tempRisk.score + ageRisk.score;
  const hasDataQualityIssue = !bpRisk.isValid || !tempRisk.isValid || !ageRisk.isValid;

  return {
    bpScore: bpRisk.score,
    tempScore: tempRisk.score,
    ageScore: ageRisk.score,
    totalScore,
    hasDataQualityIssue,
  };
}

/**
 * Checks if patient has fever (temperature ≥ 99.6°F)
 */
export function hasFever(patient: Patient): boolean {
  const tempRisk = calculateTemperatureRisk(patient.temperature);
  return tempRisk.isValid && tempRisk.value !== null && tempRisk.value >= 99.6;
}

