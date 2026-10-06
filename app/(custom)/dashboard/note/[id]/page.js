import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default async function Page(props) {
  const params = await props.params;
  return <TravelPage mode="note-detail" id={params.id} />;
}

export const metadata = pageMetadata('Travel memory','Read a memory from your private travel journal.',true);
