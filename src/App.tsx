import { useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, BookOpen, KeyRound, LogOut, Moon, Play, Search, ShieldCheck, Sun, Terminal } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { API_REGISTRY, type ApiDefinition, type ChangelogType } from "./apis/api-registry";
import { MethodBadge, StatusBadge, TypeBadge } from "./components/Badge";
import { Button } from "./components/Button";
import { CodeBlock } from "./components/CodeBlock";
import { Field, TextArea } from "./components/Field";
import { EmptyState, ErrorState, Skeleton } from "./components/States";
import { AuthProvider } from "./features/auth/AuthProvider";
import { useAuth } from "./features/auth/auth-context";
import { ENDPOINT_BREAKDOWN, usageSeries } from "./features/analytics/analytics-data";
import { createKey, listKeys, revokeKey, type ApiKeyRecord, type KeyEnvironment } from "./features/keys/key-service";
import { STATUS_DATA } from "./features/status/status-data";
import { maskKey } from "./lib/format";
import { describeSchema, getJsonBodySchema, parseOpenApiSpec, schemaExample, type EndpointDef } from "./lib/spec-parser";
import { buildRequestUrl, generateCurl, generateFetch, generatePython, requestHeaders, type SandboxState } from "./lib/snippet-generator";

type Section = "docs" | "sandbox" | "keys" | "analytics" | "status" | "changelog";
type Environment = "sandbox" | "staging" | "production";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PortalGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function PortalGate() {
  const auth = useAuth();
  return auth.isAuthenticated ? <Portal /> : <AuthScreen />;
}

function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("reviewer@example.com");
  const [name, setName] = useState("Reviewer");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError("");
    try {
      if (mode === "signup") await register(email, password, name);
      else await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <ShieldCheck size={34} />
          <h1>Developer Portal</h1>
          <p>Sign in to browse live API docs, run sandbox requests, and manage keys.</p>
        </div>
        {mode === "signup" && <Field label="Name" value={name} onChange={(event) => setName(event.target.value)} />}
        <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Field label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <ErrorState message={error} />}
        <Button type="button" onClick={() => void submit()} disabled={pending}>
          {pending ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </Button>
      </section>
    </main>
  );
}

function Portal() {
  const { session, logout } = useAuth();
  const [section, setSection] = useState<Section>("docs");
  const [apiId, setApiId] = useState(API_REGISTRY[0]?.id ?? "");
  const [environment, setEnvironment] = useState<Environment>("sandbox");
  const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  const status = STATUS_DATA.find((entry) => entry.state !== "Operational");

  const api = API_REGISTRY.find((entry) => entry.id === apiId) ?? API_REGISTRY[0];

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <div className="app-shell">
      {status && <div className="incident-banner">{status.state}: {API_REGISTRY.find((item) => item.id === status.apiId)?.name} has an active incident.</div>}
      <aside className="sidebar">
        <div className="brand"><ShieldCheck /> Developer Portal</div>
        <nav>
          <NavButton icon={<BookOpen size={18} />} label="Docs" active={section === "docs"} onClick={() => setSection("docs")} />
          <NavButton icon={<Terminal size={18} />} label="Sandbox" active={section === "sandbox"} onClick={() => setSection("sandbox")} />
          <NavButton icon={<KeyRound size={18} />} label="API Keys" active={section === "keys"} onClick={() => setSection("keys")} />
          <NavButton icon={<BarChart3 size={18} />} label="Analytics" active={section === "analytics"} onClick={() => setSection("analytics")} />
          <NavButton icon={<Activity size={18} />} label="Status" active={section === "status"} onClick={() => setSection("status")} />
          <NavButton icon={<BookOpen size={18} />} label="Changelog" active={section === "changelog"} onClick={() => setSection("changelog")} />
        </nav>
        <div className="api-list">
          <span className="eyebrow">Registered APIs</span>
          {API_REGISTRY.map((entry) => (
            <button className={entry.id === api.id ? "selected" : ""} key={entry.id} onClick={() => setApiId(entry.id)} type="button">
              <strong>{entry.name}</strong>
              <small>v{entry.version}</small>
            </button>
          ))}
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <select value={environment} onChange={(event) => setEnvironment(event.target.value as Environment)} aria-label="Environment">
            <option value="sandbox">Sandbox</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
          <Button variant="ghost" type="button" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <span>{session?.user.email}</span>
          <Button variant="ghost" type="button" onClick={logout} aria-label="Sign out"><LogOut size={18} /></Button>
        </header>
        {section === "docs" && <DocsSection api={api} />}
        {section === "sandbox" && <SandboxSection api={api} environment={environment} />}
        {section === "keys" && <KeysSection />}
        {section === "analytics" && <AnalyticsSection />}
        {section === "status" && <StatusSection />}
        {section === "changelog" && <ChangelogSection api={api} />}
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: JSX.Element; label: string; active: boolean; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick} type="button">{icon}<span>{label}</span></button>;
}

