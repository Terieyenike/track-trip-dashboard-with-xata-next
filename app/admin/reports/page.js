import Link from 'next/link';
import {redirect,notFound} from 'next/navigation';
import {adminAccount} from '@/lib/admin';
import {Brand} from '@/components/TravelUI';
import AdminInbox from '@/components/AdminInbox';
import {pageMetadata} from '@/lib/page-metadata';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('Community review inbox','Protected report review and moderation workspace.',true);
export default async function Page(){const {user,admin}=await adminAccount();if(!user)redirect('/sign-in?next=/admin/reports');if(!admin)notFound();return <main className="public-stories admin-review-page"><nav className="landing-nav"><Brand/><Link href="/dashboard">Back to my trips</Link></nav><header className="story-create-heading"><div className="eyebrow">ADMINISTRATOR WORKSPACE</div><h1>Community review inbox</h1><p>Review reports, protect readers, and keep a record of each decision.</p></header><AdminInbox/></main>;}
