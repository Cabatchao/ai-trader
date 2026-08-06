import { traderConfig } from '../trader/config';

export async function worldMonitorRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), traderConfig.worldMonitor.timeoutMs);
  const headers = { Accept: 'application/json', ...(options.headers || {}) };

  if (traderConfig.worldMonitor.apiKey) {
    headers['X-WorldMonitor-Key'] = traderConfig.worldMonitor.apiKey;
  }

  try {
    const response = await fetch(`${traderConfig.worldMonitor.baseUrl}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`World Monitor returned HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeWorldEvent(raw = {}) {
  return {
    externalId: String(raw.id || raw.event_id || crypto.randomUUID()),
    detectedAt: raw.detected_at || new Date().toISOString(),
    publishedAt: raw.published_at || raw.date || null,
    source: raw.source || raw.provider || 'worldmonitor',
    type: raw.type || raw.category || 'unknown',
    title: raw.title || 'Untitled event',
    summary: raw.summary || raw.description || '',
    countries: Array.isArray(raw.countries) ? raw.countries : [],
    entities: Array.isArray(raw.entities) ? raw.entities : [],
    affectedAssets: Array.isArray(raw.affected_assets) ? raw.affected_assets : [],
    originalUrl: raw.url || raw.original_url || null,
    raw,
  };
}
