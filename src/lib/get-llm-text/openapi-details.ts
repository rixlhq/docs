import {resolveOpenApiServers} from "@/lib/api-base-url";
import {appendSchemaNode, createSchemaContext, formatLiteral, getSchemaTypeLabel} from "./openapi-schema";
import {getRequestBodies, getResponseContents} from "./openapi-request";
import type {OpenApiDereferencedSchema, OpenApiOperation, OpenApiSecurityRequirement, OpenApiSecurityScheme, OpenApiServer} from "./types";
import {normalizeInlineText} from "./utils";

export function appendOperationDetails(
  lines: string[],
  operation: OpenApiOperation | undefined,
  schema: OpenApiDereferencedSchema | undefined
) {
  if (!operation) {
    lines.push("- Details: unavailable in schema snapshot.");
    return;
  }

  appendOperationDescription(lines, operation);
  appendOperationParameters(lines, operation);
  appendAuthorizationDetails(lines, operation, schema);
  appendServerDetails(lines, operation, schema);
  appendRequestBodyDetails(lines, operation);
  appendResponseDetails(lines, operation);
}

function appendOperationDescription(lines: string[], operation: OpenApiOperation) {
  if (!operation.description) return;
  lines.push("", normalizeInlineText(operation.description));
}

function appendOperationParameters(lines: string[], operation: OpenApiOperation) {
  const parameters = operation.parameters ?? [];
  if (parameters.length === 0) return;

  lines.push("", "- Parameters:");
  for (const parameter of parameters) {
    const name = parameter.name ?? "unknown";
    const location = parameter.in ?? "unknown";
    const required = parameter.required ? "required" : "optional";
    const type = getParameterType(parameter);
    const description = normalizeInlineText(parameter.description);
    const typeSegment = type ? `, ${type}` : "";
    lines.push(`  - \`${name}\` (${location}, ${required}${typeSegment})${description ? `: ${description}` : ""}`);
  }
}

function appendAuthorizationDetails(lines: string[], operation: OpenApiOperation, schema: OpenApiDereferencedSchema | undefined) {
  const operationSecurity = operation.security;
  const effectiveSecurity = resolveEffectiveSecurity(operationSecurity, schema?.security);

  if (Array.isArray(operationSecurity) && operationSecurity.length === 0) {
    lines.push("", "- Authorization: none");
    return;
  }

  if (!effectiveSecurity || effectiveSecurity.length === 0) {
    lines.push("", "- Authorization: not specified");
    return;
  }

  const schemeMap = buildSecuritySchemeMap(schema);
  lines.push("", "- Authorization:");
  appendSecurityRequirements(lines, effectiveSecurity, schemeMap);
}

function resolveEffectiveSecurity(
  operationSecurity: OpenApiSecurityRequirement[] | undefined,
  inheritedSecurity: OpenApiSecurityRequirement[] | undefined
) {
  return operationSecurity ?? inheritedSecurity;
}

function buildSecuritySchemeMap(schema: OpenApiDereferencedSchema | undefined) {
  return {
    ...(schema?.components?.securitySchemes ?? {}),
    ...(schema?.securityDefinitions ?? {}),
  };
}

function appendSecurityRequirements(
  lines: string[],
  requirements: OpenApiSecurityRequirement[],
  schemeMap: Record<string, OpenApiSecurityScheme | undefined>
) {
  for (const requirement of requirements) {
    for (const [schemeName, scopes] of Object.entries(requirement)) {
      lines.push(`  - ${formatSecuritySchemeSummary(schemeName, schemeMap[schemeName], scopes)}`);
    }
  }
}

function appendServerDetails(lines: string[], operation: OpenApiOperation, schema: OpenApiDereferencedSchema | undefined) {
  const servers = resolveServers(operation, schema);
  if (servers.length === 0) {
    lines.push("", "- Servers: not specified");
    return;
  }

  lines.push("", "- Servers:");
  for (const server of servers) {
    const description = normalizeInlineText(server.description);
    lines.push(`  - \`${server.url}\`${description ? `: ${description}` : ""}`);
    appendServerVariables(lines, server);
  }
}

function appendServerVariables(lines: string[], server: OpenApiServer) {
  const variables = Object.entries(server.variables ?? {});
  for (const [name, value] of variables) {
    if (!value) continue;
    const defaultValue = value.default ? ` default=\`${value.default}\`` : "";
    const variableDescription = normalizeInlineText(value.description);
    lines.push(`    - \`${name}\`${defaultValue}${variableDescription ? `: ${variableDescription}` : ""}`);
  }
}

