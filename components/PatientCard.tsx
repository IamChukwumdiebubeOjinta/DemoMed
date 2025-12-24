import type { ProcessedPatient } from '@/lib/types';

interface PatientCardProps {
  patient: ProcessedPatient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 4) return 'text-destructive';
    if (score >= 2) return 'text-orange-600';
    return 'text-green-600';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 4) return 'High Risk';
    if (score >= 2) return 'Moderate Risk';
    return 'Low Risk';
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{patient.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {patient.patient_id}</p>
        </div>
        <div className={`text-right ${getRiskColor(patient.riskScore.totalScore)}`}>
          <div className="text-2xl font-bold">{patient.riskScore.totalScore}</div>
          <div className="text-xs">{getRiskLabel(patient.riskScore.totalScore)}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Age:</span>
          <span className="font-medium text-foreground">
            {patient.age ?? 'N/A'}
            {patient.riskScore.ageScore > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                (+{patient.riskScore.ageScore})
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Blood Pressure:</span>
          <span className="font-medium text-foreground">
            {patient.blood_pressure ?? 'N/A'}
            {patient.riskScore.bpScore > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                (+{patient.riskScore.bpScore})
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Temperature:</span>
          <span className="font-medium text-foreground">
            {patient.temperature ?? 'N/A'}°F
            {patient.riskScore.tempScore > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                (+{patient.riskScore.tempScore})
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Visit Date:</span>
          <span className="font-medium text-foreground">{patient.visit_date}</span>
        </div>
      </div>

      {patient.riskScore.hasDataQualityIssue && (
        <div className="mt-3 rounded bg-yellow-50 p-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          ⚠️ Data quality issue detected
        </div>
      )}

      <div className="mt-3 border-t pt-3">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium">Diagnosis:</div>
          <div>{patient.diagnosis}</div>
        </div>
      </div>
    </div>
  );
}

