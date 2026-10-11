import { defineRailway, github, postgres, project, service } from "railway/iac";

export default defineRailway(() => {
  const NABAAT = github("kareemzeki-boop/NABAAT", {
    branch: "main",
    checkSuites: false,
  });
  const nabaatPostgres = postgres("nabaat-postgres");

  const _workspaceapiZod = service("@workspace/api-zod", {
    source: NABAAT,
    build: {
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/lib/api-zod/**"],
    },
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "workspaceapi-zod" },
  });
  const _workspaceapiServer = service("@workspace/api-server", {
    source: NABAAT,
    build: {
      buildEnvironment: "V3",
      builder: "DOCKERFILE",
      dockerfilePath: "/Dockerfile",
      watchPatterns: [
        "/.dockerignore",
        "/Dockerfile",
        "/artifacts/api-server/**",
        "/lib/api-zod/**",
        "/lib/db/**",
        "/package.json",
        "/pnpm-lock.yaml",
        "/pnpm-workspace.yaml",
      ],
    },
    start: "node --enable-source-maps ./dist/index.mjs",
    healthcheck: "/api/readyz",
    env: {
      DATABASE_URL: nabaatPostgres.env.DATABASE_URL,
      CORS_ORIGIN: "https://kareemzeki-boop.github.io",
    },
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "workspaceapi-server" },
  });
  const _workspacemockupSandbox = service("@workspace/mockup-sandbox", {
    source: NABAAT,
    build: {
      buildCommand: "pnpm --filter @workspace/mockup-sandbox build",
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/artifacts/mockup-sandbox/**"],
    },
    start: "pnpm --filter @workspace/mockup-sandbox dev",
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "workspacemockup-sandbox" },
  });
  const _workspacenabaat = service("@workspace/nabaat", {
    source: NABAAT,
    build: {
      buildCommand: "pnpm --filter @workspace/nabaat build",
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/artifacts/nabaat/**"],
    },
    start: "pnpm --filter @workspace/nabaat dev",
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "workspacenabaat" },
  });
  const _workspaceapiSpec = service("@workspace/api-spec", {
    source: NABAAT,
    build: {
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/lib/api-spec/**"],
    },
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "workspaceapi-spec" },
  });
  const _workspacedb = service("@workspace/db", {
    source: NABAAT,
    build: {
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/lib/db/**"],
    },
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "workspacedb" },
  });
  const _workspaceapiClientReact = service("@workspace/api-client-react", {
    source: NABAAT,
    build: {
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/lib/api-client-react/**"],
    },
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "workspaceapi-client-react" },
  });

  return project("blissful-light", {
    variables: { managed: true },
    resources: [
      nabaatPostgres,
      _workspaceapiZod,
      _workspaceapiServer,
      _workspacemockupSandbox,
      _workspacenabaat,
      _workspaceapiSpec,
      _workspacedb,
      _workspaceapiClientReact,
    ],
  });
});
