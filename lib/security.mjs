export const privateHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};
export function appOrigin(request) {
  const configured = process.env.APP_ORIGIN;
  if (configured) {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
      throw new Error("Invalid application origin.");
    return url.origin;
  }
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const protocol = ["http", "https"].includes(forwardedProtocol)
    ? forwardedProtocol + ":"
    : url.protocol;
  const origin = new URL(`${protocol}//${host}`);
  if (origin.username || origin.password || origin.host.toLowerCase() !== host.toLowerCase())
    throw new Error("Invalid application host.");
  return origin.origin;
}
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const expected = new URL(appOrigin(request));
    if (origin === expected.origin) return true;
    const actual = new URL(origin);
    const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
    const host = new URL(`http://${request.headers.get("host") || new URL(request.url).host}`);
    return process.env.NODE_ENV === "development" &&
      localHosts.has(expected.hostname) && localHosts.has(actual.hostname) && localHosts.has(host.hostname) &&
      actual.origin === origin && actual.protocol === expected.protocol && actual.port === expected.port && host.port === expected.port;
  } catch { return false; }
}
export function safeNext(value) {
  return ["/reset-password", "/saved-stories", "/dashboard/stories/create"].includes(value) || (typeof value === "string" && /^\/stories\/[a-f0-9-]{36}$/.test(value)) ? value : "/dashboard";
}
export function normalizeWorkspace(value) {
  if (!value || !Array.isArray(value.trips) || !Array.isArray(value.notes))
    throw new Error("Invalid workspace.");
  if (value.trips.length > 500 || value.notes.length > 2000)
    throw new Error(
      "Workspace limit reached. Export your records before adding more.",
    );
  const output = { trips: value.trips, notes: value.notes };
  if (value.bookmarks !== undefined) {
    if (!Array.isArray(value.bookmarks) || value.bookmarks.length > 500 || value.bookmarks.some(id => typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id))) throw new Error("Invalid saved stories.");
    output.bookmarks = Array.from(new Set(value.bookmarks));
  }
  return output;
}
export function isPhotoPath(path, userId) {
  return (
    path.length === 2 &&
    path[0] === userId &&
    /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(path[1])
  );
}
export async function limitedBody(request, maxBytes) {
  if (Number(request.headers.get("content-length") || 0) > maxBytes) {
    const error = new Error("Request too large.");
    error.status = 413;
    throw error;
  }
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  let total = 0;
  const parts = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      const error = new Error("Request too large.");
      error.status = 413;
      throw error;
    }
    parts.push(value);
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}
