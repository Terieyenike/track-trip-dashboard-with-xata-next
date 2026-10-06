import { configured, createSupabase } from "@/lib/supabase/server";
import {
  privateHeaders,
  sameOrigin,
  normalizeWorkspace,
  isPhotoPath,
  limitedBody,
} from "@/lib/security.mjs";
import { parseTravelData } from "@/utils/travel-data.mjs";
export const dynamic = "force-dynamic";
const json = (body, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
async function identity() {
  if (!configured())
    return { response: json({ error: "Account setup is pending." }, 503) };
  const client = await createSupabase();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user)
    return {
      response: json(
        { error: "Please sign in to access your workspace." },
        401,
      ),
    };
  return { client, user };
}
export async function GET() {
  try {
    const { client, user, response } = await identity();
    if (response) return response;
    const { data, error } = await client
      .from("travel_workspaces")
      .select("data,revision")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (error)
      return json(
        {
          error:
            "Your workspace could not be loaded. Check the database setup and retry.",
        },
        503,
      );
    return json({
      data: data?.data || { trips: [], notes: [] },
      revision: data?.revision || 0,
      userId: user.id,
    });
  } catch {
    return json({ error: "Your workspace is unavailable. Please retry." }, 503);
  }
}
export async function PUT(request) {
  if (!sameOrigin(request))
    return json({ error: "Invalid request origin." }, 403);
  try {
    const { client, user, response } = await identity();
    if (response) return response;
    const { data: permitted, error: limitError } = await client.rpc("consume_travel_request", { request_kind: "workspace-write" });
    if (limitError) return json({ error: "Unable to verify workspace limits. Please retry." }, 503);
    if (!permitted) return json({ error: "Too many changes at once. Please wait a minute and retry." }, 429);
    const text = new TextDecoder().decode(
      await limitedBody(request, 8 * 1024 * 1024),
    );
    let input, next;
    try {
      input = JSON.parse(text);
      if (input.userId !== user.id)
        return json(
          { error: "Your signed-in account changed. Reload before saving." },
          409,
        );
      if (!Number.isSafeInteger(input.revision) || input.revision < 0)
        throw new Error("Invalid revision.");
      next = parseTravelData(JSON.stringify(normalizeWorkspace(input.data)));
      for (const record of [...next.trips, ...next.notes]) {
        if (record.image?.startsWith("data:"))
          throw new Error("Upload photos before saving.");
        if (
          record.image?.startsWith("/api/photos/") &&
          !isPhotoPath(record.image.slice(12).split("/"), user.id)
        )
          throw new Error("Invalid photo ownership.");
      }
    } catch (error) {
      return json({ error: error.message || "Invalid workspace." }, 400);
    }
    const { data, error } = await client.rpc("save_travel_workspace", {
      next_data: next,
      expected_revision: input.revision,
    });
    if (error?.code === "40001")
      return json(
        {
          error:
            "Your workspace changed on another device. Reload and retry your change.",
        },
        409,
      );
    if (error)
      return json(
        {
          error:
            "Unable to save your workspace. Your previous cloud data remains unchanged.",
        },
        503,
      );
    return json({ ...data[0], userId: user.id });
  } catch (failure) {
    return json(
      {
        error:
          failure.status === 413
            ? "Workspace too large. Export records before adding more."
            : "Unable to save. Please retry.",
      },
      failure.status || 503,
    );
  }
}
