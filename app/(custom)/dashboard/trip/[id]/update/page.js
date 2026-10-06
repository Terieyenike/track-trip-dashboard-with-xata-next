import { TravelPage } from "@/components/TravelApp";
export default async function Page(props) {
  const params = await props.params;
  return <TravelPage mode="trip-form" id={params.id} />;
}
