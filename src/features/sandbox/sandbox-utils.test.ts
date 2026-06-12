import { API_REGISTRY } from '@/apis/api-registry';
import {
  buildSandboxRequest,
  generateCurlSnippet,
  generateJavaScriptFetchSnippet,
  generatePythonRequestsSnippet,
  injectAuthToken,
} from '@/features/sandbox/sandbox-utils';
import { parseOpenApiSpec } from '@/lib/spec-parser';

describe('sandbox request builder', () => {
  it('builds request urls with path and query params', () => {
    const api = API_REGISTRY[0];
    const endpoint = parseOpenApiSpec(api.spec).find((item) => item.id === 'getPokemonByName');

    expect(endpoint).toBeDefined();
    if (!endpoint) {
      throw new Error('Expected getPokemonByName endpoint to exist.');
    }

    const request = buildSandboxRequest(
      api,
      endpoint,
      { name: 'pikachu' },
      { limit: '10' },
      { Accept: 'application/json' },
      '',
    );

    expect(request.method).toBe('GET');
    expect(request.url).toBe('https://pokeapi.co/api/v2/pokemon/pikachu?limit=10');
    expect(request.headers).toEqual({ Accept: 'application/json' });
    expect(request.body).toBeUndefined();
  });

  it('injects bearer auth tokens into request headers', () => {
    const request = {
      method: 'GET',
      url: 'https://example.test',
      headers: { Accept: 'application/json' },
    };

    expect(injectAuthToken(request, 'token-123')).toEqual({
      ...request,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
  });

  it('generates curl snippets with headers, auth, and body', () => {
    const request = injectAuthToken(
      {
        method: 'POST',
        url: 'https://api.example.test/payments',
        headers: { 'Content-Type': 'application/json' },
        body: '{"amount":100}',
      },
      'token-123',
    );

    const snippet = generateCurlSnippet(request);

    expect(snippet).toContain('curl');
    expect(snippet).toContain('-X \\\n  POST');
    expect(snippet).toContain("'Content-Type: application/json'");
    expect(snippet).toContain("'Authorization: Bearer token-123'");
    expect(snippet).toContain('--data');
    expect(snippet).toContain('{"amount":100}');
  });

  it('generates javascript fetch snippets with headers and body', () => {
    const snippet = generateJavaScriptFetchSnippet({
      method: 'POST',
      url: 'https://api.example.test/payments',
      headers: { Authorization: 'Bearer token-123' },
      body: '{"amount":100}',
    });

    expect(snippet).toContain('fetch("https://api.example.test/payments"');
    expect(snippet).toContain('"Authorization": "Bearer token-123"');
    expect(snippet).toContain('body: "{\\"amount\\":100}"');
  });

  it('generates python requests snippets with headers and body', () => {
    const snippet = generatePythonRequestsSnippet({
      method: 'POST',
      url: 'https://api.example.test/payments',
      headers: { Authorization: 'Bearer token-123' },
      body: '{"amount":100}',
    });

    expect(snippet).toContain('import requests');
    expect(snippet).toContain('"POST"');
    expect(snippet).toContain('"Authorization": "Bearer token-123"');
    expect(snippet).toContain('data="{\\"amount\\":100}"');
  });
});
