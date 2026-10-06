import {pageMetadata} from "@/lib/page-metadata";
import CreateStory from '@/components/CreateStory';
export default function Page(){return <CreateStory/>;}

export const metadata = pageMetadata('Write a travel story','Choose a trip, write your advice, select memories, and preview your story before publishing.',true);
