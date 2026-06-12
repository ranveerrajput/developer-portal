import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ZodError } from 'zod';

import { authFormSchema, type AuthFormValues } from '@/features/auth/auth-schemas';
import { useAuth } from '@/features/auth/useAuth';

type AuthMode = 'sign-in' | 'sign-up';

type AuthFormProps = {
  mode: AuthMode;
};

type FieldErrors = Partial<Record<keyof AuthFormValues, string>>;

const modeContent = {
  'sign-in': {
    title: 'Sign in',
    submitLabel: 'Sign in',
    alternateLabel: 'Need an account?',
    alternateLink: '/sign-up',
    alternateAction: 'Create one',
  },
  'sign-up': {
    title: 'Create account',
    submitLabel: 'Sign up',
    alternateLabel: 'Already have an account?',
    alternateLink: '/sign-in',
    alternateAction: 'Sign in',
  },
} satisfies Record<AuthMode, Record<string, string>>;

function parseFieldErrors(error: ZodError<AuthFormValues>) {
  return error.issues.reduce<FieldErrors>((errors, issue) => {
    const field = issue.path[0];

    if (field === 'email' || field === 'password') {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const { signIn, signUp, status, error: authError, isDemoMode } = useAuth();
  const [values, setValues] = useState<AuthFormValues>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const content = modeContent[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const parsed = authFormSchema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(parseFieldErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        await signIn(parsed.data.email, parsed.data.password);
      } else {
        await signUp(parsed.data.email, parsed.data.password);
      }

      navigate('/', { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = isSubmitting || status === 'loading' || status === 'unconfigured';

  return (
    <div className="mx-auto w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">{content.title}</h1>
      <form
        className="mt-6 space-y-5"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        noValidate
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => {
              setValues((current) => ({ ...current, email: event.target.value }));
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email ? (
            <span id="email-error" className="mt-1 block text-sm text-red-700">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
            type="password"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            value={values.password}
            onChange={(event) => {
              setValues((current) => ({ ...current, password: event.target.value }));
            }}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          />
          {fieldErrors.password ? (
            <span id="password-error" className="mt-1 block text-sm text-red-700">
              {fieldErrors.password}
            </span>
          ) : null}
        </label>

        {formError || authError ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {formError ?? authError}
          </div>
        ) : null}

        {status === 'unconfigured' ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Supabase environment variables are required before authentication can be used.
          </div>
        ) : null}

        {isDemoMode ? (
          <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
            Demo authentication is enabled. Use any valid email and a password of at least 8 characters.
          </div>
        ) : null}

        <button
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={disabled}
        >
          {isSubmitting ? 'Please wait...' : content.submitLabel}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        {content.alternateLabel}{' '}
        <Link className="font-medium text-accent hover:underline" to={content.alternateLink}>
          {content.alternateAction}
        </Link>
      </p>
    </div>
  );
}
