import {createSupabase} from '@/lib/supabase/server';
import {privateHeaders} from '@/lib/security.mjs';
import {validPublicStory} from '@/lib/stories.mjs';
export const dynamic='force-dynamic';
export async function GET(){const json=(body,status=200)=>Response.json(body,{status,headers:privateHeaders});try{const client=await createSupabase();const {data:{user}}=await client.auth.getUser();if(!user)return json({error:'Please sign in.'},401);const {data,error}=await client.from('travel_workspaces').select('data').eq('owner_id',user.id).maybeSingle();if(error)throw error;const ids=data?.data.bookmarks||[];if(!ids.length)return json({stories:[]});const {data:stories,error:storyError}=await client.from('travel_stories').select('id,story').eq('published',true).in('id',ids);if(storyError)throw storyError;return json({stories:stories.filter(row=>validPublicStory(row.story)).sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id))});}catch{return json({error:'Unable to load saved stories.'},503);}}
