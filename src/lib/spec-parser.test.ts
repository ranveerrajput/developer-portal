import { API_REGISTRY } from '@/apis/api-registry';
import { parseOpenApiSpec } from '@/lib/spec-parser';

const pokeapi = API_REGISTRY.find((api) => api.id === 'pokeapi');
const payments = API_REGISTRY.find((api) => api.id === 'stub-payments');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

describe('parseOpenApiSpec', () => {
  it('parses paths and methods into endpoint definitions', () => {
    expect(pokeapi).toBeDefined();

    const endpoints = parseOpenApiSpec(pokeapi?.spec ?? {});

    expect(endpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'getPokemonByName',
          method: 'get',
          path: '/pokemon/{name}',
          summary: 'Get a Pokemon by name or id',
        }),
        expect.objectContaining({
          id: 'listPokemonTypes',
          method: 'get',
          path: '/type',
        }),
      ]),
    );
  });

  it('parses path and query parameters', () => {
    expect(pokeapi).toBeDefined();

    const endpoints = parseOpenApiSpec(pokeapi?.spec ?? {});
    const getPokemon = endpoints.find((endpoint) => endpoint.id === 'getPokemonByName');
    const listTypes = endpoints.find((endpoint) => endpoint.id === 'listPokemonTypes');

    expect(getPokemon?.parameters).toEqual([
      expect.objectContaining({
        name: 'name',
        in: 'path',
        required: true,
      }),
    ]);
    expect(listTypes?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'limit',
          in: 'query',
          required: false,
        }),
        expect.objectContaining({
          name: 'offset',
          in: 'query',
          required: false,
        }),
      ]),
    );
  });

  it('parses request bodies', () => {
    expect(payments).toBeDefined();

    const endpoints = parseOpenApiSpec(payments?.spec ?? {});
    const createPayment = endpoints.find((endpoint) => endpoint.id === 'createPayment');

    expect(createPayment?.requestBody?.required).toBe(true);
    expect(createPayment?.requestBody?.contentTypes).toEqual(['application/json']);
    expect(isRecord(createPayment?.requestBody?.schema)).toBe(true);
    expect(
      isRecord(createPayment?.requestBody?.schema)
        ? createPayment.requestBody.schema.$ref
        : undefined,
    ).toBe('#/components/schemas/CreatePaymentRequest');
  });

  it('parses responses and status codes', () => {
    expect(payments).toBeDefined();

    const endpoints = parseOpenApiSpec(payments?.spec ?? {});
    const createPayment = endpoints.find((endpoint) => endpoint.id === 'createPayment');

    expect(createPayment?.responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          statusCode: '201',
          description: 'Payment created.',
          contentTypes: ['application/json'],
        }),
        expect.objectContaining({
          statusCode: '400',
          description: 'Invalid request.',
          contentTypes: [],
        }),
      ]),
    );
  });

  it('returns an empty list when paths are missing', () => {
    expect(parseOpenApiSpec({ openapi: '3.0.3' })).toEqual([]);
  });
});
