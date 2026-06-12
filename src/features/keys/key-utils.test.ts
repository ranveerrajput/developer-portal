import { maskApiKey } from '@/features/keys/key-utils';

describe('key utils', () => {
  it('masks api keys and shows only the last four characters', () => {
    expect(maskApiKey('dp_sandbox_1234567890abcdef')).toBe('•••• •••• •••• cdef');
  });
});
