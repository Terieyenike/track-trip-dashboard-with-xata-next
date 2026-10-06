import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default async function Page(props) {
  const params = await props.params;
  return <TravelPage mode="note-form" id={params.id} />;
}

export const metadata = pageMetadata('Edit memory','Update the story, category, rating, and photo for your private travel memory.',true);
