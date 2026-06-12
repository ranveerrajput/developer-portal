type ErrorStateProps = {
  title: string;
  description?: string;
};

export function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-6 text-red-900">
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-sm">{description}</p> : null}
    </div>
  );
}