function appendRequestBodyDetails(lines: string[], operation: OpenApiOperation) {
  const requestBodies = getRequestBodies(operation);
  if (requestBodies.length === 0) return;

  lines.push("", "- Request body:");
  for (const requestBody of requestBodies) {
    const required = requestBody.required ? "required" : "optional";
    lines.push(`  - Content type: \`${requestBody.contentType}\` (${required})`);
    if (requestBody.description) {
      lines.push(`    - ${normalizeInlineText(requestBody.description)}`);
    }
    if (requestBody.schema) {
      lines.push("    - Type structure:");
      appendSchemaNode(requestBody.schema, createSchemaContext(lines), {
        depth: 3,
        name: "body",
        required: true,
      });
    }
  }
}

function appendResponseDetails(lines: string[], operation: OpenApiOperation) {
  const responses = operation.responses ? Object.entries(operation.responses) : [];
  if (responses.length === 0) return;

  lines.push("", "- Responses:");
  for (const [status, response] of responses) {
    if (!response) continue;
    const description = normalizeInlineText(response.description);
    lines.push(`  - \`${status}\`${description ? `: ${description}` : ""}`);

    const responseContents = getResponseContents(response, operation.produces);
    for (const content of responseContents) {
      lines.push(`    - Content type: \`${content.contentType}\``);
      if (content.schema) {
        lines.push("      - Type structure:");
        appendSchemaNode(content.schema, createSchemaContext(lines), {
          depth: 4,
          name: "body",
          required: true,
        });
      }
    }
  }
}

function getParameterType(parameter: {type?: string; format?: string; schema?: unknown; enum?: unknown[]}) {
  if (parameter.schema && typeof parameter.schema === "object") {
    return getSchemaTypeLabel(parameter.schema as Parameters<typeof getSchemaTypeLabel>[0]);
  }

  if (!parameter.type) return;
  const format = parameter.format ? ` (${parameter.format})` : "";
  const enumSegment = parameter.enum && parameter.enum.length > 0 ? ` enum=${parameter.enum.map(formatLiteral).join(", ")}` : "";
  return `${parameter.type}${format}${enumSegment}`;
}

type SecurityFormatter = (schemeName: string, scheme: OpenApiSecurityScheme, scopes: string[] | undefined) => string;

const SECURITY_FORMATTERS: Record<string, SecurityFormatter> = {
  apiKey: (schemeName, scheme) => {
    const location = scheme.in ?? "header";
    const keyName = scheme.name ?? "apiKey";
    const description = normalizeInlineText(scheme.description);
    return `\`${schemeName}\` (apiKey in ${location} \`${keyName}\`)${description ? `: ${description}` : ""}`;
  },
  http: (schemeName, scheme) => {
    const mode = scheme.scheme ? ` ${scheme.scheme}${scheme.bearerFormat ? ` ${scheme.bearerFormat}` : ""}` : "";
    const description = normalizeInlineText(scheme.description);
    return `\`${schemeName}\` (http${mode})${description ? `: ${description}` : ""}`;
  },
  oauth2: (schemeName, scheme, scopes) => {
    const scopesSegment = scopes && scopes.length > 0 ? ` scopes=${scopes.map((scope) => `\`${scope}\``).join(", ")}` : "";
    const description = normalizeInlineText(scheme.description);
    return `\`${schemeName}\` (${scheme.type}${scopesSegment})${description ? `: ${description}` : ""}`;
  },
  openIdConnect: (schemeName, scheme, scopes) => {
    const scopesSegment = scopes && scopes.length > 0 ? ` scopes=${scopes.map((scope) => `\`${scope}\``).join(", ")}` : "";
    const description = normalizeInlineText(scheme.description);
    return `\`${schemeName}\` (${scheme.type}${scopesSegment})${description ? `: ${description}` : ""}`;
  },
};

function formatSecuritySchemeSummary(schemeName: string, scheme: OpenApiSecurityScheme | undefined, scopes: string[] | undefined) {
  if (!scheme) {
    const scopesSegment = scopes && scopes.length > 0 ? ` scopes=${scopes.map((scope) => `\`${scope}\``).join(", ")}` : "";
    return `\`${schemeName}\`${scopesSegment}`;
  }

  const formatter = scheme.type ? SECURITY_FORMATTERS[scheme.type] : undefined;
  if (formatter) {
    return formatter(schemeName, scheme, scopes);
  }

  const description = normalizeInlineText(scheme.description);
  return `\`${schemeName}\` (${scheme.type ?? "auth"})${description ? `: ${description}` : ""}`;
}

function resolveServers(operation: OpenApiOperation, schema: OpenApiDereferencedSchema | undefined) {
  return resolveOpenApiServers(schema, operation.servers);
}
