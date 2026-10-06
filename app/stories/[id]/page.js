import Link from 'next/link';
import StoryActions from '@/components/StoryActions';
import StoryReport from '@/components/StoryReport';
import {notFound} from 'next/navigation';
import {Brand} from '@/components/TravelUI';
import {readStories} from '@/lib/public-stories';
export const dynamic='force-dynamic';
export default async function Story({params}) {
 const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))notFound();
 const {stories,unavailable}=await readStories(id);
 if(unavailable)return <main className="public-stories story-detail-page"><Brand/><section className="panel empty"><h1>This story is temporarily unavailable.</h1><p>Please try again later.</p><Link href="/explore">Explore travel stories</Link></section></main>;
 if(!stories.length)notFound();const {story}=stories[0];
 return <main className="public-stories story-detail-page"><nav className="landing-nav"><Brand/><Link href="/explore">← More stories</Link></nav><header className="stories-heading"><div className="eyebrow">{story.city} · {story.country}</div><h1>{story.title}</h1><div className="story-byline"><span className="story-author-avatar">{story.author.slice(0,1).toUpperCase()}</span><span><strong>By {story.author}</strong><small>{story.memories.length} shared memories · Travel story</small></span></div></header><article className="story-reading"><section className="story-takeaway"><div className="eyebrow">FROM ONE TRAVELER TO ANOTHER</div><h2>Advice for your journey</h2><p>{story.takeaway}</p></section>{story.memories.map((note,index)=><section className="story-memory" key={index}><div className="eyebrow">{note.category} · {'★'.repeat(note.rating)}</div><h2>{note.name}</h2><p>{note.description}</p></section>)}<StoryActions id={id} story={story}/><StoryReport id={id}/></article></main>;
}

export async function generateMetadata({params}) {
 const {id}=await params;
 if(!/^[a-f0-9-]{36}$/.test(id))return {title:"Story not found",robots:{index:false,follow:false}};
 const {stories}=await readStories(id);
 if(!stories.length)return {title:"Story unavailable",robots:{index:false,follow:false}};
 const {story}=stories[0];
 const description=`${story.city}, ${story.country} — a travel story by ${story.author}. ${story.takeaway}`.replace(/\s+/g,' ').slice(0,160);
 return {title:story.title,description,authors:[{name:story.author}],openGraph:{title:`${story.title} | Track Trips`,description,type:'article',authors:[story.author],images:[{url:'/assets/track-trips-social.png',width:1200,height:630,alt:'Track Trips — Plan trips. Share stories. Make memories.'}]},twitter:{card:'summary_large_image',images:['/assets/track-trips-social.png'],title:`${story.title} | Track Trips`,description}};
}
