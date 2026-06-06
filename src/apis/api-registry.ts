import type { OpenAPIObject } from "../lib/openapi-types";
import pokeapiSpec from "./pokeapi/openapi.json";
import pokeapiDocs from "./pokeapi/docs.md?raw";
import pokeapiChangelog from "./pokeapi/changelog.json";
import paymentsSpec from "./stub-payments/openapi.json";
import paymentsDocs from "./stub-payments/docs.md?raw";
import paymentsChangelog from "./stub-payments/changelog.json";

export interface SdkLink {
  lang: string;
  install: string;
  repo: string;
}

export type ChangelogType = "Breaking" | "Feature" | "Fix";

export interface ChangelogEntry {
  version: string;
  date: string;
  type: ChangelogType;
  title: string;
  description: string;
}

export interface ApiDefinition {
  id: string;
  name: string;
  version: string;
  spec: OpenAPIObject;
  docsFile?: string;
  docsContent?: string;
  changelog?: ChangelogEntry[];
  sdks?: SdkLink[];
  baseUrl: string;
}

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: "pokeapi",
    name: "PokéAPI",
    version: "2.0.0",
    spec: pokeapiSpec as OpenAPIObject,
    docsFile: "./pokeapi/docs.md",
    docsContent: pokeapiDocs,
    changelog: pokeapiChangelog as ChangelogEntry[],
    sdks: [
      { lang: "JavaScript", install: "npm install pokeapi-js-wrapper", repo: "https://github.com/PokeAPI/pokeapi-js-wrapper" },
      { lang: "Python", install: "pip install pokeapi", repo: "https://github.com/PokeAPI/pokeapi" }
    ],
    baseUrl: "https://pokeapi.co/api/v2"
  },
  {
    id: "stub-payments",
    name: "Stub Payments",
    version: "0.1.0",
    spec: paymentsSpec as OpenAPIObject,
    docsFile: "./stub-payments/docs.md",
    docsContent: paymentsDocs,
    changelog: paymentsChangelog as ChangelogEntry[],
    sdks: [
      { lang: "JavaScript", install: "npm install @example/payments", repo: "https://github.com/example/payments-js" },
      { lang: "Python", install: "pip install example-payments", repo: "https://github.com/example/payments-python" }
    ],
    baseUrl: "https://sandbox.example-payments.invalid/v1"
  }
];
