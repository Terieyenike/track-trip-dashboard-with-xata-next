import 'server-only';
import {cache} from 'react';
import {createClient} from '@supabase/supabase-js';
import {validPublicStory} from '@/lib/stories.mjs';
export const readStories = cache(async function readStories(id) {
 try {
  const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  let query=client.from('travel_stories').select('id,story,published_at').eq('published',true);
  if(id)query=query.eq('id',id);else query=query.order('published_at',{ascending:false}).limit(60);
  const {data,error}=await query;
  if(error)return {stories:[],unavailable:true};
  return {stories:data.filter(row=>validPublicStory(row.story)),unavailable:false};
 }catch{return {stories:[],unavailable:true};}
});
