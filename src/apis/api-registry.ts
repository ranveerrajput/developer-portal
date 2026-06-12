import pokeapiChangelog from '@/apis/pokeapi/changelog.json';
import pokeapiDocsFile from '@/apis/pokeapi/docs.md?url';
import pokeapiSpec from '@/apis/pokeapi/openapi.json';
import stubPaymentsChangelog from '@/apis/stub-payments/changelog.json';
import stubPaymentsDocsFile from '@/apis/stub-payments/docs.md?url';
import stubPaymentsSpec from '@/apis/stub-payments/openapi.json';

export type OpenAPIObject = Record<string, unknown>;

export type SdkLink = {
  lang: string;
  install?: string;
  repo: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  type: 'breaking' | 'feature' | 'fix';
  title: string;
  description: string;
};

export type ErrorCatalogueEntry = {
  code: string;
  description: string;
  causes: string[];
  resolution: string;
};

export interface ApiDefinition {
  id: string;
  name: string;
  version: string;
  spec: OpenAPIObject;
  docsFile?: string;
  changelog?: ChangelogEntry[];
  errors?: ErrorCatalogueEntry[];
  sdks?: SdkLink[];
  baseUrl: string;
}

export const API_REGISTRY = [
  {
    id: 'pokeapi',
    name: 'PokeAPI',
    version: '2.0.0',
    spec: pokeapiSpec,
    docsFile: pokeapiDocsFile,
    changelog: pokeapiChangelog,
    sdks: [
      {
        lang: 'JavaScript',
        install: 'npm install pokeapi-js-wrapper',
        repo: 'https://github.com/PokeAPI/pokeapi-js-wrapper',
      },
    ],
    errors: [
      {
        code: '404',
        description: 'The requested Pokemon resource was not found.',
        causes: ['Pokemon name is misspelled.', 'The numeric Pokemon id does not exist.'],
        resolution: 'Check the path parameter and retry with a known Pokemon name or id.',
      },
      {
        code: '429',
        description: 'Too many requests were sent to the public API.',
        causes: ['Client sent requests too quickly.', 'Shared public API rate limits were reached.'],
        resolution: 'Wait before retrying and reduce request frequency in the sandbox.',
      },
    ],
    baseUrl: 'https://pokeapi.co/api/v2',
  },
  {
    id: 'stub-payments',
    name: 'Stub Payments API',
    version: '1.0.0',
    spec: stubPaymentsSpec,
    docsFile: stubPaymentsDocsFile,
    changelog: stubPaymentsChangelog,
    sdks: [
      {
        lang: 'TypeScript',
        install: 'npm install @example/payments-sdk',
        repo: 'https://github.com/example/payments-sdk',
      },
    ],
    errors: [
      {
        code: 'PAYMENT_INVALID_AMOUNT',
        description: 'The payment amount is missing or outside the accepted range.',
        causes: ['Amount is less than one minor currency unit.', 'Amount is not an integer.'],
        resolution: 'Send amount as a positive integer in the smallest currency unit.',
      },
      {
        code: 'PAYMENT_RECIPIENT_NOT_FOUND',
        description: 'The requested recipient could not be found.',
        causes: ['Recipient id is incorrect.', 'Recipient is not available in the selected environment.'],
        resolution: 'Verify the recipient id and confirm it exists in the active API environment.',
      },
      {
        code: '401',
        description: 'The request is missing valid authentication.',
        causes: ['API key is missing.', 'API key has been revoked or belongs to another environment.'],
        resolution: 'Create a valid key for the selected environment and retry the request.',
      },
    ],
    baseUrl: 'https://api.example.test',
  },
] satisfies ApiDefinition[];

export type ApiId = (typeof API_REGISTRY)[number]['id'];
