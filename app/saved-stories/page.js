import {pageMetadata} from "@/lib/page-metadata";
import {account} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {Brand} from '@/components/TravelUI';
import SavedStories from '@/components/SavedStories';
export const dynamic='force-dynamic';
export default async function Saved(){if(!await account())redirect('/sign-in?next=/saved-stories');return <main className="public-stories"><nav className="landing-nav"><Brand/></nav><header className="stories-heading"><div className="eyebrow">YOUR COLLECTION</div><h1>Stories for someday.</h1><p>Tap “Save story” on a public story to bookmark it here. Your collection follows your account across devices.</p></header><SavedStories/></main>;}

export const metadata = pageMetadata('Saved stories','Revisit your private collection of saved travel stories and inspiration for future trips.',true);
