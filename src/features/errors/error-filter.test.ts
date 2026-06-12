import { filterErrorCatalogue } from '@/features/errors/error-filter';

const entries = [
  {
    code: 'PAYMENT_INVALID_AMOUNT',
    description: 'The payment amount is invalid.',
    causes: ['Amount is not an integer.'],
    resolution: 'Send amount as a positive integer.',
  },
  {
    code: '401',
    description: 'Authentication failed.',
    causes: ['API key is missing.'],
    resolution: 'Create a valid key and retry.',
  },
];

describe('filterErrorCatalogue', () => {
  it('matches error codes', () => {
    expect(filterErrorCatalogue(entries, 'invalid amount')).toHaveLength(1);
    expect(filterErrorCatalogue(entries, 'invalid amount')[0]?.code).toBe('PAYMENT_INVALID_AMOUNT');
  });

  it('matches causes and resolutions', () => {
    expect(filterErrorCatalogue(entries, 'valid key')).toHaveLength(1);
    expect(filterErrorCatalogue(entries, 'valid key')[0]?.code).toBe('401');
  });

  it('returns all entries for an empty query', () => {
    expect(filterErrorCatalogue(entries, '')).toHaveLength(2);
  });
});
