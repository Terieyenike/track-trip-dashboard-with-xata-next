import 'server-only';
import {createSupabase} from '@/lib/supabase/server';
export async function adminAccount(){const client=await createSupabase();const {data:{user},error}=await client.auth.getUser();if(error||!user)return {client,user:null,admin:false};const {data:admin,error:roleError}=await client.rpc('is_travel_admin');return {client,user,admin:!roleError && admin===true};}
