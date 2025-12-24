import type { AssessmentResult } from '@/lib/types';

interface SubmissionStatusProps {
  result: AssessmentResult;
}

export default function SubmissionStatus({ result }: SubmissionStatusProps) {
  const { results } = result;
  const isPass = results.status === 'PASS';
  const percentage = results.percentage;

  return (
    <div className="mb-8 rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Submission Results</h2>
          <p className="text-sm text-muted-foreground">
            Attempt {results.attempt_number} of {results.attempt_number + results.remaining_attempts}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${isPass ? 'text-green-600' : 'text-destructive'}`}>
            {percentage}%
          </div>
          <div className={`text-sm font-medium ${isPass ? 'text-green-600' : 'text-destructive'}`}>
            {results.status}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="mb-2 text-sm text-muted-foreground">High-Risk Patients</div>
          <div className="text-2xl font-bold text-foreground">
            {results.breakdown.high_risk.matches} / {results.breakdown.high_risk.correct}
          </div>
          <div className="text-xs text-muted-foreground">
            Score: {results.breakdown.high_risk.score}/{results.breakdown.high_risk.max}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="mb-2 text-sm text-muted-foreground">Fever Patients</div>
          <div className="text-2xl font-bold text-foreground">
            {results.breakdown.fever.matches} / {results.breakdown.fever.correct}
          </div>
          <div className="text-xs text-muted-foreground">
            Score: {results.breakdown.fever.score}/{results.breakdown.fever.max}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="mb-2 text-sm text-muted-foreground">Data Quality Issues</div>
          <div className="text-2xl font-bold text-foreground">
            {results.breakdown.data_quality.matches} / {results.breakdown.data_quality.correct}
          </div>
          <div className="text-xs text-muted-foreground">
            Score: {results.breakdown.data_quality.score}/{results.breakdown.data_quality.max}
          </div>
        </div>
      </div>

      {results.feedback.strengths.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-green-600">Strengths</h3>
          <ul className="space-y-1">
            {results.feedback.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-foreground">
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.feedback.issues.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold text-destructive">Issues</h3>
          <ul className="space-y-1">
            {results.feedback.issues.map((issue, idx) => (
              <li key={idx} className="text-sm text-foreground">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.can_resubmit && (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3">
          <p className="text-sm text-foreground">
            You have {results.remaining_attempts} remaining attempt{results.remaining_attempts !== 1 ? 's' : ''} to improve your score.
          </p>
        </div>
      )}
    </div>
  );
}

