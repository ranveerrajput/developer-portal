type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-28 max-w-2xl animate-pulse rounded-md bg-slate-200" />
    </div>
  );
}
