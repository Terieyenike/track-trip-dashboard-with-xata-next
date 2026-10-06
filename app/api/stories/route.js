import { createSupabase } from '@/lib/supabase/server';
import { sameOrigin, limitedBody, privateHeaders } from '@/lib/security.mjs';
import { buildStory } from '@/lib/stories.mjs';
export const dynamic = 'force-dynamic';
const json = (body, status = 200) => Response.json(body, {status, headers:privateHeaders});
export async function GET(request) {
 try {
  const client = await createSupabase();
  const {data:{user}} = await client.auth.getUser();
  if (!user) return json({error:'Please sign in.'},401);
  const trip = new URL(request.url).searchParams.get('trip');
  const {data,error} = await client.from('travel_stories').select('id,published,story').eq('owner_id',user.id).eq('trip_id',trip).maybeSingle();
  if(error) return json({error:'Story publishing needs its database setup.'},503);
  return json({story:data});
 } catch {return json({error:'Story service unavailable.'},503);}
}
export async function POST(request) {
 if(!sameOrigin(request))return json({error:'Invalid request origin.'},403);
 try {
  const client=await createSupabase(); const {data:{user}}=await client.auth.getUser();
  if(!user)return json({error:'Please sign in.'},401);
  const input=JSON.parse(new TextDecoder().decode(await limitedBody(request,10000)));
  const {data:allowed,error:limitError}=await client.rpc('consume_travel_request',{request_kind:'workspace-write'});
  if(limitError || !allowed)return json({error:'Please wait a minute and retry.'},429);
  if(input.action==='unpublish') {
   const {error}=await client.from('travel_stories').update({published:false}).eq('owner_id',user.id).eq('trip_id',input.tripId);
   if(error)throw error;
   return json({ok:true});
  }
  if(input.action!=='publish' || input.confirmPublic!==true)return json({error:'Review and confirm the public story first.'},400);
  const {data:workspace,error}=await client.from('travel_workspaces').select('data').eq('owner_id',user.id).single();
  if(error)throw error;
  const trip=workspace.data.trips.find(trip=>trip.id===input.tripId);
  if(!trip)return json({error:'Save this trip before publishing.'},400);
  let story;try {story=buildStory(trip,workspace.data.notes,input);}catch(error){return json({error:error.message},400);}
  const {data,error:saveError}=await client.from('travel_stories').upsert({owner_id:user.id,trip_id:trip.id,story,published:true,published_at:new Date().toISOString()},{onConflict:'owner_id,trip_id'}).select('id').single();
  if(saveError)throw saveError;
  return json({id:data.id});
 }catch{return json({error:'Unable to save the story. Check the story database setup and retry.'},503);}
}
