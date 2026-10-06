import Link from 'next/link';
import {Brand} from '@/components/TravelUI';
import StoryExplore from '@/components/StoryExplore';
import {readStories} from '@/lib/public-stories';
export const dynamic='force-dynamic';
export const metadata={title:'Travel stories | Track Trips',description:'Read travel memories and practical takeaways shared by travelers.'};
export default async function Explore({searchParams}){const result=await readStories();const query=await searchParams;const published=typeof query.published==='string' && /^[a-f0-9-]{36}$/.test(query.published)?query.published:null;return <main className="public-stories"><nav className="landing-nav"><Brand/><div className="public-story-nav"><Link href="/saved-stories">Saved stories</Link><Link className="button" href="/dashboard/stories/create">Write a story</Link></div></nav>{published && <section className="publish-success" role="status"><div><strong>Your story is published.</strong><p>It’s ready for readers to discover.</p></div><Link className="button secondary" href={'/stories/'+published}>View your story ↗</Link></section>}<header className="stories-heading"><div className="eyebrow">THE WORLD, THROUGH THEIR EYES</div><h1>Stories worth<br/>traveling for.</h1><p>Personal journeys, memorable moments, and advice for your next adventure.</p></header><StoryExplore {...result}/></main>;}
