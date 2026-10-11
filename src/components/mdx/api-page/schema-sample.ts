import {sample} from "openapi-sampler";
import {m} from "@/paraglide/messages";
import type {RequestMediaTypeLite, ResponseMediaTypeLite} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStatusCode(value: string): number | null {
  const statusCode = Number(value);
  return Number.isFinite(statusCode) ? statusCode : null;
}

function applyStatusCodeNormalization(
  record: Record<string, unknown>,
  normalized: Record<string, unknown>,
  statusCode: number | null
): boolean {
  if (statusCode === null) return false;

  let changed = false;
  if (typeof record.code === "number" && record.code !== statusCode) {
    normalized.code = statusCode;
    changed = true;
  }
  if (typeof record.code === "string" && record.code !== String(statusCode)) {
    normalized.code = statusCode;
    changed = true;
  }

  return changed;
}

function applyErrorMessageNormalization(
  normalized: Record<string, unknown>,
  responseDescription: string | undefined,
  statusCode: number | null
): boolean {
  const errorMessage = typeof responseDescription === "string" ? responseDescription.trim() : "";
  if (errorMessage.length === 0 || statusCode === null || statusCode < 400) return false;
  if (typeof normalized.error !== "string" || normalized.error === errorMessage) return false;

  normalized.error = errorMessage;
  return true;
}

export function normalizeResponseSample(sampleValue: unknown, responseCode: string, responseDescription?: string): unknown {
  if (!isRecord(sampleValue)) return sampleValue;

  const statusCode = parseStatusCode(responseCode);
  const normalized: Record<string, unknown> = {...sampleValue};
  let changed = false;

  changed = applyStatusCodeNormalization(sampleValue, normalized, statusCode) || changed;
  changed = applyErrorMessageNormalization(normalized, responseDescription, statusCode) || changed;

  return changed ? normalized : sampleValue;
}

export function collectResponseExamples(media: ResponseMediaTypeLite): Array<{label: string; description?: string; sample: unknown}> {
  if (media.examples) {
    return Object.entries(media.examples).map(([key, entry]) => ({
      label: entry.summary || m.apiExampleLabelWithKey({key}),
      description: entry.description,
      sample: entry.value,
    }));
  }

  if (media.example !== undefined) {
    return [
      {
        label: m.apiExampleLabel(),
        sample: media.example,
      },
    ];
  }

  if (media.schema !== undefined) {
    return [
      {
        label: m.apiExampleLabel(),
        sample: sampleSchema(media.schema),
      },
    ];
  }

  return [];
}

export function sampleSchema(schema: unknown): unknown {
  if (!schema || typeof schema !== "object") return schema;
  try {
    return sample(schema as object);
  } catch {
    return schema;
  }
}

export function getRequestExample(media: RequestMediaTypeLite): unknown {
  if (media.examples) {
    const firstExample = Object.values(media.examples)[0];
    if (firstExample && "value" in firstExample) return firstExample.value;
  }
  if (media.example !== undefined) return media.example;
  if (media.schema !== undefined) return sampleSchema(media.schema);
  return undefined;
}
