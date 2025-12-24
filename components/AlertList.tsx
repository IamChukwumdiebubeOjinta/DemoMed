interface AlertListProps {
  title: string;
  description: string;
  patientIds: string[];
  color?: 'destructive' | 'orange' | 'yellow';
}

export default function AlertList({ title, description, patientIds, color = 'destructive' }: AlertListProps) {
  const colorClasses = {
    destructive: 'border-destructive bg-destructive/10',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  };

  const textColorClasses = {
    destructive: 'text-destructive',
    orange: 'text-orange-700 dark:text-orange-400',
    yellow: 'text-yellow-700 dark:text-yellow-400',
  };

  return (
    <div className={`rounded-lg border ${colorClasses[color]} p-4`}>
      <h3 className={`mb-1 font-semibold ${textColorClasses[color]}`}>{title}</h3>
      <p className="mb-3 text-xs text-muted-foreground">{description}</p>
      <div className="text-sm">
        <div className="mb-2 font-medium text-foreground">
          Count: <span className={textColorClasses[color]}>{patientIds.length}</span>
        </div>
        {patientIds.length > 0 ? (
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {patientIds.map((id) => (
              <div
                key={id}
                className="rounded bg-background/50 px-2 py-1 text-xs font-mono text-foreground"
              >
                {id}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No patients found</div>
        )}
      </div>
    </div>
  );
}

