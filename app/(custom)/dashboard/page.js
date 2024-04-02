import Link from "next/link";
import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export default async function Dashboard() {
  const trips = await xata.db.trips.getAll();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      // year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div>
        <h1 className='text-4xl mb-8'>My Trips</h1>
      </div>
      {trips.length === 0 && <p>No travel memories found</p>}
      {trips.map((trip) => (
        <Link href='#' key={trip.id}>
          <div className='bg-gray-50 p-10 rounded shadow my-4 hover:shadow-lg hover:cursor-pointer'>
            <p className='text-lg'>
              {trip.country.toUpperCase()} |{" "}
              {trip.city
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </p>
            <p className='text-sm pt-4'>
              <span>{formatDate(trip.start)}</span> to{" "}
              <span>{formatDate(trip.end)}</span>
            </p>
          </div>
        </Link>
      ))}
    </>
  );
}