function DocsSection({ api }: { api: ApiDefinition }) {
  const endpoints = useMemo(() => parseOpenApiSpec(api.id, api.spec), [api]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(endpoints[0]?.id ?? "");
  const filtered = endpoints.filter((endpoint) =>
    [endpoint.name, endpoint.description, endpoint.path, ...endpoint.parameters.map((param) => `${param.name} ${param.description ?? ""}`)]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const selected = filtered.find((endpoint) => endpoint.id === selectedId) ?? filtered[0];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("endpoint-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="workspace-grid">
      <div className="panel endpoint-list">
        <label className="search-box"><Search size={16} /><input id="endpoint-search" placeholder="Search endpoints" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        {filtered.length === 0 ? <EmptyState title="No endpoints" body="Try a different search term." /> : filtered.map((endpoint) => (
          <button key={endpoint.id} className={endpoint.id === selected?.id ? "selected" : ""} onClick={() => setSelectedId(endpoint.id)} type="button">
            <MethodBadge method={endpoint.method} /><span>{endpoint.path}</span>
          </button>
        ))}
      </div>
      <div className="panel detail-panel">
        {!selected ? <Skeleton /> : <EndpointDetails api={api} endpoint={selected} />}
      </div>
    </section>
  );
}

function EndpointDetails({ api, endpoint }: { api: ApiDefinition; endpoint: EndpointDef }) {
  return (
    <>
      <div className="section-heading">
        <MethodBadge method={endpoint.method} />
        <div><h1>{endpoint.name}</h1><p>{endpoint.path}</p></div>
      </div>
      <p>{endpoint.description}</p>
      <h2>Parameters</h2>
      {endpoint.parameters.length === 0 ? <EmptyState title="No parameters" body="This endpoint does not define path, query, or header parameters." /> : <ParameterTable endpoint={endpoint} />}
      <h2>Request Body</h2>
      {endpoint.requestBody ? <SchemaBox schema={getJsonBodySchema(endpoint.requestBody)} /> : <EmptyState title="No request body" body="This operation does not require a JSON body." />}
      <h2>Responses</h2>
      <div className="response-grid">{endpoint.responses.map(({ status, response }) => <div className="response-row" key={status}><StatusBadge status={status} /><span>{response.description}</span></div>)}</div>
      <h2>Getting Started</h2>
      <div className="markdown"><ReactMarkdown>{api.docsContent ?? "No quickstart guide supplied."}</ReactMarkdown></div>
      <h2>SDKs</h2>
      <div className="sdk-grid">{api.sdks?.map((sdk) => <a key={sdk.lang} href={sdk.repo} target="_blank" rel="noreferrer"><strong>{sdk.lang}</strong><span>{sdk.install}</span></a>)}</div>
      <h2>Error Reference</h2>
      <div className="response-grid">
        <div className="response-row"><StatusBadge status={400} /><span>Invalid input. Check parameter types and required fields.</span></div>
        <div className="response-row"><StatusBadge status={401} /><span>Missing or expired credentials. Create a key or sign in again.</span></div>
        <div className="response-row"><StatusBadge status={429} /><span>Rate limit exceeded. Wait for reset and retry with backoff.</span></div>
      </div>
    </>
  );
}

function ParameterTable({ endpoint }: { endpoint: EndpointDef }) {
  return (
    <table><thead><tr><th>Name</th><th>Location</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
      <tbody>{endpoint.parameters.map((param) => <tr key={`${param.in}-${param.name}`}><td>{param.name}</td><td>{param.in}</td><td>{describeSchema(param.schema)}</td><td>{param.required ? "Yes" : "No"}</td><td>{param.description}</td></tr>)}</tbody>
    </table>
  );
}

function SchemaBox({ schema }: { schema: Parameters<typeof describeSchema>[0] }) {
  return <CodeBlock label="JSON schema example" code={JSON.stringify(schemaExample(schema), null, 2)} />;
}

function SandboxSection({ api, environment }: { api: ApiDefinition; environment: Environment }) {
  const endpoints = useMemo(() => parseOpenApiSpec(api.id, api.spec), [api]);
  const [endpointId, setEndpointId] = useState(endpoints[0]?.id ?? "");
  const endpoint = endpoints.find((entry) => entry.id === endpointId) ?? endpoints[0];
  return endpoint ? <SandboxRunner api={api} endpoint={endpoint} environment={environment} endpoints={endpoints} onEndpointChange={setEndpointId} /> : <EmptyState title="No endpoints" body="Add paths to the OpenAPI spec to use the sandbox." />;
}

function SandboxRunner({ api, endpoint, environment, endpoints, onEndpointChange }: { api: ApiDefinition; endpoint: EndpointDef; environment: Environment; endpoints: EndpointDef[]; onEndpointChange: (id: string) => void }) {
  const { getToken, session } = useAuth();
  const [pathParams, setPathParams] = useState<Record<string, string>>(() => Object.fromEntries(endpoint.parameters.filter((param) => param.in === "path").map((param) => [param.name, String(param.example ?? "")])));
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({ "Content-Type": "application/json" });
  const [body, setBody] = useState(() =>
    endpoint.method === "get" ? "" : JSON.stringify(schemaExample(getJsonBodySchema(endpoint.requestBody)), null, 2),
  );
  const [history, setHistory] = useState<string[]>([]);
  const baseUrl = environment === "sandbox" ? api.baseUrl : api.baseUrl.replace("sandbox", environment);
  const state: SandboxState = { baseUrl, headers, pathParams, queryParams, body, authToken: session?.token };

  const request = useQuery({
    queryKey: ["sandbox", endpoint.id, state],
    enabled: false,
    queryFn: async () => {
      const requestState = { ...state, authToken: getToken() };
      const started = performance.now();
      const response = await fetch(buildRequestUrl(endpoint, requestState), {
        method: endpoint.method.toUpperCase(),
        headers: requestHeaders(requestState),
        body: endpoint.method === "get" ? undefined : body,
      });
      const text = await response.text();
      const latency = Math.round(performance.now() - started);
      setHistory((items) => [`${endpoint.method.toUpperCase()} ${endpoint.path} ${response.status} ${latency}ms`, ...items].slice(0, 8));
      return { status: response.status, latency, body: text ? JSON.parse(text) : null };
    },
  });

  return (
    <section className="workspace-grid">
      <div className="panel endpoint-list">
        {endpoints.map((item) => <button key={item.id} className={item.id === endpoint.id ? "selected" : ""} onClick={() => onEndpointChange(item.id)} type="button"><MethodBadge method={item.method} /><span>{item.path}</span></button>)}
      </div>
      <div className="panel detail-panel">
        <div className="section-heading"><MethodBadge method={endpoint.method} /><h1>{endpoint.path}</h1></div>
        <div className="form-grid">
          {endpoint.parameters.filter((param) => param.in === "path").map((param) => <Field key={param.name} label={`Path: ${param.name}`} value={pathParams[param.name] ?? ""} onChange={(event) => setPathParams({ ...pathParams, [param.name]: event.target.value })} />)}
          {endpoint.parameters.filter((param) => param.in === "query").map((param) => <Field key={param.name} label={`Query: ${param.name}`} value={queryParams[param.name] ?? ""} onChange={(event) => setQueryParams({ ...queryParams, [param.name]: event.target.value })} />)}
          <Field label="Header: Content-Type" value={headers["Content-Type"] ?? ""} onChange={(event) => setHeaders({ ...headers, "Content-Type": event.target.value })} />
        </div>
        {endpoint.method !== "get" && <TextArea label="JSON body" value={body} onChange={(event) => setBody(event.target.value)} rows={8} />}
        <Button type="button" onClick={() => void request.refetch()}><Play size={16} /> Send request</Button>
        <div className="result-bar">{request.data && <><StatusBadge status={request.data.status} /><span>{request.data.latency} ms</span><span>Rate limit 14 / 100 resets in 47s</span></>}</div>
        {request.isLoading && <Skeleton rows={5} />}
        {request.error && <ErrorState message={request.error instanceof Error ? request.error.message : "Sandbox request failed."} />}
        {request.data ? <CodeBlock label="Response JSON" code={JSON.stringify(request.data.body, null, 2)} /> : <EmptyState title="No response yet" body="Send a request to see the live API response." />}
        <div className="snippet-grid">
          <CodeBlock label="cURL" code={generateCurl(endpoint, state)} />
          <CodeBlock label="JavaScript fetch" code={generateFetch(endpoint, state)} />
          <CodeBlock label="Python requests" code={generatePython(endpoint, state)} />
        </div>
        <h2>Request History</h2>
        {history.length ? history.map((item) => <div className="history-row" key={item}>{item}</div>) : <EmptyState title="No history" body="Requests made in this session appear here." />}
      </div>
    </section>
  );
}

function KeysSection() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(() => listKeys());
  const [created, setCreated] = useState<ApiKeyRecord | null>(null);
  const [name, setName] = useState("Default sandbox key");
  const [environment, setEnvironment] = useState<KeyEnvironment>("sandbox");

  function create() {
    const key = createKey(name, environment);
    setCreated(key);
    setKeys(listKeys());
  }

  function revoke(id: string) {
    if (window.confirm("Revoke this API key? This action cannot be undone.")) {
      revokeKey(id);
      setKeys(listKeys());
    }
  }

  return (
    <section className="panel detail-panel">
      <div className="section-heading"><KeyRound /><h1>API Key Management</h1></div>
      <div className="form-grid"><Field label="Key name" value={name} onChange={(event) => setName(event.target.value)} /><label className="field"><span>Environment</span><select value={environment} onChange={(event) => setEnvironment(event.target.value as KeyEnvironment)}><option value="sandbox">Sandbox</option><option value="production">Production</option></select></label><Button type="button" onClick={create}>Create key</Button></div>
      {created && <div className="one-time-key"><strong>Copy this key now. It will not be shown again.</strong><CodeBlock label="New API key" code={created.secret} /></div>}
      {keys.length === 0 ? <EmptyState title="No keys yet" body="Create a sandbox or production key to start testing." /> : <table><thead><tr><th>Name</th><th>Key</th><th>Environment</th><th>Created</th><th>Last used</th><th></th></tr></thead><tbody>{keys.map((key) => <tr key={key.id}><td>{key.name}</td><td>{maskKey(key.secret)}</td><td><TypeBadge tone={key.environment}>{key.environment}</TypeBadge></td><td>{key.createdAt}</td><td>{key.lastUsed}</td><td><Button variant="danger" type="button" onClick={() => revoke(key.id)}>Revoke</Button></td></tr>)}</tbody></table>}
    </section>
  );
}

function AnalyticsSection() {
  const [windowDays, setWindowDays] = useState<7 | 30>(7);
  const data = usageSeries(windowDays);
  const calls = data.reduce((sum, point) => sum + point.calls, 0);
  const errors = data.reduce((sum, point) => sum + point.errors, 0);
  return (
    <section className="panel detail-panel">
      <div className="section-heading"><BarChart3 /><h1>Usage Analytics</h1></div>
      <div className="tabs"><button className={windowDays === 7 ? "active" : ""} onClick={() => setWindowDays(7)}>7 days</button><button className={windowDays === 30 ? "active" : ""} onClick={() => setWindowDays(30)}>30 days</button></div>
      <div className="metric-grid"><Metric label="Call volume" value={calls.toLocaleString()} /><Metric label="Error rate" value={`${((errors / calls) * 100).toFixed(2)}%`} /><Metric label="Avg latency" value={`${Math.round(data.reduce((sum, point) => sum + point.latency, 0) / data.length)} ms`} /></div>
      <div className="chart-box"><ResponsiveContainer width="100%" height={260}><LineChart data={data}><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} /><Line type="monotone" dataKey="latency" stroke="#16a34a" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
      <table><thead><tr><th>Endpoint</th><th>Calls</th><th>Error rate</th><th>Avg latency</th></tr></thead><tbody>{ENDPOINT_BREAKDOWN.map((row) => <tr key={row.endpoint}><td>{row.endpoint}</td><td>{row.calls}</td><td>{row.errorRate.toFixed(1)}%</td><td>{row.avgLatency} ms</td></tr>)}</tbody></table>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function StatusSection() {
  return (
    <section className="panel detail-panel">
      <div className="section-heading"><Activity /><h1>API Status</h1></div>
      <div className="status-grid">{STATUS_DATA.map((status) => <div className="status-card" key={status.apiId}><h2>{API_REGISTRY.find((api) => api.id === status.apiId)?.name}</h2><TypeBadge tone={status.state.toLowerCase()}>{status.state}</TypeBadge><strong>{status.uptime90d}% uptime</strong>{status.incidents.map((incident) => <p key={incident.id}>{incident.timestamp}: {incident.title}. {incident.notes}</p>)}</div>)}</div>
    </section>
  );
}

function ChangelogSection({ api }: { api: ApiDefinition }) {
  const [type, setType] = useState<ChangelogType | "All">("All");
  const entries = (api.changelog ?? []).filter((entry) => type === "All" || entry.type === type);
  return (
    <section className="panel detail-panel">
      <div className="section-heading"><BookOpen /><h1>Changelog</h1></div>
      <div className="tabs">{(["All", "Breaking", "Feature", "Fix"] as const).map((item) => <button className={type === item ? "active" : ""} key={item} onClick={() => setType(item)}>{item}</button>)}</div>
      {entries.length === 0 ? <EmptyState title="No entries" body="No changelog entries match this filter." /> : entries.map((entry) => <article className="changelog-entry" key={`${entry.version}-${entry.title}`}><TypeBadge tone={entry.type.toLowerCase()}>{entry.type}</TypeBadge><h2>{entry.title}</h2><p>{entry.date} · v{entry.version}</p><p>{entry.description}</p></article>)}
    </section>
  );
}
