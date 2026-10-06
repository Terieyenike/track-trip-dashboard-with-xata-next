import { configured, createSupabase } from "@/lib/supabase/server";
import { privateHeaders, sameOrigin, limitedBody } from "@/lib/security.mjs";
export const dynamic = "force-dynamic";
const json = (body, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
export async function POST(request) {
  if (!sameOrigin(request))
    return json({ error: "Invalid request origin." }, 403);
  if (!configured()) return json({ error: "Account setup is pending." }, 503);
  try {
    const client = await createSupabase();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user)
      return json({ error: "Sign in to upload photos." }, 401);
    if (request.headers.get("x-workspace-account") !== user.id)
      return json(
        { error: "Your signed-in account changed. Reload before uploading." },
        409,
      );
    if (
      Number(request.headers.get("content-length") || 0) >
      2 * 1024 * 1024 + 10000
    )
      return json({ error: "Choose a photo below 2 MB." }, 413);
    const { data: permitted, error: limitError } = await client.rpc("consume_travel_request", { request_kind: "photo-upload" });
    if (limitError) return json({ error: "Unable to verify upload limits. Please retry." }, 503);
    if (!permitted) return json({ error: "Photo upload limit reached. Please try again in an hour." }, 429);
    const bytesBody = await limitedBody(request, 2 * 1024 * 1024 + 10000);
    const form = await new Response(bytesBody, {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("photo");
    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    if (
      !file ||
      typeof file.arrayBuffer !== "function" ||
      !extensions[file.type] ||
      file.size > 2 * 1024 * 1024 ||
      !file.size
    )
      return json(
        { error: "Choose a JPEG, PNG, WebP, or GIF below 2 MB." },
        400,
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const magic =
      file.type === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : file.type === "image/png"
          ? bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : file.type === "image/webp"
            ? bytes.subarray(0, 4).toString() === "RIFF" &&
              bytes.subarray(8, 12).toString() === "WEBP"
            : ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString());
    if (!magic)
      return json({ error: "This file is not a supported photo." }, 400);
    const path =
      user.id + "/" + crypto.randomUUID() + "." + extensions[file.type];
    const { error: uploadError } = await client.storage
      .from("travel-photos")
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploadError)
      return json({ error: "Photo upload failed. Please retry." }, 503);
    return json({ image: "/api/photos/" + path });
  } catch (failure) {
    return json(
      {
        error:
          failure.status === 413
            ? "Choose a photo below 2 MB."
            : "Unable to upload your photo.",
      },
      failure.status || 503,
    );
  }
}
