import { configured, createSupabase } from "@/lib/supabase/server";
import { privateHeaders, isPhotoPath } from "@/lib/security.mjs";
export const dynamic = "force-dynamic";
export async function GET(request, props) {
  const params = await props.params;
  if (!configured())
    return new Response("Unavailable", {
      status: 503,
      headers: privateHeaders,
    });
  try {
    const client = await createSupabase();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user)
      return new Response("Unauthorized", {
        status: 401,
        headers: privateHeaders,
      });
    if (!isPhotoPath(params.path, user.id))
      return new Response("Not found", {
        status: 404,
        headers: privateHeaders,
      });
    const { data, error: downloadError } = await client.storage
      .from("travel-photos")
      .download(params.path.join("/"));
    if (downloadError || !data)
      return new Response("Not found", {
        status: 404,
        headers: privateHeaders,
      });
    return new Response(data, {
      headers: {
        ...privateHeaders,
        "Content-Type": data.type,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Unavailable", {
      status: 503,
      headers: privateHeaders,
    });
  }
}
