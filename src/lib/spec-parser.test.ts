import { describe, expect, it } from "vitest";
import pokeapiSpec from "../apis/pokeapi/openapi.json";
import type { OpenAPIObject } from "./openapi-types";
import { parseOpenApiSpec } from "./spec-parser";
import { buildRequestUrl, generateCurl } from "./snippet-generator";

describe("spec parser and snippets", () => {
  it("flattens OpenAPI paths into endpoint definitions", () => {
    const endpoints = parseOpenApiSpec("pokeapi", pokeapiSpec as OpenAPIObject);
    expect(endpoints.some((endpoint) => endpoint.path === "/pokemon/{name}" && endpoint.method === "get")).toBe(true);
  });

  it("builds a concrete sandbox URL and cURL command", () => {
    const [endpoint] = parseOpenApiSpec("pokeapi", pokeapiSpec as OpenAPIObject);
    const state = {
      baseUrl: "https://pokeapi.co/api/v2",
      headers: { "Content-Type": "application/json" },
      pathParams: { name: "pikachu" },
      queryParams: {},
      body: "",
    };
    expect(buildRequestUrl(endpoint, state)).toContain("https://pokeapi.co/api/v2/pokemon/pikachu");
    expect(generateCurl(endpoint, state)).toContain("curl -X GET");
  });
});
